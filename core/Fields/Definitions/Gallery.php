<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;
use Kontentblocks\Utils\JSONBridge;

/**
 * Simple text input field
 * Additional args are:
 * type - specific html5 input type e.g. number, email... .
 *
 */
Class Gallery extends Field {

	// Defaults
	public static $settings = array(
		'type' => 'gallery',
		'returnObj' => 'Gallery'
	);

	/**
	 * Form
	 */
	public function form() {
		$this->label();
		echo "<div id='{$this->getFieldId()}' data-fieldkey='{$this->getKey()}' data-arraykey='{$this->getArg('arrayKey')}' data-module='{$this->parentModuleId}' class='kb-gallery--stage'></div>";
		$this->description();

	}


	public function setFilter( $data ) {
		$forJSON = null;
		if ( ! empty( $data['images'] ) && is_array( $data['images'] ) ) {
			foreach ( $data['images'] as &$image ) {
//
//				(!empty($image['details']['description'])) ?: wp_kses_post($image['details']['description']);
//				(!empty($image['details']['title'])) ?: wp_kses_post($image['details']['title']);
//				d(htmlspecialchars($image['details']['title']));
				if ( isset( $image['id'] ) ) {
					$image['file'] = wp_prepare_attachment_for_js( $image['id'] );
					$image['file']['title'] = $image['details']['title'];
					$image['file']['alt'] = $image['details']['alt'];
					$image['file']['description'] = (!empty($image['details']['description'])) ? $image['details']['description'] : '';
				}
			}

			$forJSON = array_values( $data['images'] );
		}
		$Bridge = JSONBridge::getInstance();
		$Bridge->registerFieldData( $this->parentModuleId, $this->type, $forJSON, $this->getKey(), $this->getArg('arrayKey') );
		return $data;

	}

	public function save( $data, $old ) {

		if  (is_null($data)){
			return $old;
		}

		if ( ! empty( $data['images'] ) ) {
			foreach ( $data['images'] as $key => $image ) {
				if (!empty($image['remove']) && $image['remove'] == 'true'){
					unset($data['images'][$key]);
					continue;
				}

				if ( ! isset( $image['uid'] ) ) {
					$uid = uniqid( 'kbg' );
					$image['uid'] = $uid;
					unset($data['images'][$key]);
					$data['images'][$uid] = $image;
				}



			}
		}
		if ( is_array( $old['images'] ) ) {
			foreach ( $old['images'] as $k => $v ) {
				if ( ! array_key_exists( $k, $data['images'] ) ) {
					$data['images'][ $k ] = null;
				}
			}
		}
		return $data;

	}

	/**
	 * @param $val
	 *
	 * @return mixed
	 */
	protected function prepareInputValue( $val ) {
		return $val;
	}
}