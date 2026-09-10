# Development

Build tooling requires Node.js 22 or newer, npm, PHP, and WP-CLI 2.12 or newer
with the bundled i18n commands. Install WP-CLI using the
[official instructions](https://make.wordpress.org/cli/handbook/guides/installing/).
No WordPress installation or database is needed for these build commands.
The plugin's runtime requirements are unchanged.

Run `bash bin/install-deps.sh` to check WP-CLI and run `npm ci`. There are no npm
dependencies or global npm packages to install.

Run `npm run build` to regenerate translations and `readme.md`, create the plugin
directory, and check its required files. The output is
`proteusthemes-mailchimp-widget/`, the directory expected by the existing SVN
deployment script. Building does not deploy or contact WordPress.org.

Individual commands:

- `npm run i18n`: extract PHP strings into the tracked POT, update existing PO
  translations, and compile MO files with WP-CLI. POT timestamps are blank to
  avoid changes from running the build again. Keep human-edited PO files tracked;
  compiled MO files are ignored and included in the package when present.
- `npm run readme`: regenerate `readme.md` from `readme.txt`. Edit `readme.txt`
  rather than the generated Markdown.
- `npm run package`: replace the output directory using root PHP files,
  `readme.txt`, `assets/`, `inc/`, and `languages/`. Hidden files and development
  tooling are excluded. Run the full build before preparing a release.
- `npm test`: run build-tool regression tests.
- `npm run lint`: check build-script syntax.
- `npm run test:package`: check the packaged plugin's required files.

This follows the themes' direct-script and WP-CLI approach. Asset compilation is
unnecessary: this plugin ships its CSS and JavaScript as authored. Translation
extraction uses the explicit `proteusthemes-mailchimp-widget` slug so worktree
names cannot change the text domain. New PHP translation calls must include
that domain; builds no longer rewrite PHP source to add or replace domains.

The tracked POT is retained because this repository has no CI generation step
and the existing release checks require it. Source extraction is limited to
root PHP files and `inc/` so generated packages and test fixtures cannot add
duplicate or unrelated messages.
WP-CLI's `*.php` include also matches nested paths, so the extraction script
explicitly excludes every root directory except `inc/`.

The SVN deployment script publishes a release. Run it only as an explicitly
authorized release action after building and testing, not as part of local
verification.
