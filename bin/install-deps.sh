#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v wp >/dev/null 2>&1; then
	echo "WP-CLI with its i18n commands is required. See DEVELOPMENT.md." >&2
	exit 1
fi

for command in make-pot update-po make-mo; do
	if ! PAGER=cat wp help i18n "$command" >/dev/null; then
		echo "WP-CLI i18n $command is required. See DEVELOPMENT.md." >&2
		exit 1
	fi
done
npm ci
