document.addEventListener("DOMContentLoaded", function(){

    const buscador = document.getElementById("buscar");
    const productos = document.querySelectorAll(".producto");

    // BUSCADOR
    buscador.addEventListener("keyup", function(){
        let texto = buscador.value.toLowerCase();

        productos.forEach(prod => {
            let contenido = prod.textContent.toLowerCase();
            prod.style.display = contenido.includes(texto) ? "" : "none";
        });
    });

    // FILTRO
    window.filtrar = function(categoria){
        productos.forEach(prod => {
            if(categoria === "todos"){
                prod.style.display = "";
            } else {
                prod.style.display =
                prod.classList.contains(categoria) ? "" : "none";
            }
        });
    }

    // 🔍 ZOOM (CORREGIDO)
    const visor = document.getElementById("visor");
    const imagenGrande = document.getElementById("imagen-grande");

    document.querySelectorAll(".producto img").forEach(img => {
        img.addEventListener("click", function(){
            visor.style.display = "flex";
            imagenGrande.src = this.getAttribute("src"); // 👈 CLAVE
        });
    });

    // CERRAR
    const cerrar = document.querySelector(".cerrar");

    if(cerrar){
        cerrar.addEventListener("click", function(){
            visor.style.display = "none";
        });
    }

});
  