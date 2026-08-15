<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\Setting;
use Carbon\Carbon;

class PaymentService
{
    /**
     * Subscription fee (monthly). Falls back to 50000 if not configured.
     */
    public function getSubscriptionFee(): float
    {
        $fee = Setting::where('key', 'subscription_fee')->value('value');
        $fee = $fee ? (float) $fee : 50000;
        return $fee;
    }

    /**
     * Days before due date to generate the invoice (default 7).
     */
    public function getInvoiceDaysBefore(): int
    {
        $days = Setting::where('key', 'invoice_days_before')->value('value');
        return $days ? (int) $days : 7;
    }

    /**
     * Generate monthly invoices for all active customers when within
     * the billing window (7 days before due date).
     *
     * The due date defaults to the last day of the current month.
     */
    public function generateMonthlyInvoices(int $month, int $year): array
    {
        $generated = [];

        $dueDate = Carbon::create($year, $month, 1)->lastOfMonth();
        $invoiceDate = $dueDate->copy()->subDays($this->getInvoiceDaysBefore());
        $today = Carbon::now();

        if ($today->lt($invoiceDate)) {
            return $generated;
        }

        $fee = $this->getSubscriptionFee();

        // Active customers only (user status active)
        $customers = Customer::whereHas('user', function ($q) {
            $q->where('status', 'active');
        })->get();

        foreach ($customers as $customer) {
            // Skip if invoice already exists for this period
            $exists = Payment::where('customer_id', $customer->id)
                ->where('month', $month)
                ->where('year', $year)
                ->exists();

            if ($exists) {
                continue;
            }

            $payment = Payment::create([
                'customer_id' => $customer->id,
                'invoice_number' => $this->generateInvoiceNumber($customer->id, $year, $month),
                'amount' => $fee,
                'month' => $month,
                'year' => $year,
                'status' => 'Unpaid',
                'payment_method' => null,
                'proof_path' => null,
                'payment_date' => null,
                'due_date' => $dueDate->toDateString(),
                'invoice_date' => $invoiceDate->toDateString(),
                'paid_at' => null,
            ]);

            $generated[] = $payment;
        }

        return $generated;
    }

    /**
     * Update status of unpaid invoices whose due date has passed.
     */
    public function markOverdue(): int
    {
        return Payment::whereIn('status', ['Unpaid'])
            ->whereDate('due_date', '<', Carbon::now()->toDateString())
            ->update(['status' => 'Jatuh Tempo']);
    }

    /**
     * Get active payment methods available for customers.
     */
    public function getActivePaymentMethods()
    {
        return PaymentMethod::active()->get();
    }

    /**
     * Confirm / approve / reject a payment.
     */
    public function confirmPayment(Payment $payment, string $action): Payment
    {
        if ($action === 'approve') {
            $payment->update([
                'status' => 'Paid',
                'paid_at' => now(),
            ]);
        } else {
            $payment->update([
                'status' => 'Unpaid',
                'proof_path' => null,
                'paid_at' => null,
            ]);
        }

        return $payment->fresh();
    }

    /**
     * Get payments for a specific customer.
     */
    public function getCustomerPayments(int $customerId)
    {
        return Payment::where('customer_id', $customerId)
            ->latest()
            ->get();
    }

    /**
     * Generate a unique invoice number for the given period.
     */
    public function generateInvoiceNumber(int $customerId, int $year, int $month): string
    {
        $count = Payment::where('year', $year)
            ->where('month', $month)
            ->count() + 1;

        return 'INV-' . $year . str_pad((string) $month, 2, '0', STR_PAD_LEFT)
            . '-' . str_pad((string) $count, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Company info used across invoices and the public site.
     */
    public function getCompanyInfo(): array
    {
        return [
            'name' => (string) Setting::where('key', 'name')->value('value'),
            'phone' => (string) Setting::where('key', 'phone')->value('value'),
            'email' => (string) Setting::where('key', 'email')->value('value'),
            'address' => (string) Setting::where('key', 'address')->value('value'),
        ];
    }
}
