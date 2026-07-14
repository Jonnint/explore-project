<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (! $request->user()->canViewUsers()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = User::query()->orderBy('created_at', 'desc');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        if ($status = $request->query('status')) {
            if ($status === 'verified') {
                $query->where('verified', true);
            } elseif ($status === 'unverified') {
                $query->where('verified', false);
            } elseif ($status === 'active') {
                $query->where('active', true);
            } elseif ($status === 'inactive') {
                $query->where('active', false);
            }
        }

        $users = $query->paginate(15);

        return response()->json([
            'users' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function getRoles(): JsonResponse
    {
        return response()->json([
            'roles' => ['superadmin', 'admin', 'agent', 'user'],
        ]);
    }

    public function show(Request $request, $id): JsonResponse
    {
        if (! $request->user()->canViewUsers()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::find($id);

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json(['user' => $user]);
    }

    public function store(Request $request): JsonResponse
    {
        if (! $request->user()->canManageUsers()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(['superadmin', 'admin', 'agent', 'user'])],
            'token_limit' => ['nullable', 'integer', 'min:0'],
            'region' => ['nullable', 'string', 'max:255'],
            'verified' => ['nullable', 'boolean'],
            'active' => ['nullable', 'boolean'],
        ]);

        $user = User::create($validated);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        if (! $request->user()->canManageUsers()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::find($id);

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20', Rule::unique('users', 'phone')->ignore($user->id)],
            'role' => ['required', Rule::in(['superadmin', 'admin', 'agent', 'user'])],
            'token_limit' => ['nullable', 'integer', 'min:0'],
            'region' => ['nullable', 'string', 'max:255'],
            'verified' => ['nullable', 'boolean'],
            'active' => ['nullable', 'boolean'],
        ]);

        if ($request->has('password') && $request->password) {
            $validated['password'] = $request->password;
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        if (! $request->user()->canManageUsers()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::find($id);

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function resetToken(Request $request, $id): JsonResponse
    {
        if (! $request->user()->canManageUsers()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::find($id);

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->update(['tokens_used' => 0]);

        return response()->json([
            'message' => 'Token usage reset successfully',
            'user' => $user,
        ]);
    }

    public function verify(Request $request, $id): JsonResponse
    {
        if (! $request->user()->canManageUsers()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::find($id);
        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->update(['verified' => true]);

        return response()->json([
            'message' => 'User verified successfully',
            'user' => $user,
        ]);
    }

    public function unverify(Request $request, $id): JsonResponse
    {
        if (! $request->user()->canManageUsers()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::find($id);
        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->update(['verified' => false]);

        return response()->json([
            'message' => 'User unverified successfully',
            'user' => $user,
        ]);
    }

    public function activate(Request $request, $id): JsonResponse
    {
        if (! $request->user()->canManageUsers()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::find($id);
        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->update(['active' => true]);

        return response()->json([
            'message' => 'User activated successfully',
            'user' => $user,
        ]);
    }

    public function deactivate(Request $request, $id): JsonResponse
    {
        if (! $request->user()->canManageUsers()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::find($id);
        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->update(['active' => false]);

        return response()->json([
            'message' => 'User deactivated successfully',
            'user' => $user,
        ]);
    }
}
