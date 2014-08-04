<?php

namespace Kontentblocks\Fields;

/**
 * FieldManager
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
 * @param \Kontentblocks\Modules\Module
 */
class FieldManager extends AbstractFieldManager
{

    protected $renderEngineClass = 'Kontentblocks\Fields\FieldRendererTabs';

    /**
     * Constructor
     * @param Kontentblocks\Modules\Module
     * @since 1.0.0
     */
    public function __construct( $Module )
    {
        //TODO Check module consistency
        $this->baseId = $Module->instance_id;
        $this->data = $Module->moduleData;
        $this->Module = $Module;
    }

    /**
     * Creates a new section if there is not already one with the same id
     * or returns the section if exists
     * @param string $id
     * @param array $args
     * @param Kontentblocks\Modules\Module
     * @return object
     * @since 1.0.0
     */
    public function addGroup( $id, $args = array() )
    {
        if (!$this->idExists( $id )) {
            $this->Structure[$id] = new FieldSection( $id, $args, $this->Module->envVars, $this->Module );
        }
        return $this->Structure[$id];

    }


    /**
     * Backend render method | Endpoint
     * output gets generated by attached render object
     * defaults to tabs
     * called by Kontentblocks\Modules\Module::options()
     * if not overridden b extending class
     * @see Kontentblocks\Modules\Module::options
     * TODO: update when options() was renamed
     * @return void
     * @since 1.0.0
     */
    public function renderFields()
    {
        $Renderer = new $this->renderEngineClass;
        $Renderer->setStructure( $this->Structure );
        $Renderer->render( $this->baseId, $this->data );

    }


    /**
     *
     * @param $class
     */
    public function setRenderEngineClass( $class )
    {
        //@TODO verify against abstract/interface
        $this->renderEngineClass = $class;
    }
}
