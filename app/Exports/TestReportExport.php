<?php
namespace App\Exports;

use App\Models\Course;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TestReportExport implements FromCollection, WithHeadings, WithStyles, WithTitle, WithEvents
{
    protected ?int $courseId;
    protected ?string $name;
    protected ?string $classGroup;
    protected ?Course $course;

    public function __construct(?int $courseId, ?string $name, ?string $classGroup)
    {
        $this->courseId = $courseId;
        $this->name = $name;
        $this->classGroup = $classGroup;
        $this->course = $courseId ? Course::find($courseId) : null;
    }

    public function title(): string
    {
        return 'Test Scores Report';
    }

    public function headings(): array
    {
        return ['Student Name', 'Class Group', 'Pre-Test Score', 'Post-Test Score', 'Delay-Test Score'];
    }

    public function collection()
    {
        $query = DB::table('users as u')
            ->join('model_has_roles as mhr', 'u.id', '=', 'mhr.model_id')
            ->join('roles', 'mhr.role_id', '=', 'roles.id')
            ->leftJoin('course_user as cu', 'u.id', '=', 'cu.user_id')
            ->leftJoin('tests as t', 'cu.course_id', '=', 't.course_id')
            ->leftJoin('test_attempts as ta', function($join) {
                $join->on('u.id', '=', 'ta.user_id')->on('t.id', '=', 'ta.test_id');
            })
            ->where('roles.name', 'student')
            ->select(
                'u.name as student_name',
                'cu.class_group',
                DB::raw("MAX(CASE WHEN t.type = 'pretest' THEN ta.total_score END) as pretest_score"),
                DB::raw("MAX(CASE WHEN t.type = 'posttest' THEN ta.total_score END) as posttest_score"),
                DB::raw("MAX(CASE WHEN t.type = 'delaytest' THEN ta.total_score END) as delaytest_score")
            )
            ->groupBy('u.id', 'u.name', 'cu.class_group');

        if ($this->courseId) {
            $query->where('cu.course_id', $this->courseId);
        }

        if ($this->name) {
            $query->where('u.name', 'LIKE', '%' . $this->name . '%');
        }
        
        if ($this->classGroup) {
            $query->where('cu.class_group', $this->classGroup);
        }

        return $query->get();
    }

    public function map($row): array
    {
        return [
            $row->student_name,
            ucfirst($row->class_group ?? '-'),
            $row->pretest_score ? number_format($row->pretest_score, 2) : '-',
            $row->posttest_score ? number_format($row->posttest_score, 2) : '-',
            $row->delaytest_score ? number_format($row->delaytest_score, 2) : '-',
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
                $courseName = $this->course ? $this->course->name : 'All Courses';
                $title = "Test Report for: " . $courseName;

                $sheet->insertNewRowBefore(1, 1);
                $sheet->setCellValue('A1', $title);
                
                $lastColumn = $sheet->getHighestColumn();
                $sheet->mergeCells("A1:{$lastColumn}1");

                $sheet->getStyle('A1')->getFont()->setBold(true);
            },
        ];
    }
}