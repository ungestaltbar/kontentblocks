<?php

namespace Kontentblocks\Interfaces;

interface InterfaceDataBackend
{

    public function add($key, $value);

    public function update($key, $value);

    public function get($key);

    public function delete($key);

}