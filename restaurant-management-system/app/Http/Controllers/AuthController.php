<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Models\Role;
use App\Models\ActivityLog;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // REGISTER
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => bcrypt($data['password']),
            'phone'    => $data['phone'] ?? null,
        ]);

        // Attach default role (customer) if roles/pivot exist. Fallback to id 4.
        if (method_exists($user, 'roles')) {
            $roleId = Role::where('name', 'customer')->value('id') ?? 4;
            $user->roles()->attach($roleId);
        }

        event(new Registered($user));

        $this->log($user, 'register', 'user', $user->id, $data);

        return response()->json([
            'message' => 'Registration successful. Please verify your email.',
            'user'    => $user,
        ]);
    }

    // LOGIN
    public function login(LoginRequest $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials.'
            ], 401);
        }

        $user = Auth::user();

        if (method_exists($user, 'hasVerifiedEmail') && !$user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Please verify your email first.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $this->log($user, 'login', 'user', $user->id);

        return response()->json([
            'message' => 'Login successful.',
            'token'   => $token,
            'user'    => $user,
        ]);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        $this->log($request->user(), 'logout');

        return response()->json(['message' => 'Logged out.']);
    }

    // CURRENT USER
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // EMAIL VERIFICATION
    public function verifyEmail(Request $request)
    {
        $user = User::find($request->id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if (method_exists($user, 'hasVerifiedEmail') && $user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }

        if (!hash_equals((string) $request->hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Invalid verification link'], 403);
        }

        $user->markEmailAsVerified();

        return response()->json(['message' => 'Email verified successfully.']);
    }

    // LOG ACTIVITY
    private function log($user, $action, $model = null, $modelId = null, $payload = null)
    {
        ActivityLog::create([
            'user_id'    => $user?->id,
            'action_type'=> $action,
            'model_type' => $model,
            'model_id'   => $modelId,
            'payload'    => $payload,
            'ip'         => request()->ip(),
        ]);
    }
}
