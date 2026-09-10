import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const slug = 'proteusthemes-mailchimp-widget';
const pot = `languages/${slug}.pot`;

mkdirSync(new URL('../languages/', import.meta.url), { recursive: true });
const excludedDirectories = readdirSync(root, { withFileTypes: true })
	.filter((entry) => !entry.isFile() && entry.name !== 'inc')
	.map((entry) => entry.name);

const commands = [
	['make-pot', '.', pot, `--slug=${slug}`, `--domain=${slug}`,
		'--include=*.php,inc', `--exclude=${excludedDirectories.join(',')}`,
		'--skip-js', '--skip-block-json', '--skip-theme-json',
		'--headers=' + JSON.stringify({
			'Report-Msgid-Bugs-To': 'http://support.proteusthemes.com/',
			'POT-Creation-Date': '',
			'X-Poedit-Basepath': '..',
			'X-Poedit-SourceCharset': 'UTF-8',
			'X-Poedit-SearchPath-0': '.',
		})],
	['update-po', pot, 'languages'],
	['make-mo', 'languages'],
];

for (const args of commands) {
	const result = spawnSync('wp', ['i18n', ...args], { cwd: root, stdio: 'inherit' });
	if (result.error) {
		throw new Error('Unable to run WP-CLI. Install WP-CLI with i18n support; see DEVELOPMENT.md.', { cause: result.error });
	}
	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}
