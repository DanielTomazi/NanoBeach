<?php
$hostname = "db4free.net";
$username = "basedgoddaniels";
$password = "1234567890";
$database = "basedgoddaniels";

ini_set('display_errors', 0);
error_reporting(E_ALL);

$conn = new mysqli($hostname, $username, $password, $database);

$conn->set_charset("utf8");

if ($conn->connect_errno) {
    error_log("Erro de conexão MySQL: " . $conn->connect_error);
    die("Erro interno do servidor. Tente novamente mais tarde.");
}

function sanitizeInput($data) {
    global $conn;
    return mysqli_real_escape_string($conn, trim(htmlspecialchars($data)));
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validateDate($date, $format = 'Y-m-d') {
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

function validatePhone($phone) {
    $phone = preg_replace('/\D/', '', $phone);
    return strlen($phone) >= 10 && strlen($phone) <= 11;
}
?>
