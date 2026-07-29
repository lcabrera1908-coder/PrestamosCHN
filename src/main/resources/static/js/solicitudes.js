const URL_SOLICITUDES = "/solicitudes";
const URL_CLIENTES = "/clientes";

const formSolicitud =
    document.getElementById("formSolicitud");

const mensajeSolicitud =
    document.getElementById("mensajeSolicitud");

const btnNuevaSolicitud =
    document.getElementById("btnNuevaSolicitud");

const btnBuscarSolicitud =
    document.getElementById("btnBuscarSolicitud");

const btnMostrarSolicitudes =
    document.getElementById("btnMostrarSolicitudes");

const buscarIdSolicitud =
    document.getElementById("buscarIdSolicitud");

document.addEventListener("DOMContentLoaded", inicializarPagina);

formSolicitud.addEventListener(
    "submit",
    crearSolicitud
);

btnNuevaSolicitud.addEventListener(
    "click",
    limpiarFormulario
);

btnBuscarSolicitud.addEventListener(
    "click",
    buscarSolicitudPorId
);

btnMostrarSolicitudes.addEventListener(
    "click",
    cargarSolicitudes
);

buscarIdSolicitud.addEventListener(
    "keydown",
    function (evento) {

        if (evento.key === "Enter") {

            evento.preventDefault();
            buscarSolicitudPorId();
        }
    }
);

async function inicializarPagina() {

    establecerFechaActual();

    await cargarClientes();

    await cargarSolicitudes();
}

async function cargarClientes() {

    const selectCliente =
        document.getElementById("idCliente");

    selectCliente.innerHTML = `
        <option value="">
            Seleccione un cliente
        </option>
    `;

    try {

        const respuesta = await fetch(URL_CLIENTES);

        if (!respuesta.ok) {

            throw new Error(
                "No fue posible cargar los clientes."
            );
        }

        const clientes = await respuesta.json();

        clientes
            .filter(cliente => Number(cliente.idEstado) === 1)
            .forEach(cliente => {

                const opcion =
                    document.createElement("option");

                opcion.value = cliente.idCliente;

                opcion.textContent =
                    `${cliente.idCliente} - ${obtenerNombreCliente(cliente)}`;

                selectCliente.appendChild(opcion);
            });

    } catch (error) {

        mostrarMensaje(
            error.message,
            "error"
        );
    }
}

async function cargarSolicitudes() {

    limpiarMensaje();

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

        mostrarSolicitudes(solicitudes);

    } catch (error) {

        mostrarMensaje(
            error.message,
            "error"
        );

        mostrarSolicitudes([]);
    }
}

async function crearSolicitud(evento) {

    evento.preventDefault();

    limpiarMensaje();

    const solicitud =
        obtenerDatosFormulario();

    if (!validarSolicitud(solicitud)) {
        return;
    }

    try {

        deshabilitarFormulario(true);

        const respuesta =
            await fetch(
                URL_SOLICITUDES,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(solicitud)
                }
            );

        if (!respuesta.ok) {

            throw new Error(
                await obtenerMensajeError(
                    respuesta,
                    "No fue posible crear la solicitud."
                )
            );
        }

        const solicitudCreada =
            await respuesta.json();

        mostrarMensaje(
            `Solicitud ${solicitudCreada.idSolicitud} creada correctamente.`,
            "exito"
        );

        limpiarFormulario(false);

        await cargarSolicitudes();

    } catch (error) {

        mostrarMensaje(
            error.message,
            "error"
        );

    } finally {

        deshabilitarFormulario(false);
    }
}

async function buscarSolicitudPorId() {

    const id =
        buscarIdSolicitud.value.trim();

    limpiarMensaje();

    if (id === "" || Number(id) <= 0) {

        mostrarMensaje(
            "Ingrese un ID de solicitud válido.",
            "error"
        );

        return;
    }

    try {

        const respuesta =
            await fetch(
                `${URL_SOLICITUDES}/${id}`
            );

        if (!respuesta.ok) {

            throw new Error(
                await obtenerMensajeError(
                    respuesta,
                    "Solicitud no encontrada."
                )
            );
        }

        const solicitud =
            await respuesta.json();

        mostrarSolicitudes([solicitud]);

    } catch (error) {

        mostrarMensaje(
            error.message,
            "error"
        );

        mostrarSolicitudes([]);
    }
}

function mostrarSolicitudes(solicitudes) {

    const tabla =
        document.getElementById("tablaSolicitudes");

    tabla.innerHTML = "";

    if (
        !Array.isArray(solicitudes) ||
        solicitudes.length === 0
    ) {

        tabla.innerHTML = `
            <tr>
                <td colspan="9">
                    No hay solicitudes para mostrar
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
                <span class="
                    estado-solicitud
                    ${obtenerClaseEstado(
            solicitud.idEstadoSolicitud
        )}
                ">
                    ${obtenerEstadoSolicitud(
            solicitud.idEstadoSolicitud
        )}
                </span>
            </td>

            <td>
                ${solicitud.observaciones ?? ""}
            </td>

            <td>
                <button
                    type="button"
                    class="btn-eliminar-solicitud"
                    data-id="${solicitud.idSolicitud}"
                    ${Number(solicitud.idEstadoSolicitud) !== 1
            ? "disabled"
            : ""}
                >
                    Eliminar
                </button>
            </td>
        `;

        tabla.appendChild(fila);
    });

    agregarEventosEliminar();
}

function agregarEventosEliminar() {

    document
        .querySelectorAll(
            ".btn-eliminar-solicitud:not([disabled])"
        )
        .forEach(boton => {

            boton.addEventListener(
                "click",
                function () {

                    eliminarSolicitud(
                        this.dataset.id
                    );
                }
            );
        });
}

async function eliminarSolicitud(idSolicitud) {

    const confirmar =
        window.confirm(
            `¿Está seguro de eliminar la solicitud ${idSolicitud}?`
        );

    if (!confirmar) {
        return;
    }

    limpiarMensaje();

    try {

        const respuesta =
            await fetch(
                `${URL_SOLICITUDES}/${idSolicitud}`,
                {
                    method: "DELETE"
                }
            );

        if (!respuesta.ok) {

            throw new Error(
                await obtenerMensajeError(
                    respuesta,
                    "No fue posible eliminar la solicitud."
                )
            );
        }

        mostrarMensaje(
            "Solicitud eliminada correctamente.",
            "exito"
        );

        await cargarSolicitudes();

    } catch (error) {

        mostrarMensaje(
            error.message,
            "error"
        );
    }
}

function obtenerDatosFormulario() {

    return {
        idCliente: Number(
            document.getElementById("idCliente").value
        ),

        montoSolicitado: Number(
            document.getElementById("montoSolicitado").value
        ),

        montoAprobado: null,

        plazoMeses: Number(
            document.getElementById("plazoMeses").value
        ),

        tasaInteres: Number(
            document.getElementById("tasaInteres").value
        ),

        fechaSolicitud:
        document.getElementById("fechaSolicitud").value,

        fechaDesembolso: null,

        fechaResolucion: null,

        idEstadoSolicitud: 1,

        cuotaMensual: null,

        observaciones:
            obtenerValorONull("observaciones")
    };
}

function validarSolicitud(solicitud) {

    if (
        !solicitud.idCliente ||
        solicitud.idCliente <= 0
    ) {

        mostrarMensaje(
            "Seleccione un cliente.",
            "error"
        );

        return false;
    }

    if (
        !solicitud.montoSolicitado ||
        solicitud.montoSolicitado <= 0
    ) {

        mostrarMensaje(
            "Ingrese un monto solicitado válido.",
            "error"
        );

        return false;
    }

    if (
        !solicitud.plazoMeses ||
        solicitud.plazoMeses <= 0
    ) {

        mostrarMensaje(
            "Ingrese un plazo válido.",
            "error"
        );

        return false;
    }

    if (
        solicitud.tasaInteres === null ||
        solicitud.tasaInteres < 0
    ) {

        mostrarMensaje(
            "Ingrese una tasa de interés válida.",
            "error"
        );

        return false;
    }

    if (!solicitud.fechaSolicitud) {

        mostrarMensaje(
            "Ingrese la fecha de solicitud.",
            "error"
        );

        return false;
    }

    return true;
}

function limpiarFormulario(
    limpiarMensajeActual = true
) {

    formSolicitud.reset();

    establecerFechaActual();

    if (limpiarMensajeActual) {
        limpiarMensaje();
    }

    document
        .getElementById("idCliente")
        .focus();
}

function establecerFechaActual() {

    const fechaSolicitud =
        document.getElementById("fechaSolicitud");

    const fechaActual =
        new Date();

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

    fechaSolicitud.value =
        `${anio}-${mes}-${dia}`;
}

function obtenerNombreCliente(cliente) {

    return [
        cliente.primerNombre,
        cliente.segundoNombre,
        cliente.tercerNombre,
        cliente.primerApellido,
        cliente.segundoApellido,
        cliente.apellidoCasada
    ]
        .filter(valor =>
            valor !== null &&
            valor !== undefined &&
            String(valor).trim() !== ""
        )
        .join(" ");
}

function obtenerEstadoSolicitud(idEstado) {

    switch (Number(idEstado)) {

        case 1:
            return "Pendiente";

        case 2:
            return "Aprobada";

        case 3:
            return "Rechazada";

        default:
            return idEstado ?? "";
    }
}

function obtenerClaseEstado(idEstado) {

    switch (Number(idEstado)) {

        case 1:
            return "estado-pendiente";

        case 2:
            return "estado-aprobada";

        case 3:
            return "estado-rechazada";

        default:
            return "";
    }
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

    const partes =
        fecha.split("-");

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

    mensajeSolicitud.textContent =
        texto;

    mensajeSolicitud.className =
        `mensaje ${tipo}`;
}

function limpiarMensaje() {

    mensajeSolicitud.textContent = "";

    mensajeSolicitud.className =
        "mensaje";
}

function deshabilitarFormulario(deshabilitar) {

    document
        .getElementById("btnGuardarSolicitud")
        .disabled = deshabilitar;

    btnNuevaSolicitud.disabled =
        deshabilitar;
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