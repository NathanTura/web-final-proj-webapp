document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("userform");

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload

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

        fetch('../api/app.php', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    localStorage.setItem('userId', data.id);
                    localStorage.setItem('username', data.username);

                    createpopup(data.status, data.message);
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    createpopup('Error', data.message);
                }
            })
            .catch(err => console.error(err));
    });
});
