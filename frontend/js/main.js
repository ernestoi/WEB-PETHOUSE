// REFERENCIAR EL HTML
const btn_menu = document.querySelector(".menu_hamburguesa");
const header_div = document.querySelector(".content-header");

btn_menu.addEventListener('click', ()=>{
    console.log("menu abierto");
    const abierto = btn_menu.classList.toggle("activo");
    header_div.classList.toggle("open_menu", abierto);
    
})