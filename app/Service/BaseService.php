<?php

namespace App\Service;

use App\Contract\BaseContract;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Spatie\QueryBuilder\QueryBuilder;

class BaseService implements BaseContract
{
    protected array $relation = [];
    protected string|null $guard = null;
    protected string|null $guardForeignKey = null;
    protected array $fileKeys = [];
    protected Model $model;

    /**
     * Repositories constructor.
     *
     * @param Model $model
     */
    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * @return Model
     */
    public function build(): Model
    {
        return $this->model;
    }

    /**
     * Get user id by guard name.
     *
     * @return int
     */
    public function userID(): int
    {
        return Auth::guard($this->guard)->id();
    }

    /**
     * Get all items from resource.
     *
     * @param $allowedFilters
     * @param $allowedSorts
     * @param bool|null $withPaginate
     * @return array|Exception|\Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Database\Eloquent\Collection|\Illuminate\Support\HigherOrderWhenProxy[]|QueryBuilder[]
     */
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

            $model = QueryBuilder::for($this->model::class);

            $model->allowedFilters($filters)
                ->allowedSorts($sorts)
                ->with($relation)
                ->when(!empty($withCount), function ($query) use ($withCount) {
                    $query->withCount($withCount);
                })
                ->when(!is_null($this->guardForeignKey), function ($query) {
                    $query->where($this->guardForeignKey, $this->userID());
                })
                ->orderBy($orderColumn, $orderPosition);

            if (!$paginate) return $model->get();

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
        } catch (QueryException $e) {
            \Log::error('QueryException in Service::all(): '.$e->getMessage()
                        .' | SQL: '.$e->getSql()
                        .' | Bindings: '.json_encode($e->getBindings()));
            return [
                'items'        => [],
                'prev_page'    => null,
                'current_page' => null,
                'next_page'    => null,
                'total_page'   => 0,
                'per_page'     => $perPage,
                'error'        => 'Database query error'
            ];
        }
    }

    /**
     * Find item by id from resource.
     *
     * @param mixed $id
     * @return Exception|\Illuminate\Database\Eloquent\Collection
     */
    public function find($id, array $relation = [])
    {
        try {
            return $this->model
                ->with(empty($relation) ? $this->relation : $relation)
                ->when(!is_null($this->guardForeignKey), function ($query) {
                    $query->where($this->guardForeignKey, $this->userID());
                })
                ->findOrFail($id);
        } catch (Exception $e) {;
            return $e;
        }
    }

    /**
     * Create new item to resource.
     *
     * @param $payloads
     * @return Exception|true
     */
    public function create($payloads)
    {
        try {
            if (!is_null($this->guardForeignKey)) {
                $payloads[$this->guardForeignKey] = $this->userID();
            }

            DB::beginTransaction();
            $model = $this->model->create($payloads);

            foreach ($this->fileKeys as $fileKey) {
                $model->addMultipleMediaFromRequest([$fileKey])
                    ->each(function ($image) use ($fileKey) {
                        $image->toMediaCollection($fileKey);
                    });
            }

            DB::commit();

            return $model->fresh();
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function insert($payloads)
    {
        try {
            DB::beginTransaction();
            $model = $this->model->insert($payloads);
            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            dd($e);
            return $e;
        }
    }

    /**
     * Update item from resource.
     *
     * @param mixed $id
     * @param mixed $payloads
     * @return Exception|\Illuminate\Database\Eloquent\Collection
     */
    public function update(array $conditions = [], $payloads)
    {
        try {
            if (!is_null($this->guardForeignKey)) {
                $payloads[$this->guardForeignKey] = $this->userID();
            }

            foreach ($this->fileKeys as $fileKey) {
                if (isset($payloads[$fileKey])) {
                    $media[$fileKey] = $payloads[$fileKey];
                    unset($payloads[$fileKey]);
                }
            }

            DB::beginTransaction();
            $model = $this->model::query()->where($conditions);
            $result = $model->update($payloads);

            foreach ($this->fileKeys as $fileKey) {
                $model->addMultipleMediaFromRequest([$fileKey])
                    ->each(function ($image) use ($fileKey) {
                        $image->toMediaCollection($fileKey);
                    });
            }
            DB::commit();

            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    /**
     * Destroy item from resource.
     *
     * @param $id
     * @return mixed
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();
            $model = $this->model
                ->when(!is_null($this->guardForeignKey), function ($query) {
                    $query->where($this->guardForeignKey, $this->userID());
                })
                ->findOrFail($id)
                ->delete();
            DB::commit();

            return $model;
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    /**
     * Bulk delete items based on an array of IDs.
     *
     * @param array $ids
     * @return bool|Exception
     */
    public function bulkDelete(array $ids)
    {
        try {
            DB::beginTransaction();

            $deleted = $this->model->whereIn('id', $ids)->delete();
            DB::commit();

            return $deleted > 0;
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }
}