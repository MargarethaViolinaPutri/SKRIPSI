<?php

namespace App\Service\Master;

use App\Contract\Master\QuestionContract;
use App\Models\Question;
use App\Service\BaseService;
use Illuminate\Database\Eloquent\Model;

class QuestionService extends BaseService implements QuestionContract
{
    protected Model $model;

    public function __construct(Question $model)
    {
        $this->model = $model;
    }

    public function createMultiple(array $base, array $questions)
    {
        // Extract base name without " - Soal" suffix if present
        $baseNameParts = explode(' - Soal', $base['name']);
        $baseName = trim($baseNameParts[0]);

        // Find the max question number for existing questions with the same base name and module
        $lastQuestion = $this->model
            ->where('module_id', $base['module_id'])
            ->where('name', 'like', 'Question %')
            ->orderByDesc('id')
            ->first();

        $lastNumber = 0;
        if ($lastQuestion) {
            // Extract number from name, e.g. "Question 3"
            if (preg_match('/Question (\d+)$/', $lastQuestion->name, $matches)) {
                $lastNumber = (int)$matches[1];
            }
        }

        $currentNumber = $lastNumber + 1;

        foreach ($questions as $q) {
            $this->create([
                'module_id' => $base['module_id'],
                'name' => 'Question ' . $currentNumber,
                'desc' => $q['narasi'],
                'code' => $q['kode_utuh'],   // full code saved in 'code'
                'test' => $q['kode_blank'],  // blank code saved in 'test'
            ]);
            $currentNumber++;
        }

        return true;
    }
    /**
     * Retrieve a group of questions based on a base question ID.
     *
     * @param int $id
     * @return array
     */
    public function getGroupedQuestionsById(int $id): array
    {
        $baseQuestion = $this->model->findOrFail($id);

        // Here we assume the 'name' field uses a consistent base name with suffixes like ' - Soal 1', etc.
        $baseName = explode(' - Soal', $baseQuestion->name)[0];

        $questions = $this->model->where('module_id', $baseQuestion->module_id)
            ->where('name', 'like', $baseName . '%')
            ->orderBy('id')
            ->get();

        $groupedQuestions = $questions->map(function ($q, $index) {
            return [
                'question_number' => $index + 1,
                'narasi' => $q->desc,
                'kode_blank' => $q->test,  // blank code from 'test'
                'kode_utuh' => $q->code,   // full code from 'code'
                'test' => $q->test,        // include test for compatibility
            ];
        });

        return [
            'module_id' => $baseQuestion->module_id,
            'name' => $baseName,
            'desc' => $baseQuestion->desc,
            'questions' => $groupedQuestions,
        ];
    }

    public function all(
        $filters,
        $sorts,
        ?bool $paginate = null,
        array $relation = [],
        array $withCount = [],
        int $perPage  = 10,
        string $orderColumn  = 'id',
        string $orderPosition = 'asc',
        array $conditions = [],
    ) {
        $model = $this->model->query();

        // Apply filters
        foreach ($filters as $filter) {
            if (request()->has($filter)) {
                $model->where($filter, 'like', '%' . request()->get($filter) . '%');
            }
        }

        // Apply relations
        if (!empty($relation)) {
            $model->with($relation);
        }

        // Set default sort to module if no sorts provided
        if (empty($sorts)) {
            $sorts = ['module'];
        }

        // Check if sorting by module is requested
        $sortByModule = false;
        foreach ($sorts as $sort) {
            $column = $sort;
            if (str_starts_with($sort, '-')) {
                $column = substr($sort, 1);
            }
            if ($column === 'module') {
                $sortByModule = true;
                break;
            }
        }

        if ($sortByModule) {
            $model->leftJoin('modules', 'questions.module_id', '=', 'modules.id')
                ->select('questions.*', 'modules.name as module_name');
        } else {
            $model->select('questions.*');
        }

        foreach ($sorts as $sort) {
            $direction = 'asc';
            $column = $sort;

            if (str_starts_with($sort, '-')) {
                $direction = 'desc';
                $column = substr($sort, 1);
            }

            if ($column === 'module') {
                $model->orderBy('module_name', $direction)
                      ->orderBy('name', 'asc'); // secondary sort by question name for sequence
            } else {
                $model->orderBy($column, $direction);
            }
        }

        if (!$paginate) {
            $items = $model->get()->map(function ($item, $index) {
                $item->iteration = $index + 1;
                return $item;
            });
            return $items;
        }

        $result = $model->paginate($perPage)
            ->appends(request()->query());

        $items = collect($result->items())->map(function ($item, $index) use ($result) {
            $item->iteration = $result->firstItem() + $index;
            return $item;
        });

        return [
            'items' => $items,
            'prev_page' => $result->currentPage() > 1 ? $result->currentPage() - 1 : null,
            'current_page' => $result->currentPage(),
            'next_page' => $result->hasMorePages() ? $result->currentPage() + 1 : null,
            'total_page' => $result->lastPage(),
            'per_page' => $result->perPage(),
        ];
    }

    /**
     * Update existing questions' names to "Question X" format based on their order.
     *
     * @param int|null $moduleId Optional module ID to filter questions.
     * @return bool
     */
    public function updateExistingQuestionNames(?int $moduleId = null): bool
    {
        $query = $this->model->query();

        if ($moduleId !== null) {
            $query->where('module_id', $moduleId);
        }

        // Order by module_id and then by id to ensure sequence within module
        $questions = $query->orderBy('module_id')->orderBy('id')->get();

        $currentModuleId = null;
        $currentNumber = 1;

        foreach ($questions as $question) {
            if ($currentModuleId !== $question->module_id) {
                $currentModuleId = $question->module_id;
                $currentNumber = 1;
            }
            $question->name = 'Question ' . $currentNumber;
            $question->save();
            $currentNumber++;
        }

        return true;
    }
}
