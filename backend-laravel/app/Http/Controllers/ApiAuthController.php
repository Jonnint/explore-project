<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\PendingChat;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ApiAuthController extends Controller
{
    /**
     * Login — return Sanctum token.
     * POST /api/auth/login
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        $user = Auth::user();
        $user->tokens()->delete();
        $token = $user->createToken('next-app')->plainTextToken;
        // // Hapus token lama biar ga numpuk
        // $user->tokens()->delete();

        // $token = $user->createToken('next-app')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
        ]);
    }

    /**
     * Logout — revoke token yang sedang dipakai.
     * POST /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    /**
     * Update profile.
     * PUT /api/auth/profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'region' => ['nullable', 'string', 'max:255'],
        ]);

        $user->update($validated);

        $agentPhone = $user->phone;
        $whatsappConfigured = ! empty(config('services.whatsapp.token')) && ! empty(config('services.whatsapp.phone_id'));

        return response()->json([
            'message' => 'Profil berhasil diupdate.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'region' => $user->region,
                'whatsapp_connection' => [
                    'status' => $whatsappConfigured ? 'active' : 'inactive',
                    'configured' => $whatsappConfigured,
                    'display_phone_number' => $agentPhone,
                ],
            ],
        ]);
    }

    /**
     * Update password.
     * PUT /api/auth/password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $request->user()->update([
            'password' => $validated['password'],
        ]);

        return response()->json([
            'message' => 'Password berhasil diubah.',
        ]);
    }

    /**
     * Get authenticated user.
     * GET /api/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $agentPhone = $user->phone;

        $whatsappConfigured = ! empty(config('services.whatsapp.token')) && ! empty(config('services.whatsapp.phone_id'));
        $whatsappStatus = $whatsappConfigured ? 'active' : 'inactive';

        $messagesToday = PendingChat::where('agent_phone', $agentPhone)
            ->whereDate('created_at', Carbon::today())
            ->count();

        $lastChat = PendingChat::where('agent_phone', $agentPhone)
            ->latest('created_at')
            ->first();

        $lastLead = Lead::where('agent_phone', $agentPhone)
            ->latest('last_message_at')
            ->first();

        $lastActiveTimestamp = null;
        if ($lastChat && $lastLead) {
            $lastActiveTimestamp = $lastChat->created_at->gt($lastLead->last_message_at) ? $lastChat->created_at : $lastLead->last_message_at;
        } elseif ($lastChat) {
            $lastActiveTimestamp = $lastChat->created_at;
        } elseif ($lastLead) {
            $lastActiveTimestamp = $lastLead->last_message_at;
        }

        $lastActive = $lastActiveTimestamp ? $lastActiveTimestamp->toIso8601String() : null;
        $lastActiveHuman = $lastActiveTimestamp ? $lastActiveTimestamp->diffForHumans() : 'Never active';

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'region' => $user->region,
            ],
            'whatsapp_connection' => [
                'status' => $whatsappStatus,
                'configured' => $whatsappConfigured,
                'display_phone_number' => $agentPhone,
                'last_active' => $lastActive,
                'last_active_human' => $lastActiveHuman,
                'messages_today' => $messagesToday,
            ],
        ]);
    }
}
