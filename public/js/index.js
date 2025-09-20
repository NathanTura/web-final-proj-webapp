
document.addEventListener('DOMContentLoaded', () => {
    updatesideplnels();
})
window.addEventListener('resize', () => {
    updatesideplnels();
});


function updatesideplnels() {
    if (window.innerWidth <= 769) {

        setTimeout(() => {
            var mobilemenu = document.getElementById('mobilepanel')
            var sidemenu = document.getElementById('sidepanel')

            mobilemenu.style.transform = 'translateY(0)';
            sidemenu.style.transform = 'translateX(-100%)';
        }, 3);
    }
    else {
        setTimeout(() => {
            var mobilemenu = document.getElementById('mobilepanel')
            var sidemenu = document.getElementById('sidepanel')
            mobilemenu.style.transform = 'translateY(200%)';
            sidemenu.style.transform = 'translateX(0)';

        }, 3);
    }
}
function adjustPadding() {
  const panel = document.getElementById("mobilepanel");
  if (panel) {
    if (window.innerWidth < 769) {
      document.body.style.paddingBottom = (panel.offsetHeight + 150) + "px";
    } else {
      document.body.style.paddingBottom = "0px";
    }
  }
}

window.addEventListener("load", adjustPadding);
window.addEventListener("resize", adjustPadding);

const observer = new ResizeObserver(() => adjustPadding());
observer.observe(document.body);
