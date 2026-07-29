package gt.chn.prestamos.repository;

import gt.chn.prestamos.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Integer> {

    List<Pago> findByIdSolicitudOrderByFechaPagoAsc(Integer idSolicitud);

}