<?php

namespace App\Service\Operational;

use App\Contract\Operational\QuestionContract;
use App\Models\Question;
use Illuminate\Support\Facades\Log;

class QuestionService implements QuestionContract
{
    public function all(
        $filters,
        $sorts,
        bool|null $paginate = null,
        array $relation = [],
        int $perPage = 10,
        string $orderColumn = 'id',
        string $orderPosition = 'asc',
        array $conditions = [],
    ) {
        $query = Question::query();

        if (!empty($relation)) {
            $query->with($relation);
        }

        foreach ($filters as $filter) {
            if (request()->has($filter)) {
                $query->where($filter, 'like', '%' . request()->get($filter) . '%');
            }
        }

        foreach ($conditions as $condition) {
            $query->where($condition[0], $condition[1], $condition[2]);
        }

        foreach ($sorts as $sort) {
            $query->orderBy($sort, $orderPosition);
        }

        if ($paginate) {
            $result = $query->paginate($perPage);
            Log::info('QuestionService all() paginate result:', ['result' => $result->toArray()]);
            return $result;
        }

        $result = $query->get();
        Log::info('QuestionService all() get result:', ['result' => $result->toArray()]);
        return $result;
    }

    public function find($id, array $relation = [])
    {
        return Question::with($relation)->find($id);
    }

    public function create($payloads)
    {
        return Question::create($payloads);
    }

    public function insert($payloads)
    {
        return Question::insert($payloads);
    }

    public function update(array $conditions = [], $payloads)
    {
        $query = Question::query();

        foreach ($conditions as $condition) {
            $query->where($condition[0], $condition[1], $condition[2]);
        }

        $question = $query->firstOrFail();
        $question->update($payloads);

        return $question;
    }

    public function destroy($id)
    {
        $question = Question::findOrFail($id);
        return $question->delete();
    }

    public function bulkDelete(array $ids)
    {
        return Question::whereIn('id', $ids)->delete();
    }
}