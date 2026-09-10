import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { readmeToMarkdown } from '../bin/readme.mjs';

test('converts the plugin readme while preserving metadata, prose, and PHP examples', async () => {
  const source = await readFile(new URL('../readme.txt', import.meta.url), 'utf8');
  const markdown = readmeToMarkdown(source);

  assert.ok(markdown.startsWith('# Mailchimp Widget by ProteusThemes #\n'));
  for (const field of source.split('\n').slice(1, 7)) {
    const separator = field.indexOf(':');
    assert.ok(markdown.includes(`**${field.slice(0, separator)}:**${field.slice(separator + 1)}  \n`));
  }
  for (const heading of source.matchAll(/^== (.+) ==$/gm)) {
    assert.ok(markdown.includes(`## ${heading[1]} ##\n`));
  }
  for (const heading of source.matchAll(/^= (.+) =$/gm)) {
    assert.ok(markdown.includes(`### ${heading[1]} ###\n`));
  }
  assert.ok(markdown.includes("`add_filter( 'pt-mcw/disable_frontend_styles', '__return_true' );`"));
  const php = source.match(/^`\n([\s\S]*?)\n`$/m)[1];
  assert.ok(markdown.includes(`\n\`\`\`php\n${php}\n\`\`\`\n`));
  assert.ok(markdown.includes("1. Visit 'Plugins > Add New',\n"));
  assert.ok(markdown.includes('* Initial release!\n'));
  assert.equal((markdown.match(/!\[/g) || []).length, 3);
  assert.ok(markdown.includes('![Widget settings](https://ps.w.org/proteusthemes-mailchimp-widget/assets/screenshot-1.png)'));
  assert.ok(markdown.includes('![Widget frontend with styled design](https://ps.w.org/proteusthemes-mailchimp-widget/assets/screenshot-3.png)'));
});

test('limits metadata and screenshot conversion to their sections', () => {
  assert.equal(readmeToMarkdown([
    '=== Example ===',
    'License: GPLv3 or later',
    '',
    'Note: keep this prose',
    '== Screenshots ==',
    '2. Settings',
    '== Installation ==',
    '1. Activate the plugin',
  ].join('\r\n')), [
    '# Example #',
    '**License:** GPLv3 or later  ',
    '',
    'Note: keep this prose',
    '## Screenshots ##',
    '### 2. Settings ###',
    '![Settings](https://ps.w.org/proteusthemes-mailchimp-widget/assets/screenshot-2.png)',
    '',
    '## Installation ##',
    '1. Activate the plugin',
    '',
  ].join('\n'));
});

test('preserves code contents that resemble readme markup', () => {
  const code = ['== Screenshots ==', '1. Leave this alone', 'License: unchanged', '`inline`'].join('\n');
  assert.equal(readmeToMarkdown(`\`\n${code}\n\`\n`), `\`\`\`php\n${code}\n\`\`\`\n`);
});

test('rejects an unclosed code block', () => {
  assert.throws(() => readmeToMarkdown('`\nadd_filter();\n'), /Unclosed standalone-backtick code block/);
});
