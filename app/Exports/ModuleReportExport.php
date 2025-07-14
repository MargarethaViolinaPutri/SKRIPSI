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

class ModuleReportExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle, WithEvents
{
    protected ?int $courseId;
    protected ?string $name;
    protected ?string $classGroup;

    public function __construct(?int $courseId, ?string $name, ?string $classGroup)
    {
        $this->courseId = $courseId;
        $this->name = $name;
        $this->classGroup = $classGroup;
    }

    public function title(): string
    {
        return 'Module Performance Report';
    }

    public function headings(): array
    {
        return [
            'Student Name',
            'Class Group',
            'Average Score',
            'Total Attempts',
            'Total Time Spent (Seconds)',
        ];
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $query = DB::table('users as u')
            ->join('course_user as cu', 'u.id', '=', 'cu.user_id')
            ->leftJoin('answers as a', 'u.id', '=', 'a.user_id')
            ->leftJoin('questions as q', 'a.question_id', '=', 'q.id')
            ->leftJoin('modules as m', 'q.module_id', '=', 'm.id')
            ->where('cu.course_id', $this->courseId)
            ->select(
                'u.name as student_name',
                'cu.class_group',
                DB::raw('AVG(a.total_score) as average_score'),
                DB::raw('COUNT(a.id) as total_attempts'),
                DB::raw('SUM(TIMESTAMPDIFF(SECOND, a.started_at, a.finished_at)) as total_time_spent_seconds')
            )
            ->groupBy('u.id', 'u.name', 'cu.class_group');

        if ($this->name) {
            $query->where('u.name', 'LIKE', '%' . $this->name . '%');
        }
        if ($this->classGroup) {
            $query->where('cu.class_group', $this->classGroup);
        }
        
        return $query->get();
    }

    /**
    * @param mixed $row
    *
    * @return array
    */
    public function map($row): array
    {
        return [
            $row->student_name,
            ucfirst($row->class_group ?? '-'),
            $row->average_score ? number_format($row->average_score, 2) : '0.00',
            $row->total_attempts,
            $row->total_time_spent_seconds ?? 0,
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
                $title = "Module Report for: " . ($this->course->name ?? 'All Courses');

                $sheet->insertNewRowBefore(1, 1);
                $sheet->setCellValue('A1', $title);
                $lastColumn = $sheet->getHighestColumn();
                $sheet->mergeCells("A1:{$lastColumn}1");
                $sheet->getStyle('A1')->getFont()->setBold(true);
            },
        ];
    }
}
