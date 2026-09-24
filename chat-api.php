<?php
/**
 * chat-api.php
 * -----------------------------------------------------------------
 * Backend endpoint for the AI chatbot widget.
 * Receives a user message from the browser, forwards it to Groq's
 * chat completion API, and returns the assistant's reply as JSON.
 *
 * Requirements: PHP with cURL enabled (default on WAMP).
 *
 * SETUP:
 * 1. Get a free API key at https://console.groq.com/keys
 * -----------------------------------------------------------------
 */

// ---- CONFIG -------------------------------------------------------
define('GROQ_MODEL', 'llama-3.3-70b-versatile'); 
define('SYSTEM_PROMPT', 'You are a friendly, concise assistant embedded on a website. Keep answers short and helpful.');

// Safe fallback definition
$groq_api_key_val = '';

// READ THE GROQ API KEY FROM A LOCAL .env FILE
$envFile = __DIR__ . '/.env';

if (file_exists($envFile)) {
    $envLines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($envLines as $envLine) {
        $envLine = trim($envLine);

        // Ignore comments and empty lines
        if ($envLine === '' || strpos($envLine, '#') === 0) {
            continue;
        }

        // Split the key and value
        list($envKey, $envValue) = array_pad(explode('=', $envLine, 2), 2, '');

        if (trim($envKey) === 'GROQ_API_KEY') {
            $groq_api_key_val = trim($envValue);
            break;
        }
    }
}

// Define the final constant securely
define('GROQ_API_KEY', $groq_api_key_val);
// -------------------------------------------------------------------

header('Content-Type: application/json');

// Allow the widget to call this from the same site.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST requests are allowed.']);
    exit;
}

// ---- Read incoming request ----------------------------------------
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || !isset($data['message']) || trim($data['message']) === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing "message" field.']);
    exit;
}

$userMessage = trim($data['message']);

// Optional: the widget can send prior turns as { history: [{role, content}, ...] }
$history = isset($data['history']) && is_array($data['history']) ? $data['history'] : [];

// Basic length guard so nobody sends you a novel
if (mb_strlen($userMessage) > 2000) {
    http_response_code(400);
    echo json_encode(['error' => 'Message too long.']);
    exit;
}

if (GROQ_API_KEY === '') {
    http_response_code(500);
    echo json_encode(['error' => 'Server is missing a Groq API key. Set GROQ_API_KEY in the local .env file.']);
    exit;
}

// ---- Build messages array for Groq ---------------------------------
$messages = [];
$messages[] = ['role' => 'system', 'content' => SYSTEM_PROMPT];

// Keep only the last few turns of history to control token usage
$trimmedHistory = array_slice($history, -10);
foreach ($trimmedHistory as $turn) {
    if (isset($turn['role'], $turn['content']) && in_array($turn['role'], ['user', 'assistant'], true)) {
        $messages[] = ['role' => $turn['role'], 'content' => (string) $turn['content']];
    }
}

$messages[] = ['role' => 'user', 'content' => $userMessage];

$payload = json_encode([
    'model' => GROQ_MODEL,
    'messages' => $messages,
    'temperature' => 0.7,
    'max_tokens' => 512,
]);

// ---- Call Groq API via cURL ----------------------------------------
$ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . GROQ_API_KEY,
    ],
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_TIMEOUT => 30,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(502);
    echo json_encode(['error' => 'Could not reach the AI service.', 'detail' => $curlError]);
    exit;
}

$decoded = json_decode($response, true);

if ($httpCode !== 200 || !isset($decoded['choices'][0]['message']['content'])) {
    http_response_code(502);
    echo json_encode([
        'error' => 'AI service returned an unexpected response.',
        'detail' => $decoded['error']['message'] ?? $response,
    ]);
    exit;
}

$reply = $decoded['choices'][0]['message']['content'];

echo json_encode([
    'reply' => $reply,
]);
