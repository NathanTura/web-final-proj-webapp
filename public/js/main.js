document.addEventListener('DOMContentLoaded', () => {
    const pathParts = window.location.pathname.split("/").filter(p => p);
    const hostname = pathParts.pop();
    if(hostname.includes('signin')) signin();
    else if(hostname.includes('index')) {
        getuserinfo();
        loadTransactions();
        document.getElementById('addTransaction').addEventListener('click', openTransactionPopup);
    }
});

function getuserinfo() {
    const userId = localStorage.getItem('userId');
    if(!userId) return;

    let form = new FormData();
    form.append('action','getinfo');
    form.append('userid', userId);

    fetch('../api/app.php', { method:'POST', body:form })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success'){
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
    form.append('action','gettransactions');
    form.append('userid', localStorage.getItem('userId'));

    fetch('../api/app.php', { method:'POST', body:form })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success'){
            if(!data.transactions || data.transactions.length === 0){
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
}function renderPieChart(transactions) {
    const ctxCanvas = document.getElementById('incomeExpenseChart');
    if (!ctxCanvas) return;

    const ctx = ctxCanvas.getContext('2d');

    const incomeTx = transactions.filter(tx => tx.Type === 'income');
    const expenseTx = transactions.filter(tx => tx.Type === 'expense');

    const labels = [...incomeTx.map(tx => tx.Description || 'No description'),
                    ...expenseTx.map(tx => tx.Description || 'No description')];
    const data = [...incomeTx.map(tx => parseFloat(tx.Amount)),
                  ...expenseTx.map(tx => parseFloat(tx.Amount))];
    const backgroundColor = [
        ...incomeTx.map(_ => 'rgba(54, 162, 235, 0.7)'),
        ...expenseTx.map(_ => 'rgba(255, 99, 132, 0.7)')
    ];
    const borderColor = [
        ...incomeTx.map(_ => 'rgba(54, 162, 235, 1)'),
        ...expenseTx.map(_ => 'rgba(255, 99, 132, 1)')
    ];

    // Destroy previous chart if it exists and is a Chart instance
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
                        label: function(context) {
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
