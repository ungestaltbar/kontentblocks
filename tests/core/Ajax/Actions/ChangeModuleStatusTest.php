<?php

namespace Kontentblocks\tests\core\Ajax\Actions;

use Kontentblocks\Ajax\Actions\ChangeArea;
use Kontentblocks\Ajax\Actions\ChangeModuleStatus;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Common\Data\ValueStorage;
use Kontentblocks\Modules\ModuleWorkshop;


/**
 * Class ChangeModuleStatusTest
 * @package Kontentblocks\tests\core\Ajax\Actions
 */
class ChangeModuleStatusTest extends \WP_UnitTestCase
{
    protected $userId;

    public static function setUpBeforeClass()
    {
        ( !defined( 'DOING_AJAX' ) ) ? define( 'DOING_AJAX', TRUE ) : null;
        add_filter(
            'wp_die_ajax_handler',
            array( __CLASS__, 'dump' ),
            99
        );

        \Kontentblocks\Hooks\Capabilities::setup();

    }

    public function setUp()
    {
        parent::setUp();
        $this->userId = $this->factory->user->create( array( 'role' => 'administrator' ) );
        wp_set_current_user( $this->userId );

    }

    public function testRun()
    {
        $post = $this->factory->post->create();

        $workshop = new ModuleWorkshop(
            new PostEnvironment( $post ), array(
                'class' => 'ModuleText'
            )
        );

        $workshop->create();
        $module = $workshop->getDefinitionArray();

        $data = array(
            'post_id' => $post,
            'module' => $module['mid']
        );

        $Request = new ValueStorage( $data );
        $Response = ChangeModuleStatus::run( $Request );
        $this->assertTrue( $Response->getStatus() );
        $Storage = new ModuleStorage( $post );
        $def = $Storage->getModuleDefinition( $module['mid'] );
        $this->assertFalse( $def['state']['active'] );
    }


    public static function dump()
    {
        return '__return_null';
    }

    public function tearDown()
    {
        parent::tearDown();
        wp_set_current_user( 0 );
    }


}