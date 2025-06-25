<?php 

namespace App\Contract\Operational;

use App\Contract\BaseContract;
use App\Models\Module;

interface ModuleContract extends BaseContract {
    public function isLocked(Module $module): bool;
}