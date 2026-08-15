<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InvoiceController extends Controller
{
    /**
     * Render an HTML invoice that the browser can Print / Save as PDF.
     */
    public function show(Request $request, Payment $payment, PaymentService $paymentService)
    {
        $user = Auth::user();

        // Authorization: pelanggan hanya boleh melihat invoice miliknya.
        if ($user->role === 'pelanggan') {
            $customer = $user->customer;
            if (!$customer || $payment->customer_id !== $customer->id) {
                return response()->json(['success' => false, 'message' => 'Data tidak ditemukan.'], 404);
            }
        }

        // Pastikan invoice_number ada.
        if (!$payment->invoice_number) {
            $payment->invoice_number = $paymentService->generateInvoiceNumber(
                $payment->customer_id,
                $payment->year,
                $payment->month
            );
            $payment->save();
        }

        $company = $paymentService->getCompanyInfo();
        $method = null;
        if ($payment->payment_method) {
            $method = $paymentService
                ->getActivePaymentMethods()
                ->firstWhere('type', $payment->payment_method);
        }

        $html = $this->renderHtml($payment, $company, $method);

        $filename = $payment->invoice_number . '.html';
        $download = $request->query('download');

        if ($download) {
            return response($html, 200)
                ->header('Content-Type', 'text/html; charset=UTF-8')
                ->header('Content-Disposition', "attachment; filename={$filename}");
        }

        return response($html, 200)
            ->header('Content-Type', 'text/html; charset=UTF-8');
    }

    protected function renderHtml(Payment $payment, array $company, $method): string
    {
        $paidAt = $payment->paid_at
            ? \Carbon\Carbon::parse($payment->paid_at)->format('d M Y H:i')
            : '-';
        $dueDate = $payment->due_date
            ? \Carbon\Carbon::parse($payment->due_date)->format('d M Y')
            : '-';
        $invoiceDate = $payment->invoice_date
            ? \Carbon\Carbon::parse($payment->invoice_date)->format('d M Y')
            : '-';

        $monthName = \Carbon\Carbon::createFromDate($payment->year, $payment->month)->format('F Y');
        $amountFormatted = number_format((float) $payment->amount, 0, ',', '.');
        $methodLabel = self::typeLabel($payment->payment_method);

        $bankDetails = '';
        $qrisImage = '';
        if ($method && $method->type === 'bank_transfer') {
            $bankDetails = $method->bank_name . ' ' . $method->account_number . ' ' . $method->account_holder;
        } elseif ($method && $method->type === 'qris' && $method->image_path) {
            $escaped = e($method->image_path);
            $qrisImage = '<img src="' . $escaped . '" alt="QRIS" style="width:120px;height:120px;object-fit:contain;margin-top:8px;" />';
        }

        $badgeClass = $payment->status === 'Paid' ? 'badge-paid' : 'badge-unpaid';

        $companyName = ($company['name'] ?? '') ?: 'SI-SAMPAH';
        $companyPhone = $company['phone'] ?? '';
        $companyEmail = $company['email'] ?? '';
        $companyAddress = $company['address'] ?? '';
        $customerName = optional($payment->customer->user)->name ?? optional($payment->customer)->name ?? '-';
        $customerEmail = optional($payment->customer->user)->email ?? '-';

        return <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice {$payment->invoice_number}</title>
<style>
    body { font-family: "Segoe UI", system-ui, sans-serif; margin: 0; padding: 0; color: #1e293b; }
    .page { width: 210mm; padding: 20mm; box-sizing: border-box; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #059669; padding-bottom: 12px; margin-bottom: 20px; }
    .logo { font-size: 22px; font-weight: 700; color: #059669; }
    .logo span { color: #475569; font-size: 14px; font-weight: 400; display: block; }
    .invoice-title { font-size: 20px; font-weight: 700; color: #0f172a; text-align: right; }
    .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; font-size: 13px; }
    .grid2 div p { margin: 2px 0; }
    .label { color: #64748b; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
    th { background: #f1f5f9; font-weight: 700; color: #334155; font-size: 12px; }
    td.amount { text-align: right; font-weight: 700; }
    .total { font-size: 16px; font-weight: 700; }
    .amount-total { text-align: right; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
    .badge-paid { background: #dcfce7; color: #166534; }
    .badge-unpaid { background: #fee2e2; color: #991b2b; }
    .footer { border-top: 2px solid #059669; padding-top: 16px; font-size: 11px; color: #64748b; }
    .print-btn { position: fixed; top: 16px; right: 16px; background: #059669; color: #fff; border: none; padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
</style>
</head>
<body onload="window.print()">
<button class="print-btn" onclick="window.print()">🖨 Print / Save PDF</button>
<div class="page">
    <div class="header">
        <div class="logo">
            {$companyName}
            <span>{$companyPhone} | {$companyEmail}<br>{$companyAddress}</span>
        </div>
        <div>
            <div class="invoice-title">INVOICE</div>
            <div class="meta">No: {$payment->invoice_number}<br>Tgl: {$invoiceDate}</div>
        </div>
    </div>

    <div class="grid2">
        <div>
            <p class="label">Ditagihkan Kepada</p>
            <p>{$customerName}</p>
            <p>{$customerEmail}</p>
        </div>
        <div style="text-align:right;">
            <p class="label">Jatuh Tempo</p>
            <p>{$dueDate}</p>
            <p class="label" style="margin-top:6px;">Status</p>
            <span class="badge {$badgeClass}">{$payment->status}</span>
            <p class="label" style="margin-top:6px;">Tgl Dibayar</p>
            <p>{$paidAt}</p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Deskripsi</th>
                <th>Bulan</th>
                <th>Metode</th>
                <th style="text-align:right;">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Iuran Bulanan Service Pengelolaan Sampah</td>
                <td>{$monthName}</td>
                <td>{$methodLabel} {$bankDetails}</td>
                <td class="amount">Rp {$amountFormatted}</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <th colspan="3" class="total">TOTAL TAGIHAN</th>
                <th class="amount-total">Rp {$amountFormatted}</th>
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        <p>Terima kasih atas kepercayaan Anda. Pembayaran ini otomatis tercatat setelah persetujuan admin.</p>
        <p>Tekan tombol "Print / Save PDF" di kanan atas untuk mencetak atau menyimpan sebagai PDF.</p>
    </div>
</div>
</body>
</html>
HTML;
    }

    protected static function typeLabel(?string $type): string
    {
        $map = [
            'bank_transfer' => 'Transfer Bank',
            'qris' => 'QRIS',
            'cash' => 'Tunai (Cash)',
            'virtual_account' => 'Virtual Account',
        ];
        return $map[$type] ?? ($type ?? '-');
    }
}
