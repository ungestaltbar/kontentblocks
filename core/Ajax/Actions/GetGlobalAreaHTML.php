<?php

namespace Kontentblocks\Ajax\Actions;

use Kontentblocks\Ajax\AjaxActionInterface;
use Kontentblocks\Ajax\AjaxErrorResponse;
use Kontentblocks\Ajax\AjaxSuccessResponse;
use Kontentblocks\Areas\AreaSettingsModel;
use Kontentblocks\Areas\DynamicAreaBackendHTML;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorageInterface;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class GetGlobalAreaHTML
 * Runs when area status change
 * @author Kai Jacobsen
 * @package Kontentblocks\Ajax
 */
class GetGlobalAreaHTML implements AjaxActionInterface
{
    static $nonce = 'kb-update';

    public static function run( ValueStorageInterface $Request )
    {

        $postId = $Request->getFiltered( 'post_id', FILTER_SANITIZE_NUMBER_INT );
        $areaId = $Request->getFiltered( 'areaId', FILTER_SANITIZE_STRING );
        $settings = $Request->get( 'settings' );

        $Environment = Utilities::getEnvironment( $postId );
        $Area = $Environment->getAreaDefinition( $areaId );

        $AreaSettings = new AreaSettingsModel( $Area, $Environment );
        $AreaSettings->import( Utilities::validateBoolRecursive( $settings ) );
        $update = $AreaSettings->save();

        if ($AreaSettings->isAttached()) {

            $HTML = new DynamicAreaBackendHTML( $Area, $Environment, $Area->context );
            ob_start();
            $HTML->build();
            $html = ob_get_clean();
        }

        if ($update) {
            new AjaxSuccessResponse(
                'Area Settings updated', array(
                    'settings' => $AreaSettings,
                    'html' => $html
                )
            );
        } else {
            new AjaxErrorResponse( 'Area Settings not updated', $AreaSettings );
        }

    }
}
