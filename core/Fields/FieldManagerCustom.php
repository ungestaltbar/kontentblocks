<?php

namespace Kontentblocks\Fields;

/**
 * FieldManagerCustom
 * Use ReFields outside of module context
 * WIP
 */
class FieldManagerCustom
{

    /**
     * Unique ID from module
     * Used to prefix form fields
     * @var string
     */
    protected $baseId;

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
    protected $fieldsById;

    /**
     * Constructor
     * @param $id
     * @param array $data
     * @internal param object $module
     * @return self
     */
    public function __construct($id, $data = array())
    {
        //TODO Check module consistency
        $this->baseId = $id;
        $this->data = $data;

    }

    /**
     * Creates a new section if there is not an exisiting one
     * or returns the section
     * @param string $id
     * @param array $args
     * @return object groupobject
     */
    public function addGroup($id, $args = array())
    {
        if (!$this->idExists($id)) {
            $this->structure[$id] = new FieldSection($id, $args, false, $this);
        }
        return $this->structure[$id];

    }

    public function save($data, $oldData)
    {
        $collection = array();
        foreach ($this->structure as $definition) {
            $return = ($definition->save($data, $oldData));
            $collection = $collection + $return;
        }
        return $collection;

    }

    /**
     * Backend render method | Endpoint
     * output gets generated by attached render object
     * defaults to tabs
     * called by Kontentblocks\Modules\Module::options()
     * if not overridden by extending class
     * @see Kontentblocks\Modules\Module::options
     * TODO: update when options() was renamed
     * @return void
     */
    public function renderFields()
    {
        $Renderer = new FieldRenderTabs($this->structure);
        $Renderer->render($this->baseId, $this->data);
    }

    /**
     * Prepare fields for frontend output
     * @param array $instanceData
     */
    public function setup($instanceData)
    {
        if (empty($this->fieldsById)) {
            $this->fieldsById = $this->collectAllFields();
        }
        foreach ($this->fieldsById as $field) {
            $data = (!empty($instanceData[$field->getKey()])) ? $instanceData[$field->getKey()] : '';

            $field->setup($data, $this->baseId);
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
    public function getFieldByKey($key)
    {
        if (empty($this->fieldsById)) {
            $this->fieldsById = $this->collectAllFields();
        }

        if (isset($this->fieldsById[$key])) {
            return $this->fieldsById[$key];
        } else {
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
        foreach ($this->structure as $def) {
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
    public function idExists($id)
    {
        return (isset($this->structure[$id]));

    }

    /**
     * @param array $data
     */
    public function setData($data)
    {
        $this->data = $data;
    }

    public function isPublic()
    {
        return false;
    }

    public function prepareDataAndGet()
    {
        $collect = array();
        if (!empty($this->fieldsById)) {
            foreach ($this->fieldsById as $field) {
                $collect[$field->getKey()] = $field->getValue();
            }

            return $collect;
        }
        return $this->data;
    }
}
