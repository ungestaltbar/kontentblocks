<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Kontentblocks;

/**
 * Simple text input field
 * Additional args are:
 * type - specific html5 input type e.g. number, email... .
 *
 */
Class Gallery2 extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'gallery2',
        'returnObj' => 'Gallery'
    );


    /**
     * Runs when data is set to the field
     * @param $data
     * @return mixed
     */
    public function inputFilter( $data )
    {
        $forJSON = null;
        if (!empty( $data['images'] ) && is_array( $data['images'] )) {
            foreach ($data['images'] as &$image) {
                if (isset( $image['id'] )) {
                    $image['file'] = wp_prepare_attachment_for_js( $image['id'] );
                }
            }
            $forJSON = $data;
        }
        $jsonTransport = Kontentblocks::getService( 'utility.jsontransport' );
        $jsonTransport->registerFieldData(
            $this->getFieldId(),
            $this->type,
            $forJSON,
            $this->getKey(),
            $this->getArg( 'arrayKey' )
        );
        return $data;
    }

    public function save( $data, $old )
    {
        if (is_null( $data )) {
            return $old;
        }

        if (!isset($data['images']) || !is_array($data['images'])){
            return $old;
        }

        $data['images'] = array_map(function($imageId){
            return absint($imageId);
        }, $data['images']);


        return $data;

    }

    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $val )
    {
        return $val;
    }
}