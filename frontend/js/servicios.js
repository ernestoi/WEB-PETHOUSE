// referenciar el html
const btn_detalle = document.querySelectorAll(".btn-details");
const div_model = document.querySelectorAll(".model_container");
const btn_close = document.querySelectorAll(".btn_close button");
console.log(btn_close);
//console.log(btn_detalle, div_model);

// LóGICA
btn_detalle.forEach((btn, indice) =>{
    btn.addEventListener("click", ()=> {
        /* ESTUDIAR ESTOS TEMAS
        const tarjeta = btn.closest(".tarjeta-servicio");
        const contenedor_principal = tarjeta.parentElement;
        const modal = contenedor_principal.querySelector(".model_container");
        console.log(modal);
        */
        div_model[indice].classList.add("active");  
    })
})

btn_close.forEach((btn_closes) => {
    console.log(btn_closes);
    btn_closes.addEventListener("click", () => {
        const modal = btn_closes.closest(".model_container");
        
        console.log(modal);
        modal.classList.remove("active");
    });
});
