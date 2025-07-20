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
        array $withCount = [],
        int $perPage  = 10,
        string $orderColumn  = 'id',
        string $orderPosition = 'asc',
        array $conditions = [],
    ) {
        try {
            $model = $this->model->newQuery();

            if (isset($filters) && in_array('role', $filters)) {
                if (request()->has('filter.role')) {
                    $role = request()->get('filter')['role'];
                    $model->whereHas('roles', function ($query) use ($role) {
                        $query->where('name', $role);
                    });
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
            // Removed allowedFilters and allowedSorts due to missing method error
            if (!empty($filters)) {
                foreach ($filters as $filter) {
                    if ($filter === 'name' && request()->has('filter.name')) {
                        $model->where('name', 'like', '%' . request()->get('filter')['name'] . '%');
                    }
                    if ($filter === 'role' && request()->has('filter.role')) {
                        $role = request()->get('filter')['role'];
                        $model->whereHas('roles', function ($query) use ($role) {
                            $query->where('name', $role);
                        });
                    }
                }
            }

            if (!empty($sorts)) {
                foreach ($sorts as $sort) {
                    if (request()->has('sort')) {
                        $sortParam = request()->get('sort');
                        $direction = 'asc';
                        if (str_starts_with($sortParam, '-')) {
                            $direction = 'desc';
                            $sortParam = substr($sortParam, 1);
                        }
                        if ($sortParam === $sort) {
                            $model->orderBy($sortParam, $direction);
                        }
                    }
                }
            }

            $model->with($relation)
                ->when(!empty($withCount), function ($query) use ($withCount) {
                    $query->withCount($withCount);
                })
                ->orderBy($orderColumn, $orderPosition);

            if (!$paginate) {
                return $model->get();
            }

            $result = $model->paginate($perPage)
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
