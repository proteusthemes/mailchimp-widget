/* global: PTMCWAdminVars */

/**
 * The MailChimp subscribe widget - admin area.
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
			return false;
		}

		// The last 3 characters of the MailChimp API key represent the datacenter.
		var mcDataCenter = apiKey.match( /us\d{1,2}$/ )[0];

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
			}
		})
			.done(function( response ) {
				if ( ! response.success ) {
					$noticeDiv
						.addClass( 'error' )
						.removeClass( 'updated' )
						.text( '' )
						.append(
							$('<p>')
								.text( response.data.message )
						);

					// Reset the select field and other settings.
					$mcListSelect.find( 'option' ).remove();
					$mcAccountId.val( '' );
					$selectedList.val( '' );
				}
				else {
					$noticeDiv
						.addClass( 'updated' )
						.removeClass( 'error' )
						.text( '' )
						.append(
							$('<p>')
								.text( response.data.message )
						);

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
				$noticeDiv
					.addClass( 'error' )
					.removeClass( 'updated' )
					.text( '' )
					.append(
						$('<p>')
							.text( PTMCWAdminVars.ajax_error )
					);

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
}( jQuery ));
