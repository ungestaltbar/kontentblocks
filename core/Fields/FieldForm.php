<?php

namespace Kontentblocks\Fields;


use Kontentblocks\Utils\Utilities;

/**
 * Handles form creation (backend) and such
 * Class FieldForm
 * @package Kontentblocks\Fields
 */
class FieldForm
{

    /**
     * @var \Kontentblocks\Fields\Field
     */
    private $Field;

    /**
     * @param Field $Field
     */
    public function __construct( Field $Field )
    {
        $this->Field = $Field;

        // optional call to simplify enqueueing
        if (method_exists( $Field, 'enqueue' )) {
            $Field->enqueue();
        }

    }


    /**
     * Helper to generate a unique id to be used with labels and inputs, basically.
     * @param bool $rnd
     * @return string|void
     */
    public function getInputFieldId( $rnd = false )
    {
        $number = ( $rnd ) ? '_' . uniqid() : '';
        $idAttr = sanitize_title( $this->Field->getFieldId() . '_' . $this->Field->getKey()  . $number );
        return esc_attr( $idAttr );
    }

    /**
     * Helper to generate input names and connect them to the current module
     * This method has options to generate a name, name[] or name['key'] and probably some
     * more hidden possibilities :)
     *
     * @param bool $array - if true add [] to the key
     * @param bool $akey - if true add ['$akey'] to the key
     * @param bool $multiple
     *
     * @return string
     */
    public function getFieldName( $array = null, $akey = null, $multiple = null )
    {

        $base = $this->Field->getBaseId() . '[' . $this->Field->getKey() . ']';
        $array = $this->evaluateFieldNameParam( $array );
        $akey = $this->evaluateFieldNameParam( $akey );
        $multiple = $this->evaluateFieldNameParam( $multiple );

        return esc_attr( $base . $array . $akey . $multiple );

    }

    public function getOldFieldName( $array = false, $akey = null, $multiple = false )
    {
        if ($array === true && $akey !== null && $multiple) {
            return esc_attr( "{$this->Field->getBaseId()}[{$this->Field->getKey()}][{$akey}][]" );
        } elseif ($array === true && $akey !== null) {
            return esc_attr( "{$this->Field->getBaseId()}[{$this->Field->getKey()}][{$akey}]" );
        } else if (is_bool( $array ) && $array === true) {
            return esc_attr( "{$this->Field->getBaseId()}[{$this->Field->getKey()}][]" );
        } else if (is_string( $array ) && is_string( $akey ) && is_string( $multiple )) {
            return esc_attr( "{$this->Field->getBaseId()}[{$this->Field->getKey()}][$array][$akey][$multiple]" );
        } else if (is_string( $array ) && is_string( $akey ) && $multiple) {
            return esc_attr( "{$this->Field->getBaseId()}[{$this->Field->getKey()}][$array][$akey][]" );
        } else if (is_string( $array ) && is_string( $akey )) {
            return esc_attr( "{$this->Field->getBaseId()}[{$this->Field->getKey()}][$array][$akey]" );
        } else if (is_string( $array )) {
            return esc_attr( "{$this->Field->getBaseId()}[{$this->Field->getKey()}][$array]" );
        } else {
            return esc_attr( "{$this->Field->getBaseId()}[{$this->Field->getKey()}]" );
        }
    }

    /**
     * @param mixed $param
     * @return string
     */
    private function evaluateFieldNameParam( $param )
    {
        if (is_bool( $param ) && $param === true) {
            return '[]';
        }

        if (is_string( $param ) && !empty( $param )) {
            return "[$param]";
        }

        return '';
    }

    /**
     * Shortcut method to placeholder arg
     * @return string|void
     */
    public function getPlaceholder()
    {
        return esc_attr( $this->Field->getArg( 'placeholder', '' ) );

    }

    /**
     * Renders description markup
     * Get description if available
     * @since 1.0.0
     */
    public function description()
    {
        $description = $this->Field->getArg( 'description' );
        if (!empty( $description )) {
            echo "<p class='description kb-field--description'>{$this->Field->getArg( 'description' )}</p>";
        }

    }


    /**
     * Helper Method to create a complete label tag
     * @since 1.0.0
     */
    public function label()
    {
        $label = $this->Field->getArg( 'label' );
        if (!empty( $label )) {
            echo "<label class='kb_label heading kb-field--label-heading' for='{$this->getInputFieldId(
            )}'>{$this->Field->getArg(
                'label'
            )}</label>";
        }
    }

    /**
     * Handles the generation of hidden input fields with the correct data
     * @return bool false if there is no data to render
     * @since 1.0.0
     */
    public function renderHidden()
    {
        $value = $this->Field->getValue();
        if (empty( $value )) {
            return false;
        }

        if (is_array( $value )) {
            $is_assoc = Utilities::isAssocArray( $value );

            if (!$is_assoc) { // index array
                foreach ($value as $item) {
                    if (is_array( $item ) && Utilities::isAssocArray( $item )) {
                        foreach ($item as $ikey => $ival) {
                            echo "<input type='hidden' name='{$this->getFieldName(
                                $ikey,
                                true,
                                null
                            )}' value='{$ival}' >";
                        }
                    } else {
                        foreach ($item as $singleItem){
                            echo "<input type='hidden' name='{$this->getFieldName( true )}' value='{$singleItem}' >";
                        }
                    }
                }
            } else {
                foreach ($value as $k => $v) {
                    if (is_array($v) && Utilities::isAssocArray($v)){
                        foreach($v as $kk => $kv){
                            echo "<input type='hidden' name='{$this->getFieldName( $k, $kk )}' value='{$kv}' >";
                        }
                    } else {
                        foreach($v as  $vvv){
                            echo "<input type='hidden' name='{$this->getFieldName( $k, true )}' value='{$vvv}' >";
                        }

                    }
                }
            }
        } else {
            echo "<input type='hidden' name='{$this->getOldFieldName()}' value='{$value}' >";
        }
    }


    /**
     * Header wrap markup
     * @since 1.0.0
     */
    public function header()
    {

        $title = $this->Field->getArg( 'title' );

        echo '<div class="kb-field-wrapper kb-js-field-identifier" id=' . esc_attr( $this->Field->uniqueId ) . '>'
             . '<div class="kb-field-header">';
        if (!empty( $title )) {
            echo "<h4>" . esc_html( $title ) . "</h4>";
        }
        echo '</div>';
        echo "<div class='kb_field kb-field kb-field--{$this->Field->getSetting( 'type' )} kb-field--reset clearfix'>";

    }

    /**
     * Field body markup
     * This method calls the actual form() method.
     * @since 1.0.0
     */
    public function body()
    {

        $value = $this->Field->getValue();
        /*
         * optional method to render something before the field
         */
        if (method_exists( $this->Field, 'preForm' )) {
            $this->Field->preForm();
        }

        // custom method on field instance level wins over class method
        if ($this->Field->getCallback( 'input' )) {
            $this->Field->value = call_user_func( $this->Field->getCallback( 'input' ), $value );
        } // custom method on field class level
        else {
            $this->Field->value = $this->Field->prepareFormValue( $value );
        }

        // When viewing from the frontend, an optional method can be used for the output
        if (defined( 'KB_ONSITE_ACTIVE' ) && KB_ONSITE_ACTIVE && method_exists( $this->Field, 'frontsideForm' )) {
            $this->Field->frontsideForm( $this );
        } else {
            $this->Field->form( $this );
        }

        // some fields (colorpicker etc) might have some individual settings
        $this->Field->javascriptSettings();
        /*
         * optional call after the body
         */
        if (method_exists( $this->Field, 'postForm' )) {
            $this->Field->postForm();
        }

    }

    /**
     * Footer, close wrapper
     * @since 1.0.0
     */
    public function footer()
    {
        echo "</div></div>";

    }

    /**
     * Render form segments or hidden
     */
    public function build()
    {
        // A Field might not be present, i.e. if it's not set to
        // the current context
        // Checkboxes are an actual use case, checked boxes will render hidden to preserve the value during save
        if (!$this->Field->getDisplay()) {
            if ($this->Field->getSetting( 'renderHidden' ) && method_exists($this->Field, 'renderHidden')) {
                $this->Field->renderHidden($this);
            }
            // Full markup
        } else {
            $this->header();
            $this->body();
            $this->footer();
        }
    }

}