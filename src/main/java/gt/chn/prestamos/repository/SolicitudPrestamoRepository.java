package gt.chn.prestamos.repository;

import gt.chn.prestamos.entity.SolicitudPrestamo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolicitudPrestamoRepository
        extends JpaRepository<SolicitudPrestamo, Integer> {

    List<SolicitudPrestamo> findByIdCliente(Integer idCliente);

    List<SolicitudPrestamo> findByIdEstadoSolicitud(Integer idEstadoSolicitud);

    List<SolicitudPrestamo> findByIdClienteAndIdEstadoSolicitud(
            Integer idCliente,
            Integer idEstadoSolicitud
    );
}
