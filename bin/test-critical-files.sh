#!/bin/bash -ex
#
# Exist codes:
# - 0: OK
# - 1: file missing
# - 2: folder missing

function testRequiredFiles {
	parentFolder='./'
	requiredFiles=(
		mailchimp-widget-by-proteusthemes.php
		readme.txt
		assets/css/main.css
		assets/js/admin.js
		inc/widget-mailchimp-subscribe.php
		languages/pt-mcw.pot
	)
	requiredFolders=(
		assets/js
		assets/css
		inc
		languages
	)

	# loop for files
	for file in "${requiredFiles[@]}"
	do
		filePath="$parentFolder/$file"
		if [[ ! -f $filePath ]]; then
			echo "File $filePath does not exist!"
			exit 1
		fi
	done

	# loop for directories
	for folder in "${requiredFolders[@]}"
	do
		folderPath="$parentFolder/$folder"
		if [[ ! -d $folderPath ]]; then
			echo "Directory $folderPath does not exist!"
			exit 2
		fi
	done
}

# call and unset
testRequiredFiles
unset testRequiredFiles