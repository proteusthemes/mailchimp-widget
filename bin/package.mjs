import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const destination = join(root, 'proteusthemes-mailchimp-widget');
const files = readdirSync(root).filter((name) => !name.startsWith('.') && name.endsWith('.php'));

rmSync(destination, { recursive: true, force: true });
mkdirSync(destination);

for (const name of [...files, 'readme.txt', 'assets', 'inc', 'languages']) {
	cpSync(join(root, name), join(destination, name), {
		recursive: true,
		filter: (source) => !basename(source).startsWith('.'),
	});
}

console.log('Packaged plugin in proteusthemes-mailchimp-widget/');
