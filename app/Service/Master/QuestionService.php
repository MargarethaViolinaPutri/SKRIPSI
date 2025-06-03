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
        foreach ($questions as $q) {
            $this->create([
                'module_id' => $base['module_id'],
                'name' => $base['name'] . ' - Soal ' . $q['question_number'],
                'desc' => $q['narasi'],
                'code' => $q['kode_utuh'],
                'test' => $q['kode_blank'],
            ]);
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
                'kode_blank' => $q->code,
                'kode_utuh' => $q->test,
                'test' => $q->test, // include test for compatibility
            ];
        });

        return [
            'module_id' => $baseQuestion->module_id,
            'name' => $baseName,
            'desc' => $baseQuestion->desc,
            'questions' => $groupedQuestions,
        ];
    }
}