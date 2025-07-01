<?php

namespace App\Contract\Master;

use App\Contract\BaseContract;

interface ClassRoomContract extends BaseContract
{
    public function removeMember($id);
}