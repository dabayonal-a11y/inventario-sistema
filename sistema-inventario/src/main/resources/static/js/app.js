/**
 * Sistema de Gestión de Inventario - app.js
 * Cumple con todas las funcionalidades de las Clases 7, 8, 18, 19, 20 y 21
 * Desarrollado para ADSO - SENA
 */

// URL de la API:
// - En producción (Netlify): apunta al backend desplegado en Railway
// - En desarrollo local (Live Server / archivo): apunta a localhost:8080
const BACKEND_RAILWAY = "https://inventario-sistema-production-7d49.up.railway.app";

const API_URL = (window.location.hostname === "localhost" || window.location.protocol === "file:")
    ? "http://localhost:8080/productos"
    : `${BACKEND_RAILWAY}/productos`;


// Semilla inicial con los productos de prueba del sistema (para que nunca quede vacío)
const PRODUCTOS_SEMILLA = [
    { id: 1, codigo: "PROD-001", nombre: "Laptop Dell Inspiron", categoria: "Tecnología", proveedor: "Dell Colombia", precio: 2850000.0, cantidad: 15, stockMinimo: 5 },
    { id: 2, codigo: "PROD-002", nombre: "Mouse Inalámbrico Logitech", categoria: "Accesorios", proveedor: "Logitech", precio: 65000.0, cantidad: 4, stockMinimo: 10 },
    { id: 3, codigo: "PROD-003", nombre: "Teclado Mecánico RGB", categoria: "Accesorios", proveedor: "Redragon", precio: 180000.0, cantidad: 0, stockMinimo: 5 },
    { id: 4, codigo: "PROD-004", nombre: "Monitor 24 Pulgadas IPS", categoria: "Monitores", proveedor: "LG Electronics", precio: 620000.0, cantidad: 20, stockMinimo: 8 },
    { id: 5, codigo: "PROD-005", nombre: "Impresora Multifuncional", categoria: "Oficina", proveedor: "Epson", precio: 890000.0, cantidad: 8, stockMinimo: 3 }
];

let productos = [];
let productoEditandoId = null;
let esModoLocal = false;

console.log("Sistema de Inventario iniciado. Conectando a API:", API_URL);

// ==========================================
// 1. CARGAR PRODUCTOS DESDE LA API REST (GET)
// ==========================================
async function cargarProductos() {
    try {
        console.log("Consultando API en:", API_URL);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const respuesta = await fetch(API_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!respuesta.ok) {
            throw new Error(`Error en la solicitud HTTP: ${respuesta.status}`);
        }

        productos = await respuesta.json();
        esModoLocal = false;
        localStorage.setItem("inventario_local", JSON.stringify(productos));
        console.log("PRODUCTOS RECIBIDOS DEL BACKEND:", productos);

        const banner = document.getElementById("bannerModoLocal");
        if (banner) banner.remove();

    } catch (error) {
        console.warn("Backend no disponible. Cargando modo local con persistencia:", error);
        esModoLocal = true;

        const guardados = localStorage.getItem("inventario_local");
        if (guardados) {
            try {
                productos = JSON.parse(guardados);
            } catch (e) {
                productos = [...PRODUCTOS_SEMILLA];
            }
        } else {
            productos = [...PRODUCTOS_SEMILLA];
            localStorage.setItem("inventario_local", JSON.stringify(productos));
        }

        mostrarBannerModoLocal();
    }

    // Si estamos en la página de consultar productos (productos.html)
    if (document.getElementById("tablaProductos")) {
        mostrarProductos(productos);
        actualizarResumenProductos(productos);
    }

    // Si estamos en la página principal (index.html)
    if (document.getElementById("cardTotalProductos")) {
        actualizarDashboardInicio(productos);
    }
}

// Muestra aviso amigable si el backend aún no ha sido iniciado
function mostrarBannerModoLocal() {
    const contenedor = document.getElementById("mensaje");
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div id="bannerModoLocal" class="alert alert-warning alert-dismissible fade show shadow-sm border-warning d-flex flex-wrap align-items-center justify-content-between py-2 mb-3" role="alert">
            <div class="d-flex align-items-center me-2">
                <i class="bi bi-hdd-network text-warning fs-4 me-2"></i>
                <div>
                    <strong>Modo Local Activo:</strong> Viendo y gestionando productos guardados localmente.
                    <div class="small text-muted">Para sincronizar en tiempo real con MySQL, inicia Spring Boot.</div>
                </div>
            </div>
            <button class="btn btn-sm btn-outline-dark mt-2 mt-md-0" onclick="cargarProductos()">
                <i class="bi bi-arrow-repeat me-1"></i> Reconectar Backend
            </button>
        </div>
    `;
}

// ==========================================
// 2. MOSTRAR PRODUCTOS EN LA TABLA (READ)
// ==========================================
function mostrarProductos(lista) {
    const tabla = document.getElementById("tablaProductos");
    if (!tabla) return;

    tabla.innerHTML = "";

    const badgeContador = document.getElementById("contadorProductosBadge");
    if (badgeContador) {
        badgeContador.textContent = `${lista.length} productos`;
    }

    if (lista.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="11" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                    No hay productos registrados o coincidentes.
                </td>
            </tr>
        `;
        actualizarTotalInventario(0);
        return;
    }

    lista.forEach(producto => {
        const precio = Number(producto.precio) || 0;
        const cantidad = Number(producto.cantidad) || 0;
        const stockMinimo = producto.stockMinimo != null ? Number(producto.stockMinimo) : 0;
        const valorTotal = precio * cantidad;

        // Determinar estado según Retos 2 y 3 de la guía
        let estadoBadge = "";
        if (cantidad === 0) {
            estadoBadge = '<span class="badge bg-danger"><i class="bi bi-x-circle me-1"></i>Agotado</span>';
        } else if (stockMinimo > 0 && cantidad < stockMinimo) {
            estadoBadge = '<span class="badge bg-warning text-dark"><i class="bi bi-exclamation-triangle me-1"></i>Stock bajo</span>';
        } else {
            estadoBadge = '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Disponible</span>';
        }

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td class="fw-bold text-muted">${producto.id || "-"}</td>
            <td><code>${producto.codigo}</code></td>
            <td class="fw-semibold">${producto.nombre}</td>
            <td><span class="badge bg-light text-dark border">${producto.categoria || "General"}</span></td>
            <td>${producto.proveedor || '<span class="text-muted fst-italic">No registrado</span>'}</td>
            <td>$${precio.toLocaleString("es-CO")}</td>
            <td class="fw-bold">${cantidad}</td>
            <td>${stockMinimo > 0 ? stockMinimo : '<span class="text-muted">-</span>'}</td>
            <td>${estadoBadge}</td>
            <td class="fw-bold text-primary">$${valorTotal.toLocaleString("es-CO")}</td>
            <td class="text-center">
                <button class="btn btn-warning btn-sm me-1" onclick="abrirEdicion(${producto.id})" title="Editar producto">
                    <i class="bi bi-pencil"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id})" title="Eliminar producto">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
            </td>
        `;
        tabla.appendChild(fila);
    });

    // Calcular el total general usando reduce() (Reto 5 de la guía)
    const totalGeneral = lista.reduce((total, p) => {
        return total + ((Number(p.precio) || 0) * (Number(p.cantidad) || 0));
    }, 0);

    actualizarTotalInventario(totalGeneral);
}

// Actualizar el valor total en el pie de la tabla
function actualizarTotalInventario(total) {
    const elementoValor = document.getElementById("valorTotalTexto");
    if (elementoValor) {
        elementoValor.textContent = `$${total.toLocaleString("es-CO")}`;
    }
}

// Actualizar tarjetas de KPI en productos.html
function actualizarResumenProductos(lista) {
    const kpiTotal = document.getElementById("kpiTotalProductos");
    const kpiDisp = document.getElementById("kpiDisponibles");
    const kpiAgot = document.getElementById("kpiAgotados");
    const kpiValor = document.getElementById("kpiValorInventario");

    if (kpiTotal) kpiTotal.textContent = lista.length;

    if (kpiDisp) {
        const disponibles = lista.filter(p => (Number(p.cantidad) || 0) > 0).length;
        kpiDisp.textContent = disponibles;
    }

    if (kpiAgot) {
        const agotados = lista.filter(p => (Number(p.cantidad) || 0) === 0).length;
        kpiAgot.textContent = agotados;
    }

    if (kpiValor) {
        const total = lista.reduce((sum, p) => sum + ((Number(p.precio) || 0) * (Number(p.cantidad) || 0)), 0);
        kpiValor.textContent = `$${total.toLocaleString("es-CO")}`;
    }
}

// Actualizar tarjetas de index.html con datos en vivo
function actualizarDashboardInicio(lista) {
    const cardTotal = document.getElementById("cardTotalProductos");
    const cardDisp = document.getElementById("cardDisponibles");
    const cardAgot = document.getElementById("cardAgotados");

    if (lista.length > 0) {
        if (cardTotal) cardTotal.textContent = lista.length;
        if (cardDisp) {
            const disp = lista.filter(p => (Number(p.cantidad) || 0) > 0).length;
            cardDisp.textContent = disp;
        }
        if (cardAgot) {
            const agot = lista.filter(p => (Number(p.cantidad) || 0) === 0).length;
            cardAgot.textContent = agot;
        }

        // Renderizar dinámicamente los últimos productos
        const ultimosContainer = document.getElementById("ultimosProductosContainer");
        if (ultimosContainer) {
            ultimosContainer.innerHTML = "";
            const ultimos = lista.slice(-3).reverse(); // los 3 más recientes
            ultimos.forEach(p => {
                const precio = Number(p.precio) || 0;
                const cant = Number(p.cantidad) || 0;
                const estadoClass = cant > 0 ? "bg-success" : "bg-danger";
                const estadoText = cant > 0 ? "Disponible" : "Agotado";

                const col = document.createElement("div");
                col.className = "col-12 col-md-6 col-lg-4";
                col.innerHTML = `
                    <div class="card h-100 shadow-sm border-0 bg-light">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h3 class="card-title h5 text-primary mb-0">${p.nombre}</h3>
                                <span class="badge ${estadoClass}">${estadoText}</span>
                            </div>
                            <p class="mb-1"><strong>Código:</strong> ${p.codigo}</p>
                            <p class="mb-1"><strong>Precio:</strong> $${precio.toLocaleString("es-CO")}</p>
                            <p class="mb-0"><strong>Stock:</strong> ${cant} unidades</p>
                        </div>
                    </div>
                `;
                ultimosContainer.appendChild(col);
            });
        }
    }
}

// ==========================================
// 3. REGISTRAR / GUARDAR PRODUCTO (POST / PUT)
// ==========================================
const formulario = document.getElementById("formProducto");
if (formulario) {
    formulario.addEventListener("submit", async function(event) {
        event.preventDefault();

        const codigo = document.getElementById("codigo").value.trim();
        const nombre = document.getElementById("nombre").value.trim();
        const categoria = document.getElementById("categoria").value;
        const proveedor = document.getElementById("proveedor") ? document.getElementById("proveedor").value.trim() : "";
        const precio = parseFloat(document.getElementById("precio").value);
        const cantidad = parseInt(document.getElementById("cantidad").value, 10);
        const stockMinimoEl = document.getElementById("stockMinimo");
        const stockMinimo = stockMinimoEl ? parseInt(stockMinimoEl.value, 10) : 0;

        // VALIDACIONES
        if (codigo === "") {
            mostrarAlerta("Debe ingresar el código del producto.", "warning");
            return;
        }

        if (nombre === "") {
            mostrarAlerta("Debe ingresar el nombre del producto.", "warning");
            return;
        }

        if (categoria === "") {
            mostrarAlerta("Debe seleccionar una categoría.", "warning");
            return;
        }

        if (isNaN(precio) || precio <= 0) {
            mostrarAlerta("El precio debe ser un número mayor a cero.", "warning");
            return;
        }

        if (isNaN(cantidad) || cantidad < 0) {
            mostrarAlerta("La cantidad no puede ser negativa.", "warning");
            return;
        }

        if (isNaN(stockMinimo) || stockMinimo < 0) {
            mostrarAlerta("El stock mínimo no puede ser negativo.", "warning");
            return;
        }

        // Validación de código duplicado (Clase 8, pág. 116)
        const codigoDuplicado = productos.some(p => 
            p.codigo.toUpperCase() === codigo.toUpperCase() && p.id !== productoEditandoId
        );
        if (codigoDuplicado) {
            mostrarAlerta(`Ya existe un producto registrado con el código "${codigo}".`, "warning");
            return;
        }

        const producto = {
            codigo,
            nombre,
            categoria,
            proveedor: proveedor || "No registrado",
            precio,
            cantidad,
            stockMinimo
        };

        // Si estamos en modo local (sin backend activo)
        if (esModoLocal) {
            if (productoEditandoId === null) {
                const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => Number(p.id) || 0)) + 1 : 1;
                const nuevoProducto = { id: nuevoId, ...producto };
                productos.unshift(nuevoProducto);
                localStorage.setItem("inventario_local", JSON.stringify(productos));
                mostrarAlerta("✓ Producto registrado correctamente (guardado en modo local).", "success");
                formulario.reset();
                if (window.location.pathname.includes("registrar.html")) {
                    setTimeout(() => { window.location.href = "productos.html"; }, 1000);
                }
            } else {
                const idx = productos.findIndex(p => p.id === productoEditandoId);
                if (idx !== -1) {
                    productos[idx] = { id: productoEditandoId, ...producto };
                    localStorage.setItem("inventario_local", JSON.stringify(productos));
                }
                mostrarAlerta("✓ Producto modificado correctamente.", "success");
                productoEditandoId = null;
                const btnSubmit = document.getElementById("btnSubmitForm");
                if (btnSubmit) btnSubmit.innerHTML = '<i class="bi bi-save me-1"></i> Guardar Producto';
                formulario.reset();
            }

            if (document.getElementById("tablaProductos")) {
                mostrarProductos(productos);
                actualizarResumenProductos(productos);
            }
            if (document.getElementById("cardTotalProductos")) {
                actualizarDashboardInicio(productos);
            }
            return;
        }

        try {
            let url = API_URL;
            let metodo = "POST";

            if (productoEditandoId !== null) {
                url = `${API_URL}/${productoEditandoId}`;
                metodo = "PUT";
            }

            const respuesta = await fetch(url, {
                method: metodo,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(producto)
            });

            if (!respuesta.ok) {
                throw new Error("Respuesta no satisfactoria del servidor");
            }

            if (productoEditandoId === null) {
                mostrarAlerta("✓ Producto registrado correctamente en la base de datos.", "success");
                formulario.reset();
                // Si estamos en registrar.html, redirigir a productos.html después de 1 segundo
                if (window.location.pathname.includes("registrar.html")) {
                    setTimeout(() => {
                        window.location.href = "productos.html";
                    }, 1200);
                }
            } else {
                mostrarAlerta("✓ Producto actualizado correctamente.", "success");
                productoEditandoId = null;
                const btnSubmit = document.getElementById("btnSubmitForm");
                if (btnSubmit) btnSubmit.innerHTML = '<i class="bi bi-save me-1"></i> Guardar Producto';
                formulario.reset();
            }

            await cargarProductos();

        } catch (error) {
            console.error("Error al guardar en backend:", error);
            mostrarAlerta("No se pudo conectar con el backend. Guardando temporalmente de forma local.", "warning");
            
            // Guardado local de respaldo
            if (productoEditandoId === null) {
                const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => Number(p.id) || 0)) + 1 : 1;
                productos.unshift({ id: nuevoId, ...producto });
            } else {
                const idx = productos.findIndex(p => p.id === productoEditandoId);
                if (idx !== -1) productos[idx] = { id: productoEditandoId, ...producto };
                productoEditandoId = null;
            }
            localStorage.setItem("inventario_local", JSON.stringify(productos));
            formulario.reset();
            if (document.getElementById("tablaProductos")) {
                mostrarProductos(productos);
                actualizarResumenProductos(productos);
            }
        }
    });
}

// ==========================================
// 4. EDITAR PRODUCTO (MODAL Y FORMULARIO) (PUT)
// ==========================================
function abrirEdicion(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) {
        console.error("Producto no encontrado con id:", id);
        return;
    }

    // Si existe el modal de edición en la página (productos.html)
    const modalEl = document.getElementById("modalEditarProducto");
    if (modalEl && window.bootstrap) {
        document.getElementById("editModalId").value = producto.id;
        document.getElementById("editModalCodigo").value = producto.codigo;
        document.getElementById("editModalNombre").value = producto.nombre;
        document.getElementById("editModalCategoria").value = producto.categoria || "";
        document.getElementById("editModalProveedor").value = producto.proveedor || "";
        document.getElementById("editModalPrecio").value = producto.precio;
        document.getElementById("editModalCantidad").value = producto.cantidad;
        document.getElementById("editModalStockMinimo").value = producto.stockMinimo || 0;

        const modalInstance = new bootstrap.Modal(modalEl);
        modalInstance.show();
        return;
    }

    // Si estamos en una página con formulario directo
    if (formulario) {
        productoEditandoId = producto.id;
        document.getElementById("codigo").value = producto.codigo;
        document.getElementById("nombre").value = producto.nombre;
        document.getElementById("categoria").value = producto.categoria;
        if (document.getElementById("proveedor")) {
            document.getElementById("proveedor").value = producto.proveedor || "";
        }
        document.getElementById("precio").value = producto.precio;
        document.getElementById("cantidad").value = producto.cantidad;
        if (document.getElementById("stockMinimo")) {
            document.getElementById("stockMinimo").value = producto.stockMinimo || 0;
        }

        const btnSubmit = document.getElementById("btnSubmitForm");
        if (btnSubmit) {
            btnSubmit.innerHTML = '<i class="bi bi-pencil-square me-1"></i> Actualizar Producto';
        }
        window.scrollTo({ top: formulario.offsetTop - 50, behavior: "smooth" });
    }
}

// Handler para el formulario del Modal de Edición
const formEditarModal = document.getElementById("formEditarModal");
if (formEditarModal) {
    formEditarModal.addEventListener("submit", async function(e) {
        e.preventDefault();

        const id = document.getElementById("editModalId").value;
        const codigo = document.getElementById("editModalCodigo").value.trim();
        const nombre = document.getElementById("editModalNombre").value.trim();
        const categoria = document.getElementById("editModalCategoria").value;
        const proveedor = document.getElementById("editModalProveedor").value.trim();
        const precio = parseFloat(document.getElementById("editModalPrecio").value);
        const cantidad = parseInt(document.getElementById("editModalCantidad").value, 10);
        const stockMinimo = parseInt(document.getElementById("editModalStockMinimo").value, 10);

        if (!codigo || !nombre || !categoria || isNaN(precio) || isNaN(cantidad)) {
            alert("Por favor complete todos los campos obligatorios.");
            return;
        }

        const productoActualizado = {
            id: Number(id),
            codigo,
            nombre,
            categoria,
            proveedor: proveedor || "No registrado",
            precio,
            cantidad,
            stockMinimo: isNaN(stockMinimo) ? 0 : stockMinimo
        };

        if (esModoLocal) {
            const idx = productos.findIndex(p => p.id === Number(id));
            if (idx !== -1) {
                productos[idx] = { ...productoActualizado };
                localStorage.setItem("inventario_local", JSON.stringify(productos));
            }
            const modalEl = document.getElementById("modalEditarProducto");
            const modalInst = bootstrap.Modal.getInstance(modalEl);
            if (modalInst) modalInst.hide();

            mostrarAlerta("✓ Producto modificado correctamente.", "success");
            mostrarProductos(productos);
            actualizarResumenProductos(productos);
            return;
        }

        try {
            const respuesta = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productoActualizado)
            });

            if (!respuesta.ok) throw new Error("Error al actualizar");

            // Cerrar el modal
            const modalEl = document.getElementById("modalEditarProducto");
            const modalInst = bootstrap.Modal.getInstance(modalEl);
            if (modalInst) modalInst.hide();

            mostrarAlerta("✓ Producto modificado correctamente.", "success");
            await cargarProductos();

        } catch (err) {
            console.error("Error al actualizar en backend, actualizando localmente:", err);
            const idx = productos.findIndex(p => p.id === Number(id));
            if (idx !== -1) {
                productos[idx] = { ...productoActualizado };
                localStorage.setItem("inventario_local", JSON.stringify(productos));
            }
            const modalEl = document.getElementById("modalEditarProducto");
            const modalInst = bootstrap.Modal.getInstance(modalEl);
            if (modalInst) modalInst.hide();
            mostrarAlerta("✓ Producto modificado localmente.", "success");
            mostrarProductos(productos);
            actualizarResumenProductos(productos);
        }
    });
}

// ==========================================
// 5. ELIMINAR PRODUCTO (DELETE) (CLASE 15 Y 21)
// ==========================================
async function eliminarProducto(id) {
    const confirmar = confirm("¿Está seguro de eliminar este producto del inventario?");
    if (!confirmar) return;

    if (esModoLocal) {
        productos = productos.filter(p => p.id !== id);
        localStorage.setItem("inventario_local", JSON.stringify(productos));
        mostrarAlerta("✓ Producto eliminado correctamente.", "info");
        mostrarProductos(productos);
        actualizarResumenProductos(productos);
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo eliminar el producto en el backend");
        }

        mostrarAlerta("✓ Producto eliminado correctamente.", "info");
        await cargarProductos();

    } catch (error) {
        console.warn("Error al eliminar en backend, aplicando cambio localmente:", error);
        productos = productos.filter(p => p.id !== id);
        localStorage.setItem("inventario_local", JSON.stringify(productos));
        mostrarAlerta("✓ Producto eliminado localmente.", "info");
        mostrarProductos(productos);
        actualizarResumenProductos(productos);
    }
}

// ==========================================
// 6. BUSCADOR / FILTRO EN TIEMPO REAL
// ==========================================
const buscador = document.getElementById("buscadorProductos");
if (buscador) {
    buscador.addEventListener("input", function() {
        const termino = this.value.toLowerCase().trim();
        if (termino === "") {
            mostrarProductos(productos);
        } else {
            const filtrados = productos.filter(p => 
                (p.codigo && p.codigo.toLowerCase().includes(termino)) ||
                (p.nombre && p.nombre.toLowerCase().includes(termino)) ||
                (p.categoria && p.categoria.toLowerCase().includes(termino)) ||
                (p.proveedor && p.proveedor.toLowerCase().includes(termino))
            );
            mostrarProductos(filtrados);
        }
    });
}

// ==========================================
// 7. ALERTAS Y FEEDBACK VISUAL BOOTSTRAP
// ==========================================
function mostrarAlerta(mensaje, tipo = "success") {
    const contenedor = document.getElementById("mensaje");
    if (!contenedor) {
        alert(mensaje);
        return;
    }

    const icono = tipo === "success" ? "check-circle" : (tipo === "danger" ? "exclamation-octagon" : "info-circle");

    contenedor.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show shadow-sm" role="alert">
            <i class="bi bi-${icono} me-2"></i>
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        </div>
    `;

    setTimeout(() => {
        const alertNode = contenedor.querySelector(".alert");
        if (alertNode && window.bootstrap) {
            const bsAlert = new bootstrap.Alert(alertNode);
            bsAlert.close();
        }
    }, 4500);
}

// ==========================================
// 8. EJECUCIÓN INICIAL AL CARGAR LA PÁGINA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
});