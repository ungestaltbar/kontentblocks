<?php

namespace Kontentblocks;

use Kontentblocks\Backend\DataProvider\DataProviderController;
use Kontentblocks\Backend\Screen\Layouts\EditScreenLayoutsRegistry;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Frontend\AreaRenderer;
use Kontentblocks\Frontend\RenderSettings;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\JSONTransport;
use Kontentblocks\Utils\Utilities;

/**
 * Register Area
 * @param $args
 */
function registerArea( $args )
{
    /** @var \Kontentblocks\Areas\AreaRegistry $AreaRegistry */
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
 * @param string $areaId
 * @param int $pid
 * @param array $additionalArgs
 * @return string|void
 */
function renderSingleArea( $areaId, $pid = null, $additionalArgs = array() )
{
    global $post;
    $postId = ( is_null( $pid ) && !is_null( $post ) ) ? $post->ID : $pid;


    if (is_null( $postId )) {
        return null;
    }


    /** @var \Kontentblocks\Areas\AreaRegistry $registry */
    $registry = Kontentblocks::getService( 'registry.areas' );
    if ($registry->isDynamic( $areaId )) {
        $areaDef = $registry->getArea( $areaId );
        $environment = Utilities::getEnvironment( $areaDef->parent_id, $postId );
    } else {
        $environment = Utilities::getEnvironment( $postId );
    }

    $area = $environment->getAreaDefinition( $areaId );


    if (!$area) {
        return '';
    }

    $renderSettings = new RenderSettings( $additionalArgs, $area );
    if (is_a($renderSettings->view, '\Kontentblocks\Frontend\AreaFileRenderer', true)){
        $renderer = new $renderSettings->view($environment, $renderSettings);
    } else {
        $renderer = new AreaRenderer( $environment, $renderSettings );
    }

    $renderer->render( true );
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
            renderSingleArea( $area, $post_id, $additionalArgs );
        }
    }
}


function renderContext( $context, $id, $additionalArgs = array() )
{
    global $post;
    $post_id = ( null === $id ) ? $post->ID : $id;

    $Environment = Utilities::getEnvironment( $post_id );
    $areas = $Environment->getAreasForContext( $context );
    $contextsOrder = $Environment->getDataProvider()->get( 'kb.contexts' );

    if (is_array( $contextsOrder ) && !empty( $contextsOrder )) {
        foreach ($contextsOrder as $context => $areaIds) {
            if (is_array( $areaIds )) {
                foreach (array_keys( $areaIds ) as $areaId) {
                    if (isset( $areas[$areaId] )) {
                        $tmp = $areas[$areaId];
                        unset( $areas[$areaId] );
                        $areas[$areaId] = $tmp;
                    }
                }
            }
        }
    }

    if (!empty( $areas )) {
        foreach (array_keys( $areas ) as $area) {
            $args = [ ];
            if (array_key_exists( $area, $additionalArgs )) {
                $args = Utilities::arrayMergeRecursive( $additionalArgs[$area], $additionalArgs );
            } else {
                $args = $additionalArgs;
            }

            renderSingleArea( $area, $post_id, $additionalArgs );
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

    $E = Utilities::getEnvironment( $id );
    $areas = $E->getModulesForArea( $area );

    return !empty( $areas );
}


function getPanel( $id = null, $post_id = null )
{
    return getPostPanel( $id, $post_id );
}

function getPostPanel( $panelId = null, $postId = null )
{

    if (is_null( $postId )) {
        $postId = get_the_ID();
    }

    $Environment = Utilities::getEnvironment( $postId );

    $Panel = $Environment->getPanelObject( $panelId );
    /** @var \Kontentblocks\Panels\OptionsPanel $Panel */
    if (is_a( $Panel, "\\Kontentblocks\\Panels\\AbstractPanel" )) {
        return $Panel;
    } else {
        return new \WP_Error(
            'Kontentblocks',
            'Panel with requested id does not exist.',
            array( 'request' => $panelId, 'line' => __LINE__, 'file' => __FILE__ )
        );
    }
}

/**
 * @return EditScreenLayoutsRegistry
 */
function EditScreenLayoutsRegistry()
{
    return Kontentblocks()->getService( 'registry.screenLayouts' );
}

/**
 * @return JSONTransport
 */
function JSONTransport()
{
    return Kontentblocks()->getService( 'utility.jsontransport' );
}