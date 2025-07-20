<?php

namespace App\Http\Controllers\Auth;

use App\Contract\Auth\UserAuthContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Utils\WebResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{

    protected UserAuthContract $service;

    public function __construct(UserAuthContract $service)
    {
        $this->service = $service;
    }

    public function login()
    {
        if (Auth::guard()->check()) return redirect(route('backoffice.index'));
        return Inertia::render('auth/login');
    }

    public function attempt(LoginRequest $request)
    {
        $payload = $request->validated();
        $result = $this->service->login($payload);
        return WebResponse::response($result, 'backoffice.index');
    }

    public function logout()
    {
        $result = $this->service->logout();
        return WebResponse::response($result, 'auth.login');
    }
}
