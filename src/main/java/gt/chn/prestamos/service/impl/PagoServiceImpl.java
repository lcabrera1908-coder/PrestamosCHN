package gt.chn.prestamos.service.impl;

import gt.chn.prestamos.dto.PagoDTO;
import gt.chn.prestamos.entity.DetallePago;
import gt.chn.prestamos.entity.Pago;
import gt.chn.prestamos.entity.PlanPago;
import gt.chn.prestamos.repository.DetallePagoRepository;
import gt.chn.prestamos.repository.PagoRepository;
import gt.chn.prestamos.repository.PlanPagoRepository;
import gt.chn.prestamos.service.PagoService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PagoServiceImpl implements PagoService {

    private static final String USUARIO_SISTEMA = "ADMIN";
    private static final String ESTADO_APLICADO = "APLICADO";
    private static final String ESTADO_PAGADA = "PAGADA";
    private static final String ESTADO_PARCIAL = "PARCIAL";

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private PlanPagoRepository planPagoRepository;

    @Autowired
    private DetallePagoRepository detallePagoRepository;

    @Override
    public List<PagoDTO> listar() {

        List<Pago> pagos = pagoRepository.findAll();

        return pagos.stream().map(pago -> {
            PagoDTO dto = new PagoDTO();
            dto.setIdPago(pago.getIdPago());
            dto.setIdSolicitud(pago.getIdSolicitud());
            dto.setFechaPago(pago.getFechaPago());
            dto.setMontoPago(pago.getMontoPago());
            dto.setNumeroComprobante(pago.getNumeroComprobante());
            dto.setEstadoPago(pago.getEstadoPago());
            dto.setObservaciones(pago.getObservaciones());
            return dto;
        }).toList();
    }

    @Override
    public PagoDTO obtenerPorId(Integer idPago) {

        Optional<Pago> optional = pagoRepository.findById(idPago);

        if (optional.isEmpty()) {
            return null;
        }

        Pago pago = optional.get();

        PagoDTO dto = new PagoDTO();
        dto.setIdPago(pago.getIdPago());
        dto.setIdSolicitud(pago.getIdSolicitud());
        dto.setFechaPago(pago.getFechaPago());
        dto.setMontoPago(pago.getMontoPago());
        dto.setNumeroComprobante(pago.getNumeroComprobante());
        dto.setEstadoPago(pago.getEstadoPago());
        dto.setObservaciones(pago.getObservaciones());

        return dto;
    }

    @Override
    public List<PagoDTO> listarPorSolicitud(Integer idSolicitud) {

        List<Pago> pagos =
                pagoRepository.findByIdSolicitudOrderByFechaPagoAsc(idSolicitud);

        return pagos.stream().map(pago -> {
            PagoDTO dto = new PagoDTO();
            dto.setIdPago(pago.getIdPago());
            dto.setIdSolicitud(pago.getIdSolicitud());
            dto.setFechaPago(pago.getFechaPago());
            dto.setMontoPago(pago.getMontoPago());
            dto.setNumeroComprobante(pago.getNumeroComprobante());
            dto.setEstadoPago(pago.getEstadoPago());
            dto.setObservaciones(pago.getObservaciones());
            return dto;
        }).toList();
    }

    @Override
    @Transactional
    public PagoDTO registrar(PagoDTO pagoDTO) {

        // ==========================
        // Validaciones
        // ==========================

        if (pagoDTO.getMontoPago() == null ||
                pagoDTO.getMontoPago().compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "El monto del pago debe ser mayor que cero.");
        }

        // ==========================
        // Registrar el pago
        // ==========================

        Pago pago = new Pago();
        pago.setIdSolicitud(pagoDTO.getIdSolicitud());
        pago.setFechaPago(pagoDTO.getFechaPago());
        pago.setMontoPago(pagoDTO.getMontoPago());
        pago.setNumeroComprobante(pagoDTO.getNumeroComprobante());
        pago.setEstadoPago(ESTADO_APLICADO);
        pago.setObservaciones(pagoDTO.getObservaciones());
        pago.setUsuarioCrea(USUARIO_SISTEMA);
        pago.setFechaCrea(LocalDateTime.now());

        pago = pagoRepository.save(pago);

        // Devolver el ID generado

        pagoDTO.setIdPago(pago.getIdPago());
        pagoDTO.setEstadoPago(pago.getEstadoPago());

        // ==========================
        // Monto disponible
        // ==========================

        BigDecimal montoDisponible = pagoDTO.getMontoPago();

        // ==========================
        // Obtener cuotas pendientes
        // ==========================

        List<PlanPago> cuotasPendientes =
                planPagoRepository
                        .findByIdSolicitudAndSaldoCuotaGreaterThanOrderByNumeroCuotaAsc(
                                pagoDTO.getIdSolicitud(),
                                BigDecimal.ZERO);

        // ==========================
        // Aplicar el pago
        // ==========================

        for (PlanPago cuota : cuotasPendientes) {

            if (montoDisponible.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }

            BigDecimal saldoPendiente = cuota.getSaldoCuota();

            BigDecimal montoAplicado;

            if (montoDisponible.compareTo(saldoPendiente) >= 0) {

                // Pago completo

                montoAplicado = saldoPendiente;

                cuota.setSaldoCuota(BigDecimal.ZERO);
                cuota.setEstadoCuota(ESTADO_PAGADA);

                montoDisponible = montoDisponible.subtract(montoAplicado);

            } else {

                // Pago parcial

                montoAplicado = montoDisponible;

                cuota.setSaldoCuota(
                        saldoPendiente.subtract(montoAplicado));

                cuota.setEstadoCuota(ESTADO_PARCIAL);

                montoDisponible = BigDecimal.ZERO;
            }

            // Guardar cuota actualizada

            planPagoRepository.save(cuota);

            // Registrar detalle

            DetallePago detalle = new DetallePago();
            detalle.setIdPago(pago.getIdPago());
            detalle.setIdPlanPago(cuota.getIdPlanPago());
            detalle.setMontoAplicado(montoAplicado);
            detalle.setUsuarioCrea(USUARIO_SISTEMA);
            detalle.setFechaCrea(LocalDateTime.now());

            detallePagoRepository.save(detalle);
        }

        return pagoDTO;
    }

}