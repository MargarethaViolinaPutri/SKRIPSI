<?php

namespace App\Exports;

use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StudentReportExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle, WithEvents
{
    protected ?int $courseId;
    protected ?int $questionId;
    protected ?string $name;

    public function __construct(?int $courseId, ?int $questionId, ?string $name)
    {
        $this->courseId = $courseId;
        $this->questionId = $questionId;
        $this->name = $name;
    }

    public function title(): string
    {
        return 'Student Submission Report';
    }

    public function headings(): array
    {
        return [
            'Student Name',
            'Question Name',
            'Question Description',
            'Reference Code (Answer Key)',
            'Student Submitted Code',
            'Score',
            'Structure Score',
            'Output Score',
            'Total Attempts for this Question',
            'Time Spent (Seconds)',
        ];
    }

    public function collection()
    {
        $dbDriver = DB::connection()->getDriverName();
        $timeSpentExpression = ($dbDriver === 'mysql')
            ? 'TIMESTAMPDIFF(SECOND, a.started_at, a.finished_at)'
            : 'EXTRACT(EPOCH FROM (a.finished_at - a.started_at))';

        $attemptsCountSubquery = DB::table('answers as a_sub')
            ->select('user_id', 'question_id', DB::raw('COUNT(id) as total_attempts'))
            ->groupBy('user_id', 'question_id');

        $query = DB::table('answers as a')
            ->join('users as u', 'a.user_id', '=', 'u.id')
            ->join('questions as q', 'a.question_id', '=', 'q.id')
            ->join('modules as m', 'q.module_id', '=', 'm.id')
            ->leftJoinSub($attemptsCountSubquery, 'attempts_count', function ($join) {
                $join->on('a.user_id', '=', 'attempts_count.user_id')
                     ->on('a.question_id', '=', 'attempts_count.question_id');
            })
            ->where('m.course_id', $this->courseId)
            ->select(
                'u.name as student_name',
                'q.name as question_name',
                'q.desc as question_description',
                'q.test as reference_code',
                'a.student_code',
                'a.total_score as score',
                'a.structure_score',
                'a.output_accuracy_score as output_score',
                'attempts_count.total_attempts',
                DB::raw($timeSpentExpression . ' as time_spent_seconds')
            );

        if ($this->questionId) {
            $query->where('q.id', $this->questionId);
        }

        if ($this->name) {
            $query->where('u.name', 'LIKE', '%' . $this->name . '%');
        }
        
        return $query->orderBy('u.name')->orderBy('q.name')->get();
    }

    public function map($row): array
    {
        return [
            $row->student_name,
            $row->question_name,
            $row->question_description,
            $row->reference_code,
            $row->student_code,
            number_format($row->score ?? 0, 2),
            number_format($row->structure_score ?? 0, 2),
            number_format($row->output_score ?? 0, 2),
            $row->total_attempts ?? 0,
            $row->time_spent_seconds ?? 0,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $title = "Student Submission Report for: " . ($this->course->name ?? 'All Courses');

                $sheet->insertNewRowBefore(1, 1);
                $sheet->setCellValue('A1', $title);
                $lastColumn = $sheet->getHighestColumn();
                $sheet->mergeCells("A1:{$lastColumn}1");
                $sheet->getStyle('A1')->getFont()->setBold(true);
            },
        ];
    }
}
