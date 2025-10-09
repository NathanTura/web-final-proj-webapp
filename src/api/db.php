<?php
// Database Connection File
// How to use: Include in PHP files needing DB access.
// When to use: For any DB operations to centralize config.
// Alternatives: PDO for better security; ORM like Eloquent in Laravel.

$servername = "localhost";
$username = "root";
$password = "";  // Default empty in XAMPP
$dbname = "ledgerpro";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Note: In production, use environment variables for credentials. Use prepared statements to prevent SQL injection.
?>