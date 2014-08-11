<?php

namespace Kontentblocks;

use Kontentblocks\Backend\DataProvider\PostMetaDataProvider;
use Kontentblocks\Backend\Storage\PostMetaModuleStorage;
use Kontentblocks\Frontend\AreaRenderer;

/**
 * Register Area
 * @param $args
 */
function registerArea( $args )
{
    /** @var \Kontentblocks\Backend\Areas\AreaRegistry $AreaRegistry */
    $AreaRegistry = Kontentblocks::getService( 'registry.areas' );
    $AreaRegistry->addArea( $args, true );

}

/**
 * Register Area template
 * @param $args
 */
function registerAreaTemplate( $args )
{
    $defaults = array
    (
        'id' => '',
        'label' => '',
        'layout' => array(),
        'last-item' => false,
        'thumbnail' => null,
        'cycle' => false
    );

    $settings = wp_parse_args( $args, $defaults );

    if (!empty( $settings['id'] )) {
        Kontentblocks::getService( 'registry.areas' )->addTemplate( $settings );
    }

}


/**
 * Render a single area by id
 * @param string $area
 * @param int $id
 * @param array $additionalArgs
 */
function renderSingleArea( $area, $id, $additionalArgs )
{
    global $post;
    $postId = ( null === $id ) ? $post->ID : $id;
    $AreaRender = new AreaRenderer( $postId, $area, $additionalArgs );
    $AreaRender->render( true );
}


/**
 * Render attached side(bar) areas
 * @param int $id
 * @param array $additionalArgs
 */
function renderSideAreas( $id, $additionalArgs )
{
    global $post;

    $post_id = ( null === $id ) ? $post->ID : $id;
    $areas = get_post_meta( $post_id, 'active_sidebar_areas', true );
    if (!empty( $areas )) {
        foreach ($areas as $area) {
            $AreaRender = new AreaRenderer( $area, $area, $additionalArgs );
            $AreaRender->render( true );

        }
    }
}


/**
 * Test if an area has modules attached
 * @param string $area
 * @param int $id
 * @return mixed
 */
function hasModules( $area, $id )
{
    global $post;
    if ($post === null && $id === null) {
        return false;
    }
    $post_id = ( null === $id ) ? $post->ID : $id;

    $Meta = new PostMetaModuleStorage( $post_id );
    return $Meta->hasModules( $area );
}