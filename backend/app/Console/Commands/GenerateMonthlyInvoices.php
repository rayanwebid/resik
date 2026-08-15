<?php

namespace App\Console\Commands;

use App\Services\PaymentService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class GenerateMonthlyInvoices extends Command
{
    protected $signature = 'payments:generate-invoices';
    protected $description = 'Generate monthly invoices 7 days before due date and mark overdue payments';

    public function handle(PaymentService $paymentService): int
    {
        // Generate invoices for the current month (if within the 7-day window)
        $month = (int) now()->month;
        $year = (int) now()->year;
        $generated = $paymentService->generateMonthlyInvoices($month, $year);

        // Mark previously unpaid invoices that are now past the due date
        $overdue = $paymentService->markOverdue();

        $this->info('Generated ' . count($generated) . ' invoice(s) for ' . $month . '/' . $year);
        $this->info('Marked ' . $overdue . ' overdue payment(s)');

        Log::info('Monthly invoice generation completed', [
            'generated' => count($generated),
            'overdue' => $overdue,
            'month' => $month,
            'year' => $year,
        ]);

        return Command::SUCCESS;
    }
}
