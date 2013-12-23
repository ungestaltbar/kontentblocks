<?php

namespace Kontentblocks\Hooks;

use Kontentblocks\Kontentblocks;

class Enqueues
{

    protected $DI;
    protected $styles;

    public function __construct()
    {
        $this->Caps    = Kontentblocks::getInstance()->Capabilities;


        // enqueue styles and scripts where needed
        add_action( 'admin_print_styles-post.php', array( $this, 'enqueue' ), 30 );
        add_action( 'admin_print_styles-post-new.php', array( $this, 'enqueue' ), 30 );
        add_action( 'admin_print_styles-toplevel_page_kontentblocks-sidebars', array( $this, 'enqueue' ), 30 );
        add_action( 'admin_print_styles-toplevel_page_kontentblocks-templates', array( $this, 'enqueue' ), 30 );
        add_action( 'admin_print_styles-toplevel_page_kontentblocks-areas', array( $this, 'enqueue' ), 30 );
        add_action( 'admin_print_styles-toplevel_page_dynamic_areas', array( $this, 'enqueue' ), 30 );

        // Frontend On-Site Editing
        add_action( 'wp_enqueue_scripts', array( $this, '_on_site_editing_setup' ) );

    }

    function addStyle( $handle, $src )
    {
        $this->styles[ $handle ] = array(
            'handle' => $handle,
            'src' => $src
        );

    }

    /**
     * Enqueue all styles and scripts
     * Array for localization strings used by JS actions
     * TODO: complete l18n strings, develop nameing scheme
     */
    function enqueue()
    {
        global $is_IE;

        // enqueue scripts
        if ( is_admin() ) {

            // Main Stylesheet
            wp_enqueue_style( 'kontentblocks-base', KB_PLUGIN_URL . 'css/kontentblocks.css' );
            wp_enqueue_style( 'vex', KB_PLUGIN_URL . 'js/vex/css/vex.css' );
            wp_enqueue_style( 'vex-flat', KB_PLUGIN_URL . 'js/vex/css/vex-theme-flat-attack.css' );
            $this->enqueueStyles();

            // Plugins - Chosen, Noty, Sortable Touch
            wp_enqueue_script( 'kb_plugins', KB_PLUGIN_URL . '/js/dist/plugins.min.js', null, null, true );



            wp_enqueue_script( 'Kontentblocks-Extensions', KB_PLUGIN_URL . '/js/dist/extensions.min.js', array( 'kontentblocks-base' ), null, true );

            wp_enqueue_script( 'Kontentblocks-Refields', KB_PLUGIN_URL . '/js/dist/refields.min.js', array( 'KB-Backend', 'wp-color-picker' ), null, true );
            // Main Kontentblocks script file
            wp_enqueue_script( 'kontentblocks-base', KB_PLUGIN_URL . '/js/dist/kontentblocks.min.js', null, '0.7', true );
            wp_enqueue_script( 'KB-Backend', KB_PLUGIN_URL . '/js/dist/backend.min.js', array( 'jquery-ui-core', 'jquery-ui-tabs', 'jquery-ui-sortable', 'jquery-ui-mouse', 'kontentblocks-base' ), null, true );
            // add Kontentblocks l18n strings
            $localize = $this->_localize();
            wp_localize_script( 'kontentblocks-base', 'kontentblocks', $localize );
        }

        if ( $is_IE ) {
            wp_enqueue_script( 'respond', KB_PLUGIN_URL . 'js/respond.min.js', null, true, true );
            wp_enqueue_style( 'ie8css', KB_PLUGIN_URL . 'css/ie8css.css' );
        }

        do_action( 'kb_enqueue_files' );

    }

    // Front End editing
    public function _on_site_editing_setup()
    {

        \Kontentblocks\Helper\getHiddenEditor();
        // Thickbox on front end for logged in users
        wp_enqueue_media();


        $config = array(
            'url' => KB_PLUGIN_URL,
            'ajaxurl' => admin_url( 'admin-ajax.php' )
        );

        if ( is_user_logged_in() && !is_admin() ) {
            //add_action( 'wp_footer', array( $this, 'add_reveal' ) );
            wp_enqueue_script( 'KBPlugins', KB_PLUGIN_URL . 'js/dist/plugins.min.js', array( 'jquery', 'jquery-ui-mouse', 'wp-color-picker' ) );

            wp_enqueue_script( 'KBOnSiteEditing', KB_PLUGIN_URL . 'js/KBOnSiteEditing.js', array( 'KBPlugins', 'jquery', 'thickbox', 'jquery-ui-mouse' ) );
            wp_localize_script( 'KBOnSiteEditing', 'kontentblocks', $this->_localize() );
            wp_enqueue_script( 'kb-shared', KB_PLUGIN_URL . 'js/dist/shared.min.js', array( 'KBPlugins' ), null, true );
            wp_localize_script( 'kb-frontend', 'KBAppConfig', $config );
//            wp_enqueue_style( 'thickbox' );
            wp_enqueue_style( 'KB', KB_PLUGIN_URL . '/css/kontentblocks.css' );
            wp_enqueue_style( 'vex', KB_PLUGIN_URL . '/js/vex/css/vex.css' );
            wp_enqueue_style( 'vex-theme', KB_PLUGIN_URL . '/js/vex/css/vex-theme-flat-attack.css' );
            wp_enqueue_style( 'KBOsEditStyle', KB_PLUGIN_URL . '/css/KBOsEditStyle.css' );
            wp_enqueue_style( 'wp-color-picker' );

            wp_enqueue_style( 'kontentblocks-base', KB_PLUGIN_URL . 'css/kontentblocks.css' );
            wp_enqueue_style( 'vex', KB_PLUGIN_URL . 'js/vex/css/vex.css' );
            wp_enqueue_style( 'vex-flat', KB_PLUGIN_URL . 'js/vex/css/vex-theme-flat-attack.css' );

            $this->enqueueStyles();

            // Plugins - Chosen, Noty, Sortable Touch
            wp_enqueue_script( 'kb_plugins', KB_PLUGIN_URL . '/js/dist/plugins.min.js', null, null, true );



            wp_enqueue_script( 'Kontentblocks-Extensions', KB_PLUGIN_URL . '/js/dist/extensions.min.js', array( 'kontentblocks-base' ), null, true );
            wp_enqueue_script( 'KB-Backend', KB_PLUGIN_URL . '/js/dist/backend.min.js', array( 'jquery-ui-core', 'jquery-ui-tabs', 'jquery-ui-sortable', 'jquery-ui-mouse' ), null, true );
            wp_enqueue_script( 'kb-frontend', KB_PLUGIN_URL . 'js/dist/frontend.min.js', array( 'backbone', 'jquery-ui-tabs', 'jquery-ui-draggable', 'kb-shared', 'KB-Backend' ), null, true );
            wp_enqueue_script( 'Kontentblocks-Refields', KB_PLUGIN_URL . '/js/dist/refields.min.js', array('KB-Backend'), null, true );

            // Main Kontentblocks script file
            wp_enqueue_script( 'kontentblocks-base', KB_PLUGIN_URL . '/js/dist/kontentblocks.min.js', array( 'KB-Backend' ), '0.7', true );


            wp_enqueue_script(
                'iris', admin_url( 'js/iris.min.js' ), array( 'jquery-ui-draggable', 'jquery-ui-slider', 'jquery-touch-punch' ), false, 1
            );
            wp_enqueue_script(
                'wp-color-picker', admin_url( 'js/color-picker.min.js' ), array( 'iris' ), false, 1
            );
            $colorpicker_l10n = array(
                'clear' => __( 'Clear' ),
                'defaultString' => __( 'Default' ),
                'pick' => __( 'Select Color' )
            );
            wp_localize_script( 'wp-color-picker', 'wpColorPickerL10n', $colorpicker_l10n );
        }

    }

    private function _localize()
    {
        //Caps for the current user as global js object

        $current_user = wp_get_current_user();
        $roles        = $current_user->roles;

        // get caps from options
        $option = get_option( 'kontentblocks_capabilities' );

        // if, for some reason, caps not set, fallback to defaults
        $setup_caps = (!empty( $option )) ? $option : $this->Caps->getCaps();

        // prepare cap collection for current user
        $caps = array();
        if ( is_array( $roles ) ) {
            foreach ( $roles as $role ) {
                if ( !empty( $setup_caps[ $role ] ) ) {
                    foreach ( $setup_caps[ $role ] as $cap ) {
                        $caps[] = $cap;
                    }
                }
            }
        }

        // Setup the global js object base
        return array
            (
            'caps' => $caps,
            'config' => array(
                'url' => KB_PLUGIN_URL
            ),
//            'fields' => get_option( 'kontentfields' ),
            'nonces' => array(
                'kb_frontsite_save' => wp_create_nonce( 'save-form' ),
                'kb_frontsite_open' => wp_create_nonce( 'open-form' )
            )
        );

    }


    public function enqueueStyles()
    {
        if ( !empty( $this->styles ) ) {
            foreach ( $this->styles as $style ) {
                wp_enqueue_style( $style[ 'handle' ], $style[ 'src' ] );
            }
        }

    }

}
