package gt.chn.prestamos.service;

import gt.chn.prestamos.dto.PagoDTO;

import java.util.List;

public interface PagoService {

    List<PagoDTO> listar();

    PagoDTO obtenerPorId(Integer idPago);

    List<PagoDTO> listarPorSolicitud(Integer idSolicitud);

    PagoDTO registrar(PagoDTO pagoDTO);

}