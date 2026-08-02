<?php

namespace App\Http\Controllers;

use App\Models\Slider;
use App\Models\News;
use App\Models\Activity;
use App\Models\Faq;
use App\Models\Gallery;
use App\Models\Company;
use App\Models\Partner;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;

class CMSController extends Controller
{
    /**
     * Get consolidated data for homepage items
     */
    public function getHomeData(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'sliders' => Slider::orderBy('order_num')->get(),
                'company' => Company::first(),
                'testimonials' => Testimonial::all(),
                'partners' => Partner::all(),
                'latest_news' => News::with('author')->latest()->take(3)->get(),
                'faqs' => Faq::orderBy('order_num')->get(),
                'galleries' => Gallery::latest()->take(8)->get(),
            ]
        ]);
    }

    /**
     * Get all news articles
     */
    public function newsIndex(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => News::with('author')->latest()->get()
        ]);
    }

    /**
     * Get detail news article and increment views
     */
    public function newsShow(string $slug): JsonResponse
    {
        $post = News::with('author')->where('slug', $slug)->firstOrFail();
        $post->increment('views');

        return response()->json([
            'success' => true,
            'data' => $post
        ]);
    }

    /**
     * Get all activity events
     */
    public function activitiesIndex(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Activity::latest()->get()
        ]);
    }

    /**
     * Get company profile details
     */
    public function profile(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Company::first()
        ]);
    }
}
