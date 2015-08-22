<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Common\Data\AbstractModel;


/**
 * Class ModuleModel
 * Module Data Container
 *
 * @package Kontentblocks\Modules
 */
class ModuleModel extends AbstractModel
{



    /**
     * parent Module
     * @var Module
     */
    private $module;

    /**
     * @param array $data
     * @param Module $module
     * @since 0.1.0
     */
    public function __construct( $data = array(), Module $module )
    {
        $this->module = $module;
        $this->_originalData = $data;
        $this->set( $data );
        $this->_initialized = true;
    }




    /**
     * (PHP 5 &gt;= 5.4.0)<br/>
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     * @return array
     * @since 0.1.0
     */
    public function jsonSerialize()
    {
        $vars = get_object_vars( $this );
        unset( $vars['module'] );
        unset( $vars['_locked'] );
        unset( $vars['_initialized'] );
        unset( $vars['_originalData'] );
        return $vars;
    }

    /**
     *
     * @return mixed
     * @since 0.1.0
     */
    public function export()
    {
        return $this->jsonSerialize();
    }



    /**
     * @return bool
     * @ince 0.2.0
     */
    public function sync()
    {
        $storage = $this->module->environment->getStorage();
        $result = $storage->saveModule( $this->module->getId(), $this->export() );
        $storage->reset();
        return $result;
    }
}