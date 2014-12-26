<?php

namespace Kontentblocks\Utils;

/**
 * Class JSONTransport
 * Collect specific or arbitrary data arrays during run time
 * output as json_encoded strings in wp_footer resp. admin_footer()
 * @package Kontentblocks\Utils
 */
class JSONTransport
{

    protected $data = array();
    protected $publicData = array();
    protected $modules = array();
    protected $areas = array();
    protected $fieldData = array();
    protected $Fields = array();


    /**
     * Class constructor
     *
     * Register actions
     *
     * @since 1.0.0
     * @action wp_print_footer_script
     * @action admin_footer
     */
    public function __construct()
    {

        if (is_user_logged_in() && current_user_can( 'edit_kontentblocks' )) {
            add_action( 'wp_print_footer_scripts', array( $this, 'printJSON' ), 9 );
            add_action( 'admin_footer', array( $this, 'printJSON' ), 9 );
        }
        add_action( 'wp_print_footer_scripts', array( $this, 'printPublicJSON' ), 9 );
        add_action( 'admin_footer', array( $this, 'printPublicJSON' ), 9 );

    }

    /**
     * Register arbitrary data
     *
     * @param string $group key of collection
     * @param string $key key of data entry
     * @param mixed $data value of data entry
     *
     * @since 1.0.0
     * @return object self
     */
    public function registerData( $group, $key, $data )
    {

        if (is_null( $key )) {
            $this->data[$group] = $data;
        } else {
            $this->data[$group][$key] = $data;
        }

        return $this;
    }

    /**
     * Register data which must be available to not logged in users
     *
     * @param string $group key of collection
     * @param string $key key of data entry
     * @param mixed $data value of data entry
     *
     * @since 1.0.0
     * @return object $this
     */
    public function registerPublicData( $group, $key, $data )
    {
        if (is_null( $key )) {
            $this->publicData[$group] = $data;
        } else {
            $this->publicData[$group][$key] = $data;
        }

        return $this;
    }

    /**
     * Register data of a field
     *
     * @param string $modid should be the module instance_id
     * @param string $type field type
     * @param mixed $data
     * @param string $key key of field
     * @param $arrayKey
     *
     * @since 1.0.0
     * @return object $this
     */
    public function registerFieldData( $modid, $type, $data, $key, $arrayKey )
    {

        if (!empty( $arrayKey )) {
            $this->fieldData[$type][$modid][$arrayKey][$key] = $data;
        } else {
            $this->fieldData[$type][$modid][$key] = $data;

        }

        return $this;
    }

    /**
     * Register only setting args of module fields
     * Gets handled automatically by FieldManagers
     * @param string $key storage key
     * @param array $data args
     * @return $this
     */
    public function registerFieldArgs( $key, $data )
    {

        if (is_null( $key )) {
            $this->Fields = $data;
        } else {
            $this->Fields[$key] = $data;
        }

        return $this;
    }


    /**
     * Register module definition
     *
     * @param array $module module definition array
     *
     * @since 1.0.0
     * @return object $this
     */
    public function registerModule( $module )
    {
        $this->modules[$module['instance_id']] = $module;

        return $this;
    }

    /**
     * Wrapper to register multiple modules at once
     * @param array $modules array of module definitions
     *
     * @since 1.0.0
     * @return false|void
     */
    public function registerModules( $modules )
    {
        if (!is_array( $modules )) {
            return false;
        }

        foreach ($modules as $module) {
            $this->registerModule( $module );
        }
    }

    /**
     * Register area definition
     *
     * @param array $area
     *
     * @since 1.0.0
     * @return object $this
     */
    public function registerArea( $area )
    {
        $this->areas[$area['id']] = $area;

        return $this;
    }

    /**
     * Output collected data in footer
     *
     * @since 1.0.0
     * @return void
     */
    public function printJSON()
    {
        $this->data['Modules'] = $this->modules;
        $this->data['Areas'] = $this->areas;
        $this->data['fieldData'] = $this->fieldData;
        $this->data['Fields'] = $this->Fields;
        $json = json_encode( $this->data );

        print "<script>var KB = KB || {}; KB.payload = {}; KB.payload =  {$json};</script>";
    }

    /**
     * Output public data
     *
     * @since 1.0.0
     * @return void
     */
    public function printPublicJSON()
    {
        $json = json_encode( $this->publicData );
        print "<script>var KB = KB || {}; KB.appData = {}; KB.appData =  {$json}; KB.on = jQuery.noop;</script>";
    }

    /**
     * Get relevant raw data
     *
     * Used during ajax calls
     * Result gets merged with existing data by the corresponding caller (javascript)
     *
     * @since 1.0.0
     * @return array
     */
    public function getJSON()
    {
        $this->data['Modules'] = $this->modules;
        $this->data['Areas'] = $this->areas;
        $this->data['fieldData'] = $this->fieldData;
        $this->data['Fields'] = $this->Fields;

        return $this->data;
    }

}