<?php

namespace Kontentblocks\Frontend\Renderer;

use Kontentblocks\Areas\AreaProperties;
use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Frontend\AreaNode;
use Kontentblocks\Frontend\ModuleIterator;
use Kontentblocks\Frontend\AreaRenderSettings;
use Kontentblocks\Templating\AreaView;
use Kontentblocks\Templating\Twig;


/**
 * Class AreaFileRenderer
 * @package Kontentblocks\Frontend
 */
abstract class AreaFileRenderer
{
    /**
     * @var AreaProperties
     */
    public $area;

    /**
     * @var AreaRenderSettings
     */
    public $renderSettings;

    /**
     * @var Environment
     */
    public $environment;

    /**
     * @var ModuleIterator
     */
    public $moduleIterator;

    /**
     * @var SlotRenderer
     */
    public $slotRenderer;

    /**
     * @var AreaNode
     */
    public $areaNode;

    /**
     * @param Environment $environment
     * @param AreaRenderSettings $renderSettings
     */
    public function __construct( Environment $environment, AreaRenderSettings $renderSettings )
    {
        $this->renderSettings = $renderSettings;
        $this->area = $renderSettings->area;
        $this->areaNode = new AreaNode($environment, $renderSettings);
        $this->environment = $environment;
        $this->moduleIterator = new ModuleIterator( $environment->getModulesForArea( $this->area->id ), $environment );
        $this->slotRenderer = new SlotRenderer( $this->moduleIterator, $renderSettings );

    }

    public function render()
    {
        Twig::setPath($this->getTemplatePath());
        $view = new AreaView($this, [
            'r' => $this->slotRenderer
        ]);
        $view->render(true);
    }

    /**
     * Should return the relative file
     * @return string
     */
    abstract public function getTemplateFile();

    /**
     * @return string
     */

    abstract public function getTemplatePath();

}