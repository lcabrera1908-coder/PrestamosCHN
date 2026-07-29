package gt.chn.prestamos.dto;

import java.math.BigDecimal;

public class DetallePagoDTO {

    private Integer idDetallePago;
    private Integer idPago;
    private Integer idPlanPago;
    private BigDecimal montoAplicado;

    public DetallePagoDTO() {
    }

    public DetallePagoDTO(Integer idDetallePago, Integer idPago,
                          Integer idPlanPago, BigDecimal montoAplicado) {
        this.idDetallePago = idDetallePago;
        this.idPago = idPago;
        this.idPlanPago = idPlanPago;
        this.montoAplicado = montoAplicado;
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
}