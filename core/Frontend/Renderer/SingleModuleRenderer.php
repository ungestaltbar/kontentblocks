<?php

namespace Kontentblocks\Frontend\Renderer;


use Kontentblocks\Common\Interfaces\RendererInterface;
use Kontentblocks\Frontend\ModuleRenderSettings;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\Module;
use Kontentblocks\Utils\Utilities;

/**
 * Class SingleModuleRenderer
 * @package Kontentblocks\Frontend
 */
class SingleModuleRenderer implements RendererInterface
{

    /**
     * @var ModuleRenderSettings
     */
    public $renderSettings;

    /**
     * css classes
     * @var string
     */
    public $classes;

    /**
     * @var Module
     */
    public $module;

    /**
     * @param Module $module
     * @param ModuleRenderSettings $renderSettings
     */
    public function __construct(Module $module, ModuleRenderSettings $renderSettings)
    {
        $this->module = $module;
        $this->renderSettings = $this->setupRenderSettings($renderSettings);
        $this->classes = $this->setupClasses();
        $this->module->context->set($this->renderSettings->export());

        // @TODO other properties?
        if (isset($this->renderSettings['areaContext'])) {
            $this->module->context->areaContext = $this->renderSettings['areaContext'];
            $this->module->properties->areaContext = $this->renderSettings['areaContext'];
        }

        if ($module->verifyRender()) {
            Kontentblocks::getService('utility.jsontransport')->registerModule($module->toJSON());
        }
    }

    /**
     * @param ModuleRenderSettings $renderSettings
     * @return ModuleRenderSettings
     */
    private function setupRenderSettings(ModuleRenderSettings $renderSettings)
    {
        $renderSettings->import(
            array(
                'context' => Utilities::getTemplateFile(),
                'subcontext' => 'content',
                'element' => (isset($renderSettings['element'])) ? $renderSettings['element'] : $this->module->properties->getSetting(
                    'element'
                ),
                'action' => null,
                'area_template' => 'default'
            )
        );

        return $renderSettings;
    }

    /**
     * @return string
     */
    private function setupClasses()
    {
        return
            array(
                'os-edit-container',
                'module',
                'single-module',
                $this->module->properties->getSetting('slug'),
                'view-' . str_replace('.twig', '', $this->module->properties->viewfile)
            );

    }

    /**
     * @param bool $echo
     * @return bool|string
     */
    public function render($echo = false)
    {
        if (!$this->module->verifyRender()) {
            return false;
        }

        $out = '';
        $out .= $this->beforeModule();
        $out .= $this->module->module();
        $out .= $this->afterModule();


        if ($echo) {
            echo $out;
        }
        return $out;
    }

    /**
     * @return string
     */
    public function beforeModule()
    {
        return sprintf(
            '<%3$s id="%1$s" class="%2$s">',
            $this->module->getId(),
            $this->getModuleClasses(),
            $this->renderSettings['element']
        );
    }

    /**
     * @return string
     */
    private function getModuleClasses()
    {
        return implode(' ', array_unique($this->classes));
    }

    /**
     * @return string
     */
    public function afterModule()
    {
        return sprintf('</%s>', $this->renderSettings['element']);
    }

    /**
     * @return Module
     */
    public function getModule()
    {
        return $this->module;
    }

    /**
     * @return SingleModuleRenderer
     */
    public function addClasses($classes)
    {
        $this->classes = array_merge($this->classes, $classes);
        return $this;
    }

}