
document.addEventListener('DOMContentLoaded', () => {

    const pathParts = window.location.pathname.split("/").filter(p => p);
    const hostname = pathParts.pop();
    if (hostname.includes('signin')) {
        localStorage.clear()
        signin();
    }
    else if (hostname.includes('index')) {
        logout();
        getuserinfo();
        loadTransactions();
        document.getElementById('addTransaction').addEventListener('click', openTransactionPopup);
        document.getElementById('addbtn').addEventListener('click' , openTransactionPopup)
    }
});


function logout() {
    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();

        const existing = document.getElementById('exitpopup');
        if (existing) existing.remove();


        const popup = document.createElement('div');
        popup.id = 'exitpopup';
        popup.classList.add('popup');

        popup.innerHTML = `
            <h3>Log out</h3>
            <p>Do you want to logout?</p>
            <div class="popup-buttons">
                <button id="cancelLogoutBtn">Cancel</button>
                <button id="confirmLogoutBtn">Logout</button>
            </div>
        `;

        document.body.appendChild(popup);


        setTimeout(() => popup.style.right = '20px', 50);


        document.getElementById('cancelLogoutBtn').addEventListener('click', () => {
            popup.style.right = '-400px';
            setTimeout(() => popup.remove(), 400);
        });

        document.getElementById('confirmLogoutBtn').addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'http://localhost:8000/public/signin.html';
        });
    });
}



function getuserinfo() {
    document.getElementById('username').textContent = localStorage.getItem('username');

    console.log(localStorage.getItem('userId'))
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    let form = new FormData();
    form.append('action', 'getinfo');
    form.append('userid', userId);

    fetch('../api/app.php', { method: 'POST', body: form })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                document.getElementById('Income').textContent = data.Income + " Birr";
                document.getElementById('Expense').textContent = data.Expense + " Birr";
                document.getElementById('Balance').textContent = data.Balance + " Birr";
            }
        });
}

function loadTransactions() {
    const userId = localStorage.getItem('userId');
    const recentsDiv = document.querySelector('.recents');
    recentsDiv.innerHTML = '<p>Loading...</p>';

    let form = new FormData();
    form.append('action', 'gettransactions');
    form.append('userid', userId);

    fetch('../api/app.php', { method: 'POST', body: form })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                if (!data.transactions || data.transactions.length === 0) {
                    recentsDiv.innerHTML = '<p>No transactions yet</p>';
                    return;
                }
                renderPieChart(data.transactions);
                let html = '<h3>Recent Transactions</h3><ul style="list-style:none; padding:0;">';
                data.transactions.forEach(tx => {
                    const typeStr = tx.Type.toString();
                    html += `
                    <li class="${typeStr}" style="display:grid; grid-template-columns: 1fr 1fr 2fr 1fr; gap:10px; padding:5px 0; border-bottom:1px solid #444;">
                        <span>${tx.Created_at.split(' ')[0]}</span>
                        <span>${typeStr.charAt(0).toUpperCase() + typeStr.slice(1)}</span>
                        <span>${tx.Description || 'No description'}</span>
                        <span>${tx.Amount} Birr</span>
                    </li>
                `;
                });
                html += '</ul>';
                recentsDiv.innerHTML = html;

            } else {
                recentsDiv.innerHTML = `<p>${data.message}</p>`;
            }
        })
        .catch(err => {
            recentsDiv.innerHTML = '<p>Error loading transactions</p>';
            console.error(err);
        });
}


function renderPieChart(transactions) {
    const ctxCanvas = document.getElementById('incomeExpenseChart');
    if (!ctxCanvas) return;

    const ctx = ctxCanvas.getContext('2d');

    const labels = transactions.map(tx => tx.Description || 'No description');
    const data = transactions.map(tx => parseFloat(tx.Amount));

    // Default color palette
    const defaultColors = [
        '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099',
        '#0099C6', '#DD4477', '#66AA00', '#B82E2E', '#316395',
        '#994499', '#22AA99', '#AAAA11', '#6633CC', '#E67300',
        '#8B0707', '#329262', '#5574A6', '#3B3EAC'
    ];


    const backgroundColor = transactions.map((_, i) => defaultColors[i % defaultColors.length] + 'CC');
    const borderColor = transactions.map((_, i) => defaultColors[i % defaultColors.length]);

    if (window.incomeExpenseChart && window.incomeExpenseChart instanceof Chart) {
        window.incomeExpenseChart.destroy();
    }

    window.incomeExpenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ label: 'Income & Expense', data, backgroundColor, borderColor, borderWidth: 1 }] },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 20, padding: 15 } },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.raw || 0;
                            const total = context.chart._metasets[0].total;
                            const percentage = ((value / total) * 100).toFixed(2);
                            return `${context.label}: ${value} Birr (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

const userId = localStorage.getItem('userId');
function loadGoals() {
    let form = new FormData();
    form.append("action", "getgoals");
    form.append("user_id", userId);

    fetch('../api/app.php', { method: 'POST', body: form })
        .then(res => res.json())
        .then(data => {
            const container = document.querySelector(".current-goal-proggress");
            container.innerHTML = "";

            if (data.status !== "success" || data.goals.length === 0) {
                container.innerHTML = "<p>No active goals</p>";
                document.getElementById("activeGoals").textContent = 0;
                return;
            }

            document.getElementById("activeGoals").textContent = data.goals.length;

            data.goals.forEach(goal => {
                const percent = Math.floor((goal.current_amount / goal.target_amount) * 100);
                const isCompleted = goal.status === "completed";
                const canContribute = goal.can_contribute === true;

                const goalDiv = document.createElement("div");
                goalDiv.classList.add("Progresses");

                goalDiv.innerHTML = `
          <h4>${goal.goal_name}</h4>
          <div>
            <progress max="100" value="${percent}"></progress>
            <span>${percent}%</span><br>
            <p>Daily: ${goal.daily_contribution} birr</p>
            <input 
              type="button" 
              value="${isCompleted ? "Completed" : canContribute ? "Contribute" : "Come back tomorrow"}"
              ${!canContribute || isCompleted ? "disabled" : ""}
              onclick="contributeGoal(${goal.goal_id})"
            >
          </div>
        `;
                container.appendChild(goalDiv);
            });
        })
        .catch(err => console.error(err));
}

function loadCompletedGoals() {
    let form = new FormData();
    form.append("action", "getcompletedgoals");
    form.append("user_id", userId);

    fetch('../api/app.php', { method: 'POST', body: form })
        .then(res => res.json())
        .then(data => {
            if (data.status !== "success") return;

            const completedContainer = document.getElementById("completedGoals");
            completedContainer.textContent = data.completedGoals.length;

            // Sum points (example: points = target_amount)
            let totalPoints = 0;
            data.completedGoals.forEach(goal => {
                totalPoints += parseFloat(goal.target_amount);
            });
            document.getElementById("totalPoints").textContent = totalPoints;
        })
        .catch(err => console.error(err));
}


function generateDeadlineOptions() {
    const target = parseFloat(document.getElementById("targetamount").value);
    const container = document.getElementById("deadlineOptions");
    container.className = "container";
    container.innerHTML = "";

    if (!target || target <= 0) {
        container.innerHTML = "<p style='color:red;'>Please enter a valid amount.</p>";
        return;
    }

    const durations = [30, 60, 90, 120]; // days
    let html = `<h4>Select a Deadline Option</h4><ul>`;
    durations.forEach(days => {
        const daily = (target / days).toFixed(2);
        const today = new Date();
        today.setDate(today.getDate() + days);
        const deadlineDate = today.toISOString().split("T")[0];

        html += `
      <li>
        <input type="radio" name="deadlineOption" value="${days}" data-daily="${daily}" data-deadline="${deadlineDate}" />
        ${days} days → ${daily} birr/day (ends on ${deadlineDate})
      </li>
    `;
    });
    html += `</ul>`;
    container.innerHTML = html;
}

function submitGoal() {
    const goalName = document.getElementById("goalname").value.trim();
    const targetAmount = parseFloat(document.getElementById("targetamount").value);
    const selected = document.querySelector('input[name="deadlineOption"]:checked');

    if (!goalName || !targetAmount || !selected) {
        alert("Please fill all fields and select a deadline option!");
        return;
    }

    const daily = parseFloat(selected.dataset.daily);
    const deadlineDate = selected.dataset.deadline;

    let form = new FormData();
    form.append("action", "addgoal");
    form.append("user_id", userId);
    form.append("goal_name", goalName);
    form.append("target_amount", targetAmount);
    form.append("daily_contribution", daily);
    form.append("deadline", deadlineDate);

    fetch('../api/app.php', { method: 'POST', body: form })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.status === "success") {

                document.getElementById("goalForm").reset();
                document.getElementById("deadlineOptions").innerHTML = "";
                loadGoals();
            }
        })
        .catch(err => console.error(err));
}


function contributeGoal(goalId) {
    let form = new FormData();
    form.append("action", "contribute");
    form.append("user_id", userId);
    form.append("goal_id", goalId);

    fetch('../api/app.php', { method: 'POST', body: form })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.status === "success") loadGoals();
        })
        .catch(err => console.error(err));
}

document.addEventListener('DOMContentLoaded', () => {
    loadGoals();
    loadCompletedGoals();
    updateside();
});



function openTransactionPopup() {
    const existing = document.getElementById('transactionPopup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'transactionPopup';

    popup.innerHTML = `
        <h3>Add Transaction</h3>
        <div class="popup-field">
            <label for="tType">Type:</label>
            <select id="tType">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
            </select>
        </div>
        <div class="popup-field">
            <label for="tName">Description:</label>
            <input type="text" id="tName" placeholder="Description">
        </div>
        <div class="popup-field">
            <label for="tAmount">Amount:</label>
            <input type="number" id="tAmount" placeholder="Amount">
        </div>
        <div class="popup-buttons">
            <button id="cancelTransBtn">Cancel</button>
            <button id="addTransBtn">Add</button>
        </div>
    `;

    document.body.appendChild(popup);

    setTimeout(() => popup.style.right = '20px', 50);

    document.getElementById('cancelTransBtn').addEventListener('click', () => {
        popup.style.right = '-400px';
        setTimeout(() => popup.remove(), 400);
    });

    document.getElementById('addTransBtn').addEventListener('click', () => {
        const type = document.getElementById('tType').value;
        const name = document.getElementById('tName').value.trim();
        const amount = parseFloat(document.getElementById('tAmount').value);
        const userId = localStorage.getItem('userId');

        if (!name || isNaN(amount) || amount <= 0) {
            createpopup('Error', 'Please enter valid name and amount!');
            return;
        }


        let form = new FormData();
        form.append('action', 'addtransaction');
        form.append('userid', userId);
        form.append('type', type);
        form.append('amount', amount);
        form.append('description', name);

        fetch('../api/app.php', {
            method: 'POST',
            body: form
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    createpopup('Success', data.message);
                    getuserinfo();
                    loadTransactions();
                    popup.style.right = '-400px';
                    setTimeout(() => popup.remove(), 400);
                } else {
                    createpopup('Error', data.message);
                }
            })
            .catch(err => console.error(err));
    });

}

const addTransactionBtn = document.getElementById('addTransaction');
addTransactionBtn.addEventListener('click', openTransactionPopup);


function loadReminders() {
    let form = new FormData();
    form.append('action', 'getreminders');
    form.append('user_id', userId);

    fetch('../api/app.php', { method: 'POST', body: form })
        .then(res => res.json())
        .then(data => {
            const container = document.querySelector('.history');
            container.innerHTML = '';
            if (data.status !== 'success' || data.reminders.length === 0) {
                container.innerHTML = '<p>No reminders yet. Add some reminders!</p>';
                return;
            }

            data.reminders.forEach(rem => {
                const div = document.createElement('div');
                div.classList.add('reminder-item');
                div.innerHTML = `
        <p><strong>${rem.name}</strong> - ${rem.amount} Birr</p>
        <p>${rem.type} - ${new Date(rem.rem_date).toLocaleString()}</p>
        <button onclick="deleteReminder(${rem.reminder_id}, event)">Delete</button>
    `;
                container.appendChild(div);
            });

        })
        .catch(err => console.error(err));
}

function addReminder() {
    const name = document.getElementById('name').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const remdate = document.getElementById('remdate').value;
    const type = document.querySelector('select').value;

    if (!name || !amount || !remdate) {
        alert('Please fill all fields');
        return;
    }

    let form = new FormData();
    form.append('action', 'addreminder');
    form.append('user_id', userId);
    form.append('name', name);
    form.append('amount', amount);
    form.append('remdate', remdate);
    form.append('type', type);
    fetch('../api/app.php', { method: 'POST', body: form })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.status === 'success') {
                document.getElementById('name').value = '';
                document.getElementById('amount').value = '';
                document.getElementById('remdate').value = '';
                loadReminders();
            }
        })
        .catch(err => console.error(err));
}
function deleteReminder(id, e) {
     e.preventDefault();

    const userId = localStorage.getItem('userId');
    let form = new FormData();
    form.append('action', 'deletereminder');
    form.append('user_id', userId);
    form.append('reminder_id', id);

    fetch('../api/app.php', { method: 'POST', body: form })
        .then(res => res.json())
        .then(data => {
            createpopup(data.status, data.message)
            loadReminders();
        })
        .catch(err => console.error(err));
}


document.getElementById('setreminder').addEventListener('click', addReminder);
document.addEventListener('DOMContentLoaded', loadReminders);

function loadLeaderboard() {
    const listContainer = document.getElementById('leaderboardList');
    listContainer.innerHTML = "<li>Loading leaderboard...</li>";

    let form = new FormData();
    form.append("action", "getleaderboard");

    fetch('../api/app.php', { method: 'POST', body: form })
        .then(res => res.json())
        .then(data => {
            if (data.status !== "success" || data.leaders.length === 0) {
                listContainer.innerHTML = "<li>No users yet</li>";
                return;
            }

            listContainer.innerHTML = "";

            // Header
            const header = document.createElement('li');
            header.classList.add('leader-header');
            header.innerHTML = `
                <span class="rank">Rank</span>
                <span class="username">Username</span>
                <span class="points">Points</span>
            `;
            listContainer.appendChild(header);

            // Users
            data.leaders.forEach((user, index) => {
                const item = document.createElement('li');
                item.classList.add('leader-item');

                // Highlight top 3
                if (index === 0) item.style.backgroundColor = "#ffd70033"; // Gold
                else if (index === 1) item.style.backgroundColor = "#c0c0c033"; // Silver
                else if (index === 2) item.style.backgroundColor = "#cd7f3233"; // Bronze

                item.innerHTML = `
                    <span class="rank">${index + 1}</span>
                    <span class="username">${user.Username}</span>
                    <span class="points">${user.points} pts</span>
                `;
                listContainer.appendChild(item);
            });
        })
        .catch(err => console.error(err));
}

document.addEventListener('DOMContentLoaded', loadLeaderboard);
