<?php
declare(strict_types=1);

namespace HopoShop\Services;

use Exception;
use HopoShop\Config\Config;

require_once dirname(__DIR__, 2) . '/config/config.php';

class EmailService
{
    /**
     * Sends order confirmation email to the customer upon checkout.
     */
    public static function sendOrderConfirmation(array $order, array $customer, array $items): bool
    {
        $to = $customer['email'] ?? '';
        if (empty($to) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        $orderId = htmlspecialchars((string)($order['id'] ?? ''));
        $subject = "HOPO SHOP Atelier — Order Confirmed: #{$orderId}";
        $totalFormatted = number_format((float)($order['total_amount'] ?? 0), 2);
        $trackingNumber = htmlspecialchars((string)($order['tracking_number'] ?? ''));
        $courier = htmlspecialchars((string)($order['courier_partner'] ?? 'BlueDart Express Luxe'));
        $estDelivery = htmlspecialchars((string)($order['estimated_delivery'] ?? '5-7 business days'));
        $customerName = htmlspecialchars((string)($customer['name'] ?? 'Valued Customer'));

        $itemsHtml = '';
        foreach ($items as $item) {
            $title = htmlspecialchars((string)($item['title'] ?? $item['product_title'] ?? 'Couture Piece'));
            $size = htmlspecialchars((string)($item['size'] ?? 'Standard'));
            $qty = (int)($item['quantity'] ?? $item['qty'] ?? 1);
            $unitPrice = number_format((float)($item['unit_price'] ?? $item['price'] ?? 0), 2);
            $itemTotal = number_format((float)($item['total_price'] ?? ($qty * (float)($item['unit_price'] ?? $item['price'] ?? 0))), 2);

            $itemsHtml .= "
                <tr style='border-bottom: 1px solid #E5DCCD;'>
                    <td style='padding: 12px 8px; font-size: 14px; color: #1E293B;'>
                        <strong>{$title}</strong><br>
                        <span style='font-size: 12px; color: #64748B;'>Size: {$size} &times; {$qty}</span>
                    </td>
                    <td style='padding: 12px 8px; font-size: 14px; color: #1E293B; text-align: right;'>
                        ₹{$itemTotal}
                    </td>
                </tr>
            ";
        }

        $shippingAddress = $order['shipping_address'] ?? [];
        if (is_string($shippingAddress)) {
            $shippingAddress = json_decode($shippingAddress, true) ?: [];
        }
        $addrLine1 = htmlspecialchars((string)($shippingAddress['addressLine1'] ?? ''));
        $addrCity = htmlspecialchars((string)($shippingAddress['city'] ?? ''));
        $addrState = htmlspecialchars((string)($shippingAddress['state'] ?? ''));
        $addrPincode = htmlspecialchars((string)($shippingAddress['pincode'] ?? ''));

        $html = "
        <!DOCTYPE html>
        <html>
        <head><meta charset='utf-8'></head>
        <body style='margin: 0; padding: 0; background-color: #FAF6F0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;'>
            <table width='100%' cellpadding='0' cellspacing='0' style='background-color: #FAF6F0; padding: 30px 15px;'>
                <tr>
                    <td align='center'>
                        <table width='600' cellpadding='0' cellspacing='0' style='background-color: #FFFFFF; border-radius: 8px; overflow: hidden; border: 1px solid #E5DCCD; max-width: 600px;'>
                            <!-- Header -->
                            <tr>
                                <td style='background-color: #8B1E3F; padding: 28px 24px; text-align: center; color: #FFFFFF;'>
                                    <h1 style='margin: 0; font-size: 24px; letter-spacing: 4px; font-weight: 700;'>HOPO SHOP</h1>
                                    <p style='margin: 6px 0 0 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #F7E7CE;'>Luxury Indian Haute Couture Atelier</p>
                                </td>
                            </tr>
                            <!-- Intro -->
                            <tr>
                                <td style='padding: 24px 24px 12px 24px; color: #1E293B;'>
                                    <h2 style='margin: 0 0 12px 0; font-size: 18px; color: #0D1B2A;'>Namaste, {$customerName}</h2>
                                    <p style='margin: 0; font-size: 14px; line-height: 1.6; color: #475569;'>
                                        Thank you for choosing HOPO SHOP. Your couture order <strong>#{$orderId}</strong> has been confirmed and reserved in our master atelier.
                                    </p>
                                </td>
                            </tr>
                            <!-- Items Table -->
                            <tr>
                                <td style='padding: 12px 24px;'>
                                    <table width='100%' cellpadding='0' cellspacing='0' style='border-collapse: collapse;'>
                                        <thead>
                                            <tr style='border-bottom: 2px solid #8B1E3F; text-align: left;'>
                                                <th style='padding: 8px; font-size: 12px; text-transform: uppercase; color: #8B1E3F;'>Curated Ensemble</th>
                                                <th style='padding: 8px; font-size: 12px; text-transform: uppercase; color: #8B1E3F; text-align: right;'>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {$itemsHtml}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td style='padding: 14px 8px; font-size: 15px; font-weight: bold; color: #0D1B2A;'>Grand Total:</td>
                                                <td style='padding: 14px 8px; font-size: 15px; font-weight: bold; color: #8B1E3F; text-align: right;'>₹{$totalFormatted}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </td>
                            </tr>
                            <!-- Logistics / Delivery Details -->
                            <tr>
                                <td style='padding: 12px 24px 24px 24px;'>
                                    <div style='background-color: #FAF6F0; border-radius: 6px; padding: 16px; border: 1px solid #E5DCCD;'>
                                        <h3 style='margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #8B1E3F;'>Delivery Concierge</h3>
                                        <p style='margin: 0 0 4px 0; font-size: 13px; color: #334155;'><strong>Courier Partner:</strong> {$courier}</p>
                                        <p style='margin: 0 0 4px 0; font-size: 13px; color: #334155;'><strong>Consignment Tracking ID:</strong> {$trackingNumber}</p>
                                        <p style='margin: 0 0 8px 0; font-size: 13px; color: #334155;'><strong>Estimated Arrival:</strong> {$estDelivery}</p>
                                        <p style='margin: 0; font-size: 13px; color: #334155;'><strong>Destination:</strong> {$addrLine1}, {$addrCity}, {$addrState} - {$addrPincode}</p>
                                    </div>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style='background-color: #0D1B2A; padding: 20px; text-align: center; color: #94A3B8; font-size: 12px;'>
                                    <p style='margin: 0 0 4px 0;'>HOPO SHOP Luxury Atelier · Mumbai, India</p>
                                    <p style='margin: 0;'>For bespoke inquiries or concierge assistance, reply to this email.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        ";

        return self::send($to, $subject, $html);
    }

    /**
     * Sends instant new order notification to the Atelier administration team.
     */
    public static function sendAdminNewOrderAlert(array $order, array $customer, array $items): bool
    {
        $adminEmail = Config::get('ADMIN_NOTIFICATION_EMAIL', 'admin@hoposhop.in');
        if (empty($adminEmail) || !filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        $orderId = htmlspecialchars((string)($order['id'] ?? ''));
        $total = number_format((float)($order['total_amount'] ?? 0), 2);
        $subject = "[HOPO Atelier Alert] New Order Received: #{$orderId} (₹{$total})";
        $customerName = htmlspecialchars((string)($customer['name'] ?? 'Customer'));
        $customerEmail = htmlspecialchars((string)($customer['email'] ?? 'N/A'));
        $customerPhone = htmlspecialchars((string)($customer['phone'] ?? 'N/A'));
        $paymentMethod = htmlspecialchars((string)($order['payment_method'] ?? 'UPI'));

        $itemCount = count($items);

        $html = "
        <!DOCTYPE html>
        <html>
        <head><meta charset='utf-8'></head>
        <body style='font-family: Arial, sans-serif; background-color: #F8FAFC; padding: 20px; color: #1E293B;'>
            <div style='max-width: 600px; margin: auto; background: white; padding: 24px; border-radius: 8px; border: 1px solid #E2E8F0;'>
                <div style='background: #0D1B2A; color: white; padding: 14px 18px; border-radius: 6px;'>
                    <h2 style='margin: 0; font-size: 18px;'>New Customer Order Received</h2>
                </div>
                <div style='margin-top: 18px; font-size: 14px; line-height: 1.6;'>
                    <p><strong>Order ID:</strong> #{$orderId}</p>
                    <p><strong>Total Value:</strong> ₹{$total}</p>
                    <p><strong>Payment Method:</strong> {$paymentMethod}</p>
                    <p><strong>Customer:</strong> {$customerName} ({$customerEmail}, {$customerPhone})</p>
                    <p><strong>Items Ordered:</strong> {$itemCount} piece(s)</p>
                </div>
                <div style='margin-top: 24px;'>
                    <a href='" . rtrim((string)Config::get('FRONTEND_URL', 'https://hoposhop.in'), '/') . "/admin/orders' 
                       style='background: #8B1E3F; color: white; padding: 10px 18px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;'>
                        Open Admin Orders Desk
                    </a>
                </div>
            </div>
        </body>
        </html>
        ";

        return self::send($adminEmail, $subject, $html);
    }

    /**
     * Sends order status progression updates to the customer.
     */
    public static function sendOrderStatusUpdate(array $order, array $customer, string $status): bool
    {
        $to = $customer['email'] ?? '';
        if (empty($to) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        $orderId = htmlspecialchars((string)($order['id'] ?? ''));
        $trackingNumber = htmlspecialchars((string)($order['tracking_number'] ?? ''));
        $courier = htmlspecialchars((string)($order['courier_partner'] ?? 'BlueDart Express Luxe'));

        $statusTitles = [
            'CONFIRMED'        => 'Order Confirmed',
            'PACKED'           => 'Master Artisan Quality Inspection Complete & Packed',
            'SHIPPED'          => 'Handed Over to Courier for Dispatch',
            'OUT_FOR_DELIVERY' => 'Out for Delivery to Your Doorstep',
            'DELIVERED'        => 'Safely Delivered to Customer',
            'CANCELLED'        => 'Order Cancelled',
            'RETURN_REQUESTED' => 'Return / Exchange Concierge Request Received',
        ];

        $title = $statusTitles[$status] ?? "Status Updated: {$status}";
        $subject = "HOPO SHOP — Order #{$orderId} Update: {$title}";

        $html = "
        <!DOCTYPE html>
        <html>
        <head><meta charset='utf-8'></head>
        <body style='margin: 0; padding: 20px; background-color: #FAF6F0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;'>
            <div style='max-width: 580px; margin: auto; background: white; border: 1px solid #E5DCCD; border-radius: 8px; overflow: hidden;'>
                <div style='background: #8B1E3F; color: white; padding: 20px; text-align: center;'>
                    <h2 style='margin: 0; font-size: 20px; letter-spacing: 2px;'>HOPO SHOP</h2>
                    <p style='margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; color: #F7E7CE;'>Order Progress Notification</p>
                </div>
                <div style='padding: 24px; color: #1E293B; font-size: 14px; line-height: 1.6;'>
                    <p>Dear Customer,</p>
                    <p>The status of your order <strong>#{$orderId}</strong> has been updated to:</p>
                    <div style='background-color: #FAF6F0; padding: 14px; border-left: 4px solid #8B1E3F; margin: 16px 0; font-weight: bold; color: #8B1E3F;'>
                        {$title}
                    </div>
                    " . ($trackingNumber !== '' ? "<p><strong>Courier:</strong> {$courier}<br><strong>Tracking ID:</strong> {$trackingNumber}</p>" : "") . "
                    <p>You can track live milestones on your order at any time through our portal.</p>
                </div>
                <div style='background: #0D1B2A; color: #94A3B8; text-align: center; padding: 16px; font-size: 12px;'>
                    HOPO SHOP Luxury Haute Couture Atelier
                </div>
            </div>
        </body>
        </html>
        ";

        return self::send($to, $subject, $html);
    }

    /**
     * Core sending method using native PHP mail() with proper MIME headers,
     * or SMTP socket connection if configured.
     */
    public static function send(string $to, string $subject, string $htmlBody): bool
    {
        try {
            $fromAddress = Config::get('MAIL_FROM_ADDRESS', 'orders@hoposhop.in');
            $fromName = Config::get('MAIL_FROM_NAME', 'HOPO SHOP Atelier');

            $headers = [
                'MIME-Version: 1.0',
                'Content-Type: text/html; charset=UTF-8',
                'Content-Transfer-Encoding: 8bit',
                "From: {$fromName} <{$fromAddress}>",
                "Reply-To: {$fromAddress}",
                'X-Mailer: PHP/' . phpversion(),
            ];

            // If SMTP is enabled and host is specified, send via SMTP
            $smtpHost = Config::get('SMTP_HOST', '');
            if (!empty($smtpHost)) {
                return self::sendViaSmtp($to, $subject, $htmlBody, $fromAddress, $fromName);
            }

            // Default: Native mail() function (standard on MilesWeb cPanel with Exim)
            return @mail($to, $subject, $htmlBody, implode("\r\n", $headers));
        } catch (\Throwable $e) {
            error_log("EmailService send failure to {$to}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Minimal RFC 5321 compliant SMTP socket sender for authenticated cPanel mail.
     */
    private static function sendViaSmtp(string $to, string $subject, string $body, string $fromAddress, string $fromName): bool
    {
        $host = (string)Config::get('SMTP_HOST', 'localhost');
        $port = (int)Config::get('SMTP_PORT', 587);
        $user = (string)Config::get('SMTP_USER', '');
        $pass = (string)Config::get('SMTP_PASS', '');

        $timeout = 10;
        $socket = @fsockopen($host, $port, $errno, $errstr, $timeout);
        if (!$socket) {
            error_log("SMTP connection failed to {$host}:{$port} - {$errstr} ({$errno})");
            // Fallback to mail()
            return @mail($to, $subject, $body, "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nFrom: {$fromName} <{$fromAddress}>\r\n");
        }

        $read = function() use ($socket): string {
            $data = '';
            while ($str = fgets($socket, 515)) {
                $data .= $str;
                if (substr($str, 3, 1) === ' ') break;
            }
            return $data;
        };

        $write = function(string $cmd) use ($socket): void {
            fputs($socket, $cmd . "\r\n");
        };

        $read();
        $write("EHLO " . (gethostname() ?: 'localhost'));
        $read();

        if (!empty($user) && !empty($pass)) {
            $write("AUTH LOGIN");
            $read();
            $write(base64_encode($user));
            $read();
            $write(base64_encode($pass));
            $read();
        }

        $write("MAIL FROM:<{$fromAddress}>");
        $read();
        $write("RCPT TO:<{$to}>");
        $read();
        $write("DATA");
        $read();

        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: {$fromName} <{$fromAddress}>\r\n";
        $headers .= "To: {$to}\r\n";
        $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";

        $write($headers . "\r\n" . $body . "\r\n.");
        $read();

        $write("QUIT");
        fclose($socket);

        return true;
    }
}
