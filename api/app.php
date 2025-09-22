<?php
include "db.php";

$action = $_POST['action'] ?? '';

if($action === 'signin'){
    $login = $_POST['email'] ?? '';

    $password = $_POST['password'] ?? '';

    $stmt = $conn->prepare("SELECT * FROM users WHERE EmailAddress = ? OR Username = ?");
    if(!$stmt){ echo json_encode(["status"=>"failed","message"=>"Database error"]); exit; }

    $stmt->bind_param("ss", $login, $login);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows === 0){
        echo json_encode(["status"=>"failed","message"=>"User not found"]); exit;
    }

    $user = $result->fetch_assoc();
    if($user['Password'] === $password){
        echo json_encode([
            "status"=>"success",
            "message"=>"Login successful",
            "id"=>$user['userid'],
            "username"=>$user['Username']
        ]);
    } else {
        echo json_encode(["status"=>"failed","message"=>"Incorrect password"]);
    }
}

else if($action === 'getinfo'){
    $userid = $_POST['userid'] ?? 0;
    if(!$userid){ echo json_encode(["status"=>"failed","message"=>"User ID missing"]); exit; }

    $stmt = $conn->prepare("SELECT Balance, Income, Expense FROM user_info WHERE user_id = ?");
    if(!$stmt){ echo json_encode(["status"=>"failed","message"=>"Database error"]); exit; }

    $stmt->bind_param("i", $userid);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows === 0){
        echo json_encode(["status"=>"failed","message"=>"User info not found"]); exit;
    }

    $user = $result->fetch_assoc();
    echo json_encode([
        "status"=>"success",
        "Balance"=>floatval($user['Balance']),
        "Income"=>floatval($user['Income']),
        "Expense"=>floatval($user['Expense'])
    ]);
}

// Add transaction
else if($action === 'addtransaction'){
    $userid = $_POST['userid'] ?? 0;
    $type = $_POST['type'] ?? '';
    $amount = $_POST['amount'] ?? 0;
    $description = $_POST['description'] ?? '';

    if(!$userid || !$type || !$amount){ echo json_encode(["status"=>"failed","message"=>"Missing fields"]); exit; }

    $stmt = $conn->prepare("INSERT INTO transactions (user_id, Type, Amount, Description) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isds", $userid, $type, $amount, $description);
    if($stmt->execute()){
        if($type === 'income'){
            $conn->query("UPDATE user_info SET Income = Income + $amount, Balance = Balance + $amount WHERE user_id = $userid");
        } else if($type === 'expense'){
            $conn->query("UPDATE user_info SET Expense = Expense + $amount, Balance = Balance - $amount WHERE user_id = $userid");
        }
        echo json_encode(["status"=>"success","message"=>"Transaction added"]);
    } else {
        echo json_encode(["status"=>"failed","message"=>"Database error"]);
    }
}

// Get recent transactions
else if($action === 'gettransactions'){
    $userid = $_POST['userid'] ?? 0;
    if(!$userid){ echo json_encode(["status"=>"failed","message"=>"User ID missing"]); exit; }

    $stmt = $conn->prepare("SELECT id, Type, Amount, Description, Created_at FROM transactions WHERE user_id = ? ORDER BY Created_at DESC LIMIT 10");
    $stmt->bind_param("i", $userid);
    $stmt->execute();
    $result = $stmt->get_result();

    $transactions = [];
    while($row = $result->fetch_assoc()) $transactions[] = $row;

    echo json_encode(["status"=>"success","transactions"=>$transactions]);
}
?>
