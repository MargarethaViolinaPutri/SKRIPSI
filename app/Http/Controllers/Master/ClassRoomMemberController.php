<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ClassRoom;
use App\Models\User; // Assuming members are users
use Illuminate\Http\JsonResponse;

class ClassRoomMemberController extends Controller
{
    /**
     * Fetch members of a classroom.
     *
     * @param Request $request
     * @param int $id ClassRoom ID
     * @return JsonResponse
     */
    public function fetch(Request $request, int $id): JsonResponse
    {
        $classroom = ClassRoom::findOrFail($id);

        // Assuming classroom has a members relationship
        $members = $classroom->members()->get(['id', 'name', 'email']);

        return response()->json([
            'data' => $members,
        ]);
    }

    /**
     * Delete a member from the classroom.
     *
     * @param int $id Member ID
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $member = User::findOrFail($id);

        // Assuming you have a pivot table or relation to detach member from classroom
        // For example, if classroom_user pivot table exists:
        // $member->classrooms()->detach($classroomId);

        // Or if deleting the user entirely:
        $member->delete();

        return response()->json([
            'message' => 'Member deleted successfully',
        ]);
    }
}