/* global: PTMCWAdminVars */

/**
 * The Mailchimp subscribe widget - admin area.
 */
(function ( $ ) {
	$( document ).on( 'click', '.js-connect-mailchimp-api-key', function( event ) {
		event.preventDefault();

		var apiKey = $( this ).siblings( '.js-mailchimp-api-key' ).val(),
			$noticeDiv = $( this ).parent().siblings( '.js-mailchimp-notice' ),
			$mcListContainer = $( this ).parent().siblings( '.js-mailchimp-list-container' ),
			$mcListSelect = $mcListContainer.find( 'select' ),
			$mcAccountId = $( this ).siblings( '.js-mailchimp-account-id' ),
			$selectedList = $( this ).parent().siblings( '.js-mailchimp-list-container' ).find( '.js-mailchimp-selected-list' );

		// Abort, if the API key is not set.
		if ( apiKey.length === 0 ) {
			displayNotice( 'error', PTMCWAdminVars.text.no_api_key, $noticeDiv );

			return false;
		}

		// The last 3 or 4 characters (-us4 or -us12) of the Mailchimp API key represent the datacenter.
		var matchDataCenter = apiKey.match( /us\d{1,2}$/ );

		if ( ! matchDataCenter ) {
			displayNotice( 'error', PTMCWAdminVars.text.incorrect_api_key, $noticeDiv );

			return false;
		}

		var mcDataCenter = matchDataCenter[0];

		$.ajax({
			url: PTMCWAdminVars.ajax_url,
			type: 'GET',
			dataType: 'json',
			data: {
				action:   'pt_mailchimp_subscribe_get_lists',
				security: PTMCWAdminVars.ajax_nonce,
				api_key:  apiKey,
				mc_dc:    mcDataCenter,
			},
			beforeSend:  function() {
				$( '.js-mailchimp-loader' ).show();

				// Clear notice.
				$noticeDiv.removeClass( 'updated error' ).text( '' );
			}
		})
			.done(function( response ) {
				if ( ! response.success ) {
					displayNotice( 'error', response.data.message, $noticeDiv );

					// Reset the select field and other settings.
					$mcListSelect.find( 'option' ).remove();
					$mcAccountId.val( '' );
					$selectedList.val( '' );
				}
				else {
					displayNotice( 'updated', response.data.message, $noticeDiv );

					// Reset the select field and other settings.
					$mcListSelect.find( 'option' ).remove();
					$mcAccountId.val( '' );

					// Add options to the select control.
					$.each( response.data.lists, function( key, value ) {
						$mcListSelect
							.append(
								$('<option>', { "value" : key } )
									.text(value)
							)
					} );

					// Set existing selected list.
					if ( $selectedList.val().length > 0 && $mcListSelect.find( 'option[value=' + $selectedList.val() + ']' ) ) {
						$mcListSelect.val( $selectedList.val() );
					}

					// Trigger the change event with the initialize set to true.
					$mcListSelect.trigger( 'change', true );

					// Set the correct account ID in the hidden input field.
					$mcAccountId.val( response.data.account_id );

					// Display the select container.
					$mcListContainer.show();
				}
			})
			.fail(function() {
				displayNotice( 'error', PTMCWAdminVars.text.ajax_error, $noticeDiv );

				// Reset the select field and other settings.
				$mcListSelect.find( 'option' ).remove();
				$mcAccountId.val( '' );
				$selectedList.val( '' );
			})
			.always(function() {
				$( '.js-mailchimp-loader' ).hide();
			});
	} );

	$( document ).on( 'change', '.js-mailchimp-list-container select', function( event, initialize ) {
		var $currentList = $( this ).siblings( '.js-mailchimp-selected-list' );

		if ( initialize && 0 < $currentList.val().length ) {
			$( this ).val( $currentList.val() );
		}

		$currentList.val( $( this ).val() );

	} );

	/**
	 * Helper function to display the notice.
	 *
	 * @param type       Type of the notice ( 'error' or 'updated' ).
	 * @param message    The text message.
	 * @param $noticeDiv The jQuery element to append the message to.
	 */
	function displayNotice( type, message, $noticeDiv ) {
		$noticeDiv
			.removeClass( 'updated error' )
			.addClass( type )
			.text( '' )
			.append(
				$('<p>')
					.text( message )
			);
	}
}( jQuery ));
