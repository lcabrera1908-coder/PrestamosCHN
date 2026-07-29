package gt.chn.prestamos.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "PlanPagos")
public class PlanPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdPlanPago")
    private Integer idPlanPago;

    @Column(name = "IdSolicitud", nullable = false)
    private Integer idSolicitud;

    @Column(name = "NumeroCuota", nullable = false)
    private Integer numeroCuota;

    @Column(name = "FechaVencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column(name = "MontoCapital", nullable = false, precision = 18, scale = 2)
    private BigDecimal montoCapital;

    @Column(name = "MontoInteres", nullable = false, precision = 18, scale = 2)
    private BigDecimal montoInteres;

    @Column(name = "MontoCuota", nullable = false, precision = 18, scale = 2)
    private BigDecimal montoCuota;

    @Column(name = "SaldoCuota", nullable = false, precision = 18, scale = 2)
    private BigDecimal saldoCuota;

    @Column(name = "EstadoCuota", nullable = false, length = 20)
    private String estadoCuota;

    @Column(name = "UsuarioCrea", nullable = false, length = 50)
    private String usuarioCrea;

    @Column(
            name = "FechaCrea",
            nullable = false,
            insertable = false,
            updatable = false
    )
    private LocalDateTime fechaCrea;

    @Column(name = "UsuarioActualiza", length = 50)
    private String usuarioActualiza;

    @Column(name = "FechaActualiza")
    private LocalDateTime fechaActualiza;

    public PlanPago() {
    }

    public Integer getIdPlanPago() {
        return idPlanPago;
    }

    public void setIdPlanPago(Integer idPlanPago) {
        this.idPlanPago = idPlanPago;
    }

    public Integer getIdSolicitud() {
        return idSolicitud;
    }

    public void setIdSolicitud(Integer idSolicitud) {
        this.idSolicitud = idSolicitud;
    }

    public Integer getNumeroCuota() {
        return numeroCuota;
    }

    public void setNumeroCuota(Integer numeroCuota) {
        this.numeroCuota = numeroCuota;
    }

    public LocalDate getFechaVencimiento() {
        return fechaVencimiento;
    }

    public void setFechaVencimiento(LocalDate fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }

    public BigDecimal getMontoCapital() {
        return montoCapital;
    }

    public void setMontoCapital(BigDecimal montoCapital) {
        this.montoCapital = montoCapital;
    }

    public BigDecimal getMontoInteres() {
        return montoInteres;
    }

    public void setMontoInteres(BigDecimal montoInteres) {
        this.montoInteres = montoInteres;
    }

    public BigDecimal getMontoCuota() {
        return montoCuota;
    }

    public void setMontoCuota(BigDecimal montoCuota) {
        this.montoCuota = montoCuota;
    }

    public BigDecimal getSaldoCuota() {
        return saldoCuota;
    }

    public void setSaldoCuota(BigDecimal saldoCuota) {
        this.saldoCuota = saldoCuota;
    }

    public String getEstadoCuota() {
        return estadoCuota;
    }

    public void setEstadoCuota(String estadoCuota) {
        this.estadoCuota = estadoCuota;
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

    public String getUsuarioActualiza() {
        return usuarioActualiza;
    }

    public void setUsuarioActualiza(String usuarioActualiza) {
        this.usuarioActualiza = usuarioActualiza;
    }

    public LocalDateTime getFechaActualiza() {
        return fechaActualiza;
    }

    public void setFechaActualiza(LocalDateTime fechaActualiza) {
        this.fechaActualiza = fechaActualiza;
    }
}
