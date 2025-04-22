<?php

namespace App\Service\Master;

use App\Contract\Master\UserContract;
use App\Models\User;
use App\Service\BaseService;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class UserService extends BaseService implements UserContract
{
    protected Model $model;

    public function __construct(User $model)
    {
        $this->model = $model;
    }

    public function create($payloads)
    {
        $role = $payloads['role'];
        unset($payloads['role']);
        try {


            DB::beginTransaction();
            $model = $this->model->create($payloads);

            $model->assignRole($role);

            DB::commit();

            return $model->fresh();
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }
}
