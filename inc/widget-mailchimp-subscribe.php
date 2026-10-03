<?php
/**
 * Mailchimp Subscribe Widget
 *
 * There are two hidden inputs, where the account ID and the selected list ID are saved.
 * These two fields get populated via JS, because we get the email lists from the MC API.
 *
 * @package pt-mcw
 */

if ( ! class_exists( 'PT_Mailchimp_Subscribe' ) ) {
	class PT_Mailchimp_Subscribe extends WP_Widget {

		/**
		 * Register widget with WordPress.
		 */
		public function __construct() {
			parent::__construct(
				false, // ID, auto generate when false.
				esc_html__( 'Mailchimp by ProteusThemes', 'proteusthemes-mailchimp-widget' ),
				array(
					'description' => esc_html__( 'Display a subscribe form for collecting emails with Mailchimp.', 'proteusthemes-mailchimp-widget'),
					'classname'   => 'widget-mailchimp-subscribe',
				)
			);

			// AJAX callback.
			add_action( 'wp_ajax_pt_mailchimp_subscribe_get_lists', array( $this, 'mailchimp_get_lists' ) );
		}

		/**
		 * Front-end display of widget.
		 *
		 * @see WP_Widget::widget()
		 *
		 * @param array $args
		 * @param array $instance
		 */
		public function widget( $args, $instance ) {
			$api_key       = empty( $instance['api_key'] ) ? '' : $instance['api_key'];
			$account_id    = empty( $instance['account_id'] ) ? '' : $instance['account_id'];
			$selected_list = empty( $instance['selected_list'] ) ? '' : $instance['selected_list'];
			$mc_datacenter = '';
			$form_action   = '';

			if ( empty( $account_id ) || empty( $selected_list ) || ! preg_match( '/us\d{1,2}$/', $api_key ) ) {
				if ( current_user_can( 'edit_theme_options' ) ) {
					echo $args['before_widget'];
					?>
					<p><?php esc_html_e( 'The Mailchimp account is not connected yet, so this subscribe form is hidden from visitors.', 'proteusthemes-mailchimp-widget' ); ?></p>
					<?php
					echo $args['after_widget'];
				}

				return;
			}

			if ( ! empty( $api_key ) && preg_match( '/us\d{1,2}$/', $api_key, $mc_dc_match ) ) {
				$mc_datacenter = $mc_dc_match[0];

				$form_action = sprintf(
					'//github.%1$s.list-manage.com/subscribe/post?u=%2$s&amp;id=%3$s',
					esc_attr( $mc_datacenter ),
					esc_attr( $account_id ),
					esc_attr( $selected_list )
				);
			}

			$mc_securty_string = sprintf( 'b_%1$s_%2$s', esc_attr( $account_id ), esc_attr( $selected_list ) );

			$form_texts = apply_filters( 'pt-mcw/form_texts', array(
				'email'  => esc_html__( 'Your E-mail Address', 'proteusthemes-mailchimp-widget' ),
				'submit' => esc_html__( 'Subscribe!', 'proteusthemes-mailchimp-widget' ),
			) );

			echo $args['before_widget'];
			?>
			<form <?php echo ! empty( $form_action ) ? 'action="' . esc_url( $form_action ) . '"' : ''; ?> method="post" name="mc-embedded-subscribe-form" class="mailchimp-subscribe  validate" target="_blank" novalidate>
				<input type="email" value="" name="EMAIL" class="email  form-control  mailchimp-subscribe__email-input" placeholder="<?php echo esc_html( $form_texts['email'] ); ?>" required>
				<!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
				<div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="<?php echo esc_attr( $mc_securty_string ); ?>" tabindex="-1" value=""></div>
				<input type="submit" value="<?php echo esc_html( $form_texts['submit'] ); ?>" name="subscribe" class="button  btn  btn-primary mailchimp-subscribe__submit">
			</form>
			<?php
			echo $args['after_widget'];
		}

		/**
		 * Sanitize widget form values as they are saved.
		 *
		 * @param array $new_instance The new options.
		 * @param array $old_instance The previous options.
		 */
		public function update( $new_instance, $old_instance ) {
			$defaults     = array( 'api_key' => '', 'account_id' => '', 'selected_list' => '' );
			$new_instance = wp_parse_args( (array) $new_instance, $defaults );
			$old_instance = wp_parse_args( (array) $old_instance, $defaults );
			$instance     = array();

			$instance['api_key']       = sanitize_text_field( $new_instance['api_key'] );
			$instance['account_id']    = sanitize_text_field( $new_instance['account_id'] );
			$instance['selected_list'] = sanitize_text_field( $new_instance['selected_list'] );

			if ( $instance['api_key'] === $old_instance['api_key'] ) {
				// A failed connection in the admin can submit empty values for an unchanged key, so keep the saved ones.
				foreach ( array( 'account_id', 'selected_list' ) as $key ) {
					if ( '' === $instance[ $key ] && ! empty( $old_instance[ $key ] ) ) {
						$instance[ $key ] = $old_instance[ $key ];
					}
				}
			}

			return $instance;
		}

		/**
		 * Back-end widget form.
		 *
		 * @param array $instance The widget options.
		 */
		public function form( $instance ) {
			$api_key       = empty( $instance['api_key'] ) ? '' : $instance['api_key'];
			$account_id    = empty( $instance['account_id'] ) ? '' : $instance['account_id'];
			$selected_list = empty( $instance['selected_list'] ) ? '' : $instance['selected_list'];

			?>
			<p>
				<?php esc_html_e( 'In order to use this widget, you have to: ', 'proteusthemes-mailchimp-widget' ); ?>
			</p>

			<ol>
				<li><?php printf( esc_html__( '%1$sVisit this URL and login with your mailchimp account%2$s,', 'proteusthemes-mailchimp-widget' ), '<a href="https://admin.mailchimp.com/account/api" target="_blank">', '</a>' ); ?></li>
				<li><?php printf( esc_html__( '%1$sCreate an API key%2$s and paste it in the input field below,', 'proteusthemes-mailchimp-widget' ), '<a href="http://kb.mailchimp.com/integrations/api-integrations/about-api-keys#Find-or-Generate-Your-API-Key" target="_blank">', '</a>' ); ?></li>
				<li><?php esc_html_e( 'Click on the Connect button, so that your existing Mailchimp lists can be retrieved,', 'proteusthemes-mailchimp-widget' ); ?></li>
				<li><?php esc_html_e( 'Select which list you want your visitors to subscribe to, from the dropdown menu below.', 'proteusthemes-mailchimp-widget' ); ?></li>
			</ol>

			<p>
				<label for="<?php echo $this->get_field_id( 'api_key' ); ?>"><?php esc_html_e( 'Mailchimp API key:', 'proteusthemes-mailchimp-widget' ); ?>
				</label>
				<input class="js-mailchimp-api-key" id="<?php echo $this->get_field_id( 'api_key' ); ?>" name="<?php echo $this->get_field_name( 'api_key' ); ?>" type="text" value="<?php echo esc_html( $api_key ); ?>" />
				<input class="js-connect-mailchimp-api-key  button" type="button" value="<?php esc_html_e( 'Connect', 'proteusthemes-mailchimp-widget' ); ?>">
				<input class="js-mailchimp-account-id" id="<?php echo $this->get_field_id( 'account_id' ); ?>" name="<?php echo $this->get_field_name( 'account_id' ); ?>" type="hidden" value="<?php echo esc_attr( $account_id ); ?>">
			</p>

			<p class="js-mailchimp-loader" style="display: none;">
				<span class="spinner" style="display: inline-block; float: none; visibility: visible; margin-bottom: 6px;" ></span> <?php esc_html_e( 'Loading ...', 'proteusthemes-mailchimp-widget' ); ?>
			</p>

			<div class="js-mailchimp-notice"></div>

			<p class="js-mailchimp-list-container" style="display: none;">
				<label for="<?php echo $this->get_field_id( 'list' ); ?>"><?php esc_html_e( 'Mailchimp list:', 'proteusthemes-mailchimp-widget' ); ?></label> <br>
				<select id="<?php echo $this->get_field_id( 'list' ); ?>" name="<?php echo $this->get_field_name( 'list' ); ?>"></select>
				<input class="js-mailchimp-selected-list" id="<?php echo $this->get_field_id( 'selected_list' ); ?>" name="<?php echo $this->get_field_name( 'selected_list' ); ?>" type="hidden" value="<?php echo esc_attr( $selected_list ); ?>">
			</p>

			<?php if ( ! empty( $api_key ) ) : ?>
				<script type="text/javascript">
					jQuery( '.js-connect-mailchimp-api-key' ).trigger( 'click' );
				</script>
			<?php endif; ?>

			<?php
		}

		/**
		 * AJAX callback function to retrieve the Mailchimp lists.
		 */
		public function mailchimp_get_lists() {
			check_ajax_referer( 'pt-mcw-ajax-verification', 'security' );

			if ( ! current_user_can( 'edit_theme_options' ) && ! current_user_can( 'edit_posts' ) ) {
				wp_send_json_error( array( 'message' => esc_html__( 'You are not allowed to do this.', 'proteusthemes-mailchimp-widget' ) ), 403 );
			}

			$response = array();

			$api_key       = isset( $_GET['api_key'] ) ? sanitize_text_field( wp_unslash( $_GET['api_key'] ) ) : '';
			$mc_datacenter = isset( $_GET['mc_dc'] ) ? sanitize_text_field( wp_unslash( $_GET['mc_dc'] ) ) : '';

			if ( '' === $api_key || ! preg_match( '/^us\d{1,2}$/', $mc_datacenter ) ) {
				$response['message'] = esc_html__( 'This Mailchimp API key is not formatted correctly, please copy the whole API key from the Mailchimp dashboard!', 'proteusthemes-mailchimp-widget' );

				wp_send_json_error( $response );
			}

			$args = array(
				'headers' => array(
					'Authorization' => sprintf( 'apikey %1$s', $api_key ),
				),
			);

			$mc_lists_endpoint = sprintf( 'https://%1$s.api.mailchimp.com/3.0/lists', $mc_datacenter );

			$lists  = array();
			$offset = 0;

			do {
				$request = wp_safe_remote_get( add_query_arg( array(
					'count'  => 1000,
					'offset' => $offset,
				), $mc_lists_endpoint ), $args );

				// Error while connecting to the Mailchimp server.
				if ( is_wp_error( $request ) ) {
					$response['message'] = esc_html__( 'There was an error connecting to the Mailchimp servers.', 'proteusthemes-mailchimp-widget' );

					wp_send_json_error( $response );
				}

				// Retrieve the response code and body.
				$response_code = wp_remote_retrieve_response_code( $request );
				$response_body = json_decode( wp_remote_retrieve_body( $request ), true );

				if ( ! is_array( $response_body ) ) {
					$response['message'] = esc_html__( 'There was an error connecting to the Mailchimp servers.', 'proteusthemes-mailchimp-widget' );

					wp_send_json_error( $response );
				}

				// The request was not successful.
				if ( 200 !== $response_code ) {
					$response['message'] = sprintf(
						esc_html__( 'Error: %1$s (error code: %2$s)', 'proteusthemes-mailchimp-widget' ),
						isset( $response_body['title'] ) ? $response_body['title'] : '',
						isset( $response_body['status'] ) ? $response_body['status'] : ''
					);

					wp_send_json_error( $response );
				}

				$page_lists = isset( $response_body['lists'] ) && is_array( $response_body['lists'] ) ? $response_body['lists'] : array();

				// Parse through the retrieved lists and collect the info we need.
				foreach ( $page_lists as $list ) {
					if ( isset( $list['id'], $list['name'] ) ) {
						$lists[ $list['id'] ] = $list['name'];
					}
				}

				$offset     += count( $page_lists );
				$total_items = isset( $response_body['total_items'] ) ? (int) $response_body['total_items'] : 0;
			} while ( ! empty( $page_lists ) && $offset < $total_items );

			// There are no lists in this Mailchimp account.
			if ( empty( $lists ) ) {
				$response['message'] = esc_html__( 'There are no email lists with this API key! Please create an email list in the Mailchimp dashboard and try again.', 'proteusthemes-mailchimp-widget' );

				wp_send_json_error( $response );
			}

			$mc_account_id = $this->get_mailchimp_account_id( $api_key, $mc_datacenter );

			if ( empty( $mc_account_id ) ) {
				$response['message'] = esc_html__( 'There was an error connecting to the Mailchimp servers.', 'proteusthemes-mailchimp-widget' );

				wp_send_json_error( $response );
			}

			$response['message']    = esc_html__( 'Mailchimp lists were successfully retrieved!', 'proteusthemes-mailchimp-widget' );
			$response['lists']      = $lists;
			$response['account_id'] = $mc_account_id;

			wp_send_json_success( $response );
		}


		/**
		 * Get the mailchimp account ID from the API key.
		 *
		 * @return string API key
		 */
		private function get_mailchimp_account_id( $api_key, $mc_datacenter ) {
			$args = array(
				'headers' => array(
					'Authorization' => sprintf( 'apikey %1$s', $api_key ),
				),
			);

			$mc_account_endpoint = sprintf( 'https://%1$s.api.mailchimp.com/3.0/', $mc_datacenter );

			$request = wp_safe_remote_get( $mc_account_endpoint, $args );

			if ( is_wp_error( $request ) || 200 !== wp_remote_retrieve_response_code( $request ) ) {
				return false;
			}

			$body = json_decode( wp_remote_retrieve_body( $request ), true );

			return isset( $body['account_id'] ) ? $body['account_id'] : false;
		}

	}
}
