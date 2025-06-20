<?php

namespace App\Service\Master;

use App\Contract\Master\ModuleContract;
use App\Models\Module;
use App\Service\BaseService;
use Illuminate\Database\Eloquent\Model;

class ModuleService extends BaseService implements ModuleContract
{
    protected Model $model;
    protected array $fileKeys = [];

    public function __construct(Module $model)
    {
        $this->model = $model;
    }

    public function create($payloads)
    {
        $files = request()->file('materials');
        $materialPaths = [];

        // Create a unique folder for each submit using course name and timestamp
        $courseName = request()->input('course_id');
        // Optionally, you can fetch course name from DB if needed
        $folderName = $courseName . '_' . date('Ymd_His'); // store directly in public storage root without 'materials' folder

        if (is_array($files)) {
            foreach ($files as $file) {
                $path = $file->store($folderName, 'public'); // store files in unique folder
                $materialPaths[] = $path;
            }
        }

        $payloads['material_paths'] = $materialPaths;

        if (isset($payloads['materials'])) {
            unset($payloads['materials']);
        }

        return parent::create($payloads);
    }
}
