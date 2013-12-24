<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Prebuild select field to chose one entry of a taxonomy
 */
Class ChoseTaxonomy extends Field
{

    /**
     * Select field form html
     */
    public function form()
    {
        $tax = $this->getArg( 'taxonomy' );

        if ( !$tax ) {
            echo __( 'Please set a taxonomy to show', 'kontentblocks' );
            return;
        }

        if ( !taxonomy_exists( $tax ) ) {
            echo __( 'Such a Taxonomy does not exist yet', 'kontentblocks' );
            return;
        }

        $query = array(
            'hide_empty' => false,
            'taxonomy' => $tax
        );

        $terms = get_terms( $tax, $query );

        $this->label();

        print "<select id='{$this->get_field_id()}' name='{$this->get_field_name()}'>";

        if ( $this->getArg( 'empty', true ) ) {
            print "<option value='' name=''>Bitte wählen</option>";
        }

        if ( !empty( $terms ) ) {
            foreach ( $terms as $term ) {
                $selected = selected( $this->getValue(), $term->slug, false );
                print "<option {$selected} value='{$term->slug}'>{$term->name}</option>";
            }
        }

        print "</select>";

        $this->description();

    }

}

// register
kb_register_fieldtype( 'chosetaxonomy', 'Kontentblocks\Fields\Definitions\ChoseTaxonomy' );