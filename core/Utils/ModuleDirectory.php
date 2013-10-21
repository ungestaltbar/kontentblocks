<?php

namespace Kontentblocks\Utils;

use Kontentblocks\Admin\AbstractDataContainer,
    Kontentblocks\Modules\Module;

class ModuleDirectory
{

    static $instance;
    public $modules = array();

    public static function getInstance()
    {
        if ( null == self::$instance ) {
            self::$instance = new self;
        }


        return self::$instance;

    }

    public function add( $classname )
    {
        
        if ( !isset( $this->modules[ 'classname' ] ) && property_exists( $classname, 'defaults' ) ) {
            $args = $classname::$defaults;
            $args['class'] = $classname;
            $args = wp_parse_args($args, Module::getDefaults());
            $this->modules[ $classname ] = $args;
        } 

    }

    public function get( $classname )
    {
        if ( isset( $this->modules[ $classname ] ) ) {
            return $this->modules[ $classname ];
        }
        else {
            return new \Exception( 'Cannot get module from collection' );
        }

    }

    public function getAllModules( AbstractDataContainer $dataContainer )
    {
        if ( $dataContainer->isPostContext() ) {
            return $this->modules;
        }
        else {
            return array_filter( $this->modules, array( $this, '_filterForGlobalArea' ) );
        }

    }

    public function _filterForGlobalArea( $module )
    {
        if ( isset($module['globallyAvailable']) && $module['globallyAvailable'] === true ) {
            return $module;
        }

    }

    public function getModuleTemplates()
    {
        return array_filter( $this->modules, array( $this, '_filterModuleTemplates' ) );

    }

    private function _filterModuleTemplates( $module )
    {
        if ( isset( $module->settings[ 'templateable' ] ) and $module->settings[ 'templateable' ] == true ) {
            return $module;
        }

    }

}
