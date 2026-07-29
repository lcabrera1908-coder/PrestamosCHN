package gt.chn.prestamos.controller;

import gt.chn.prestamos.dto.AprobacionSolicitudDTO;
import gt.chn.prestamos.dto.SolicitudPrestamoDTO;
import gt.chn.prestamos.entity.SolicitudPrestamo;
import gt.chn.prestamos.service.SolicitudPrestamoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/solicitudes")
public class SolicitudPrestamoController {

    private final SolicitudPrestamoService service;

    public SolicitudPrestamoController(SolicitudPrestamoService service) {
        this.service = service;
    }

    @GetMapping
    public List<SolicitudPrestamo> obtenerTodos() {
        return service.obtenerTodos();
    }

    @GetMapping("/{id}")
    public SolicitudPrestamo obtenerPorId(@PathVariable Integer id) {
        return service.obtenerPorId(id);
    }

    @PostMapping
    public SolicitudPrestamo guardar(@RequestBody SolicitudPrestamoDTO dto) {
        return service.guardar(dto);
    }

    @PutMapping("/{id}")
    public SolicitudPrestamo actualizar(
            @PathVariable Integer id,
            @RequestBody SolicitudPrestamo solicitud) {

        return service.actualizar(id, solicitud);
    }

    @PutMapping("/{id}/aprobar")
    public SolicitudPrestamo aprobarSolicitud(
            @PathVariable Integer id,
            @RequestBody AprobacionSolicitudDTO dto) {

        return service.aprobarSolicitud(id, dto);
    }

    @PutMapping("/{id}/rechazar")
    public SolicitudPrestamo rechazarSolicitud(
            @PathVariable Integer id,
            @RequestBody AprobacionSolicitudDTO dto) {

        return service.rechazarSolicitud(id, dto);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        service.eliminar(id);
    }
}