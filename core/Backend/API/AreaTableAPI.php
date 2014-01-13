<?php

namespace Kontentblocks\Backend\API;

use Kontentblocks\Interfaces\InterfaceDataAPI;

/**
 * @property mixed areasDefinitions
 */
class AreaTableAPI implements InterfaceDataAPI
{

    protected $areaId;
    /**
     * @var null Database object
     */
    protected $db = null;

    protected $tablename = null;
    protected $dataByAreas = array();
    protected $currentAreaDefinition;
    protected $areasDefinitions = array();

    public function __construct($areaId = null)
    {

        global $wpdb;



        $this->db = $wpdb;
        $this->tablename = $wpdb->prefix . 'kb_areas';
        $this->selfUpdate();

        if ($areaId) {
            $this->setId($areaId);
        }
    }

    public function add($key, $value)
    {

        $insert = array(
            'area_id' => $this->areaId,
            'area_key' => $key,
            'area_value' => wp_unslash(maybe_serialize($value))
        );

        $result = $this->db->insert($this->tablename, $insert, array('%s', '%s', '%s'));

        if ($result === false) {
            return false;
        } else {
            wp_cache_delete('kb_areas_all', 'kontentblocks');
            $this->selfUpdate();
            return true;
        }
    }

    public function update($key, $value)
    {

        // create new
        if (!$this->keyExists($key)) {
            return $this->add($key, $value);
        }

        //update existing
        $update = array(
            'area_value' => maybe_serialize($value)
        );
        $result = $this->db->update(
            $this->tablename,
            $update,
            array(
                'area_id' => $this->areaId,
                'area_key' => $key
            ),
            array(
                '%s'
            ),
            array(
                '%s', '%s'
            )
        );

        if ($result === false) {
            return false;
        } else {
            wp_cache_delete('kb_areas_all', 'kontentblocks');
            return true;
        }

    }

    public function get($key)
    {
        $data = $this->getAreaData();

        if (!$data) {
            return null;
        }

        if (!empty($data[$key][0])) {
            return maybe_unserialize($data[$key][0]);
        } else {
            return null;
        }
    }

    public function getAll()
    {
        return $this->getAreaData();
    }

    public function delete($key = null)
    {
        if ($key) {
            $result = $this->db->delete($this->tablename, array('area_id' => $this->areaId, 'area_key' => $key));
        } else {
            $result = $this->db->delete($this->tablename, array('area_id' => $this->areaId));
        }
        if ($result === false) {
            return false;
        } else {
            wp_cache_delete('kb_areas_all', 'kontentblocks');
            return true;
        }
    }

    private function selfUpdate()
    {
        $cache = wp_cache_get('kb_areas_all', 'kontentblocks');
        if ($cache !== false) {
            $res = $cache;
        } else {
            $res = $this->db->get_results("SELECT * FROM $this->tablename;", ARRAY_A);
            wp_cache_set('kb_areas_all', $res, 'kontentblocks', 600);

        }

        if (!empty($res)) {
            $this->dataByAreas = $this->reorganizeTableData($res);
            $this->areasDefinitions = $this->filterAreaDefinitions($res);
        } else {
            // todo ? what is supposed to be
            $this->dataByAreas = $res;
        }

    }

    /**
     * Rearrange table data to assoc. array, by area_id
     * @param $res
     * @return array
     */
    private function reorganizeTableData($res)
    {
        $collection = array();
        foreach ($res as $row) {

            $collection[$row['area_id']][$row['area_key']][] = maybe_unserialize($row['area_value']);
        }
        return $collection;
    }

    private function filterAreaDefinitions($res)
    {
        $collection = array();

        foreach ($res as $row) {
            if ($row['area_key'] === 'definition') {
                $collection[$row['area_id']] = maybe_unserialize($row['area_value']);
            }
        }
        return $collection;
    }

    private function getAreaData()
    {
        if (isset($this->dataByAreas[$this->areaId])) {
            return $this->dataByAreas[$this->areaId];
        } else {
            return false;
        }
    }

    public function setId($id)
    {
        $this->areaId = $id;
        $this->currentAreaDefinition = $this->areasDefinitions[$id];
        return $this;
    }

    private function keyExists($key)
    {
        $data = $this->getAreaData();
        return isset($data[$key]);
    }

    public function getAreaDefinitions()
    {
        return $this->areasDefinitions;
    }

    public function getAreaDefinition()
    {
        return $this->currentAreaDefinition;
    }
}