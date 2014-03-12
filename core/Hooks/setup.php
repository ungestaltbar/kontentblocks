<?php

namespace Kontentblocks\Hooks;

/*
 * Add Plugin Theme Support
 */
use Kontentblocks\Backend\Storage\BackupManager;
add_theme_support('kontentblocks');


/*
 * Remove Editor from built-in Post Types, Kontentblocks will handle this instead.
 * above action will remove submit button from media upload as well
 * uses @filter get_media_item_args to readd the submit button
 */

function remove_editor_support()
{
    // hidden for pages by default
    if (apply_filters('kb_remove_editor_page', false)) {
        remove_post_type_support('page', 'editor');
    }

    // visible for posts by default
    if (apply_filters('kb_remove_editor_post', false)) {
        remove_post_type_support('post', 'editor');
    }

}

add_action('init', __NAMESPACE__ . '\remove_editor_support');


function deleteBackup($post_id)
{
    BackupManager::deletePostCallback($post_id);
}

add_action('delete_post', __NAMESPACE__ . '\deleteBackup');

/*
 * Media Library Fix
 *  re-adds the submit button to the media upload
 *  @todo Outdated
 */

function readd_submit_button($args)
{
    $args['send'] = true;
    return $args;

}

add_filter('get_media_item_args', __NAMESPACE__ . '\readd_submit_button', 99, 1);

