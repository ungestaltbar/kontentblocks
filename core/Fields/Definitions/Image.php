<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldFormController;
use Kontentblocks\Language\I18n;
use Kontentblocks\Templating\FieldView;
use Kontentblocks\Utils\AttachmentHandler;

/**
 * Single image insert/upload.
 * @return array attachment id, title, caption
 *
 */
Class Image extends Field
{

    public static $settings = array(
        'type' => 'image',
        'returnObj' => 'Image'
    );


    public function prepareTemplateData( $data )
    {
        $data['image'] = new AttachmentHandler($this->getValue('id'));
        return $data;
    }

    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue( $val )
    {


        // image default value
        $imageDefaults = array(
            'id' => null,
            'title' => '',
            'caption' => ''
        );

        $parsed = wp_parse_args( $val, $imageDefaults );

        $parsed['id'] = ( !is_null( $parsed['id'] ) ) ? absint( $parsed['id'] ) : null;
        $parsed['title'] = esc_html( $parsed['title'] );
        $parsed['caption'] = esc_html( $parsed['caption'] );

        return $parsed;

    }

}