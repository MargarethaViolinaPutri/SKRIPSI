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

    public function all(
        $filters,
        $sorts,
        bool|null $paginate = null,
        array $relation = [],
        int $perPage  = 10,
        string $orderColumn  = 'id',
        string $orderPosition = 'asc',
        array $conditions = [],
    ) {
        try {
            $model = $this->model->newQuery();

            // Apply filters
            if (isset($filters) && in_array('role', $filters)) {
                if (request()->has('filter.role')) {
                    $role = request()->get('filter')['role'];
                    $model->role($role);
                }
            }

            // Exclude students already assigned to a class
            if (request()->has('filter.exclude_classroom') && request()->get('filter')['exclude_classroom']) {
                $model->whereDoesntHave('classRooms');
            }

            // Extend: mark users who are already assigned to a class
            if (request()->has('filter.extend_assigned')) {
                $model->withCount('classRooms');
            }

            // Apply other filters, sorts, relations, pagination as in BaseService
            $query = $model->with($relation)
                ->orderBy($orderColumn, $orderPosition);

            if (!$paginate) {
                return $query->get();
            }

            $result = $query->paginate($perPage)
                ->appends(request()->query());

            return [
                'items' => $result->items(),
                'prev_page' => $result->currentPage() > 1 ? $result->currentPage() - 1 : null,
                'current_page' => $result->currentPage(),
                'next_page' => $result->hasMorePages() ? $result->currentPage() + 1 : null,
                'total_page' => $result->lastPage(),
                'per_page' => $result->perPage(),
            ];
        } catch (Exception $e) {
            return $e;
        }
    }
}
