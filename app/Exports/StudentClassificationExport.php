<?php

namespace App\Exports;

use App\Service\Master\CourseService;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class StudentClassificationExport implements FromCollection, WithHeadings, WithMapping
{
    protected int $courseId;
    protected CourseService $courseService;

    public function __construct(int $courseId)
    {
        $this->courseId = $courseId;
        $this->courseService = app(CourseService::class);
    }
    
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return $this->courseService->getStudentTestDetails($this->courseId);
    }

    public function headings(): array
    {
        return [
            'Student ID',
            'Student Name',
            'Pre-Test Score',
            'Stratum',
            'Class Group'
        ];
    }

    public function map($student): array
    {
        return [
            $student->id,
            $student->name,
            $student->total_score ?? 'N/A',
            $student->stratum ?? '-',
            $student->class_group ?? '-',
        ];
    }
}
