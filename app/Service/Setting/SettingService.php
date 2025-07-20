<?php 

namespace App\Service\Setting;

use App\Contract\Setting\SettingContract;
use App\Models\Setting;
use App\Service\BaseService;
use Illuminate\Database\Eloquent\Model;

class SettingService extends BaseService implements SettingContract
{
    protected Model $model;

    public function __construct(Setting $model)
    {
        $this->model = $model;
    }
}