package gt.chn.prestamos.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "DetallePagos")
public class DetallePago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdDetallePago")
    private Integer idDetallePago;

    @Column(name = "IdPago", nullable = false)
    private Integer idPago;

    @Column(name = "IdPlanPago", nullable = false)
    private Integer idPlanPago;

    @Column(name = "MontoAplicado", nullable = false)
    private BigDecimal montoAplicado;

    @Column(name = "UsuarioCrea", nullable = false)
    private String usuarioCrea;

    @Column(name = "FechaCrea", nullable = false)
    private LocalDateTime fechaCrea;

    public DetallePago() {
    }

    public Integer getIdDetallePago() {
        return idDetallePago;
    }

    public void setIdDetallePago(Integer idDetallePago) {
        this.idDetallePago = idDetallePago;
    }

    public Integer getIdPago() {
        return idPago;
    }

    public void setIdPago(Integer idPago) {
        this.idPago = idPago;
    }

    public Integer getIdPlanPago() {
        return idPlanPago;
    }

    public void setIdPlanPago(Integer idPlanPago) {
        this.idPlanPago = idPlanPago;
    }

    public BigDecimal getMontoAplicado() {
        return montoAplicado;
    }

    public void setMontoAplicado(BigDecimal montoAplicado) {
        this.montoAplicado = montoAplicado;
    }

    public String getUsuarioCrea() {
        return usuarioCrea;
    }

    public void setUsuarioCrea(String usuarioCrea) {
        this.usuarioCrea = usuarioCrea;
    }

    public LocalDateTime getFechaCrea() {
        return fechaCrea;
    }

    public void setFechaCrea(LocalDateTime fechaCrea) {
        this.fechaCrea = fechaCrea;
    }
}