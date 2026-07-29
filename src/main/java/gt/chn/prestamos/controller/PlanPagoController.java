package gt.chn.prestamos.controller;

import gt.chn.prestamos.entity.PlanPago;
import gt.chn.prestamos.service.PlanPagoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planpagos")
public class PlanPagoController {

    private final PlanPagoService planPagoService;

    public PlanPagoController(PlanPagoService planPagoService) {
        this.planPagoService = planPagoService;
    }

    @GetMapping
    public List<PlanPago> obtenerTodos() {
        return planPagoService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public PlanPago obtenerPorId(@PathVariable Integer id) {
        return planPagoService.obtenerPorId(id);
    }

    @GetMapping("/solicitud/{idSolicitud}")
    public List<PlanPago> obtenerPorSolicitud(
            @PathVariable Integer idSolicitud) {

        return planPagoService.obtenerPorSolicitud(idSolicitud);
    }
}