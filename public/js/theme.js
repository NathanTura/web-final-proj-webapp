const modeSlider = document.getElementById('modeSlider');
const sliderCircle = document.getElementById('sliderCircle');

const divs = document.querySelectorAll('.p1-h, .p2-h, .l-h');

modeSlider.onclick = () => {
    const currentTheme = document.body.getAttribute('data-theme');
    if (currentTheme === 'light') {
        document.body.setAttribute('data-theme', 'dark');
        sliderCircle.style.transform = 'translateX(26px)';

        divs.forEach(div => {
        div.style.background_color = 'black'; 
        });
       
    } else {
        document.body.setAttribute('data-theme', 'light');
        sliderCircle.style.transform = 'translateX(0px)';
      
    }
};
