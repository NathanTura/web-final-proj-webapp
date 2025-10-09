
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
    }
});
function logout(){
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
function signin() {
    const form = document.getElementById('userform');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email) {
            createpopup('Error', 'Enter email or username');
            return;
        }
        if (!password) {
            createpopup('Error', 'Enter password');
            return;
        }
        let formData = new FormData();
        formData.append('action', 'signin');
        formData.append('email', email);
        formData.append('password', password);

        try {
            const response = await fetch('../api/app.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.status === 'success') {
                localStorage.setItem('userId', data.id);
                localStorage.setItem('username', data.username);


                createpopup(data.status, data.message);
                setTimeout(() => {
                    window.location.href = 'http://localhost:8000/public/dashboard.html';
                }, 2000);
            } else {
                createpopup(data.message, data.message);
            }
        } catch (err) {
            console.error(err);
            createpopup('Error', 'An error occurred while signing in.');
        }
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
    const recentsDiv = document.querySelector('.recents');
    recentsDiv.innerHTML = '<p>Loading...</p>';

    let form = new FormData();
    form.append('action', 'gettransactions');
    form.append('userid', localStorage.getItem('userId'));

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
        type: 'pie',
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
