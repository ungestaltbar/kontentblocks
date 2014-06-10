<?php
namespace Kontentblocks\Templating;

use Kontentblocks\Utils\ImageResize;
use Twig_SimpleFunction;

class Twig
{

    private static $loader = null;
    private static $environment = null;

	protected static $paths = array();

    public static function getInstance()
    {

        if (self::$loader === null) {
            self::$loader = new \Twig_Loader_Filesystem(self::getDefaultPath());
        }

        if (self::$environment === null) {
            self::$environment = new \Twig_Environment(
                self::$loader, array(
                'cache' => apply_filters('kb_twig_cache_path', WP_CONTENT_DIR . '/twigcache/'),
                'auto_reload' => TRUE,
                'debug' => TRUE
            ));
            self::$environment->addExtension(new \Twig_Extension_Debug());

            $getPermalink = new Twig_SimpleFunction('get_permalink', function ($id) {
                return get_permalink($id);
            });

            self::$environment->addFunction($getPermalink);


            $getImage = new Twig_SimpleFunction('getImage', function ($id, $width = null, $height = null, $crop = true, $single = true, $upscale = true) {
                return ImageResize::getInstance()->process($id, $width, $height, $crop, $single, $upscale);

            });
            self::$environment->addFunction($getImage);

            $wpNavMenu = new Twig_SimpleFunction('wp_nav_menu', function ($args) {
                $args['echo'] = false;
                return wp_nav_menu($args);
            });
            self::$environment->addFunction($wpNavMenu);

        }


        return self::$environment;

    }

    public static function getDefaultPath()
    {
        return apply_filters('kb_twig_def_path', get_template_directory() . '/module-templates/');

    }

    protected function __construct()
    {

    }

    private function __clone()
    {

    }

    public static function setPath($path)
    {

	    if (!in_array($path, self::$paths)){
		    self::$paths[] = $path;
		    self::$loader->prependPath($path);
	    }


    }

    public static function resetPath()
    {
        self::$loader->setPaths(self::getDefaultPath());

    }

}