const URL_CLIENTES = "/clientes";

const formCliente = document.getElementById("formCliente");
const btnNuevo = document.getElementById("btnNuevo");
const btnCancelar = document.getElementById("btnCancelar");
const btnBuscarCliente = document.getElementById("btnBuscarCliente");
const btnMostrarTodos = document.getElementById("btnMostrarTodos");
const buscarIdCliente = document.getElementById("buscarIdCliente");
const mensajeCliente = document.getElementById("mensajeCliente");

document.addEventListener("DOMContentLoaded", cargarClientes);

formCliente.addEventListener("submit", guardarCliente);
btnNuevo.addEventListener("click", limpiarFormulario);
btnCancelar.addEventListener("click", limpiarFormulario);
btnBuscarCliente.addEventListener("click", buscarClientePorId);
btnMostrarTodos.addEventListener("click", cargarClientes);

buscarIdCliente.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        evento.preventDefault();
        buscarClientePorId();
    }
});

async function cargarClientes() {

    limpiarMensaje();

    try {

        const respuesta = await fetch(URL_CLIENTES);

        if (!respuesta.ok) {
            throw new Error(
                await obtenerMensajeError(
                    respuesta,
                    "No fue posible consultar los clientes."
                )
            );
        }

        const clientes = await respuesta.json();

        mostrarClientes(clientes);

    } catch (error) {

        mostrarMensaje(error.message, "error");
        mostrarClientes([]);
    }
}

async function guardarCliente(evento) {

    evento.preventDefault();
    limpiarMensaje();

    const idCliente = document.getElementById("idCliente").value.trim();
    const cliente = obtenerDatosFormulario();

    if (!validarCliente(cliente)) {
        return;
    }

    const esModificacion = idCliente !== "";
    const url = esModificacion
        ? `${URL_CLIENTES}/${idCliente}`
        : URL_CLIENTES;

    const metodo = esModificacion ? "PUT" : "POST";

    /*
     * El POST recibe ClienteDTO.
     * El PUT recibe la entidad Cliente.
     */
    if (esModificacion) {
        cliente.idCliente = Number(idCliente);
    }

    try {

        deshabilitarFormulario(true);

        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cliente)
        });

        if (!respuesta.ok) {
            throw new Error(
                await obtenerMensajeError(
                    respuesta,
                    esModificacion
                        ? "No fue posible modificar el cliente."
                        : "No fue posible registrar el cliente."
                )
            );
        }

        mostrarMensaje(
            esModificacion
                ? "Cliente modificado correctamente."
                : "Cliente registrado correctamente.",
            "exito"
        );

        limpiarFormulario(false);
        await cargarClientes();

    } catch (error) {

        mostrarMensaje(error.message, "error");

    } finally {

        deshabilitarFormulario(false);
    }
}

async function buscarClientePorId() {

    const id = buscarIdCliente.value.trim();

    limpiarMensaje();

    if (id === "" || Number(id) <= 0) {
        mostrarMensaje("Ingrese un ID de cliente válido.", "error");
        return;
    }

    try {

        const respuesta = await fetch(`${URL_CLIENTES}/${id}`);

        if (!respuesta.ok) {
            throw new Error(
                await obtenerMensajeError(
                    respuesta,
                    "Cliente no encontrado."
                )
            );
        }

        const cliente = await respuesta.json();

        mostrarClientes([cliente]);

    } catch (error) {

        mostrarMensaje(error.message, "error");
        mostrarClientes([]);
    }
}

function mostrarClientes(clientes) {

    const tabla = document.getElementById("tablaClientes");

    tabla.innerHTML = "";

    if (!Array.isArray(clientes) || clientes.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="8">
                    No hay clientes para mostrar
                </td>
            </tr>
        `;

        return;
    }

    clientes.forEach(cliente => {

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${cliente.idCliente ?? ""}</td>

            <td>${obtenerNombreCompleto(cliente)}</td>

            <td>${cliente.numeroIdentificacion ?? ""}</td>

            <td>${formatearFecha(cliente.fechaNacimiento)}</td>

            <td>${cliente.telefono ?? ""}</td>

            <td>${cliente.correo ?? ""}</td>

            <td>${obtenerEstado(cliente.idEstado)}</td>

            <td>
                <button
                    type="button"
                    class="btn-editar"
                    data-id="${cliente.idCliente}">
                    Editar
                </button>

                <button
                    type="button"
                    class="btn-eliminar"
                    data-id="${cliente.idCliente}">
                    Eliminar
                </button>
            </td>
        `;

        tabla.appendChild(fila);
    });

    agregarEventosTabla();
}

function agregarEventosTabla() {

    document.querySelectorAll(".btn-editar").forEach(boton => {

        boton.addEventListener("click", function () {
            cargarClienteEnFormulario(this.dataset.id);
        });
    });

    document.querySelectorAll(".btn-eliminar").forEach(boton => {

        boton.addEventListener("click", function () {
            eliminarCliente(this.dataset.id);
        });
    });
}

async function cargarClienteEnFormulario(idCliente) {

    limpiarMensaje();

    try {

        const respuesta = await fetch(
            `${URL_CLIENTES}/${idCliente}`
        );

        if (!respuesta.ok) {
            throw new Error(
                await obtenerMensajeError(
                    respuesta,
                    "No fue posible obtener el cliente."
                )
            );
        }

        const cliente = await respuesta.json();

        document.getElementById("idCliente").value =
            cliente.idCliente ?? "";

        document.getElementById("primerNombre").value =
            cliente.primerNombre ?? "";

        document.getElementById("segundoNombre").value =
            cliente.segundoNombre ?? "";

        document.getElementById("tercerNombre").value =
            cliente.tercerNombre ?? "";

        document.getElementById("primerApellido").value =
            cliente.primerApellido ?? "";

        document.getElementById("segundoApellido").value =
            cliente.segundoApellido ?? "";

        document.getElementById("apellidoCasada").value =
            cliente.apellidoCasada ?? "";

        document.getElementById("numeroIdentificacion").value =
            cliente.numeroIdentificacion ?? "";

        document.getElementById("fechaNacimiento").value =
            cliente.fechaNacimiento ?? "";

        document.getElementById("direccion").value =
            cliente.direccion ?? "";

        document.getElementById("correo").value =
            cliente.correo ?? "";

        document.getElementById("telefono").value =
            cliente.telefono ?? "";

        document.getElementById("idEstado").value =
            cliente.idEstado ?? 1;

        document.getElementById("btnGuardar").textContent =
            "Modificar cliente";

        btnCancelar.classList.remove("oculto");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        mostrarMensaje(error.message, "error");
    }
}

async function eliminarCliente(idCliente) {

    const confirmar = window.confirm(
        `¿Está seguro de eliminar el cliente ${idCliente}?`
    );

    if (!confirmar) {
        return;
    }

    limpiarMensaje();

    try {

        const respuesta = await fetch(
            `${URL_CLIENTES}/${idCliente}`,
            {
                method: "DELETE"
            }
        );

        if (!respuesta.ok) {
            throw new Error(
                await obtenerMensajeError(
                    respuesta,
                    "No fue posible eliminar el cliente."
                )
            );
        }

        mostrarMensaje(
            "Cliente eliminado correctamente.",
            "exito"
        );

        limpiarFormulario(false);
        await cargarClientes();

    } catch (error) {

        mostrarMensaje(error.message, "error");
    }
}

function obtenerDatosFormulario() {

    return {
        primerNombre: obtenerValor("primerNombre"),
        segundoNombre: obtenerValorONull("segundoNombre"),
        tercerNombre: obtenerValorONull("tercerNombre"),
        primerApellido: obtenerValor("primerApellido"),
        segundoApellido: obtenerValorONull("segundoApellido"),
        apellidoCasada: obtenerValorONull("apellidoCasada"),
        numeroIdentificacion: obtenerValor("numeroIdentificacion"),
        fechaNacimiento: obtenerValor("fechaNacimiento"),
        direccion: obtenerValor("direccion"),
        correo: obtenerValorONull("correo"),
        telefono: obtenerValor("telefono"),
        idEstado: Number(document.getElementById("idEstado").value)
    };
}

function validarCliente(cliente) {

    if (cliente.primerNombre === "") {
        mostrarMensaje("Ingrese el primer nombre.", "error");
        return false;
    }

    if (cliente.primerApellido === "") {
        mostrarMensaje("Ingrese el primer apellido.", "error");
        return false;
    }

    if (cliente.numeroIdentificacion === "") {
        mostrarMensaje(
            "Ingrese el número de identificación.",
            "error"
        );
        return false;
    }

    if (cliente.fechaNacimiento === "") {
        mostrarMensaje(
            "Ingrese la fecha de nacimiento.",
            "error"
        );
        return false;
    }

    if (cliente.direccion === "") {
        mostrarMensaje("Ingrese la dirección.", "error");
        return false;
    }

    if (cliente.telefono === "") {
        mostrarMensaje("Ingrese el teléfono.", "error");
        return false;
    }

    if (
        cliente.correo !== null &&
        !validarCorreo(cliente.correo)
    ) {
        mostrarMensaje(
            "Ingrese un correo electrónico válido.",
            "error"
        );
        return false;
    }

    return true;
}

function limpiarFormulario(limpiarMensajeActual = true) {

    formCliente.reset();

    document.getElementById("idCliente").value = "";
    document.getElementById("idEstado").value = "1";
    document.getElementById("btnGuardar").textContent =
        "Guardar cliente";

    btnCancelar.classList.add("oculto");

    if (limpiarMensajeActual) {
        limpiarMensaje();
    }

    document.getElementById("primerNombre").focus();
}

function obtenerNombreCompleto(cliente) {

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

function obtenerEstado(idEstado) {

    switch (Number(idEstado)) {
        case 1:
            return "Activo";
        case 2:
            return "Inactivo";
        default:
            return idEstado ?? "";
    }
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

function validarCorreo(correo) {

    const expresion =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return expresion.test(correo);
}

function obtenerValor(idElemento) {

    return document.getElementById(idElemento).value.trim();
}

function obtenerValorONull(idElemento) {

    const valor = obtenerValor(idElemento);

    return valor === "" ? null : valor;
}

function mostrarMensaje(texto, tipo) {

    mensajeCliente.textContent = texto;
    mensajeCliente.className = `mensaje ${tipo}`;
}

function limpiarMensaje() {

    mensajeCliente.textContent = "";
    mensajeCliente.className = "mensaje";
}

function deshabilitarFormulario(deshabilitar) {

    document.getElementById("btnGuardar").disabled = deshabilitar;
    btnNuevo.disabled = deshabilitar;
    btnCancelar.disabled = deshabilitar;
}

async function obtenerMensajeError(respuesta, mensajePredeterminado) {

    try {

        const tipoContenido =
            respuesta.headers.get("content-type") ?? "";

        if (tipoContenido.includes("application/json")) {

            const error = await respuesta.json();

            return error.message ||
                error.mensaje ||
                error.error ||
                mensajePredeterminado;
        }

        const texto = await respuesta.text();

        return texto.trim() !== ""
            ? texto
            : mensajePredeterminado;

    } catch {

        return mensajePredeterminado;
    }
}