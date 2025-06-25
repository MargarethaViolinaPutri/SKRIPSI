<?php

namespace App\Service\Master;

use App\Contract\Master\ClassRoomContract;
use App\Models\ClassRoom;
use App\Models\ClassRoomUser;
use App\Service\BaseService;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ClassRoomService extends BaseService implements ClassRoomContract
{
    protected Model $model;

    public function __construct(ClassRoom $model)
    {
        $this->model = $model;
    }

    public function create($payloads)
    {

        $members = $payloads['members'];
        unset($payloads['members']);

        try {
            DB::beginTransaction();
            $model = $this->model->create($payloads);

            $members = collect($members)->map(function ($member) use ($model) {
                return [
                    'user_id' => $member['value'],
                    'class_room_id' => $model->id,
                ];
            });

            ClassRoomUser::insert($members->toArray());

            DB::commit();

            return $model->fresh();
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            // Detach all members related to this classroom
            ClassRoomUser::where('class_room_id', $id)->delete();

            // Delete the classroom itself
            $classroom = $this->model->findOrFail($id);
            $classroom->delete();

            DB::commit();

            return true;
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }
}