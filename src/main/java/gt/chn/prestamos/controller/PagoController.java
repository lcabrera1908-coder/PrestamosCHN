package gt.chn.prestamos.controller;

import gt.chn.prestamos.dto.PagoDTO;
import gt.chn.prestamos.service.PagoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "*")
public class PagoController {

    @Autowired
    private PagoService pagoService;

    @GetMapping
    public ResponseEntity<List<PagoDTO>> listar() {
        return ResponseEntity.ok(pagoService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagoDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(pagoService.obtenerPorId(id));
    }

    @GetMapping("/solicitud/{idSolicitud}")
    public ResponseEntity<List<PagoDTO>> listarPorSolicitud(@PathVariable Integer idSolicitud) {
        return ResponseEntity.ok(pagoService.listarPorSolicitud(idSolicitud));
    }

    @PostMapping
    public ResponseEntity<PagoDTO> registrar(@RequestBody PagoDTO pagoDTO) {
        return ResponseEntity.ok(pagoService.registrar(pagoDTO));
    }
}