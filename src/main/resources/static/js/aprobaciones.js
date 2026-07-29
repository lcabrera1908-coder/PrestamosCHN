const URL_SOLICITUDES = "/solicitudes";

const tablaPendientes =
    document.getElementById("tablaPendientes");

const mensajeAprobacion =
    document.getElementById("mensajeAprobacion");

const seccionResolucion =
    document.getElementById("seccionResolucion");

const formResolucion =
    document.getElementById("formResolucion");

const btnRechazar =
    document.getElementById("btnRechazar");

const btnCancelarResolucion =
    document.getElementById("btnCancelarResolucion");

const btnActualizarPendientes =
    document.getElementById("btnActualizarPendientes");

document.addEventListener(
    "DOMContentLoaded",
    cargarSolicitudesPendientes
);

formResolucion.addEventListener(
    "submit",
    aprobarSolicitud
);

btnRechazar.addEventListener(
    "click",
    rechazarSolicitud
);

btnCancelarResolucion.addEventListener(
    "click",
    cancelarResolucion
);

btnActualizarPendientes.addEventListener(
    "click",
    cargarSolicitudesPendientes
);

async function cargarSolicitudesPendientes() {

    limpiarMensaje();
    ocultarFormulario();

    try {

        const respuesta =
            await fetch(URL_SOLICITUDES);

        if (!respuesta.ok) {

            throw new Error(
                await obtenerMensajeError(
                    respuesta,
                    "No fue posible consultar las solicitudes."
                )
            );
        }

        const solicitudes =
            await respuesta.json();

        const pendientes =
            solicitudes.filter(
                solicitud =>
                    Number(solicitud.idEstadoSolicitud) === 1
            );

        mostrarSolicitudesPendientes(pendientes);

    } catch (error) {

        mostrarMensaje(
            error.message,
            "error"
        );

        mostrarSolicitudesPendientes([]);
    }
}

function mostrarSolicitudesPendientes(solicitudes) {

    tablaPendientes.innerHTML = "";

    if (
        !Array.isArray(solicitudes) ||
        solicitudes.length === 0
    ) {

        tablaPendientes.innerHTML = `
            <tr>
                <td colspan="8">
                    No hay solicitudes pendientes
                </td>
            </tr>
        `;

        return;
    }

    solicitudes.forEach(solicitud => {

        const fila =
            document.createElement("tr");

        fila.innerHTML = `
            <td>
                ${solicitud.idSolicitud ?? ""}
            </td>

            <td>
                ${solicitud.idCliente ?? ""}
            </td>

            <td>
                ${formatearMoneda(
            solicitud.montoSolicitado
        )}
            </td>

            <td>
                ${solicitud.plazoMeses ?? 0} meses
            </td>

            <td>
                ${formatearNumero(
            solicitud.tasaInteres
        )} %
            </td>

            <td>
                ${formatearFecha(
            solicitud.fechaSolicitud
        )}
            </td>

            <td>
                ${solicitud.observaciones ?? ""}
            </td>

            <td>
                <button
                    type="button"
                    class="btn-seleccionar-solicitud"
                    data-id="${solicitud.idSolicitud}"
                >
                    Resolver
                </button>
            </td>
        `;

        tablaPendientes.appendChild(fila);
    });

    agregarEventosSeleccion();
}

function agregarEventosSeleccion() {

    document
        .querySelectorAll(".btn-seleccionar-solicitud")
        .forEach(boton => {

            boton.addEventListener(
                "click",
                function () {

                    seleccionarSolicitud(
                        this.dataset.id
                    );
                }
            );
        });
}

async function seleccionarSolicitud(idSolicitud) {

    limpiarMensaje();

    try {

        const respuesta =
            await fetch(
                `${URL_SOLICITUDES}/${idSolicitud}`
            );

        if (!respuesta.ok) {

            throw new Error(
                await obtenerMensajeError(
                    respuesta,
                    "No fue posible consultar la solicitud."
                )
            );
        }

        const solicitud =
            await respuesta.json();

        if (
            Number(solicitud.idEstadoSolicitud) !== 1
        ) {

            mostrarMensaje(
                "La solicitud ya fue resuelta.",
                "error"
            );

            await cargarSolicitudesPendientes();
            return;
        }

        cargarFormulario(solicitud);

    } catch (error) {

        mostrarMensaje(
            error.message,
            "error"
        );
    }
}

function cargarFormulario(solicitud) {

    document
        .getElementById("idSolicitudSeleccionada")
        .value = solicitud.idSolicitud ?? "";

    document
        .getElementById("datoIdSolicitud")
        .textContent = solicitud.idSolicitud ?? "";

    document
        .getElementById("datoIdCliente")
        .textContent = solicitud.idCliente ?? "";

    document
        .getElementById("datoMontoSolicitado")
        .textContent =
        formatearMoneda(
            solicitud.montoSolicitado
        );

    document
        .getElementById("datoFechaSolicitud")
        .textContent =
        formatearFecha(
            solicitud.fechaSolicitud
        );

    document
        .getElementById("montoAprobado")
        .value = solicitud.montoSolicitado ?? "";

    document
        .getElementById("plazoMesesAprobado")
        .value = solicitud.plazoMeses ?? "";

    document
        .getElementById("tasaInteresAprobada")
        .value = solicitud.tasaInteres ?? "";

    document
        .getElementById("observacionesResolucion")
        .value = solicitud.observaciones ?? "";

    establecerFechaDesembolso();

    seccionResolucion
        .classList
        .remove("oculto");

    seccionResolucion.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

async function aprobarSolicitud(evento) {

    evento.preventDefault();

    limpiarMensaje();

    const idSolicitud =
        document
            .getElementById("idSolicitudSeleccionada")
            .value
            .trim();

    if (idSolicitud === "") {

        mostrarMensaje(
            "Seleccione una solicitud.",
            "error"
        );

        return;
    }

    const dto = {
        montoAprobado: Number(
            document
                .getElementById("montoAprobado")
                .value
        ),

        plazoMeses: Number(
            document
                .getElementById("plazoMesesAprobado")
                .value
        ),

        tasaInteres: Number(
            document
                .getElementById("tasaInteresAprobada")
                .value
        ),

        fechaDesembolso:
        document
            .getElementById("fechaDesembolso")
            .value,

        observaciones:
            obtenerValorONull(
                "observacionesResolucion"
            )
    };

    if (!validarAprobacion(dto)) {
        return;
    }

    const confirmar =
        window.confirm(
            `¿Está seguro de aprobar la solicitud ${idSolicitud}?`
        );

    if (!confirmar) {
        return;
    }

    try {

        deshabilitarBotones(true);

        const respuesta =
            await fetch(
                `${URL_SOLICITUDES}/${idSolicitud}/aprobar`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dto)
                }
            );

        if (!respuesta.ok) {

            throw new Error(
                await obtenerMensajeError(
                    respuesta,
                    "No fue posible aprobar la solicitud."
                )
            );
        }

        const solicitudAprobada =
            await respuesta.json();

        mostrarMensaje(
            `Solicitud ${solicitudAprobada.idSolicitud} aprobada correctamente. El plan de pagos fue generado.`,
            "exito"
        );

        ocultarFormulario();

        await recargarPendientesSinLimpiarMensaje();

    } catch (error) {

        mostrarMensaje(
            error.message,
            "error"
        );

    } finally {

        deshabilitarBotones(false);
    }
}

async function rechazarSolicitud() {

    limpiarMensaje();

    const idSolicitud =
        document
            .getElementById("idSolicitudSeleccionada")
            .value
            .trim();

    if (idSolicitud === "") {

        mostrarMensaje(
            "Seleccione una solicitud.",
            "error"
        );

        return;
    }

    const observaciones =
        obtenerValorONull(
            "observacionesResolucion"
        );

    if (
        observaciones === null ||
        observaciones.trim() === ""
    ) {

        mostrarMensaje(
            "Ingrese el motivo del rechazo en observaciones.",
            "error"
        );

        return;
    }

    const dto = {
        montoAprobado: null,
        plazoMeses: null,
        tasaInteres: null,
        fechaDesembolso: null,
        observaciones: observaciones
    };

    const confirmar =
        window.confirm(
            `¿Está seguro de rechazar la solicitud ${idSolicitud}?`
        );

    if (!confirmar) {
        return;
    }

    try {

        deshabilitarBotones(true);

        const respuesta =
            await fetch(
                `${URL_SOLICITUDES}/${idSolicitud}/rechazar`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dto)
                }
            );

        if (!respuesta.ok) {

            throw new Error(
                await obtenerMensajeError(
                    respuesta,
                    "No fue posible rechazar la solicitud."
                )
            );
        }

        const solicitudRechazada =
            await respuesta.json();

        mostrarMensaje(
            `Solicitud ${solicitudRechazada.idSolicitud} rechazada correctamente.`,
            "exito"
        );

        ocultarFormulario();

        await recargarPendientesSinLimpiarMensaje();

    } catch (error) {

        mostrarMensaje(
            error.message,
            "error"
        );

    } finally {

        deshabilitarBotones(false);
    }
}

async function recargarPendientesSinLimpiarMensaje() {

    try {

        const respuesta =
            await fetch(URL_SOLICITUDES);

        if (!respuesta.ok) {
            return;
        }

        const solicitudes =
            await respuesta.json();

        const pendientes =
            solicitudes.filter(
                solicitud =>
                    Number(solicitud.idEstadoSolicitud) === 1
            );

        mostrarSolicitudesPendientes(pendientes);

    } catch {
        // El mensaje principal se conserva.
    }
}

function validarAprobacion(dto) {

    if (
        !dto.montoAprobado ||
        dto.montoAprobado <= 0
    ) {

        mostrarMensaje(
            "Ingrese un monto aprobado válido.",
            "error"
        );

        return false;
    }

    if (
        !dto.plazoMeses ||
        dto.plazoMeses <= 0
    ) {

        mostrarMensaje(
            "Ingrese un plazo válido.",
            "error"
        );

        return false;
    }

    if (
        Number.isNaN(dto.tasaInteres) ||
        dto.tasaInteres < 0
    ) {

        mostrarMensaje(
            "Ingrese una tasa de interés válida.",
            "error"
        );

        return false;
    }

    if (!dto.fechaDesembolso) {

        mostrarMensaje(
            "Ingrese la fecha de desembolso.",
            "error"
        );

        return false;
    }

    return true;
}

function establecerFechaDesembolso() {

    const fechaActual = new Date();

    const anio =
        fechaActual.getFullYear();

    const mes =
        String(
            fechaActual.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            fechaActual.getDate()
        ).padStart(2, "0");

    document
        .getElementById("fechaDesembolso")
        .value = `${anio}-${mes}-${dia}`;
}

function cancelarResolucion() {

    limpiarMensaje();
    ocultarFormulario();
}

function ocultarFormulario() {

    formResolucion.reset();

    document
        .getElementById("idSolicitudSeleccionada")
        .value = "";

    seccionResolucion
        .classList
        .add("oculto");
}

function deshabilitarBotones(deshabilitar) {

    document
        .getElementById("btnAprobar")
        .disabled = deshabilitar;

    btnRechazar.disabled = deshabilitar;

    btnCancelarResolucion.disabled =
        deshabilitar;
}

function formatearMoneda(valor) {

    return Number(valor ?? 0)
        .toLocaleString(
            "es-GT",
            {
                style: "currency",
                currency: "GTQ",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
}

function formatearNumero(valor) {

    return Number(valor ?? 0)
        .toLocaleString(
            "es-GT",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
}

function formatearFecha(fecha) {

    if (!fecha) {
        return "";
    }

    const partes = fecha.split("-");

    if (partes.length !== 3) {
        return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obtenerValorONull(idElemento) {

    const valor =
        document
            .getElementById(idElemento)
            .value
            .trim();

    return valor === ""
        ? null
        : valor;
}

function mostrarMensaje(texto, tipo) {

    mensajeAprobacion.textContent = texto;

    mensajeAprobacion.className =
        `mensaje ${tipo}`;
}

function limpiarMensaje() {

    mensajeAprobacion.textContent = "";

    mensajeAprobacion.className =
        "mensaje";
}

async function obtenerMensajeError(
    respuesta,
    mensajePredeterminado
) {

    try {

        const tipoContenido =
            respuesta.headers
                .get("content-type") ?? "";

        if (
            tipoContenido.includes(
                "application/json"
            )
        ) {

            const error =
                await respuesta.json();

            return (
                error.message ||
                error.mensaje ||
                error.error ||
                mensajePredeterminado
            );
        }

        const texto =
            await respuesta.text();

        return texto.trim() !== ""
            ? texto
            : mensajePredeterminado;

    } catch {

        return mensajePredeterminado;
    }
}