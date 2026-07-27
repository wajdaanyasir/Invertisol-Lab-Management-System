<?php
/**
 * InvertiSOL Repairing Labs - PHP Hosting MySQL REST API
 * Upload this file to your PHP web hosting server (cPanel, Hostinger, GoDaddy, etc.)
 * 
 * Instructions:
 * 1. Create a MySQL Database on your hosting cPanel/phpMyAdmin.
 * 2. Import the `schema.sql` file in phpMyAdmin.
 * 3. Update the DB_HOST, DB_NAME, DB_USER, DB_PASS below with your MySQL credentials.
 */

// --- DATABASE CONFIGURATION ---
define('DB_HOST', 'localhost');
define('DB_NAME', 'eenjimvt_invertisol_lab');
define('DB_USER', 'eenjimvt_labmanager');
define('DB_PASS', 'lab_admin@123@12');
define('API_SECRET_KEY', ''); // Set a secret key if you wish to enforce header validation (X-API-KEY)

// --- CORS & HEADERS ---
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-KEY, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// --- API KEY VALIDATION (Optional) ---
if (defined('API_SECRET_KEY') && !empty(API_SECRET_KEY)) {
    $headers = getallheaders();
    $providedKey = isset($headers['X-API-KEY']) ? $headers['X-API-KEY'] : (isset($_GET['api_key']) ? $_GET['api_key'] : '');
    if ($providedKey !== API_SECRET_KEY) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Invalid API Key']);
        exit;
    }
}

// --- DATABASE CONNECTION & AUTOMATIC CREATION ---
try {
    // 1. Try connecting directly to specified database
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]
    );
} catch (PDOException $e) {
    // 2. If database connection fails, attempt auto-creating database if MySQL user has privileges
    try {
        $pdoHost = new PDO(
            "mysql:host=" . DB_HOST . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        $pdoHost->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
        
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ]
        );
    } catch (PDOException $e2) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Database connection failed: ' . $e2->getMessage(),
            'tip' => 'Please verify MySQL user credentials and host permissions.'
        ]);
        exit;
    }
}

// --- AUTO TABLE PROVISIONING ---
function ensureTablesExist($pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `app_data_store` (
        `store_key` VARCHAR(100) PRIMARY KEY,
        `json_content` LONGTEXT NOT NULL,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
}
ensureTablesExist($pdo);

// --- ROUTER & ACTIONS ---
$action = isset($_GET['action']) ? $_GET['action'] : 'ping';
$input = json_decode(file_get_contents('php://input'), true);

switch ($action) {

    case 'ping':
        echo json_encode([
            'status' => 'success',
            'message' => 'InvertiSOL PHP Hosting MySQL API is active & connected!',
            'timestamp' => date('c'),
            'db_name' => DB_NAME,
            'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'PHP Engine'
        ]);
        break;

    case 'get_all':
        try {
            $stmt = $pdo->query("SELECT store_key, json_content FROM app_data_store");
            $rows = $stmt->fetchAll();
            $data = [];
            foreach ($rows as $r) {
                $data[$r['store_key']] = json_decode($r['json_content'], true);
            }
            echo json_encode([
                'status' => 'success',
                'data' => $data
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'sync_all':
        try {
            if (!$input || !is_array($input)) {
                throw new Exception('Invalid payload. JSON object with store collections expected.');
            }

            $stmt = $pdo->prepare("INSERT INTO app_data_store (store_key, json_content) VALUES (:key, :content) 
                                   ON DUPLICATE KEY UPDATE json_content = VALUES(json_content)");

            foreach ($input as $key => $value) {
                $stmt->execute([
                    ':key' => $key,
                    ':content' => json_encode($value, JSON_UNESCAPED_UNICODE)
                ]);
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'All application state successfully synced to MySQL hosting database!',
                'synced_keys' => array_keys($input),
                'timestamp' => date('c')
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'save_collection':
        try {
            $key = isset($_GET['key']) ? $_GET['key'] : (isset($input['key']) ? $input['key'] : null);
            $content = isset($input['content']) ? $input['content'] : $input;

            if (!$key) {
                throw new Exception('Missing store key.');
            }

            $stmt = $pdo->prepare("INSERT INTO app_data_store (store_key, json_content) VALUES (:key, :content) 
                                   ON DUPLICATE KEY UPDATE json_content = VALUES(json_content)");
            $stmt->execute([
                ':key' => $key,
                ':content' => json_encode($content, JSON_UNESCAPED_UNICODE)
            ]);

            echo json_encode([
                'status' => 'success',
                'message' => "Collection '{$key}' saved successfully.",
                'key' => $key
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Unknown API action specified.']);
        break;
}
