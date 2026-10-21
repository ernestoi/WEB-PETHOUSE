// REFERENCIAR EL HTML
const btn_question = document.querySelectorAll(".faq_question");
const faq_question_div = document.querySelectorAll(".faq_answer");

//lógica evento click
btn_question.forEach((btn, indice) => {
    btn.addEventListener("click", ()=>{
        const abierto = btn.classList.toggle("is-open");
        faq_question_div[indice].classList.toggle("visibles", abierto);
        console.log("boton precionado");
    });
});
