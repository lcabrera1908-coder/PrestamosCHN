package gt.chn.prestamos.service;

import gt.chn.prestamos.dto.AprobacionSolicitudDTO;
import gt.chn.prestamos.dto.SolicitudPrestamoDTO;
import gt.chn.prestamos.entity.SolicitudPrestamo;
import gt.chn.prestamos.repository.SolicitudPrestamoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SolicitudPrestamoService {

    private final SolicitudPrestamoRepository repository;
    private final PlanPagoService planPagoService;

    public SolicitudPrestamoService(
            SolicitudPrestamoRepository repository,
            PlanPagoService planPagoService) {

        this.repository = repository;
        this.planPagoService = planPagoService;
    }

    public List<SolicitudPrestamo> obtenerTodos() {
        return repository.findAll();
    }

    public SolicitudPrestamo obtenerPorId(Integer id) {

        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Solicitud no encontrada"));
    }

    public SolicitudPrestamo guardar(SolicitudPrestamoDTO dto) {

        SolicitudPrestamo solicitud = new SolicitudPrestamo();

        solicitud.setIdCliente(dto.getIdCliente());
        solicitud.setMontoSolicitado(dto.getMontoSolicitado());
        solicitud.setMontoAprobado(dto.getMontoAprobado());
        solicitud.setPlazoMeses(dto.getPlazoMeses());
        solicitud.setTasaInteres(dto.getTasaInteres());
        solicitud.setFechaSolicitud(dto.getFechaSolicitud());
        solicitud.setFechaDesembolso(dto.getFechaDesembolso());
        solicitud.setFechaResolucion(dto.getFechaResolucion());
        solicitud.setIdEstadoSolicitud(dto.getIdEstadoSolicitud());
        solicitud.setCuotaMensual(dto.getCuotaMensual());
        solicitud.setObservaciones(dto.getObservaciones());

        solicitud.setUsuarioCrea("ADMIN");

        return repository.save(solicitud);
    }

    public SolicitudPrestamo actualizar(
            Integer id,
            SolicitudPrestamo solicitudActualizada) {

        SolicitudPrestamo solicitud = obtenerPorId(id);

        solicitud.setIdCliente(solicitudActualizada.getIdCliente());
        solicitud.setMontoSolicitado(solicitudActualizada.getMontoSolicitado());
        solicitud.setMontoAprobado(solicitudActualizada.getMontoAprobado());
        solicitud.setPlazoMeses(solicitudActualizada.getPlazoMeses());
        solicitud.setTasaInteres(solicitudActualizada.getTasaInteres());
        solicitud.setFechaSolicitud(solicitudActualizada.getFechaSolicitud());
        solicitud.setFechaDesembolso(solicitudActualizada.getFechaDesembolso());
        solicitud.setFechaResolucion(solicitudActualizada.getFechaResolucion());
        solicitud.setIdEstadoSolicitud(solicitudActualizada.getIdEstadoSolicitud());
        solicitud.setCuotaMensual(solicitudActualizada.getCuotaMensual());
        solicitud.setObservaciones(solicitudActualizada.getObservaciones());

        solicitud.setUsuarioActualiza("ADMIN");
        solicitud.setFechaActualiza(LocalDateTime.now());

        return repository.save(solicitud);
    }

    @Transactional
    public SolicitudPrestamo aprobarSolicitud(
            Integer id,
            AprobacionSolicitudDTO dto) {

        SolicitudPrestamo solicitud = obtenerPorId(id);

        validarDatosAprobacion(dto);

        BigDecimal cuotaMensual = calcularCuotaMensual(
                dto.getMontoAprobado(),
                dto.getTasaInteres(),
                dto.getPlazoMeses()
        );

        solicitud.setMontoAprobado(dto.getMontoAprobado());
        solicitud.setPlazoMeses(dto.getPlazoMeses());
        solicitud.setTasaInteres(dto.getTasaInteres());
        solicitud.setFechaDesembolso(dto.getFechaDesembolso());
        solicitud.setFechaResolucion(LocalDate.now());

        // Estado 2 = Aprobada
        solicitud.setIdEstadoSolicitud(2);

        solicitud.setCuotaMensual(cuotaMensual);
        solicitud.setObservaciones(dto.getObservaciones());

        solicitud.setUsuarioActualiza("ADMIN");
        solicitud.setFechaActualiza(LocalDateTime.now());

        SolicitudPrestamo solicitudGuardada =
                repository.save(solicitud);

        planPagoService.generarPlanPagos(solicitudGuardada);

        return solicitudGuardada;
    }

    public SolicitudPrestamo rechazarSolicitud(
            Integer id,
            AprobacionSolicitudDTO dto) {

        SolicitudPrestamo solicitud = obtenerPorId(id);

        solicitud.setFechaResolucion(LocalDate.now());

        // Estado 3 = Rechazada
        solicitud.setIdEstadoSolicitud(3);

        solicitud.setObservaciones(dto.getObservaciones());

        solicitud.setUsuarioActualiza("ADMIN");
        solicitud.setFechaActualiza(LocalDateTime.now());

        return repository.save(solicitud);
    }

    public void eliminar(Integer id) {

        SolicitudPrestamo solicitud = obtenerPorId(id);

        repository.delete(solicitud);
    }

    private BigDecimal calcularCuotaMensual(
            BigDecimal montoAprobado,
            BigDecimal tasaInteresAnual,
            Integer plazoMeses) {

        double monto = montoAprobado.doubleValue();
        double tasaAnual = tasaInteresAnual.doubleValue();

        if (tasaAnual == 0) {
            return montoAprobado
                    .divide(
                            BigDecimal.valueOf(plazoMeses),
                            2,
                            RoundingMode.HALF_UP
                    );
        }

        double tasaMensual = tasaAnual / 12 / 100;

        double cuota = monto
                * tasaMensual
                / (1 - Math.pow(1 + tasaMensual, -plazoMeses));

        return BigDecimal.valueOf(cuota)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private void validarDatosAprobacion(AprobacionSolicitudDTO dto) {

        if (dto.getMontoAprobado() == null
                || dto.getMontoAprobado().compareTo(BigDecimal.ZERO) <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El monto aprobado debe ser mayor que cero");
        }

        if (dto.getPlazoMeses() == null || dto.getPlazoMeses() <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El plazo en meses debe ser mayor que cero");
        }

        if (dto.getTasaInteres() == null
                || dto.getTasaInteres().compareTo(BigDecimal.ZERO) < 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La tasa de interés no puede ser negativa");
        }

        if (dto.getFechaDesembolso() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha de desembolso es obligatoria");
        }
    }
}