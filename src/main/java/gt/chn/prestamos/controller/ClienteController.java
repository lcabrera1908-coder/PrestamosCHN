package gt.chn.prestamos.controller;

import gt.chn.prestamos.dto.ClienteDTO;
import gt.chn.prestamos.entity.Cliente;
import gt.chn.prestamos.service.ClienteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public List<Cliente> obtenerTodos() {
        return clienteService.obtenerTodos();
    }

    @PostMapping
    public Cliente crearCliente(@RequestBody ClienteDTO clienteDTO) {
        return clienteService.guardar(clienteDTO);
    }

    @GetMapping("/{id}")
    public Cliente obtenerPorId(@PathVariable Integer id) {
        return clienteService.obtenerPorId(id);
    }

    @PutMapping("/{id}")
    public Cliente actualizar(
            @PathVariable Integer id,
            @RequestBody Cliente cliente) {

        return clienteService.actualizar(id, cliente);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        clienteService.eliminar(id);
    }
}