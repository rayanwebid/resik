<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePickupRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required',
            'waste_type' => 'required|string|max:100',
            'estimated_weight' => 'required|numeric|min:0.1',
            'notes' => 'nullable|string',
            'photo' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ];
    }
}
