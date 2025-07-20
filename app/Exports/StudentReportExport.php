<?php

namespace App\Exports;

use App\Models\Course;
use App\Models\Module;
use App\Models\User;
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
    protected ?int $moduleId;
    protected ?int $userId;
    protected ?Course $course;
    protected ?Module $module;
    protected ?User $student;

    public function __construct(?int $courseId, ?int $moduleId, ?int $userId)
    {
        $this->courseId = $courseId;
        $this->moduleId = $moduleId;
        $this->userId = $userId;
        $this->course = $courseId ? Course::find($courseId) : null;
        $this->module = $moduleId ? Module::find($moduleId) : null;
        $this->student = $userId ? User::find($userId) : null;
    }

    public function title(): string
    {
        return 'Student Submission Detail';
    }

    public function headings(): array
    {
        return [
            'Question Name', 'Description', 'Time Spent (Seconds)',
            'Output Score', 'Structure Score', 'Total Score',
        ];
    }

    public function collection()
    {
        $dbDriver = DB::connection()->getDriverName();
        $timeSpentExpression = ($dbDriver === 'mysql')
            ? 'ABS(TIMESTAMPDIFF(SECOND, a.started_at, a.finished_at))'
            : 'ABS(EXTRACT(EPOCH FROM (a.finished_at - a.started_at)))';

        $query = DB::table('answers as a')
            ->join('users as u', 'a.user_id', '=', 'u.id')
            ->join('questions as q', 'a.question_id', '=', 'q.id')
            ->join('modules as m', 'q.module_id', '=', 'm.id')
            ->where('m.course_id', $this->courseId)
            ->select(
                'u.name as student_name', 'm.name as module_name', 'q.name as question_name', 
                'q.desc as question_description', 'q.test as reference_code', 'a.student_code',
                'a.total_score as score', 'a.structure_score', 'a.output_accuracy_score as output_score',
                DB::raw($timeSpentExpression . ' as time_spent_seconds')
            );

        if ($this->moduleId) {
            $query->where('m.id', $this->moduleId);
        }

        if ($this->userId) {
            $query->where('a.user_id', $this->userId);
        }
        
        return $query->orderBy('u.name')->orderBy('m.name')->orderBy('q.id')->get();
    }

    public function map($row): array
    {
        return [
            $row->question_name,
            $row->question_description,
            $row->time_spent_seconds ?? 0,
            number_format($row->output_score ?? 0, 2),
            number_format($row->structure_score ?? 0, 2),
            number_format($row->score ?? 0, 2),
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
                
                $courseTitle = "Course: " . ($this->course->name ?? 'All Courses');
                $moduleTitle = $this->module ? " | Module: " . $this->module->name : "";
                $studentTitle = "Student: " . ($this->student->name ?? 'All Students');
                
                $sheet->insertNewRowBefore(1, 3);
                $sheet->setCellValue('A1', $courseTitle . $moduleTitle);
                $sheet->setCellValue('A2', $studentTitle);

                $lastColumn = $sheet->getHighestColumn();
                $sheet->mergeCells("A1:{$lastColumn}1");
                $sheet->mergeCells("A2:{$lastColumn}2");

                $sheet->getStyle('A1:A2')->getFont()->setBold(true);
            },
        ];
    }
}