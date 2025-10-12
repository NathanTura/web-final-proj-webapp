
// menu controller 

window.addEventListener("resize", () => {
    const m_list = document.getElementById('menulists')
    if (window.innerWidth > 769) {
        m_list.style.display = 'flex'
    }
    else {
        m_list.style.display = 'none'
        isshowing = false
    }
})



var isshowing = false
function showmenu() {
    const m_list = document.getElementById('menulists')
    if (!isshowing) {

        m_list.style.display = 'flex'
        isshowing = !isshowing
    }
    else {

        m_list.style.display = 'none'
        isshowing = !isshowing
    }
}

