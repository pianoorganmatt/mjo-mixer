<?php
/**
 * Plugin Name: Audio Mixer
 * Description: A simple WordPress plugin that uses React.
 * Version: 1.0
 * Author: Your Name
 */

// Enqueue the React script and styles
function audiomixer_enqueue_scripts() {
    wp_enqueue_script(
        'audiomixer-js',
        plugins_url('/dist/main.js', __FILE__), // Adjust this path if needed
        ['wp-element'], // WordPress' React and ReactDOM
        time(), // For cache busting during development
        true // Load script in the footer
    );
}
add_action('wp_enqueue_scripts', 'audiomixer_enqueue_scripts');

function audiomixer_view_render($atts) {
    // Extract shortcode attributes, setting 'post_id' to null by default
    $atts = shortcode_atts([
        'post_id' => null
    ], $atts);

    // Return the HTML with the post_id as a data attribute
    return '<div id="audiomixer-root" data-post-id="'.esc_attr($atts['post_id']).'"></div>';
}
add_shortcode('audio_mixer', 'audiomixer_view_render');


function setupAudioMixer(){
    if( function_exists('acf_add_options_page') ) {

        acf_add_options_page(array(
            'page_title'    => 'Audio',
            'menu_title'    => 'Audio',
            'menu_slug'     => 'audio',
            'capability'    => 'edit_posts',
            'redirect'      => false
        ));
    
    }
}

add_action('acf/init', 'setupAudioMixer');

add_action('init', function() {
    // Add CORS headers for all requests
    header("Access-Control-Allow-Origin: *"); // Change * to a specific domain for better security
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");

    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
});

require('includes/api.php');
