document.addEventListener('DOMContentLoaded', () => {
  
    const link_ = document.getElementById('signup');
    const signuphtml = link_.innerHTML;

    const userid = window.localStorage.getItem('userId');
    const username = window.localStorage.getItem('username');

    if (userid && username && link_) {
        link_.style.display = 'flex';
        link_.style.alignItems = 'center';
        link_.style.gap = '0.5rem';
        link_.style.flexWrap = 'nowrap';
        link_.style.whiteSpace = 'nowrap';
        link_.style.minWidth = 'fit-content';

        link_.innerHTML = `
            <img id="profileImg" src="assets/profile_pic2.png" alt="profile">
            <p>Welcome ${username}</p>
        `;

        const profileImg = document.getElementById('profileImg');

        profileImg.addEventListener('mouseenter', () => {
            profileImg.src = 'assets/profile_pic.png';
        });
        profileImg.addEventListener('mouseleave', () => {
            profileImg.src = 'assets/profile_pic2.png';
        });

        profileImg.addEventListener('click', profile_display);
    } else {
        link_.innerHTML = signuphtml;
    }
});

function profile_display(e) {
    e.stopPropagation();


    const existing = document.getElementById('profileDropdown');
    if (existing) existing.remove();

    const dropdown = document.createElement('div');
    dropdown.id = 'profileDropdown';
    dropdown.innerHTML = `
        <a href="account.html">Account</a>
        <a href="#" id="logoutBtn">Logout</a>
    `;

    dropdown.style.left = (e.clientX + 10) + 'px';
    dropdown.style.top = (e.clientY + 10) + 'px';

    document.body.appendChild(dropdown);

    dropdown.classList.add('show')

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        window.location.reload();
    });

    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
        setTimeout(() => dropdown.remove(), 300); 
    }, { once: true });
}


const myInterval = setInterval(loadimages, 300);
let count = 0;

const images = document.querySelectorAll('.image-group > img');

function loadimages() {
    if (count === 0) {
        const slogan = document.getElementById('slogan');
        slogan.style.transform = 'translateY(0px)';
        slogan.style.opacity = '1';
        images[2].style.opacity = '1'; // laptop
        images[2].style.top = '60%';
    } 
    else if (count === 1) {
        images[0].style.opacity = '1'; // phone 1
        images[0].style.left = '0';
    } 
    else if (count === 2) {
        images[1].style.opacity = '1'; // phone 2
        images[1].style.left = '50%';
        clearInterval(myInterval); 
    }

    count++;
}

const article = document.getElementById('article')
const setup_guide = document.getElementById('setup-guide')
const main = document.getElementById('main')

setTimeout(() => {
    article.style.transform = 'translateY(0)';
    setup_guide.style.transform = 'translateY(0)';
}, 1500);


const handleScroll = () => {
  if (window.scrollY > 50) {
 
    main.style.transform = 'translateY(-100vh)';
    article.style.transform = 'translateY(-40vh)';
    setup_guide.style.transform = 'translateY(-40vh)';
  } else {
   
    main.style.transform = 'translateY(0)';
    article.style.transform = 'translateY(0)';
    setup_guide.style.transform = 'translateY(0)';
  }
};


// Video controller 
document.querySelectorAll('.Create-container').forEach(container => {
    const video = container.querySelector('video');

    container.addEventListener('mouseenter', () => {
      video.currentTime = 0;   
      video.play();            
    });
  });

  document.querySelectorAll('.Automate-container').forEach(container => {
    const video = container.querySelector('video');

    container.addEventListener('mouseenter', () => {
      video.currentTime = 0;   
      video.play();            
    });
  });

  document.querySelectorAll('.Manage-Container').forEach(container => {
    const video = container.querySelector('video');

    container.addEventListener('mouseenter', () => {
      video.currentTime = 0;   
      video.play();            
    });
  });

