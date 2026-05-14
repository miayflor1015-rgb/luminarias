document.addEventListener("DOMContentLoaded", function() {

    // --- VARIABLES ---
    const loginModal = document.getElementById("login-modal");
    const loginForm = document.getElementById("login-form");
    const buscador = document.getElementById("buscar");
    const productos = document.querySelectorAll(".producto");
    const visor = document.getElementById("visor");
    const imagenGrande = document.getElementById("imagen-grande");

    // --- LÓGICA LOGIN ---
    if (loginModal) {
        loginModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            const u = document.getElementById("user").value;
            const p = document.getElementById("pass").value;

            if (u === "admin" && p === "1234") {
                loginModal.style.display = "none";
                document.body.style.overflow = "auto"; 
            } else {
                alert("Usuario o contraseña incorrectos.");
            }
        };
    }

    // --- BUSCADOR ---
    if (buscador) {
        buscador.addEventListener("keyup", function() {
            let texto = buscador.value.toLowerCase();
            productos.forEach(prod => {
                let contenido = prod.textContent.toLowerCase();
                prod.style.display = contenido.includes(texto) ? "" : "none";
            });
        });
    }

    // --- FILTRO CATEGORÍAS ---
    window.filtrar = function(categoria) {
        productos.forEach(prod => {
            prod.style.display = (categoria === "todos" || prod.classList.contains(categoria)) ? "" : "none";
        });
    };

    // --- VISOR DE IMÁGENES ---
    document.addEventListener("click", function(e) {
        if (e.target.closest(".producto img")) {
            if(visor && imagenGrande) {
                visor.style.display = "flex";
                imagenGrande.src = e.target.src;
                document.body.style.overflow = "hidden";
            }
        }
    });

    window.cerrarImagen = function() {
        if (visor) {
            visor.style.display = "none";
            document.body.style.overflow = "auto";
        }
    };

    // Cerrar visor con clic fuera o Escape
    window.addEventListener("click", function(e) {
        if (e.target === visor) cerrarImagen();
    });

    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") cerrarImagen();
    });

    // --- BOTÓN SUBIR ---
    const btnSubir = document.getElementById("btn-subir");
    if (btnSubir) {
        window.onscroll = function() {
            btnSubir.style.display = (window.scrollY > 300) ? "block" : "none";
        };
        btnSubir.onclick = function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }

    // --- INYECCIÓN AUTOMÁTICA DE BOTONES ---
    const todosLosProductos = document.querySelectorAll(".producto");
    todosLosProductos.forEach(prod => {
        const etiquetasP = prod.querySelectorAll("p");
        // Extrae el precio limpiando el texto "Bs."
        const textoPrecio = etiquetasP[1] ? etiquetasP[1].innerText.replace(/[^\d.]/g, "") : "0";

        const htmlCotizador = `
            <div class="cotizador-box" style="margin-top: 10px; padding: 10px; border-top: 1px solid #444;">
                <label style="font-size: 12px; display: block; color: #888;">Cajas a vender:</label>
                <input type="number" class="input-cajas" value="0" min="0" style="width: 100%; margin-bottom: 5px; padding: 5px;">
                <span class="monto" style="display:none;">${textoPrecio}</span>
                <p class="subtotal-item" style="font-size: 13px; font-weight: bold; margin: 5px 0; color: #888;">
                    Subtotal: Bs. <span>0.00</span>
                </p>
                <button class="btn-agregar" onclick="agregarALista(this)" 
                        style="background: #7ED957; border: none; color: #000; width: 100%; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                    + Añadir a Cotización
                </button>
            </div>
        `;
        prod.insertAdjacentHTML('beforeend', htmlCotizador);
    });

}); // Fin DOMContentLoaded

// --- LÓGICA DEL CARRITO (FUERA DE DOMCONTENTLOADED) ---
let carritoCotizacion = [];

// Cálculo de subtotal en tiempo real
document.addEventListener("input", function(e) {
    if (e.target.classList.contains("input-cajas")) {
        const tarjeta = e.target.closest(".producto");
        const precio = parseFloat(tarjeta.querySelector(".monto").innerText);
        const unidadesPorCaja = parseInt(tarjeta.getAttribute("data-por-caja")) || 1;
        const cantidadCajas = parseInt(e.target.value) || 0;

        const subtotal = (precio * unidadesPorCaja) * cantidadCajas;
        tarjeta.querySelector(".subtotal-item span").innerText = subtotal.toFixed(2);
    }
});

function agregarALista(boton) {
    const tarjeta = boton.closest(".producto");
    const etiquetasP = tarjeta.querySelectorAll("p");
    
    // Extraemos el código único (usualmente el primer <p>)
    const codigo = etiquetasP[0] ? etiquetasP[0].innerText.replace("Código: ", "").trim() : "Sin Código";
    
    const inputCajas = tarjeta.querySelector(".input-cajas");
    const cajasNuevas = parseInt(inputCajas.value) || 0;
    const unidadesPorCaja = parseInt(tarjeta.getAttribute("data-por-caja")) || 1;
    const precioUnitario = parseFloat(tarjeta.querySelector(".monto").innerText);

    if (cajasNuevas <= 0) return alert("Ingresa una cantidad válida de cajas.");

    // --- VERIFICACIÓN DE DUPLICADOS ---
    let productoExistente = carritoCotizacion.find(item => item.nombre === codigo);

    if (productoExistente) {
        // Si ya existe, incrementamos sus valores en el array
        productoExistente.cajas += cajasNuevas;
        productoExistente.cantidadTotal = productoExistente.cajas * unidadesPorCaja;
        productoExistente.subtotal = productoExistente.cajas * (precioUnitario * unidadesPorCaja);
    } else {
        // Si no existe, lo añadimos como nuevo objeto al array
        const subtotalCalculado = (precioUnitario * unidadesPorCaja) * cajasNuevas;
        carritoCotizacion.push({ 
            nombre: codigo, 
            cajas: cajasNuevas, 
            unidadesPorCaja, 
            cantidadTotal: cajasNuevas * unidadesPorCaja, 
            subtotal: subtotalCalculado 
        });
    }
    
    // Actualizamos la interfaz del panel lateral
    actualizarResumen();

    // Limpiamos los campos visuales de la tarjeta del producto
    inputCajas.value = 0;
    tarjeta.querySelector(".subtotal-item span").innerText = "0.00";

    // Aseguramos que el panel sea visible y el botón de minimizar muestre "−"
    const panel = document.getElementById("panel-cotizacion");
    panel.classList.add("visible");
    panel.classList.remove("minimizado");
    document.getElementById("btn-minimizar").innerHTML = "−";
    document.getElementById('panel-cotizacion').classList.add('activo');
}
function actualizarResumen() {
    const listaHTML = document.getElementById("lista-articulos");
    const totalHTML = document.getElementById("gran-total");
    const contador = document.getElementById("contador-items");
    
    if (!listaHTML) return;
    listaHTML.innerHTML = "";
    let sumaTotal = 0;

    if (carritoCotizacion.length === 0) {
        listaHTML.innerHTML = `<p style="text-align:center; color:#888; padding:20px;">No hay productos en la lista</p>`;
    }

    carritoCotizacion.forEach((item, index) => {
        sumaTotal += item.subtotal;

        // Calculamos el precio unitario para mostrarlo (subtotal / unidades totales)
        const precioUnitario = item.subtotal / item.cantidadTotal;

        listaHTML.innerHTML += `
            <div style="border-bottom: 1px solid #333; padding: 10px 0; position: relative;">
                <p style="margin:0; font-size:14px; padding-right: 25px;"><strong>${item.nombre}</strong></p>
                <p style="margin:0; font-size:12px; color: #bbb;">
                    ${item.cajas} cajas (${item.cantidadTotal} unid.)
                </p>
                <p style="margin:2px 0 0 0; font-size:13px; color: #7ED957;">
                    ${item.cantidadTotal} unid. × Bs. ${precioUnitario.toFixed(2)} = <strong>Bs. ${item.subtotal.toFixed(2)}</strong>
                </p>
                <button onclick="quitarDelCarrito(${index})" 
                        style="position:absolute; top:10px; right:0; background:none; border:none; color:#ff4d4d; cursor:pointer; font-weight:bold; font-size:16px;">
                    ×
                </button>
            </div>
        `;
    });
    
    // No olvides actualizar los totales abajo si tu función sigue
    if(totalHTML) totalHTML.innerText = `Bs. ${sumaTotal.toFixed(2)}`;
    if(contador) contador.innerText = carritoCotizacion.length;
}

function quitarDelCarrito(index) {
    carritoCotizacion.splice(index, 1);
    actualizarResumen();
}

function restablecerCotizacion() {
    if (confirm("¿Deseas borrar toda la cotización?")) {
        carritoCotizacion = [];
        actualizarResumen();
    }
}

function cerrarTotalmente() {
    const panel = document.getElementById('panel-cotizacion');
    if (panel) {
        // Quitamos la clase 'activo' (que lo muestra)
        panel.classList.remove('visible');
        // También quitamos 'minimizado' para que la próxima vez abra normal
        panel.classList.remove('minimizado');
        panel.classList.remove('visible');
        
        // OPCIONAL: Si tu CSS no usa clases, usa esta línea:
        // panel.style.display = 'none'; 
    }
}

function compartirCotizacion() {
    if (carritoCotizacion.length === 0) {
        alert("Primero añade algunos productos a la cotización.");
        return;
    }

    // CAPTURAR EL NOMBRE
    const inputCliente = document.getElementById("nombre-cliente");
    const nombreCliente = inputCliente ? inputCliente.value.trim() : "";
    
    if (nombreCliente === "") {
        alert("Por favor, ingresa el nombre del cliente.");
        if(inputCliente) inputCliente.focus();
        return;
    }

    // ARMAR EL MENSAJE
    let texto = "*COTIZACIÓN EVERLEO*\n";
    texto += `*Cliente:* ${nombreCliente}\n`;
    texto += "----------------------------\n\n";

    let sumaTotal = 0;
    carritoCotizacion.forEach(p => {
        // CALCULAMOS EL PRECIO UNITARIO
        const precioUnitario = p.subtotal / p.cantidadTotal;

        texto += `• *${p.nombre}*\n`;
        texto += `  ${p.cajas} cajas (${p.cantidadTotal} unid.)\n`;
        // NUEVA LÍNEA CON DESGLOSE:
        texto += `  ${p.cantidadTotal} unid. x Bs. ${precioUnitario.toFixed(2)} = *Bs. ${p.subtotal.toFixed(2)}*\n\n`;
        
        sumaTotal += p.subtotal;
    });

    texto += "----------------------------\n";
    texto += `*TOTAL GENERAL: Bs. ${sumaTotal.toFixed(2)}*`;

    const textoCodificado = encodeURIComponent(texto);
    const esCelular = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (esCelular && navigator.share) {
        navigator.share({ title: 'Cotización', text: texto }).catch(() => {
            window.open(`https://api.whatsapp.com/send?text=${textoCodificado}`, '_blank');
        });
    } else {
        window.open(`https://api.whatsapp.com/send?text=${textoCodificado}`, '_blank');
    }
}
function minimizarPanel() {
    const panel = document.getElementById("panel-cotizacion");
    const btn = document.getElementById("btn-minimizar");
    
    // Alterna la clase. Si se añade, el CSS de arriba lo frena a 60px del fondo.
    const estaMin = panel.classList.toggle("minimizado");
    
    // Cambia el símbolo
    btn.innerHTML = estaMin ? "+" : "−";
}
function verDetalles(elemento) {
    if (event) event.stopPropagation();
    // 'elemento' es la imagen que tocaste
    const nombre = elemento.getAttribute('data-nombre');
    const especificaciones = elemento.getAttribute('data-specs');
    const imagenSrc = elemento.src;

    // Llenamos el modal con esa información
    document.getElementById('modal-titulo').innerText = nombre;
    document.getElementById('modal-specs').innerText = especificaciones;
    document.getElementById('modal-img').src = imagenSrc;

    // Mostramos el modal
    document.getElementById('modal-detalles').style.display = "flex";
}

function cerrarModal() {
    document.getElementById('modal-detalles').style.display = "none";
}