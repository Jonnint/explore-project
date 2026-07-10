<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KnowledgeBase;
use Illuminate\Http\Request;

class KnowledgeBaseController extends Controller
{
    public function index(Request $request)
    {
        $data = KnowledgeBase::query()
            ->where('user_id', $request->user()->id)
            ->search($request->get('q'))
            ->when($request->get('category'), fn ($q, $cat) => $q->forCategory($cat))
            ->latest()
            ->paginate(20);

        return response()->json($data);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:50',
            'content.body' => 'required|string',
            'content.keywords' => 'nullable|array',
            'content.keywords.*' => 'string|max:100',
            'content.related_products' => 'nullable|array',
            'content.related_products.*' => 'integer|exists:products,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
            'is_active' => 'boolean',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['content'] = [
            'body' => $validated['content']['body'],
            'keywords' => $validated['content']['keywords'] ?? [],
            'related_products' => $validated['content']['related_products'] ?? [],
        ];

        $entry = KnowledgeBase::create($validated);

        return response()->json($entry, 201);
    }

    public function show(Request $request, KnowledgeBase $knowledgeBase)
    {
        if ($knowledgeBase->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($knowledgeBase);
    }

    public function update(Request $request, KnowledgeBase $knowledgeBase)
    {
        if ($knowledgeBase->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|max:50',
            'content.body' => 'sometimes|string',
            'content.keywords' => 'nullable|array',
            'content.keywords.*' => 'string|max:100',
            'content.related_products' => 'nullable|array',
            'content.related_products.*' => 'integer|exists:products,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
            'is_active' => 'boolean',
        ]);

        if (isset($validated['content'])) {
            $current = $knowledgeBase->content;
            $validated['content'] = [
                'body' => $validated['content']['body'] ?? ($current['body'] ?? ''),
                'keywords' => $validated['content']['keywords'] ?? ($current['keywords'] ?? []),
                'related_products' => $validated['content']['related_products'] ?? ($current['related_products'] ?? []),
            ];
        }

        $knowledgeBase->update($validated);

        return response()->json($knowledgeBase);
    }

    public function destroy(Request $request, KnowledgeBase $knowledgeBase)
    {
        if ($knowledgeBase->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $knowledgeBase->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }

    public function search(Request $request)
    {
        $request->validate(['q' => 'required|string|max:255']);

        $results = KnowledgeBase::where('user_id', $request->user()->id)
            ->active()
            ->search($request->get('q'))
            ->limit(10)
            ->get(['id', 'title', 'category', 'content', 'tags']);

        return response()->json($results);
    }

    public function append(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:50',
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'keywords' => 'nullable|array',
            'keywords.*' => 'string|max:100',
            'related_products' => 'nullable|array',
            'related_products.*' => 'integer|exists:products,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
        ]);

        $entry = KnowledgeBase::appendOrCreate(
            userId: $request->user()->id,
            category: $validated['category'],
            title: $validated['title'],
            body: $validated['body'],
            keywords: $validated['keywords'] ?? [],
            relatedProducts: $validated['related_products'] ?? [],
            tags: $validated['tags'] ?? [],
        );

        return response()->json($entry, 201);
    }
}
