var dashboard, Reminders, Goals, transactions, leaderboards;
var currentpanel;
document.addEventListener('DOMContentLoaded', () => {

    
    dashboard = document.getElementById('dashboard')
    Reminders = document.getElementById('Reminders')
    transactions = document.getElementById('transactions')
    Goals = document.getElementById('Goals')
    leaderboards = document.getElementById('leaderboards')
    hideAll();
})

function hideAll() {
    dashboard.style.display = 'flex'
    Reminders.style.display = 'none'
    leaderboards.style.display = 'none'
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
            leaderboards.style.display = 'none';
            Goals.style.display = 'none';
            currentpanel = "dashboard";
            // main(currentpanel)
        } else if (index === 1) {
            dashboard.style.display = 'none';
            Reminders.style.display = 'flex';
            leaderboards.style.display = 'none';
            Goals.style.display = 'none';
            currentpanel = "Reminders";
            loadReminders();
            // main(currentpanel)
        }
        else if (index === 3) {
            dashboard.style.display = 'none';
            Reminders.style.display = 'none';
            leaderboards.style.display = 'none';
            Goals.style.display = 'block';
            currentpanel = "My Goals";
            // main(currentpanel)
        }
        else if (index === 4) {
            dashboard.style.display = 'none';
            Reminders.style.display = 'none';
            leaderboards.style.display = 'block';
            Goals.style.display = 'none';
            currentpanel = "leaderboards";
            // main(currentpanel)
        }
    });
});

function switchpanel(text) {
    if (text === "Dashboard") {
        dashboard.style.display = 'flex';
        Reminders.style.display = 'none';
        leaderboards.style.display = 'none';
        Goals.style.display = 'none';
        currentpanel = "dashboard";
        // main(currentpanel)
    } else if (text === "Reminders") {
        dashboard.style.display = 'none';
        Reminders.style.display = 'flex';
        leaderboards.style.display = 'none';
        Goals.style.display = 'none';
        currentpanel = "Reminders";
        // main(currentpanel)
    }
    else if (text === "My Goals") {
        dashboard.style.display = 'none';
        Reminders.style.display = 'none';
        leaderboards.style.display = 'none';
        Goals.style.display = 'block';
        currentpanel = "My Goals";
        // main(currentpanel)
    }
    else if (text === "Leaderboard") {
        dashboard.style.display = 'none';
        Reminders.style.display = 'none';
        leaderboards.style.display = 'block';
        Goals.style.display = 'none';
        currentpanel = "Leaderboard";
        // main(currentpanel)
    }
}
