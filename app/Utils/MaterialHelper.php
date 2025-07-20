<?php

namespace App\Utils;

use Illuminate\Support\Facades\Storage;

class MaterialHelper
{
    /**
     * Get full URL for a material file path stored in material_paths.
     *
     * @param string|null $filePath
     * @return string|null
     */
    public static function getMaterialUrl(?string $filePath): ?string
    {
        if (!$filePath) {
            return null;
        }

        if (Storage::disk('public')->exists($filePath)) {
            return asset('storage/' . $filePath);
        }

        return null;
    }
}