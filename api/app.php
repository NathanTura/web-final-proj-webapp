<?php
include "db.php";

date_default_timezone_set('Africa/Addis_Ababa');

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
            "id"=>$user['Userid'],
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

    $stmt = $conn->prepare("SELECT transaction_id, Type, Amount, Description, Created_at FROM transactions WHERE user_id = ? ORDER BY Created_at DESC LIMIT 10");
    $stmt->bind_param("i", $userid);
    $stmt->execute();
    $result = $stmt->get_result();

    $transactions = [];
    while($row = $result->fetch_assoc()) $transactions[] = $row;

    echo json_encode(["status"=>"success","transactions"=>$transactions]);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////


else if ($action === 'getgoals') {
    $user_id = $_POST['user_id'] ?? 0;

    $stmt = $conn->prepare("SELECT * FROM goals WHERE user_id=? AND status='active' ORDER BY created_at DESC");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $today = date('Y-m-d');
    $goals = [];

    while ($row = $result->fetch_assoc()) {
        $row['can_contribute'] = ($row['last_contribution_date'] != $today);
        $goals[] = $row;
    }

    echo json_encode(["status"=>"success","goals"=>$goals]);
    exit;
}

// Get completed goals
else if ($action === 'getcompletedgoals') {
    $user_id = $_POST['user_id'] ?? 0;

    $stmt = $conn->prepare("SELECT * FROM goals WHERE user_id=? AND status='completed' ORDER BY created_at DESC");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $completed = [];
    while ($row = $result->fetch_assoc()) {
        $completed[] = $row;
    }

    echo json_encode(["status"=>"success","completedGoals"=>$completed]);
    exit;
}

else if ($action === 'addgoal') {
    $user_id = $_POST['user_id'] ?? 0;
    $goal_name = $_POST['goal_name'] ?? '';
    $target_amount = $_POST['target_amount'] ?? 0;
    $daily = $_POST['daily_contribution'] ?? 0;
    $deadline = $_POST['deadline'] ?? '';

    if (!$user_id || !$goal_name || !$target_amount || !$deadline) {
        echo json_encode(["status"=>"failed", "message"=>"Missing fields"]);
        exit;
    }

    $stmt = $conn->prepare("
        INSERT INTO goals (user_id, goal_name, target_amount, current_amount, daily_contribution, deadline, status, created_at)
        VALUES (?, ?, ?, 0, ?, ?, 'active', NOW())
    ");
    $stmt->bind_param("isdds", $user_id, $goal_name, $target_amount, $daily, $deadline);

    if ($stmt->execute()) {
        echo json_encode(["status"=>"success","message"=>"Goal added successfully!"]);
    } else {
        echo json_encode(["status"=>"failed","message"=>"Database error"]);
    }
    exit;
}

else if($action === 'contribute'){
    $user_id = $_POST['user_id'] ?? 0;
    $goal_id = $_POST['goal_id'] ?? 0;

    if(!$goal_id || !$user_id){
        echo json_encode(['status'=>'error','message'=>'Goal ID and User ID required']);
        exit;
    }

    // Get goal info
    $stmt = $conn->prepare("
        SELECT current_amount, target_amount, daily_contribution, last_contribution_date, status 
        FROM goals 
        WHERE goal_id=? AND user_id=?
    ");
    $stmt->bind_param("ii", $goal_id, $user_id);
    $stmt->execute();
    $goal = $stmt->get_result()->fetch_assoc();

    if(!$goal){
        echo json_encode(['status'=>'error','message'=>'Goal not found']);
        exit;
    }

    $today = date('Y-m-d');

    // Already completed?
    if($goal['status'] === 'completed'){
        echo json_encode(['status'=>'error','message'=>'Goal already completed']);
        exit;
    }

    // Already contributed today?
    if($goal['last_contribution_date'] === $today){
        echo json_encode(['status'=>'error','message'=>'You already contributed today! Come back tomorrow.']);
        exit;
    }

    // Add daily contribution
    $newAmount = $goal['current_amount'] + $goal['daily_contribution'];
    $newStatus = ($newAmount >= $goal['target_amount']) ? 'completed' : 'active';

    $update = $conn->prepare("
        UPDATE goals 
        SET current_amount=?, status=?, last_contribution_date=? 
        WHERE goal_id=? AND user_id=?
    ");
    $update->bind_param("dssii", $newAmount, $newStatus, $today, $goal_id, $user_id);

    if($update->execute()){
        // Award points only if completed
        if($newStatus === 'completed'){
            // Example: 1 point per birr
            $points = $goal['target_amount'];

            $stmtPoints = $conn->prepare("UPDATE users SET points = points + ? WHERE userid=?");
            $stmtPoints->bind_param("di", $points, $user_id);
            $stmtPoints->execute();
        }

        echo json_encode([
            'status'=>'success',
            'message'=>"Contributed {$goal['daily_contribution']} birr successfully!"
        ]);
    } else {
        echo json_encode(['status'=>'error','message'=>'Failed to contribute']);
    }
    exit;
}

else if($action === 'addreminder'){
    $user_id = $_POST['user_id'] ?? 0;
    $name = $_POST['name'] ?? '';
    $amount = $_POST['amount'] ?? 0;
    $remdate = $_POST['remdate'] ?? '';
    $type = $_POST['type'] ?? 'one-time';

    if(!$name || !$amount || !$remdate){
        echo json_encode(["status"=>"failed","message"=>"All fields are required"]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO reminders (user_id, name, amount, rem_date, type) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("isdss", $user_id, $name, $amount, $remdate, $type);

    if($stmt->execute()){
        echo json_encode(["status"=>"success","message"=>"Reminder added!"]);
    } else {
        echo json_encode(["status"=>"failed","message"=>"Database error"]);
    }
    exit;
}

// Get reminders
else if($action === 'getreminders'){
        $user_id = $_POST['user_id'] ?? 0;
    $stmt = $conn->prepare("SELECT * FROM reminders WHERE user_id=? ORDER BY rem_date DESC");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $reminders = [];
    while($row = $result->fetch_assoc()){
        $reminders[] = $row;
    }

    echo json_encode(["status"=>"success","reminders"=>$reminders]);
    exit;
}

// Delete reminder
else if($action === 'deletereminder'){
        $userid = $_POST['user_id'] ?? 0;
    $reminder_id = $_POST['reminder_id'] ?? 0;
    if(!$reminder_id){
        echo json_encode(["status"=>"failed","message"=>"Reminder ID required"]);
        exit;
    }
    $stmt = $conn->prepare("DELETE FROM reminders WHERE reminder_id=? AND user_id=?");
    $stmt->bind_param("ii", $reminder_id, $userid);
    if($stmt->execute()){
        echo json_encode(["status"=>"success","message"=>"Reminder deleted!"]);
    } else {
        echo json_encode(["status"=>"failed","message"=>"Failed to delete"]);
    }
    exit;
}

else if($action === 'getleaderboard'){
    // Calculate points from completed goals
        $stmt = $conn->prepare("
            SELECT 
        u.userid,
        u.Username,
        SUM(
            g.target_amount 
            / DATEDIFF(g.deadline, g.created_at)
        ) AS points
    FROM goals g
    INNER JOIN users u ON u.userid = g.user_id
    WHERE g.status = 'completed'
    GROUP BY u.userid, u.Username
    ORDER BY points DESC
    LIMIT 10;

    ");
    $stmt->execute();
    $result = $stmt->get_result();

    $leaders = [];
    while($row = $result->fetch_assoc()){
        $row['points'] = round($row['points'], 2); // Round points
        $leaders[] = $row;
    }

    echo json_encode(["status"=>"success", "leaders"=>$leaders]);
    exit;
}


?>
