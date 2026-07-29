package gt.chn.prestamos.service;

import gt.chn.prestamos.entity.PlanPago;
import gt.chn.prestamos.entity.SolicitudPrestamo;
import gt.chn.prestamos.repository.PlanPagoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class PlanPagoService {

    private static final String USUARIO_SISTEMA = "ADMIN";
    private static final String ESTADO_PENDIENTE = "PENDIENTE";

    private final PlanPagoRepository planPagoRepository;

    public PlanPagoService(PlanPagoRepository planPagoRepository) {
        this.planPagoRepository = planPagoRepository;
    }

    public List<PlanPago> obtenerTodos() {
        return planPagoRepository.findAll();
    }

    public PlanPago obtenerPorId(Integer idPlanPago) {
        return planPagoRepository.findById(idPlanPago)
                .orElseThrow(() ->
                        new RuntimeException(
                                "No se encontró el plan de pago con id: " + idPlanPago
                        )
                );
    }

    public List<PlanPago> obtenerPorSolicitud(Integer idSolicitud) {
        return planPagoRepository.findByIdSolicitud(idSolicitud);
    }

    @Transactional
    public List<PlanPago> generarPlanPagos(SolicitudPrestamo solicitud) {

        validarSolicitud(solicitud);

        List<PlanPago> cuotasExistentes =
                planPagoRepository.findByIdSolicitud(solicitud.getIdSolicitud());

        if (!cuotasExistentes.isEmpty()) {
            planPagoRepository.deleteAll(cuotasExistentes);
            planPagoRepository.flush();
        }

        BigDecimal saldoCapital =
                solicitud.getMontoAprobado()
                        .setScale(2, RoundingMode.HALF_UP);

        BigDecimal tasaMensual =
                solicitud.getTasaInteres()
                        .divide(
                                BigDecimal.valueOf(1200),
                                10,
                                RoundingMode.HALF_UP
                        );

        BigDecimal cuotaMensual =
                solicitud.getCuotaMensual()
                        .setScale(2, RoundingMode.HALF_UP);

        LocalDate fechaPrimeraCuota =
                solicitud.getFechaDesembolso().plusMonths(1);

        for (int numeroCuota = 1;
             numeroCuota <= solicitud.getPlazoMeses();
             numeroCuota++) {

            BigDecimal montoInteres =
                    saldoCapital.multiply(tasaMensual)
                            .setScale(2, RoundingMode.HALF_UP);

            BigDecimal montoCapital =
                    cuotaMensual.subtract(montoInteres)
                            .setScale(2, RoundingMode.HALF_UP);

            // Ajuste de la última cuota por redondeo
            if (numeroCuota == solicitud.getPlazoMeses()) {
                montoCapital = saldoCapital;

                cuotaMensual = montoCapital
                        .add(montoInteres)
                        .setScale(2, RoundingMode.HALF_UP);
            }

            BigDecimal nuevoSaldo =
                    saldoCapital.subtract(montoCapital)
                            .setScale(2, RoundingMode.HALF_UP);

            if (nuevoSaldo.compareTo(BigDecimal.ZERO) < 0) {
                nuevoSaldo = BigDecimal.ZERO;
            }

            PlanPago planPago = new PlanPago();

            planPago.setIdSolicitud(solicitud.getIdSolicitud());
            planPago.setNumeroCuota(numeroCuota);
            planPago.setFechaVencimiento(
                    fechaPrimeraCuota.plusMonths(numeroCuota - 1L)
            );
            planPago.setMontoCapital(montoCapital);
            planPago.setMontoInteres(montoInteres);
            planPago.setMontoCuota(cuotaMensual);

            // El saldo inicial de cada cuota es el monto de la cuota.
            // Este saldo irá disminuyendo conforme se registren pagos.
            planPago.setSaldoCuota(cuotaMensual);

            planPago.setEstadoCuota(ESTADO_PENDIENTE);
            planPago.setUsuarioCrea(USUARIO_SISTEMA);

            planPagoRepository.save(planPago);

            saldoCapital = nuevoSaldo;
        }

        return planPagoRepository.findByIdSolicitud(solicitud.getIdSolicitud());
    }

    private void validarSolicitud(SolicitudPrestamo solicitud) {

        if (solicitud == null) {
            throw new IllegalArgumentException("La solicitud no puede ser nula");
        }

        if (solicitud.getIdSolicitud() == null) {
            throw new IllegalArgumentException("La solicitud debe estar guardada");
        }

        if (solicitud.getMontoAprobado() == null ||
                solicitud.getMontoAprobado().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto aprobado debe ser mayor que cero");
        }

        if (solicitud.getPlazoMeses() == null ||
                solicitud.getPlazoMeses() <= 0) {
            throw new IllegalArgumentException("El plazo debe ser mayor que cero");
        }

        if (solicitud.getTasaInteres() == null ||
                solicitud.getTasaInteres().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("La tasa de interés no puede ser negativa");
        }

        if (solicitud.getCuotaMensual() == null) {
            throw new IllegalArgumentException("La solicitud no tiene una cuota mensual calculada");
        }

        if (solicitud.getFechaDesembolso() == null) {
            throw new IllegalArgumentException("La solicitud no tiene fecha de desembolso");
        }
    }
}