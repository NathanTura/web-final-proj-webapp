window.addEventListener('resize', () => {
    if (window.innerWidth <= 769) {

            var sidemenu = document.getElementById('sidepanel')

          setTimeout(() => {
            var mobilemenu = document.getElementById('mobilepanel')
            var sidemenu = document.getElementById('sidepanel')

            mobilemenu.style.transform = 'translateY(0)';
            sidemenu.style.transform = 'translateX(-100%)';
        }, 3);
    }
    else{
            setTimeout(() => {
            var mobilemenu = document.getElementById('mobilepanel')
            var sidemenu = document.getElementById('sidepanel')
            mobilemenu.style.transform = 'translateY(200%)';
            sidemenu.style.transform = 'translateX(0)';
           
        }, 3);
    }
});
