// referencia HTML
const user_options = document.querySelectorAll(".user")
const vista_perfil = document.querySelector(".vista_perfil-cliente");
console.log(user_options);
const vista_mis_mascotas = document.querySelector(".vista_mis-mascotas");
const btn_vistaMascotas = document.querySelector(".btn_ver-mascotas");
const btn_vistaPerfil = document.querySelector(".cont_btn-profile a");
const btns_menu = document.querySelectorAll(".content-menu .btn");
console.log(btns_menu);
/*
// Manejamos el color de los botones al hacer click
user_options.forEach((option, indice) =>{
    option.addEventListener("click", ()=>{
        user_options.forEach((tarjeta) => {
            tarjeta.classList.remove("active");
        })
        option.classList.add("active");
        console.log("presioando exitosamente..");
    })
});
*/


// MOSTRAR BOTON SELECCIONADO
function activarBoton(opcion_selecionada){
    btn_vistaMascotas.classList.remove("active");
    btn_vistaPerfil.classList.remove("active");
    opcion_selecionada.classList.add("active");
}

// Mostrar la vista de Mis Mascotas
function mostrarVista(nombreVista){
    vista_perfil.hidden = nombreVista !== "perfil";
    vista_mis_mascotas.hidden = nombreVista !== "mascotas";
} 

btn_vistaMascotas.addEventListener("click", ()=>{
    mostrarVista("mascotas");
    activarBoton(btn_vistaMascotas);
})

// Mostrar la vista del perfil
btn_vistaPerfil.addEventListener("click", (event)=>{
    event.preventDefault();
    mostrarVista("perfil");
    activarBoton(btn_vistaPerfil)
})


// MANTENER PRECIONADO BOTON DEL MENÚ
btns_menu.forEach((btn) => {
    btn.addEventListener("click", ()=>{
        btns_menu.forEach((otrobtn) => {
            otrobtn.classList.remove("active");
        })
        btn.classList.add("active");
        console.log(btn.className);
    });
});

















