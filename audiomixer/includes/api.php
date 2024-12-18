<?php

add_action('rest_api_init', 'initApiRoutes');

function initApiRoutes(){
    @register_rest_route(
        'audiomixer', '/gettracks', [
            'method' => 'GET',
            'callback' => 'getAudioTracks'
        ]
        );
}

function getAudioTracks(){
    try{
        $rows = get_field('audio_tracks', 'option');
        $title = get_the_title($post_id);
        echo json_encode(['status' => 200, 'tracks' => $rows, 'post_id'=> $post_id,'title'=>$title]);
    }catch(Exception $e){
        echo json_encode(['status' => 500, 'msg' => 'Someting went wrong.']);
    }
}



// Register REST API route
add_action('rest_api_init', function () {
    register_rest_route('audiomixer', '/fetch-file', array(
        'methods' => 'GET',
        'callback' => 'cff_fetch_file',
        'permission_callback' => '__return_true', // Adjust this for production security
    ));
});

/**
 * Fetch file and return as a blob.
 */
function cff_fetch_file($request) {
    $url = $request->get_param('url');

    if (empty($url)) {
        return new WP_Error('no_url', 'No URL provided', array('status' => 400));
    }

    // Fetch the file content
    $response = wp_remote_get($url);
    if (is_wp_error($response)) {
        return new WP_Error('failed_fetch', 'Failed to fetch the file', array('status' => 500));
    }

    $body = wp_remote_retrieve_body($response);
    $content_type = wp_remote_retrieve_header($response, 'content-type');

    if (empty($body)) {
        return new WP_Error('empty_file', 'File is empty or could not be read', array('status' => 500));
    }

    return new WP_REST_Response($body, 200, array(
        'Content-Type' => $content_type ? $content_type : 'application/octet-stream', // Default to a generic binary if unknown
        'Content-Disposition' => 'attachment', // Force download
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
    ));
}

