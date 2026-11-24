<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/phpmailer/Exception.php';
require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';

$cfg = require __DIR__ . '/config.php';

function respond(bool $ok, string $msg, int $code = 200): void {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'message' => $msg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(false, 'Method not allowed.', 405);

// --- Anti-spam: honeypot + minimum fill time ---
if (!empty($_POST['website'])) respond(true, 'Message sent!');          // bot filled hidden field: pretend success
$ts = (int)($_POST['ts'] ?? 0);
if ($ts && (time() - intdiv($ts, 1000)) < $cfg['min_seconds']) respond(false, 'Please try again.', 429);

// --- Simple per-IP rate limit (file based, no DB needed) ---
$ip   = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$file = sys_get_temp_dir() . '/cf_' . md5($ip) . '.json';
$hits = is_file($file) ? (json_decode((string)file_get_contents($file), true) ?: []) : [];
$hits = array_values(array_filter($hits, fn($t) => $t > time() - 3600));
if (count($hits) >= $cfg['max_per_hour']) respond(false, 'Too many messages. Try again later.', 429);

// --- Validate input ---
$name    = trim(strip_tags($_POST['name'] ?? ''));
$email   = trim($_POST['email'] ?? '');
$message = trim(strip_tags($_POST['message'] ?? ''));

if ($name === '' || mb_strlen($name) > 100)                respond(false, 'Please enter your name.', 422);
if (!filter_var($email, FILTER_VALIDATE_EMAIL))            respond(false, 'Please enter a valid email.', 422);
if ($message === '' || mb_strlen($message) > 5000)         respond(false, 'Please enter a message (max 5000 chars).', 422);

// --- Send via SMTP ---
$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = $cfg['smtp_host'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $cfg['smtp_user'];
    $mail->Password   = $cfg['smtp_pass'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $cfg['smtp_port'];
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom($cfg['smtp_user'], $cfg['site_name']);   // must be your own authenticated address
    $mail->addAddress($cfg['to_email']);
    $mail->addReplyTo($email, $name);                        // hitting "Reply" goes to the visitor

    $mail->Subject = "New portfolio message from {$name}";
    $mail->Body    = "Name: {$name}\nEmail: {$email}\nIP: {$ip}\n\n{$message}";
    $mail->send();

    $hits[] = time();
    file_put_contents($file, json_encode($hits));
    respond(true, 'Message sent! I will get back to you soon.');
} catch (Exception $e) {
    error_log('Contact form error: ' . $mail->ErrorInfo);
    respond(false, 'Sorry, something went wrong. Please try again later.', 500);
}
