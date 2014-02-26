<?php

namespace Kontentblocks\Fields;

/**
 * FieldManager
 * // TODO: Change working title
 * // TODO: Rename Groups to Sections
 * Purpose of this class:
 * Connecting fields to a module and offering an API to interact with
 * fields and the underlying structure.
 *
 * There are two different cases which are handled by this class:
 * 1) Backend: preparing fields and initiate the rendering of the field output
 * 2) Frontend: Setting fields up.
 *
 * Instantiated by Kontentblocks\Modules\Module if fields() method is present
 * in extending class
 *
 * @see Kontentblocks\Modules\Module::__cosntruct()
 * @param object | Module instance
 */
class FieldManager
{

    /**
     * Unique ID from module
     * Used to prefix form fields
     * @var string
     */
    protected $moduleId;

    /**
     * Collection of added Sections / Fields ...
     * @var array
     */
    protected $structure;

    /**
     * Object to handle the section layout
     * e.g. defaults to tabs
     * @var object
     */
    protected $Render;

    /**
     * registered fields in one flat array
     * @var array
     */
    protected $FieldsById;

    /**
     * Constructor
     * @param object $module
     * @return self
     */
    public function __construct( $module )
    {
        //TODO Check module consistency
        $this->moduleId = $module->instance_id;
        $this->data     = $module->moduleData;
        $this->module   = $module;


    }

    /**
     * Creates a new section if there is not already one with the same id
     * or returns the section if exists
     * @param string $id
     * @param array $args
     * @return object groupobject
     */
    public function addGroup( $id, $args = array() )
    {
        if ( !$this->idExists( $id ) ) {
            $this->structure[ $id ] = new FieldSection( $id, $args, $this->module->getAreaContext() );
        }
        return $this->structure[ $id ];

    }

    public function save( $data, $oldData )
    {
        $collection = array();
        foreach ( $this->structure as $definition ) {
            $return     = ($definition->save( $data, $oldData ));
            $collection = $collection + $return;
        }
        return $collection;

    }

    /**
     * Backend render method | Endpoint
     * output gets generated by attached render object
     * defaults to tabs
     * called by Kontentblocks\Modules\Module::options()
     * if not overriden b extending class
     * @see Kontentblocks\Modules\Module::options
     * TODO: update when options() was renamed
     * @return void
     */
    public function renderFields()
    {
        $Renderer = new FieldRenderTabs( $this->structure );
        $Renderer->render( $this->moduleId, $this->data );

    }

    /**
     * Prepare fields for frontend output
     * @param array $instanceData
     */
    public function setup( $instanceData )
    {
        if ( empty( $this->FieldsById ) ) {
            $this->FieldsById = $this->collectAllFields();
        }
        foreach ( $this->FieldsById as $field ) {
            $data = (!empty( $instanceData[ $field->getKey() ] )) ? $instanceData[ $field->getKey() ] : '';
            $field->setup( $data, $this->moduleId );
        }

    }

    /**
     * Get a field object by key
     * returns the object on success
     * or false if key does not exist
     *
     * @param string $key
     * @return mixed
     */
    public function getFieldByKey( $key )
    {
        if ( empty( $this->FieldsById ) ) {
            $this->FieldsById = $this->collectAllFields();
        }

        if ( isset( $this->FieldsById[ $key ] ) ) {
            return $this->FieldsById[ $key ];
        }
        else {
            false;
        }

    }

    /**
     * Extract single fields from structure object
     * and stores them in one single flat array
     * @return array
     */
    public function collectAllFields()
    {
        $collect = array();
        foreach ( $this->structure as $def ) {
            $collect = $collect + $def->getFields();
        }
        return $collect;

    }

    /**
     * Helper method to check whether an section already
     * exists in group
     * @param string $id
     * @return object
     */
    public function idExists( $id )
    {
        // TODO Test for right inheritance / abstract class
        return (isset( $this->structure[ $id ] ));

    }

}
