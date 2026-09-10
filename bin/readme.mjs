import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function readmeToMarkdown(source) {
  let metadata = true;
  let screenshots = false;
  let codeBlock = false;
  const output = [];

  for (const line of source.replace(/\r\n/g, '\n').split('\n')) {
    if (line.trim() === '`') {
      output.push(codeBlock ? '```' : '```php');
      codeBlock = !codeBlock;
      continue;
    }

    if (codeBlock) {
      output.push(line);
      continue;
    }

    const heading = line.match(/^(={1,3})\s+(.+?)\s+\1\s*$/);
    if (heading) {
      const level = 4 - heading[1].length;
      const marker = '#'.repeat(level);
      output.push(`${marker} ${heading[2]} ${marker}`);
      if (level === 2) screenshots = heading[2] === 'Screenshots';
      continue;
    }

    if (line.trim() === '') metadata = false;
    const field = metadata && line.match(/^([^:]+):\s*(.*)$/);
    if (field) {
      output.push(`**${field[1]}:** ${field[2]}  `);
      continue;
    }

    const screenshot = screenshots && line.match(/^(\d+)\.\s+(.+)$/);
    if (screenshot) {
      output.push(
        `### ${screenshot[1]}. ${screenshot[2]} ###`,
        `![${screenshot[2]}](https://ps.w.org/proteusthemes-mailchimp-widget/assets/screenshot-${screenshot[1]}.png)`,
        '',
      );
      continue;
    }

    output.push(line);
  }

  if (codeBlock) throw new Error('Unclosed standalone-backtick code block in readme.txt');
  return `${output.join('\n').trimEnd()}\n`;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const source = await readFile(new URL('../readme.txt', import.meta.url), 'utf8');
  await writeFile(new URL('../readme.md', import.meta.url), readmeToMarkdown(source));
  console.log('Generated readme.md from readme.txt');
}
