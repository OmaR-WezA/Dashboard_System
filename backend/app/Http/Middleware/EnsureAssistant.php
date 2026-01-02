<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAssistant
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || (!$request->user()->is_admin && !$request->user()->is_assistant)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Assistant or Admin access required.',
            ], 403);
        }

        return $next($request);
    }
}

