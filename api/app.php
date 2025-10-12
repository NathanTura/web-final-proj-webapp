<?php

include "db.php";

$login = $_POST['login'] ?? '';
$password = $_POST['password'] ?? '';
$action = $_POST['action'] ?? '';

if ($action == 'signin'){

    if (empty($login)) {
        echo json_encode([
            "status" => "failed",
            "message" => "Email or Username is required"
        ]);
        exit;
    }
    if (empty($password)){
        echo json_encode([
            "status" => "failed",
            "message" => "Password is required"
        ]);
        exit;
    }
    $stmt = $conn->prepare("select * from users where EmailAddress = ? or Username = ?");

    if (!$stmt) {
        echo json_encode([
            "status" => "failed",
            "message" => "Database error: " . $conn->error
        ]);
        exit;
    }

    $stmt->bind_param("ss", $login, $login);

    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            "status" => "failed",
            "message" => "User not found"
        ]);
        exit;
    }


    $user = $result->fetch_assoc();

    if ($user['Password'] === $password) {
        echo json_encode([
            "status" => "success",
            "message" => "Login successful",
            "id" => $user['Userid'],
            "username" => $user['Username'], 
        ]);
    } else {
        echo json_encode([
            "status" => "failed",
            "message" => "Incorrect password"
        ]);
    }
}

else if ($action == 'account-display'){
    
    $userid = $_POST["userid"] ?? '';

    if (empty($userid)) {
        echo json_encode([
            "status" => "failed",
            "message" => "User id not set",
            "email" => "Notfound@example.com",
            "username" => "a username",
            "password" => "a password"
        ]);
        exit;
    }

    $stmt = $conn->prepare("SELECT * FROM users WHERE Userid = ?");
    $stmt->bind_param("s", $userid);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            "status" => "failed",
            "message" => "User id not found",
            "email" => "Notfound@example.com",
            "username" => "a username",
            "password" => "a password"
        ]);
        exit;
    } else {
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }

        echo json_encode([
            "status" => "success",
            "message" => "User found",
            "data" => $data
        ]);
    }
}

else if($action == 'signup'){    
    $EmailAddress = $_POST['Email'] ?? '';
    $Username = $_POST['Uname'] ?? '';
    $Password = $_POST['password'] ?? '';
    $Cpassword = $_POST['confirmpassword'] ?? '';

    if (empty($EmailAddress) || empty($Password) || empty($Cpassword) || empty($Username)) {
        echo json_encode([
            "status" => "error",
            "message" => "All fields are required."
        ]);
        exit;
    }

    if ($Password !== $Cpassword) {
        echo json_encode([
            "status" => "error",
            "message" => "Passwords do not match."
        ]);
        exit;
    }

    $stmt = $conn->prepare("SELECT * FROM users WHERE EmailAddress = ?");
    $stmt->bind_param("s", $EmailAddress);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
    
        $stmt = $conn->prepare("INSERT INTO users (EmailAddress, Username ,  Password, Cpassword) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $EmailAddress, $Username, $Password, $Cpassword);

        if ($stmt->execute()) {
    
            $newUserId = $conn->insert_id;

            echo json_encode([
                "status" => "success",
                "message" => "User created",
                "id" => $newUserId,
                "username" => $Username
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Couldn't create account: " . $stmt->error
            ]);
        }
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "User already exists"
        ]);
    }
}

else if($action == 'help'){ 
    $userid = $_POST['Userid'] ?? '';
    $message = $_POST['Message'] ?? '';

    if (empty($userid) || empty($message)) {
        echo json_encode([
            "status" => "error",
            "message" => "Message must be included."
        ]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO help (Userid , Message) VALUES (?, ?)");
    $stmt->bind_param("ss", $userid, $message);

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Message sent!",
        ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Couldn't send message!" . $stmt->error
            ]);
        }
    } 

?>
