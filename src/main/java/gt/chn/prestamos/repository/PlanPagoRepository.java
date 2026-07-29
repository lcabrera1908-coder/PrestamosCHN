package gt.chn.prestamos.repository;

import gt.chn.prestamos.entity.PlanPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PlanPagoRepository extends JpaRepository<PlanPago, Integer> {

    // Obtener todas las cuotas de una solicitud
    List<PlanPago> findByIdSolicitud(Integer idSolicitud);

    // Obtener únicamente las cuotas con saldo pendiente
    List<PlanPago> findByIdSolicitudAndSaldoCuotaGreaterThanOrderByNumeroCuotaAsc(
            Integer idSolicitud,
            BigDecimal saldoCuota
    );

}