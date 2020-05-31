<?php

/*
Plugin Name: Mailchimp widget by ProteusThemes
Plugin URI: https://wordpress.org/plugins/proteusthemes-mailchimp-widget/
Description: Mailchimp widget with API integration, that allows you to select which Mailchimp list you want your visitors to subscribe to.
Version: 1.0.5
Tested up to: 5.4.1
Author: ProteusThemes
Author URI: http://www.proteusthemes.com
License: GPL3
License URI: http://www.gnu.org/licenses/gpl.html
Text Domain: proteusthemes-mailchimp-widget
Domain Path: /languages
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

		// Enqueue plugin frontend assets.
		add_action( 'wp_enqueue_scripts', 'PTMCW_Plugin::enqueue_frontend_scripts' );
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
			define( 'PT_MCW_VERSION', '1.0.3' );
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
		wp_enqueue_script( 'ptmcw-admin-js', PT_MCW_URL . 'assets/js/admin.js', array( 'jquery' ), PT_MCW_VERSION, true );

		// Provide the global variable to the 'ptmcw-admin-js'.
		wp_localize_script( 'ptmcw-admin-js', 'PTMCWAdminVars', array(
			'ajax_url'    => admin_url( 'admin-ajax.php' ),
			'ajax_nonce'  => wp_create_nonce( 'pt-mcw-ajax-verification' ),
			'text'        => array(
				'ajax_error'        => esc_html__( 'An error occurred while retrieving data via the AJAX request!', 'proteusthemes-mailchimp-widget' ),
				'no_api_key'        => esc_html__( 'Please input the Mailchimp API key!', 'proteusthemes-mailchimp-widget' ),
				'incorrect_api_key' => esc_html__( 'This Mailchimp API key is not formatted correctly, please copy the whole API key from the Mailchimp dashboard!', 'proteusthemes-mailchimp-widget' ),
			)
		) );
	}

	/**
	 * Enqueue frontend scripts.
	 */
	public static function enqueue_frontend_scripts() {
		if ( ! apply_filters( 'pt-mcw/disable_frontend_styles', false ) ) {
			wp_enqueue_style( 'ptmcw-main-css', PT_MCW_URL . 'assets/css/main.css', array(), PT_MCW_VERSION );
		}
	}
}

$ptmcw_plugin = new PTMCW_Plugin();
