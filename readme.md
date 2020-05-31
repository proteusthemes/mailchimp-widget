# Mailchimp Widget by ProteusThemes #
**Contributors:** capuderg, cyman, Prelc, proteusthemes  
**Tags:** email, newsletter, widget, mailchimp, wordpress, form, plugin, subscribe, landing page  
**Requires at least:** 4.0.0  
**Tested up to:** 5.4.1  
**Stable tag:** 1.0.3  
**License:** GPLv3 or later  

Capture your visitor's email address and subscribe them to your newsletter campaign with this simple Mailchimp widget plugin!

## Description ##

This plugin registers a custom WordPress widget called **Mailchimp by ProteusThemes**. This widget will allow you to connect to your Mailchimp account with your API key and you will be able to select the list you want your visitors to subscribe to.

This widget can be used for all sorts of things, like: newsletter, lead capture, email sequence, and much more!

The Widget will output an email input field and a submit button, that's all you need to capture your visitor's email address. Main idea behind this plugin is that's easy and simple to use.

**Do you want to contribute?**

Please refer to the official [GitHub repository](https://github.com/proteusthemes/mailchimp-widget) of this plugin.

## Installation ##

**From your WordPress dashboard**

1. Visit 'Plugins > Add New',
2. Search for 'Mailchimp widget by ProteusThemes' and install the plugin,
3. Activate 'Mailchimp widget by ProteusThemes' from your Plugins page.

**From WordPress.org**

1. Download 'Mailchimp widget by ProteusThemes'.
2. Upload the 'proteusthemes-mailchimp-widget' directory to your '/wp-content/plugins/' directory, using your favorite method (ftp, sftp, scp, etc...)
3. Activate 'Mailchimp widget by ProteusThemes' from your Plugins page.

**Once the plugin is activated you will find the widget (Mailchimp by ProteusThemes) in Appearance -> Widgets or in your page builder, if it supports widgets**

## Frequently Asked Questions ##

### How do I disable the default widget form styles? ###

You can do that easily with a help of custom WP filter. Please add this code to your theme:

`add_filter( 'pt-mcw/disable_frontend_styles', '__return_true' );`

### How do I change the texts of the widget? ###

You can change it with a help of custom WP filter. Please add this code to your theme and change the texts to your liking:


	function pt_mcw_form_texts() {
	    return array(
	        'email'  => esc_html__( 'Your E-mail Address', 'pt-mcw' ),
	        'submit' => esc_html__( 'Subscribe!', 'pt-mcw' ),
	    );
	}
	add_filter( 'pt-mcw/form_texts', 'pt_mcw_form_texts' );


## Screenshots ##

### 1. Widget settings ###
![Widget settings](http://ps.w.org/mailchimp-widget-by-proteusthemes/assets/screenshot-1.png)

### 2. Widget frontend with basic design ###
![Widget frontend with basic design](http://ps.w.org/mailchimp-widget-by-proteusthemes/assets/screenshot-2.png)

### 3. Widget frontend with styled design ###
![Widget frontend with styled design](http://ps.w.org/mailchimp-widget-by-proteusthemes/assets/screenshot-3.png)


## Changelog ##

### 1.0.3 ###

*Release Date - 25 September 2017*

* Improve CSS code

### 1.0.2 ###

*Release Date - 10 August 2017*

* Remove unneeded frontend HTML markup

### 1.0.1 ###

*Release Date - 21 July 2017*

* Fix HTML validation errors

### 1.0.0 ###

*Release Date - 3 July 2017*

* Initial release!
