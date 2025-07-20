<?php

namespace App\Providers;

use App\Contract\Auth\UserAuthContract;
use App\Contract\AuthContract;
use App\Contract\BaseContract;
use App\Contract\Master\ClassRoomContract;
use App\Contract\Master\CourseContract;
use App\Contract\Master\ModuleContract;
use App\Contract\Master\QuestionContract as MasterQuestionContract;
use App\Contract\Master\TestContract;
use App\Contract\Master\TestQuestionContract;
use App\Contract\Operational\QuestionContract as OperationalQuestionContract;
use App\Contract\Master\UserContract;
use App\Contract\Operational\ModuleContract as OperationalModuleContract;
use App\Contract\Setting\LevelContract;
use App\Contract\Setting\SettingContract;
use App\Service\Auth\UserAuthService;
use App\Service\AuthService;
use App\Service\BaseService;
use App\Service\Master\ClassRoomService;
use App\Service\Master\CourseService;
use App\Service\Master\ModuleService;
use App\Service\Master\QuestionService as MasterQuestionService;
use App\Service\Master\TestQuestionService;
use App\Service\Master\TestService;
use App\Service\Operational\QuestionService as OperationalQuestionService;
use App\Service\Master\UserService;
use App\Service\Operational\ModuleService as OperationalModuleService;
use App\Service\Setting\LevelService;
use App\Service\Setting\SettingService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(AuthContract::class, AuthService::class);
        $this->app->bind(BaseContract::class, BaseService::class);

        $this->app->bind(UserAuthContract::class, UserAuthService::class);

        $this->app->bind(SettingContract::class, SettingService::class);
        // $this->app->bind(LevelContract::class, LevelService::class);

        $this->app->bind(ClassRoomContract::class, ClassRoomService::class);
        $this->app->bind(ModuleContract::class, ModuleService::class);
        $this->app->bind(CourseContract::class, CourseService::class);
        $this->app->bind(MasterQuestionContract::class, MasterQuestionService::class);
        $this->app->bind(OperationalQuestionContract::class, OperationalQuestionService::class);
        $this->app->bind(UserContract::class, UserService::class);

        $this->app->bind(OperationalModuleContract::class, OperationalModuleService::class);
        $this->app->bind(TestContract::class, TestService::class);
        $this->app->bind(TestQuestionContract::class, TestQuestionService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}