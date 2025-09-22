function createpopup(status, message) {
    const existing = document.getElementById('popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'popup';
    popup.className = 'popup';
    popup.style.color = 'white';
    popup.style.backgroundColor = '#0f172a';
    popup.style.borderColor = status.toLowerCase().includes('success') ? 'green' : 'red';
    popup.innerHTML = `<h3>${status}</h3><p>${message}</p>`;

    document.body.appendChild(popup);


    setTimeout(() => {
        
        popup.style.right = "10px";
    }, 50);

  
    setTimeout(() => {
        popup.style.right = "-300px";
        setTimeout(() => popup.remove(), 500);
    }, 3000);
}
