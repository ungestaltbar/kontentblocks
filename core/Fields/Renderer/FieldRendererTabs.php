<?php

namespace Kontentblocks\Fields\Renderer;

use Kontentblocks\Templating\CoreView;

/**
 * By default all sections and fields are organized in tabs,
 * which get generated by this class
 *
 * There may be different ways to organize in future releases
 * Instantiated by:
 * @see Kontentblocks\Fields\FieldManager::render()
 *
 * @package Fields
 * @since 0.1.0
 */
class FieldRendererTabs extends AbstractFieldRenderer
{

    /**
     * Instance data from module
     * Gets passed through to section handler
     * @var array
     */
    protected $data;


    /**
     * Wrapper to output methods
     */
    public function render()
    {
        if (!is_array($this->renderSections)) {
            return null;
        }
        $view = new CoreView(
            'renderer/tabs.twig', array(
                'structure' => $this->renderSections,
            )
        );
        return $view->render();
    }

    /**
     * @return string
     */
    public function getIdString()
    {
        return 'fields-renderer-tabs';
    }
}
