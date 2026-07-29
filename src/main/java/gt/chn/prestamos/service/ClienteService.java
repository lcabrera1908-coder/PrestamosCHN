package gt.chn.prestamos.service;

import gt.chn.prestamos.dto.ClienteDTO;
import gt.chn.prestamos.entity.Cliente;
import gt.chn.prestamos.repository.ClienteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<Cliente> obtenerTodos() {
        return clienteRepository.findAll();
    }

    public Cliente obtenerPorId(Integer id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cliente no encontrado"
                ));
    }

    public Cliente guardar(ClienteDTO dto) {

        Cliente cliente = new Cliente();

        cliente.setPrimerNombre(dto.getPrimerNombre());
        cliente.setSegundoNombre(dto.getSegundoNombre());
        cliente.setTercerNombre(dto.getTercerNombre());
        cliente.setPrimerApellido(dto.getPrimerApellido());
        cliente.setSegundoApellido(dto.getSegundoApellido());
        cliente.setApellidoCasada(dto.getApellidoCasada());
        cliente.setNumeroIdentificacion(dto.getNumeroIdentificacion());
        cliente.setFechaNacimiento(dto.getFechaNacimiento());
        cliente.setDireccion(dto.getDireccion());
        cliente.setCorreo(dto.getCorreo());
        cliente.setTelefono(dto.getTelefono());
        cliente.setIdEstado(dto.getIdEstado());

        cliente.setUsuarioCrea("ADMIN");

        System.out.println("UsuarioCrea = " + cliente.getUsuarioCrea());

        return clienteRepository.save(cliente);
    }

    public Cliente actualizar(Integer id, Cliente clienteActualizado) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cliente no encontrado"
                ));

        cliente.setPrimerNombre(clienteActualizado.getPrimerNombre());
        cliente.setSegundoNombre(clienteActualizado.getSegundoNombre());
        cliente.setTercerNombre(clienteActualizado.getTercerNombre());
        cliente.setPrimerApellido(clienteActualizado.getPrimerApellido());
        cliente.setSegundoApellido(clienteActualizado.getSegundoApellido());
        cliente.setApellidoCasada(clienteActualizado.getApellidoCasada());
        cliente.setNumeroIdentificacion(clienteActualizado.getNumeroIdentificacion());
        cliente.setFechaNacimiento(clienteActualizado.getFechaNacimiento());
        cliente.setDireccion(clienteActualizado.getDireccion());
        cliente.setCorreo(clienteActualizado.getCorreo());
        cliente.setTelefono(clienteActualizado.getTelefono());
        cliente.setIdEstado(clienteActualizado.getIdEstado());

        cliente.setUsuarioActualiza("ADMIN");
        cliente.setFechaActualiza(LocalDateTime.now());

        return clienteRepository.save(cliente);
    }

    public void eliminar(Integer id) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cliente no encontrado"
                ));

        clienteRepository.delete(cliente);
    }
}