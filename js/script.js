document.addEventListener("DOMContentLoaded", function() {

    const buscador = document.getElementById("buscar");
    const productos = document.querySelectorAll(".producto");
    const visor = document.getElementById("visor");
    const imagenGrande = document.getElementById("imagen-grande");

    // --- BUSCADOR ---
    buscador.addEventListener("keyup", function() {
        let texto = buscador.value.toLowerCase();
        productos.forEach(prod => {
            let contenido = prod.textContent.toLowerCase();
            prod.style.display = contenido.includes(texto) ? "" : "none";
        });
    });

    // --- FILTRO ---
    window.filtrar = function(categoria) {
        productos.forEach(prod => {
            if (categoria === "todos") {
                prod.style.display = "";
            } else {
                prod.style.display = prod.classList.contains(categoria) ? "" : "none";
            }
        });
    }

    // --- 🔍 ZOOM (VISOR) ---
    document.querySelectorAll(".producto img").forEach(img => {
        img.addEventListener("click", function() {
            visor.style.display = "flex";
            imagenGrande.src = this.getAttribute("src");
            document.body.style.overflow = "hidden"; // Bloquea el scroll del fondo
        });
    });

    // --- FUNCIONES PARA CERRAR ---
    
    // 1. Definimos la función que busca tu botón (onclick="cerrarImagen")
    window.cerrarImagen = function() {
        visor.style.display = "none";
        document.body.style.overflow = "auto"; // Devuelve el scroll
    };

    // 2. Opcional: Cerrar también si hacen clic en el fondo negro (fuera de la foto)
    visor.addEventListener("click", function(e) {
        if (e.target === visor) {
            cerrarImagen();
        }
    });

    // 3. Opcional: Cerrar con la tecla Escape
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") cerrarImagen();
    });

});