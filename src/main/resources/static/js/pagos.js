const API_SOLICITUDES = "/solicitudes";
const API_PLAN_PAGOS = "/api/planpagos";
const API_PAGOS = "/api/pagos";

let solicitudActual = null;
let planPagosActual = [];
let saldoPendienteActual = 0;

document.addEventListener("DOMContentLoaded", () => {

    document
        .getElementById("btnConsultar")
        .addEventListener("click", consultarSolicitud);

    document
        .getElementById("formPago")
        .addEventListener("submit", registrarPago);

    document
        .getElementById("idSolicitudConsulta")
        .addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                consultarSolicitud();
            }
        });

    document.getElementById("fechaPago").value = obtenerFechaLocal();
});

/**
 * Consulta la solicitud, el plan de pagos y el historial.
 */
async function consultarSolicitud() {

    limpiarMensaje("mensajeGeneral");
    limpiarMensaje("mensajePago");

    const inputIdSolicitud =
        document.getElementById("idSolicitudConsulta");

    const idSolicitud = Number(inputIdSolicitud.value);

    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
        mostrarMensaje(
            "mensajeGeneral",
            "Ingrese un ID de solicitud válido.",
            "error"
        );
        ocultarSecciones();
        return;
    }

    cambiarEstadoBotonConsulta(true);

    try {

        const solicitudes = await obtenerJson(API_SOLICITUDES);

        if (!Array.isArray(solicitudes)) {
            throw new Error("No fue posible obtener la lista de solicitudes.");
        }

        const solicitud = solicitudes.find(
            item => Number(item.idSolicitud) === idSolicitud
        );

        if (!solicitud) {
            throw new Error(
                `No se encontró la solicitud con ID ${idSolicitud}.`
            );
        }

        const idEstadoSolicitud = Number(solicitud.idEstadoSolicitud);

        // 2 = APROBADA
        if (idEstadoSolicitud !== 2) {

            throw new Error(
                `La solicitud no se encuentra aprobada. Estado actual: ${
                    obtenerNombreEstadoSolicitud(idEstadoSolicitud)
                }.`
            );
        }

        const planPagos = await obtenerJson(
            `${API_PLAN_PAGOS}/solicitud/${idSolicitud}`
        );

        solicitudActual = solicitud;
        planPagosActual = Array.isArray(planPagos) ? planPagos : [];

        calcularSaldoPendiente();
        mostrarDatosSolicitud();
        mostrarPlanPagos();

        await cargarHistorialPagos(idSolicitud);

        mostrarSecciones();

        mostrarMensaje(
            "mensajeGeneral",
            "Solicitud consultada correctamente.",
            "exito"
        );

    } catch (error) {

        solicitudActual = null;
        planPagosActual = [];
        saldoPendienteActual = 0;

        ocultarSecciones();

        mostrarMensaje(
            "mensajeGeneral",
            error.message || "No fue posible consultar la solicitud.",
            "error"
        );

    } finally {
        cambiarEstadoBotonConsulta(false);
    }
}

/**
 * Registra el pago por medio de POST /api/pagos.
 */
async function registrarPago(event) {

    event.preventDefault();

    limpiarMensaje("mensajePago");

    if (!solicitudActual) {
        mostrarMensaje(
            "mensajePago",
            "Primero debe consultar una solicitud aprobada.",
            "error"
        );
        return;
    }

    const fechaPago =
        document.getElementById("fechaPago").value;

    const montoPago =
        Number(document.getElementById("montoPago").value);

    const numeroComprobante =
        document.getElementById("numeroComprobante").value.trim();

    const observaciones =
        document.getElementById("observaciones").value.trim();

    if (!fechaPago) {
        mostrarMensaje(
            "mensajePago",
            "Ingrese la fecha del pago.",
            "error"
        );
        return;
    }

    if (!Number.isFinite(montoPago) || montoPago <= 0) {
        mostrarMensaje(
            "mensajePago",
            "El monto del pago debe ser mayor que cero.",
            "error"
        );
        return;
    }

    if (!numeroComprobante) {
        mostrarMensaje(
            "mensajePago",
            "Ingrese el número de comprobante.",
            "error"
        );
        return;
    }

    if (saldoPendienteActual <= 0) {
        mostrarMensaje(
            "mensajePago",
            "El préstamo ya no tiene saldo pendiente.",
            "error"
        );
        return;
    }

    /*
     * La lógica actual del backend no registra saldo a favor.
     * Por eso se evita enviar un monto mayor al saldo pendiente.
     */
    if (montoPago > saldoPendienteActual) {
        mostrarMensaje(
            "mensajePago",
            `El pago no puede ser mayor que el saldo pendiente de ${
                formatearMoneda(saldoPendienteActual)
            }.`,
            "error"
        );
        return;
    }

    const pago = {
        idSolicitud: solicitudActual.idSolicitud,
        fechaPago: fechaPago,
        montoPago: montoPago,
        numeroComprobante: numeroComprobante,
        observaciones: observaciones || null
    };

    cambiarEstadoBotonPago(true);

    try {

        const respuesta = await fetch(API_PAGOS, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(pago)
        });

        if (!respuesta.ok) {
            throw new Error(await obtenerMensajeError(respuesta));
        }

        const pagoRegistrado = await respuesta.json();

        mostrarMensaje(
            "mensajePago",
            `Pago registrado correctamente. ID de pago: ${
                pagoRegistrado.idPago ?? "generado"
            }.`,
            "exito"
        );

        limpiarFormularioPago();

        /*
         * Se vuelven a consultar los datos para reflejar
         * los saldos y estados actualizados.
         */
        await actualizarDatosDespuesDelPago();

    } catch (error) {

        mostrarMensaje(
            "mensajePago",
            error.message || "No fue posible registrar el pago.",
            "error"
        );

    } finally {
        cambiarEstadoBotonPago(false);
    }
}

/**
 * Actualiza plan de pagos e historial después de registrar.
 */
async function actualizarDatosDespuesDelPago() {

    const idSolicitud = solicitudActual.idSolicitud;

    const planPagos = await obtenerJson(
        `${API_PLAN_PAGOS}/solicitud/${idSolicitud}`
    );

    planPagosActual = Array.isArray(planPagos) ? planPagos : [];

    calcularSaldoPendiente();
    mostrarDatosSolicitud();
    mostrarPlanPagos();

    await cargarHistorialPagos(idSolicitud);
}

/**
 * Consulta el historial de pagos de una solicitud.
 */
async function cargarHistorialPagos(idSolicitud) {

    try {

        const pagos = await obtenerJson(
            `${API_PAGOS}/solicitud/${idSolicitud}`
        );

        mostrarHistorialPagos(
            Array.isArray(pagos) ? pagos : []
        );

    } catch (error) {

        console.error("Error al cargar historial:", error);

        mostrarHistorialPagos([]);
    }
}

/**
 * Muestra la información general del préstamo.
 */
function mostrarDatosSolicitud() {

    document.getElementById("datoIdSolicitud").textContent =
        solicitudActual.idSolicitud ?? "-";

    document.getElementById("datoIdCliente").textContent =
        solicitudActual.idCliente ?? "-";

    document.getElementById("datoEstadoSolicitud").textContent =
        obtenerNombreEstadoSolicitud(solicitudActual.idEstadoSolicitud);

    document.getElementById("datoMontoAprobado").textContent =
        formatearMoneda(solicitudActual.montoAprobado);

    document.getElementById("datoCuotaMensual").textContent =
        formatearMoneda(solicitudActual.cuotaMensual);

    document.getElementById("datoSaldoPendiente").textContent =
        formatearMoneda(saldoPendienteActual);

    document.getElementById("saldoDisponible").value =
        formatearMoneda(saldoPendienteActual);

    const inputMonto =
        document.getElementById("montoPago");

    inputMonto.max = saldoPendienteActual.toFixed(2);
}

/**
 * Calcula el saldo sumando el saldo pendiente de todas las cuotas.
 */
function calcularSaldoPendiente() {

    saldoPendienteActual = planPagosActual.reduce(
        (total, cuota) => {
            return total + convertirNumero(cuota.saldoCuota);
        },
        0
    );
}

/**
 * Muestra las cuotas del préstamo.
 */
function mostrarPlanPagos() {

    const tbody =
        document.getElementById("tablaPlanPagosBody");

    tbody.innerHTML = "";

    if (planPagosActual.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="sin-registros">
                    No existe un plan de pagos para esta solicitud.
                </td>
            </tr>
        `;

        return;
    }

    const cuotasOrdenadas = [...planPagosActual].sort(
        (a, b) =>
            convertirNumero(a.numeroCuota) -
            convertirNumero(b.numeroCuota)
    );

    cuotasOrdenadas.forEach(cuota => {

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${cuota.numeroCuota ?? "-"}</td>
            <td>${formatearFecha(cuota.fechaVencimiento)}</td>
            <td>${formatearMoneda(cuota.montoCuota)}</td>
            <td>${formatearMoneda(cuota.saldoCuota)}</td>
            <td>
                <span class="${obtenerClaseEstado(cuota.estadoCuota)}">
                    ${cuota.estadoCuota ?? "-"}
                </span>
            </td>
        `;

        tbody.appendChild(fila);
    });
}

/**
 * Muestra los pagos realizados.
 */
function mostrarHistorialPagos(pagos) {

    const tbody =
        document.getElementById("tablaPagosBody");

    tbody.innerHTML = "";

    if (pagos.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="sin-registros">
                    No hay pagos registrados para esta solicitud.
                </td>
            </tr>
        `;

        return;
    }

    const pagosOrdenados = [...pagos].sort((a, b) => {

        const fechaA = new Date(`${a.fechaPago}T00:00:00`);
        const fechaB = new Date(`${b.fechaPago}T00:00:00`);

        if (fechaA.getTime() !== fechaB.getTime()) {
            return fechaB - fechaA;
        }

        return convertirNumero(b.idPago) -
            convertirNumero(a.idPago);
    });

    pagosOrdenados.forEach(pago => {

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${pago.idPago ?? "-"}</td>
            <td>${formatearFecha(pago.fechaPago)}</td>
            <td>${escaparHtml(pago.numeroComprobante || "-")}</td>
            <td>${formatearMoneda(pago.montoPago)}</td>
            <td>
                <span class="${obtenerClaseEstado(pago.estadoPago)}">
                    ${pago.estadoPago ?? "-"}
                </span>
            </td>
            <td>${escaparHtml(pago.observaciones || "-")}</td>
        `;

        tbody.appendChild(fila);
    });
}

/**
 * Realiza una petición GET y devuelve JSON.
 */
async function obtenerJson(url) {

    const respuesta = await fetch(url);

    if (!respuesta.ok) {
        throw new Error(await obtenerMensajeError(respuesta));
    }

    /*
     * Evita error si el backend devuelve una respuesta vacía.
     */
    const texto = await respuesta.text();

    if (!texto) {
        return null;
    }

    return JSON.parse(texto);
}

/**
 * Intenta obtener el mensaje enviado por el backend.
 */
async function obtenerMensajeError(respuesta) {

    const texto = await respuesta.text();

    if (!texto) {
        return `Error HTTP ${respuesta.status}.`;
    }

    try {

        const error = JSON.parse(texto);

        return error.message ||
            error.mensaje ||
            error.error ||
            texto;

    } catch {
        return texto;
    }
}

/**
 * Devuelve la clase visual según el estado.
 */
function obtenerClaseEstado(estado) {

    const estadoNormalizado = normalizarTexto(estado);

    if (estadoNormalizado === "PAGADA") {
        return "estado estado-pagada";
    }

    if (estadoNormalizado === "PARCIAL") {
        return "estado estado-parcial";
    }

    if (estadoNormalizado === "APLICADO") {
        return "estado estado-aplicado";
    }

    return "estado estado-pendiente";
}

/**
 * Limpia el formulario manteniendo la fecha.
 */
function limpiarFormularioPago() {

    document.getElementById("montoPago").value = "";
    document.getElementById("numeroComprobante").value = "";
    document.getElementById("observaciones").value = "";
    document.getElementById("fechaPago").value = obtenerFechaLocal();
}

/**
 * Oculta las secciones que dependen de una solicitud.
 */
function ocultarSecciones() {

    document
        .getElementById("seccionSolicitud")
        .classList.add("oculto");

    document
        .getElementById("seccionFormularioPago")
        .classList.add("oculto");

    document
        .getElementById("seccionHistorial")
        .classList.add("oculto");

    document
        .getElementById("seccionPlanPagos")
        .classList.add("oculto");
}

/**
 * Muestra las secciones después de consultar.
 */
function mostrarSecciones() {

    document
        .getElementById("seccionSolicitud")
        .classList.remove("oculto");

    document
        .getElementById("seccionFormularioPago")
        .classList.remove("oculto");

    document
        .getElementById("seccionHistorial")
        .classList.remove("oculto");

    document
        .getElementById("seccionPlanPagos")
        .classList.remove("oculto");
}

/**
 * Muestra mensajes de éxito, error o información.
 */
function mostrarMensaje(idElemento, mensaje, tipo) {

    const elemento = document.getElementById(idElemento);

    elemento.textContent = mensaje;
    elemento.className = "mensaje";

    if (tipo === "exito") {
        elemento.classList.add("mensaje-exito");
    } else if (tipo === "informacion") {
        elemento.classList.add("mensaje-informacion");
    } else {
        elemento.classList.add("mensaje-error");
    }
}

function limpiarMensaje(idElemento) {

    const elemento = document.getElementById(idElemento);

    elemento.textContent = "";
    elemento.className = "mensaje";
}

function cambiarEstadoBotonConsulta(cargando) {

    const boton = document.getElementById("btnConsultar");

    boton.disabled = cargando;
    boton.textContent = cargando ? "Consultando..." : "Consultar";
}

function cambiarEstadoBotonPago(cargando) {

    const boton = document.getElementById("btnRegistrarPago");

    boton.disabled = cargando;
    boton.textContent = cargando
        ? "Registrando..."
        : "Registrar pago";
}

function formatearMoneda(valor) {

    return new Intl.NumberFormat("es-GT", {
        style: "currency",
        currency: "GTQ",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(convertirNumero(valor));
}

function formatearFecha(fecha) {

    if (!fecha) {
        return "-";
    }

    const partes = String(fecha).split("-");

    if (partes.length !== 3) {
        return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function convertirNumero(valor) {

    const numero = Number(valor);

    return Number.isFinite(numero) ? numero : 0;
}

function normalizarTexto(valor) {

    return String(valor || "")
        .trim()
        .toUpperCase();
}

/**
 * Devuelve el nombre del estado de la solicitud según su identificador.
 */
function obtenerNombreEstadoSolicitud(idEstadoSolicitud) {

    const idEstado = Number(idEstadoSolicitud);

    if (idEstado === 1) {
        return "PENDIENTE";
    }

    if (idEstado === 2) {
        return "APROBADA";
    }

    if (idEstado === 3) {
        return "RECHAZADA";
    }

    return "DESCONOCIDO";
}

/**
 * Obtiene la fecha local sin desplazamientos por zona horaria.
 */
function obtenerFechaLocal() {

    const fecha = new Date();

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

/**
 * Evita insertar HTML recibido desde los datos.
 */
function escaparHtml(valor) {

    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}