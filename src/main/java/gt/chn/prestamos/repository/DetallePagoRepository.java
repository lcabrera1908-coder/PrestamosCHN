package gt.chn.prestamos.repository;

import gt.chn.prestamos.entity.DetallePago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetallePagoRepository extends JpaRepository<DetallePago, Integer> {

    List<DetallePago> findByIdPago(Integer idPago);

    List<DetallePago> findByIdPlanPago(Integer idPlanPago);

}