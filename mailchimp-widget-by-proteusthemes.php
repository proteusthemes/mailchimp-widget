<?php

/*
Plugin Name: MailChimp widget by ProteusThemes
Plugin URI: https://wordpress.org/plugins/mailchimp-widget-by-proteusthemes/
Description: MailChimp widget with API integration, that allows you to select which MailChimp list you want your visitors to subscribe to.
Version: 0.1.0
Author: ProteusThemes
Author URI: http://www.proteusthemes.com
License: GPL3
License URI: http://www.gnu.org/licenses/gpl.html
Text Domain: pt-mcw
*/

// Block direct access to the main plugin file.
defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

/**
 * Main plugin class with initialization tasks.
 */
class PTMCW_Plugin {
	/**
	 * Constructor for this class.
	 */
	public function __construct() {
		// Set plugin constants.
		add_action( 'plugins_loaded', 'PTMCW_Plugin::set_plugin_constants' );

		// Register widgets.
		add_action( 'widgets_init', 'PTMCW_Plugin::register_widgets' );

		// Enqueue plugin admin assets.
		add_action( 'admin_enqueue_scripts', 'PTMCW_Plugin::enqueue_admin_scripts' );
	}

	/**
	 * Set plugin constants.
	 *
	 * Path/URL to root of this plugin, with trailing slash and plugin version.
	 */
	public static function set_plugin_constants() {
		// Path/URL to root of this plugin, with trailing slash.
		if ( ! defined( 'PT_MCW_PATH' ) ) {
			define( 'PT_MCW_PATH', plugin_dir_path( __FILE__ ) );
		}

		if ( ! defined( 'PT_MCW_URL' ) ) {
			define( 'PT_MCW_URL', plugin_dir_url( __FILE__ ) );
		}

		// The plugin version.
		if ( ! defined( 'PT_MCW_VERSION' ) ) {
			$plugin_data = get_plugin_data( __FILE__ );
			define( 'PT_MCW_VERSION', $plugin_data['Version'] );
		}
	}

	/**
	 * Register the widgets in the 'widgets_init' action hook.
	 */
	public static function register_widgets() {
		if ( ! class_exists( 'PT_Mailchimp_Subscribe' ) ) {
			require_once PT_MCW_PATH . 'inc/widget-mailchimp-subscribe.php';
		}

		register_widget( 'PT_Mailchimp_Subscribe' );
	}

	/**
	 * Enqueue admin scripts.
	 */
	public static function enqueue_admin_scripts() {
		// Enqueue admin JS.
		wp_enqueue_script( 'ptmcw-admin-js', PT_MCW_URL . '/assets/js/admin.js', array( 'jquery' ), PT_MCW_VERSION );

		// Provide the global variable to the 'ptmcw-admin-js'.
		wp_localize_script( 'ptmcw-admin-js', 'PTMCWAdminVars', array(
			'ajax_url'    => admin_url( 'admin-ajax.php' ),
			'ajax_nonce'  => wp_create_nonce( 'pt-mcw-ajax-verification' ),
			'ajax_error'  => esc_html__( 'An error occurred while retrieving data via the AJAX request!', 'pt-mcw' ),
		) );
	}
}

$ptmcw_plugin = new PTMCW_Plugin();