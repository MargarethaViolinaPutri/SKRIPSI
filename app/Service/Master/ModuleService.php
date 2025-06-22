<?php

namespace App\Service\Master;

use App\Contract\Master\ModuleContract;
use App\Models\Module;
use App\Service\BaseService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ModuleService extends BaseService implements ModuleContract
{
    protected Model $model;
    protected array $fileKeys = [];

    public function __construct(Module $model)
    {
        $this->model = $model;
        // Ensure material_paths is selected and accessible
        $this->model->makeHidden([]); // Clear hidden if any
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

    public function update(array $conditions = [], $payloads)
    {
        $files = request()->file('materials');
        $materialPaths = [];

        // Find existing module
        $module = $this->model->where($conditions)->first();

        if (!$module) {
            return null;
        }

        // If new files are uploaded, delete all existing material files
        if (is_array($files) && count($files) > 0) {
            if (!empty($module->material_paths) && is_array($module->material_paths)) {
                foreach ($module->material_paths as $filePath) {
                    if (Storage::disk('public')->exists($filePath)) {
                        Storage::disk('public')->delete($filePath);
                    }
                }
            }
        }

        // Create a unique folder for each submit using course name and timestamp
        $courseName = request()->input('course_id');
        $folderName = $courseName . '_' . date('Ymd_His');

        if (is_array($files)) {
            foreach ($files as $file) {
                $path = $file->store($folderName, 'public');
                $materialPaths[] = $path;
            }
        }

        $payloads['material_paths'] = $materialPaths;

        if (isset($payloads['materials'])) {
            unset($payloads['materials']);
        }

        return parent::update($conditions, $payloads);
    }

    public function destroy($id)
    {
        try {
            $module = $this->model->findOrFail($id);

            // Delete associated material files
            if (!empty($module->material_paths) && is_array($module->material_paths)) {
                $foldersToCheck = [];
                foreach ($module->material_paths as $filePath) {
                    if (Storage::disk('public')->exists($filePath)) {
                        Storage::disk('public')->delete($filePath);
                        // Collect folder path to check later
                        $foldersToCheck[] = dirname($filePath);
                    }
                }
                // Remove duplicate folder paths
                $foldersToCheck = array_unique($foldersToCheck);
                // Check and delete empty folders
                foreach ($foldersToCheck as $folder) {
                    $filesInFolder = Storage::disk('public')->files($folder);
                    $subFoldersInFolder = Storage::disk('public')->directories($folder);
                    if (empty($filesInFolder) && empty($subFoldersInFolder)) {
                        Storage::disk('public')->deleteDirectory($folder);
                    }
                }
            }

            // Delete the module record
            return parent::destroy($id);
        } catch (\Exception $e) {
            return $e;
        }
    }
}