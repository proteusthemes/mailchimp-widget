module.exports = function ( grunt ) {
	// Auto-load the needed grunt tasks
	// require('load-grunt-tasks')(grunt);
	require( 'load-grunt-tasks' )( grunt, { pattern: ['grunt-*'] } );

	var config = {
		tmpdir:                  '.tmp/',
		phpFileRegex:            '[^/]+\.php$',
		phpFileInSubfolderRegex: '.*?\.php$',
		pluginSlug:              'proteusthemes-mailchimp-widget',
	};

	// configuration
	grunt.initConfig( {
		pgk: grunt.file.readJSON( 'package.json' ),

		config: config,

		// https://github.com/gruntjs/grunt-contrib-copy
		copy: {
			// create new directory for deployment
			build: {
				expand: true,
				dot:    false,
				dest:   config.pluginSlug + '/',
				src:    [
					'*.php',
					'readme.txt',
					'assets/**',
					'inc/**',
					'languages/**',
				],
				flatten: false
			}
		},

		// https://www.npmjs.com/package/grunt-wp-i18n
		makepot: {
			plugin: {
				options: {
					domainPath:      'languages/',
					include:         [config.phpFileRegex, '^inc/'+config.phpFileInSubfolderRegex],
					mainFile:        'proteusthemes-mailchimp-widget.php',
					potComments:     'Copyright (C) {year} ProteusThemes \n# This file is distributed under the GPL 3.0.',
					potFilename:     'proteusthemes-mailchimp-widget.pot',
					potHeaders:      {
						poedit:                 true,
						'report-msgid-bugs-to': 'http://support.proteusthemes.com/',
					},
					type:            'wp-plugin',
					updateTimestamp: false,
					updatePoFiles:   true,
				}
			},
		},

		// https://www.npmjs.com/package/grunt-wp-i18n
		addtextdomain: {
			options: {
				updateDomains: true
			},
			target: {
				files: {
					src: [
						'*.php',
						'inc/**/*.php',
					]
				}
			}
		},

		// https://www.npmjs.com/package/grunt-po2mo
		po2mo: {
			files: {
				src:    'languages/*.po',
				expand: true,
			},
		},

		wp_readme_to_markdown: {
			your_target: {
				files: {
					'readme.md': 'readme.txt'
				},
			},
		},

	} );

	// update languages files
	grunt.registerTask( 'plugin_i18n', [
		'addtextdomain',
		'makepot:plugin',
		'po2mo',
	] );

	// update languages files
	grunt.registerTask( 'readme', [
		'wp_readme_to_markdown',
	] );

};
