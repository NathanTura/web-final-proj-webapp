



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
