<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Checkboxset
 * Multiple key => value pairs as checkboxes
 * 
 */
Class CheckboxSet extends Field
{

    // Field defaults
    protected $defaults = array(
        'renderHidden' => true
    );

    /**
     * Checkboxset form html
     * @throws Exception
     */
    public function form()
    {
        $options = $this->getArg( 'options', array() );
        $data    = $this->getValue();

        $this->label();

        foreach ( $options as $item ) {

            if ( !isset( $item[ 'key' ] ) OR !isset( $item[ 'label' ] ) OR !isset( $item[ 'value' ] ) ) {
                throw new Exception( 'Provide valid checkbox items. Check your code. Either a key, value or label is missing' );
            }

            $checked = ($item[ 'value' ] === $data[ $item[ 'key' ] ]) ? 'checked="checked"' : '';
            echo "<div class='kb-checkboxset-item'><label><input type='checkbox' id='{$this->get_field_id()}' name='{$this->get_field_name( true, $item[ 'key' ], false )}' value='{$item[ 'value' ]}'  {$checked} /> {$item[ 'label' ]}</label></div>";
        }

        $this->description();

    }

    /**
     * Custom save filter
     * Unchecked boxes will get the value FALSE
     * 'fake' boolean values get converted to true ones,
     * means any of these: '1', 'on', 'true', '0', 'false', 'off'
     * Important to note that you must not define a value as FALSE in the options array,
     * in that case you'll have a hard time.
     * @param array $fielddata - from $_POST
     * @param array $old - as saved
     * @return array
     */
    public function save( $fielddata, $old )
    {
        $collect = array();
        $options = $this->getArg( 'options' );

        foreach ( $options as $k => $v ) {

            if ( !isset( $fielddata[ $v[ 'key' ] ] ) ) {
                $fielddata[ $v[ 'key' ] ] = FALSE;
            }
        }

        if ( is_array( $fielddata ) && !empty( $fielddata ) ) {
            foreach ( $fielddata as $k => $v ) {

                if ( $this->getArg( 'filter', true ) ) {
                    $filtered = filter_var( $v, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE );
                }
                else {
                    $filtered = $v;
                }

                if ( $filtered === NULL ) {
                    $collect[ $k ] = $v;
                }
                else {
                    $collect[ $k ] = $filtered;
                }
            }
        }
        return $collect;

    }

    public function filter( $fielddata )
    {
        $collect = array();
        if ( !empty( $fielddata ) ) {
            foreach ( $fielddata as $k => $v ) {

                if ( $this->getArg( 'filter', true ) ) {
                    $filtered = filter_var( $v, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE );
                }
                else {
                    $filtered = $v;
                }

                if ( $filtered !== NULL ) {
                    $collect[ $k ] = $filtered;
                }
                else {
                    $collect[ $k ] = $v;
                }
            }
        }
        return $collect;

    }

}

kb_register_fieldtype( 'checkboxset', 'Kontentblocks\Fields\Definitions\CheckboxSet' );
