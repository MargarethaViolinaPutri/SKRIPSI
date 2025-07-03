<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('test_attempts', function (Blueprint $table) {
            // $table->dropColumn('question_order');
            // $table->text('student_code')->nullable()->after('user_id');
            // $table->string('student_code_path')->nullable()->after('student_code');
            // $table->decimal('output_accuracy_score', 5, 2)->default(0)->after('student_code_path');
            // $table->decimal('structure_score', 5, 2)->default(0)->after('output_accuracy_score');
            // $table->renameColumn('score', 'total_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('test_attempts', function (Blueprint $table) {
            //
        });
    }
};
