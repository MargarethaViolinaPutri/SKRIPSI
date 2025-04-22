<?php

namespace App\Service;

use App\Contract\AuthContract;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthService implements AuthContract
{
    protected string $username = 'email';
    protected string|null $guard = null;
    protected string|null $guardForeignKey = null;
    protected Model $model;

    /**
     * Repositories constructor.
     *
     * @param Model $model
     */
    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * @return Model
     */
    public function build(): Model
    {
        return $this->model;
    }

    /**
     * Get user id by guard name.
     *
     * @return int
     */
    public function userID(): int
    {
        return Auth::guard($this->guard)->id();
    }

    /**
     * Login to app.
     *
     * @param array $credentials
     */
    public function login(array $credentials)
    {
        try {
            $userQuery = $this->model::query()->where($this->username, $credentials[$this->username]);
            $user = $userQuery->first();

            if (!$userQuery->exists()) {
                return new Exception($this->username . ' tidak terdaftar.');
            }

            if (!Hash::check($credentials["password"], $user->password)) {
                return new Exception('Password salah.');
            }

            if (!$login = Auth::guard($this->guard)->attempt($credentials)) {
                return new Exception($this->username . ' atau password salah.');
            }

            return $login;
        } catch (Exception $exception) {
            return $exception;
        }
    }

    /**
     * Register new user.
     *
     * @param array $payloads
     * @return Exception
     */
    public function register(array $payloads, $assignRole = [])
    {
        try {
            DB::beginTransaction();

            $user = $this->model->create($payloads);
            if ($assignRole) {
                $user->assignRole($assignRole);
            }

            DB::commit();

            return $user;
        } catch (Exception $exception) {
            DB::rollBack();
            return $exception;
        }
    }

    /**
     * Update user role and profile.
     *
     * @param array $payloads
     * @return Exception
     */
    public function update($id, array $payloads, $assignRole = [])
    {
        try {
            DB::beginTransaction();

            $user = $this->model->find($id);
            $user->update($payloads);
            if ($assignRole) {
                $user->syncRoles($assignRole);
            }


            DB::commit();

            return $user->first();
        } catch (Exception $exception) {
            DB::rollBack();
            return $exception;
        }
    }

    /**
     * Logout user from app.
     *
     * @return Exception|true
     */
    public function logout(): Exception|bool
    {
        try {
            Auth::guard($this->guard)->logout();
            return true;
        } catch (Exception $exception) {
            return $exception;
        }
    }

    /**
     * Send OTP code for validate email.
     *
     * @param array $payloads
     * @return bool|Exception
     */
    public function sendOTP(array $payloads)
    {
        // try {
        //     $randomNumber = rand(0, 999999);
        //     $otp = str_pad($randomNumber, 6, '0', STR_PAD_LEFT);

        //     $user = $this->model::query()
        //         ->where('email', $payloads['email'])
        //         ->first();

        //     if (!$user)
        //         return new Exception('Email not register.');

        //     DB::beginTransaction();

        //     PasswordResetToken::updateOrCreate(
        //         ['email' => $payloads['email']],
        //         [
        //             'otp' => Hash::make($otp),
        //             'otp_expired' => Carbon::now()->addMinutes(config('service-contract.auth.otp_expired'))
        //         ]
        //     );

        //     DB::commit();

        //     Mail::to($payloads['email'])->send(new SendOTP($otp));

        //     return [
        //         'email' => $payloads['email']
        //     ];
        // } catch (Exception $exception) {
        //     DB::rollBack();
        //     return $exception;
        // }
    }

    /**
     * Send OTP code for validate email.
     *
     * @param array $payloads
     * @return array|Exception
     */
    public function validateOTP(array $payloads)
    {
        // try {
        //     $token = Str::random(64);

        //     DB::beginTransaction();

        //     $reset = PasswordResetToken::query()
        //         ->where('email', $payloads['email'])
        //         ->first();

        //     if (!Hash::check($payloads['otp'], $reset->otp)) {
        //         return new Exception('OTP is invalid.');
        //     }

        //     $reset->update([
        //         // 'otp' => null,
        //         'token' => Hash::make($token),
        //         'token_expired' => Carbon::now()->addMinutes(config('service-contract.auth.token_expired'))
        //     ]);

        //     DB::commit();

        //     return [
        //         'email' => $payloads['email'],
        //         'token' => $token
        //     ];
        // } catch (Exception $exception) {
        //     DB::rollBack();
        //     return $exception;
        // }
    }

    /**
     * Validate OTP for resert password.
     *
     * @param array $payloads
     * @return bool|Exception
     */
    public function resetPassword(array $payloads)
    {
        // try {
        //     DB::beginTransaction();

        //     $reset = PasswordResetToken::query()
        //         ->where('email', $payloads['email'])
        //         ->first();

        //     if (!Hash::check($payloads['token'], $reset->token)) {
        //         return new Exception('OTP is invalid.');
        //     }

        //     $this->model::where('email', $payloads['email'])
        //         ->update(['password' => Hash::make($payloads['password'])]);

        //     $reset->delete();

        //     DB::commit();

        //     return true;
        // } catch (Exception $exception) {
        //     DB::rollBack();
        //     return $exception;
        // }
    }
}
