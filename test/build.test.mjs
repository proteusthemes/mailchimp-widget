import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const slug = 'proteusthemes-mailchimp-widget';

function fixture(t, script) {
	mkdirSync(join(root, 'tmp'), { recursive: true });
	const directory = mkdtempSync(join(root, 'tmp', 'build-test-'));
	t.after(() => rmSync(directory, { recursive: true, force: true }));
	mkdirSync(join(directory, 'bin'));
	cpSync(join(root, 'bin', script), join(directory, 'bin', script));
	return directory;
}

function write(directory, name, contents = name) {
	const path = join(directory, name);
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, contents);
}

function run(directory, script) {
	return spawnSync(process.execPath, [join(directory, 'bin', script)], {
		cwd: directory,
		encoding: 'utf8',
	});
}

function succeeded(result) {
	assert.ifError(result.error);
	assert.equal(result.status, 0, result.stdout + result.stderr);
}

function files(directory, prefix = '') {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const name = prefix + entry.name;
		return entry.isDirectory() ? files(join(directory, entry.name), name + '/') : [name];
	}).sort();
}

test('packaging includes release files, excludes development and hidden files, and removes stale output', (t) => {
	const directory = fixture(t, 'package.mjs');
	const included = [
		`${slug}.php`, 'uninstall.php', 'readme.txt', 'assets/css/main.css',
		'assets/js/nested/admin.js', 'inc/nested/widget.php', `languages/${slug}.pot`,
		'languages/fr_FR.po', 'languages/fr_FR.mo',
	].sort();
	for (const name of included) write(directory, name);
	for (const name of [
		'.private.php', 'assets/.hidden', 'inc/.private/widget.php',
		'languages/.hidden/catalog.po', 'package.json', 'readme.md', 'test/fixture.php',
		`${slug}/stale.php`, `${slug}/assets/removed.css`,
	]) write(directory, name);

	succeeded(run(directory, 'package.mjs'));
	const output = join(directory, slug);
	assert.deepEqual(files(output), included);
	for (const name of included) assert.equal(readFileSync(join(output, name), 'utf8'), name);

	rmSync(join(directory, 'assets/js/nested/admin.js'));
	write(directory, 'inc/nested/widget.php', 'Updated widget');
	succeeded(run(directory, 'package.mjs'));
	assert.deepEqual(files(output), included.filter((name) => name !== 'assets/js/nested/admin.js'));
	assert.equal(readFileSync(join(output, 'inc/nested/widget.php'), 'utf8'), 'Updated widget');
});

test('packaging fails when a required source directory is missing', (t) => {
	const directory = fixture(t, 'package.mjs');
	for (const name of [`${slug}.php`, 'readme.txt', 'assets/main.css', 'inc/widget.php']) {
		write(directory, name);
	}
	const result = run(directory, 'package.mjs');
	assert.ifError(result.error);
	assert.notEqual(result.status, 0);
	assert.match(result.stderr, /languages/);
});

function moMessages(path) {
	const buffer = readFileSync(path);
	const littleEndian = buffer.readUInt32LE(0) === 0x950412de;
	const integer = (offset) => littleEndian ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset);
	assert.equal(integer(0), 0x950412de, 'Compiled file must be a GNU MO catalog');
	const count = integer(8);
	const originals = integer(12);
	const translations = integer(16);
	const string = (table, index) => {
		const length = integer(table + index * 8);
		const offset = integer(table + index * 8 + 4);
		return buffer.toString('utf8', offset, offset + length);
	};
	return new Map(Array.from({ length: count }, (_, index) => [string(originals, index), string(translations, index)]));
}

test('WP-CLI extracts scoped singular, context, and plural strings and preserves translations across builds', (t) => {
	const prerequisite = spawnSync('wp', ['--version'], { encoding: 'utf8' });
	assert.ifError(prerequisite.error && new Error('WP-CLI with i18n support is required; see DEVELOPMENT.md.', { cause: prerequisite.error }));
	succeeded(prerequisite);
	const directory = fixture(t, 'i18n.mjs');
	write(directory, `${slug}.php`, `<?php
/*
Plugin Name: Translation fixture
Version: 1.2.3
Text Domain: ${slug}
*/
__( 'Subscribe now', '${slug}' );
__( 'Wrong domain', 'unrelated' );
`);
	write(directory, 'inc/nested/widget.php', `<?php
_x( 'Subscribe', 'button label', '${slug}' );
_n( 'One subscriber', 'Many subscribers', 2, '${slug}' );
`);
	write(directory, 'extra.php', `<?php __( 'Additional root string', '${slug}' );`);
	for (const [name, message] of [
		['fixtures/sample.php', 'Ignored fixture'],
		['assets/source.php', 'Ignored asset'],
		[`${slug}/inc/widget.php`, 'Ignored package'],
	]) write(directory, name, `<?php __( '${message}', '${slug}' );`);
	write(directory, 'languages/fr_FR.po', `msgid ""
msgstr ""
"Project-Id-Version: Translation fixture 1.2.3\\n"
"Language: fr_FR\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Plural-Forms: nplurals=2; plural=(n > 1);\\n"

msgid "Subscribe now"
msgstr "Inscrivez-vous"
`);

	succeeded(run(directory, 'i18n.mjs'));
	const potPath = join(directory, 'languages', `${slug}.pot`);
	const poPath = join(directory, 'languages/fr_FR.po');
	const moPath = join(directory, 'languages/fr_FR.mo');
	const pot = readFileSync(potPath, 'utf8');
	assert.match(pot, /msgid "Subscribe now"/);
	assert.match(pot, /msgid "Additional root string"/);
	assert.match(pot, /"POT-Creation-Date: \\n"/);
	assert.match(pot, /msgctxt "button label"\nmsgid "Subscribe"/);
	assert.match(pot, /msgid "One subscriber"\nmsgid_plural "Many subscribers"/);
	assert.doesNotMatch(pot, /Ignored fixture|Ignored asset|Ignored package|Wrong domain/);
	const po = readFileSync(poPath, 'utf8');
	assert.match(po, /msgid "Subscribe now"\nmsgstr "Inscrivez-vous"/);
	assert.match(po, /msgctxt "button label"\nmsgid "Subscribe"/);
	assert.match(po, /msgid_plural "Many subscribers"/);
	assert.equal(moMessages(moPath).get('Subscribe now'), 'Inscrivez-vous');
	const mo = readFileSync(moPath);

	succeeded(run(directory, 'i18n.mjs'));
	assert.equal(readFileSync(potPath, 'utf8'), pot);
	assert.equal(readFileSync(poPath, 'utf8'), po);
	assert.deepEqual(readFileSync(moPath), mo);
});
