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
use App\Models\PickupRequest;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;

class CMSController extends Controller
{
    /**
     * Get consolidated data for homepage items
     */
    public function getHomeData(): JsonResponse
    {
        $activePickup = PickupRequest::whereIn('status', ['menunggu', 'diproses', 'dalam perjalanan'])
            ->with(['customer.district', 'customer.village', 'customer.city', 'customer.user', 'officer.user'])
            ->latest()
            ->first();

        $activePickupData = null;
        if ($activePickup) {
            $districtName = $activePickup->customer->district->name ?? null;
            $villageName = $activePickup->customer->village->name ?? null;
            $cityName = $activePickup->customer->city->name ?? null;
            $locationName = $villageName ? "{$villageName}, {$districtName}" : ($districtName ?: ($cityName ?: ($activePickup->customer->address ?? 'Wilayah Layanan')));

            $statusLabel = 'Menunggu Penjemputan';
            if ($activePickup->status === 'diproses') {
                $statusLabel = 'Sedang Diproses';
            } elseif ($activePickup->status === 'dalam perjalanan') {
                $statusLabel = 'Dalam Perjalanan';
            }

            $activePickupData = [
                'id' => $activePickup->id,
                'status' => $activePickup->status,
                'status_label' => $statusLabel,
                'location' => $locationName,
                'waste_type' => ucfirst($activePickup->waste_type),
                'estimated_weight' => floatval($activePickup->estimated_weight),
                'customer_name' => $activePickup->customer->name ?? ($activePickup->customer->user->name ?? 'Warga'),
                'officer_name' => $activePickup->officer->user->name ?? null,
                'updated_at' => $activePickup->updated_at ? $activePickup->updated_at->diffForHumans() : null,
            ];
        }

        $totalCompletedWeight = PickupRequest::whereIn('status', ['selesai', 'sudah diambil'])->sum('estimated_weight');
        $totalCustomers = Customer::count();

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
                'active_pickup' => $activePickupData,
                'stats' => [
                    'total_recycled_kg' => floatval($totalCompletedWeight),
                    'total_customers' => $totalCustomers,
                ]
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
