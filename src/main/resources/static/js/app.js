const btnConsultar = document.getElementById("btnConsultar");

btnConsultar.addEventListener("click", consultarSolicitud);

async function consultarSolicitud() {

    const id = document.getElementById("idSolicitud").value.trim();
    const mensaje = document.getElementById("mensaje");

    if (id === "") {
        mensaje.innerHTML = "Ingrese el Id de la solicitud";
        return;
    }

    mensaje.innerHTML = "";

    document.getElementById("datosSolicitud")
        .classList.add("oculto");

    document.getElementById("seccionPlanPagos")
        .classList.add("oculto");

    try {

        const urlSolicitud = `/solicitudes/${id}`;

        const respuestaSolicitud = await fetch(urlSolicitud);

        if (!respuestaSolicitud.ok) {

            const detalle = await respuestaSolicitud.text();

            throw new Error(
                `Error ${respuestaSolicitud.status} al consultar la solicitud. ${detalle}`
            );
        }

        const solicitud = await respuestaSolicitud.json();

        mostrarSolicitud(solicitud);

        const urlPlan = `/api/planpagos/solicitud/${id}`;

        const respuestaPlan = await fetch(urlPlan);

        let planPagos = [];

        if (respuestaPlan.ok) {
            planPagos = await respuestaPlan.json();
        }

        if (planPagos.length > 0) {

            mensaje.innerHTML = "";
            mostrarPlanPagos(planPagos);

        } else {

            mensaje.innerHTML =
                "La solicitud existe, pero aún no tiene un plan de pagos generado.";

            document.getElementById("seccionPlanPagos")
                .classList.add("oculto");
        }

    } catch (error) {

        mensaje.innerHTML = error.message;

        document.getElementById("datosSolicitud")
            .classList.add("oculto");

        document.getElementById("seccionPlanPagos")
            .classList.add("oculto");
    }
}

function mostrarSolicitud(solicitud) {

    document.getElementById("datosSolicitud")
        .classList.remove("oculto");

    document.getElementById("datoIdSolicitud").textContent =
        solicitud.idSolicitud ?? "";

    document.getElementById("datoIdCliente").textContent =
        solicitud.idCliente ?? "";

    document.getElementById("datoMontoSolicitado").textContent =
        formatearMoneda(solicitud.montoSolicitado);

    document.getElementById("datoMontoAprobado").textContent =
        formatearMoneda(solicitud.montoAprobado);

    document.getElementById("datoPlazoMeses").textContent =
        `${solicitud.plazoMeses ?? 0} meses`;

    document.getElementById("datoTasaInteres").textContent =
        `${solicitud.tasaInteres ?? 0} %`;

    document.getElementById("datoCuotaMensual").textContent =
        formatearMoneda(solicitud.cuotaMensual);

    document.getElementById("datoFechaDesembolso").textContent =
        solicitud.fechaDesembolso ?? "";

    document.getElementById("datoEstadoSolicitud").textContent =
        obtenerEstadoSolicitud(solicitud.idEstadoSolicitud);
}

function mostrarPlanPagos(planPagos) {

    document.getElementById("seccionPlanPagos")
        .classList.remove("oculto");

    const tabla = document.getElementById("tablaPlanPagos");

    tabla.innerHTML = "";

    planPagos.forEach(cuota => {

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <tr>
                <td>${cuota.numeroCuota}</td>
                <td>${cuota.fechaVencimiento}</td>
                <td>${formatearMoneda(cuota.montoCapital)}</td>
                <td>${formatearMoneda(cuota.montoInteres)}</td>
                <td>${formatearMoneda(cuota.montoCuota)}</td>
                <td>${formatearMoneda(cuota.saldoCuota)}</td>
                <td>${cuota.estadoCuota}</td>
            </tr>
        `;

        tabla.appendChild(fila);
    });
}

function formatearMoneda(valor) {

    return Number(valor ?? 0).toLocaleString(
        "es-GT",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}

function obtenerEstadoSolicitud(idEstado) {

    switch (idEstado) {
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