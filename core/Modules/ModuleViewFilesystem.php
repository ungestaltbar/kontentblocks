<?php

namespace Kontentblocks\Modules;

use DirectoryIterator;
use Kontentblocks\Utils\Utilities;


/**
 * Class ModuleViewFilesystem
 *
 *
 *
 * @package Kontentblocks\Modules
 */
class ModuleViewFilesystem
{

    public $isChildTheme;
    protected $views = array();
    protected $paths = array();
    protected $viewsMeta;
    protected $preview;

    /**
     * @var Module
     */
    private $module;

    /**
     * @param Module $module
     */
    public function __construct(Module $module)
    {
        $this->module = $module;
        $this->isChildTheme = is_child_theme();
        $this->viewsMeta = new ModuleViewsMeta($module->properties->getSetting('templates'));
        $this->views = $this->setupViews($module);
    }

    /**
     * @param Module $module
     * @return array
     */
    public function setupViews(Module $module)
    {

        if ($this->isChildTheme) {
            $childPath = trailingslashit(
                             get_stylesheet_directory()
                         ) . 'module-templates' . DIRECTORY_SEPARATOR . $module->properties->getSetting(
                    'slug'
                ) . DIRECTORY_SEPARATOR;
            if (is_dir($childPath)) {
                $this->paths[] = $childPath;
            }
        }

        $parentPath = trailingslashit(
                          get_template_directory()
                      ) . 'module-templates' . DIRECTORY_SEPARATOR . $module->properties->getSetting(
                'slug'
            ) . DIRECTORY_SEPARATOR;

        if (is_dir($parentPath)) {
            $this->paths[] = $parentPath;
        }

        $modulePath = trailingslashit($module->properties->getSetting('path'));

        $this->paths[] = $modulePath;

        $uploadDir = wp_upload_dir();
        $class = $module->properties->class;
        $path = $uploadDir['basedir'] . DIRECTORY_SEPARATOR . 'Kontentblocks' . DIRECTORY_SEPARATOR . 'moduletemplates' . DIRECTORY_SEPARATOR . $class . DIRECTORY_SEPARATOR;
        if (is_dir($path)) {
            $this->paths[] = $path;
        }

        /**
         * iterate over all paths and convert file structure to md array
         */
        $files = array();
        foreach (array_reverse($this->paths) as $path) {
            $tmp = $this->fillArrayWithFileNodes($path, $path);
            $files = Utilities::arrayMergeRecursive($tmp, $files);
        }
        return $files;
    }

    /**
     * @param $dir
     * @param $root
     * @return array
     */
    public function fillArrayWithFileNodes($dir, $root)
    {
        $data = array();
        $dir = new DirectoryIterator($dir);
        foreach ($dir as $node) {
            if ($node->isDir() && !$node->isDot()) {
                $data[$node->getFilename()] = $this->fillArrayWithFileNodes($node->getPathname(), $root);
            } else if ($node->isFile()) {
                $filename = $node->getFilename();
                if (is_string($filename) && $filename[0] !== '_') {
                    if ($node->getExtension() == 'twig') {
                        if ($node->getFilename() === 'preview.twig') {
                            $filenode = new \SplFileInfo($node->getRealPath());
                            $this->preview = new ModuleViewFile($filenode, $root, $this->viewsMeta);
                        } else {
                            $filenode = new \SplFileInfo($node->getRealPath());
                            $data[$node->getFilename()] = new ModuleViewFile($filenode, $root, $this->viewsMeta);
                        }
                    }
                }
            }
        }
        return $data;
    }

    /**
     * @return array
     */
    public function reloadViews()
    {
        $this->views = $this->setupViews($this->module);
        return $this->views;
    }

    public function getPreview()
    {
        return $this->preview;
    }

    /**
     * @return array
     */
    public function getTemplates()
    {
        return $this->views;
    }

    /**
     * Finds all possible views for the given context
     * $this->views reflects the directory/file structure of the modules root folder
     * Always returns views from the root folder
     * -- looks for context directories (e.g. normal,side...) and returns matching views
     * -- looks for directories named like the basename of a pagetemplate like template-sidebar.php
     * --- looks further for specific contexts for that pagetemplate
     * -- looks for directories named like posttypes
     * --- looks futher for contexts for that posttype
     *
     * for example, with this directory structure, and context of side for the posttype page:
     * - ModuleName[d]
     * -- page[d]
     * --- side[d]
     * ---- default.twig[f]
     * -- side[d]
     * --- another-default.twig[f]
     * -- default.twig[f]
     *
     * returns two selectable views:
     *  page/side/default.twig
     *  side/another-default.twig
     *
     * Views get merged on name, so a more specific view will override a less specific one
     *
     * @param ModuleContext $context
     * @return array
     */
    public function getTemplatesforContext(ModuleContext $context)
    {
        $collection = array();
        $collection += $this->getSingles($this->views);
        $areaContext = $context->areaContext;
        $postType = $context->postType;
        $pageTemplate = basename($context->pageTemplate);
        $subarea = $context->subarea || $this->module->properties->submodule;
        if (array_key_exists($areaContext, $this->views)) {
            $collection = array_merge($collection, $this->getSingles($this->views[$areaContext]));
        }

        if (array_key_exists($postType, $this->views)) {
            $ptvs = $this->views[$postType];
            $collection = array_merge($collection, $this->getSingles($ptvs));

            if (array_key_exists($areaContext, $ptvs)) {
                $collection = array_merge($collection, $ptvs[$areaContext]);
            }
        }

        if (!is_null($pageTemplate && !empty($pageTemplate))) {
            if (array_key_exists($pageTemplate, $this->views)) {
                $ptvs = $this->views[$pageTemplate];
                $collection = array_merge($collection, $this->getSingles($ptvs));

                if (array_key_exists($areaContext, $ptvs)) {
                    $collection = array_merge($collection, $ptvs[$areaContext]);
                }
            }
        }

        if ($subarea && isset($this->views['subarea'])) {
            $collection = array_merge($collection, $this->getSingles($this->views['subarea']));
        }

        if (isset($this->views['user'])) {
            $collection = array_merge($collection, $this->getSingles($this->views['user']));
        }
        return $collection;

    }

    /**
     * extracts only files in the given array of dir/files
     * @param $files
     * @return array
     */
    private function getSingles($files)
    {

        if (!is_array($files)) {
            return $files;
        }

        return array_filter(
            $files,
            function ($file) {
                return (!is_array($file));
            }
        );
    }

    /**
     * @param $filename
     * @return string
     */
    public function findFile($filename)
    {
        foreach ($this->paths as $path) {
            $full = trailingslashit($path) . $filename;
            if (file_exists($full)) {
                return $full;
            }
        }
        return false;

    }


}