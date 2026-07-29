package gt.chn.prestamos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PagoDTO {

    private Integer idPago;
    private Integer idSolicitud;
    private LocalDate fechaPago;
    private BigDecimal montoPago;
    private String numeroComprobante;
    private String estadoPago;
    private String observaciones;

    public PagoDTO() {
    }

    public PagoDTO(Integer idPago, Integer idSolicitud, LocalDate fechaPago,
                   BigDecimal montoPago, String numeroComprobante,
                   String estadoPago, String observaciones) {
        this.idPago = idPago;
        this.idSolicitud = idSolicitud;
        this.fechaPago = fechaPago;
        this.montoPago = montoPago;
        this.numeroComprobante = numeroComprobante;
        this.estadoPago = estadoPago;
        this.observaciones = observaciones;
    }

    public Integer getIdPago() {
        return idPago;
    }

    public void setIdPago(Integer idPago) {
        this.idPago = idPago;
    }

    public Integer getIdSolicitud() {
        return idSolicitud;
    }

    public void setIdSolicitud(Integer idSolicitud) {
        this.idSolicitud = idSolicitud;
    }

    public LocalDate getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(LocalDate fechaPago) {
        this.fechaPago = fechaPago;
    }

    public BigDecimal getMontoPago() {
        return montoPago;
    }

    public void setMontoPago(BigDecimal montoPago) {
        this.montoPago = montoPago;
    }

    public String getNumeroComprobante() {
        return numeroComprobante;
    }

    public void setNumeroComprobante(String numeroComprobante) {
        this.numeroComprobante = numeroComprobante;
    }

    public String getEstadoPago() {
        return estadoPago;
    }

    public void setEstadoPago(String estadoPago) {
        this.estadoPago = estadoPago;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}
