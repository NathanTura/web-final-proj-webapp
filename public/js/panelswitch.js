var dashboard, transactios;

document.addEventListener('DOMContentLoaded', () => {
    dashboard = document.getElementById('dashboard')
    transactios = document.getElementById('transactions')
    hideAll();
})

function hideAll() {
    dashboard.style.display = 'flex'
    transactios.style.display = 'none'
}

document.querySelectorAll('.sidepanel ul li').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.sidepanel ul li').forEach(li => li.classList.remove('active'));
        item.classList.add('active');

        switchpanel(item.textContent.trim());
    });
});


const mobileItems = document.querySelectorAll('.mobilepanel ul li');

mobileItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        mobileItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        if(index === 0){
            dashboard.style.display = 'flex';
            transactios.style.display = 'none';
        } else if(index === 1){
            dashboard.style.display = 'none';
            transactios.style.display = 'flex';
        }
    });
});

function switchpanel(text) {
    if(text === "Dashboard") {
        dashboard.style.display = 'flex';
        transactios.style.display = 'none';
    } else if(text === "Transactions") {
        dashboard.style.display = 'none';
        transactios.style.display = 'flex';
    }
}
