<?php

namespace Kontentblocks\Fields\Returnobjects;

interface InterfaceFieldReturn
{
    public function getValue();

    public function handleLoggedInUsers();
}