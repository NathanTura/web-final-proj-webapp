var dashboard, Reminders, Goals;

document.addEventListener('DOMContentLoaded', () => {
    dashboard = document.getElementById('dashboard')
    Reminders = document.getElementById('Reminders')
    Goals = document.getElementById('Goals')
    hideAll();
})

function hideAll() {
    dashboard.style.display = 'flex'
    Reminders.style.display = 'none'
    Goals.style.display = 'none'
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
        if (index === 0) {
            dashboard.style.display = 'flex';
            Reminders.style.display = 'none';
            Goals.style.display = 'none';
        } else if (index === 1) {
            dashboard.style.display = 'none';
            Reminders.style.display = 'flex';
            Goals.style.display = 'none';
        }
        else if (index === 3) {
            dashboard.style.display = 'none';
            Reminders.style.display = 'none';
            Goals.style.display = 'block';
        }
    });
});

function switchpanel(text) {
    if (text === "Dashboard") {
        dashboard.style.display = 'flex';
        Reminders.style.display = 'none';
        Goals.style.display = 'none';
    } else if (text === "Transactions") {
        dashboard.style.display = 'none';
        Reminders.style.display = 'flex';
        Goals.style.display = 'none';
    }
    else if (text === "My Goals") {
        dashboard.style.display = 'none';
        Reminders.style.display = 'none';
        Goals.style.display = 'block';
    }
}
