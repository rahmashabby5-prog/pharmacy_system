import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { History, Eye, Printer, Calendar } from 'lucide-react';

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    fetchSalesHistory();
  }, []);

  const fetchSalesHistory = async () => {
    try {
      const res = await api.get('sales/history/');
      setSales(res.data);
    } catch (err) {
      console.error('Error fetching sales history:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewSaleDetails = (sale) => {
    setSelectedSale(sale);
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Inapakia...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row g-4">
      <div className="col-md-8">
        <div className="premium-card p-4 h-100">
          <h5 className="text-white mb-4 d-flex align-items-center gap-2">
            <History size={22} className="text-success" />
            <span>Kumbukumbu za Mauzo (Sales History)</span>
          </h5>

          <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table className="table table-premium table-hover align-middle">
              <thead>
                <tr>
                  <th>Namba ya Invois</th>
                  <th>Muda</th>
                  <th>Njia ya Malipo</th>
                  <th>Jumla (TZS)</th>
                  <th>TRA Status</th>
                  <th style={{ width: '100px' }}></th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <code className="text-white">{sale.invoice_number}</code>
                      <div className="text-xs text-secondary">Mhudumu: {sale.cashier_name}</div>
                    </td>
                    <td>{new Date(sale.created_at).toLocaleString()}</td>
                    <td>
                      <span className={`badge bg-secondary`}>
                        {sale.payment_method}
                      </span>
                    </td>
                    <td className="fw-bold">{parseFloat(sale.total_amount).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${sale.tra_vfd_signed ? 'bg-success bg-opacity-20 text-success' : 'bg-danger bg-opacity-20 text-danger'}`}>
                        {sale.tra_vfd_signed ? 'SIGNED' : 'FAILED'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-premium-secondary py-1 px-2 text-xs d-flex align-items-center gap-1"
                        onClick={() => viewSaleDetails(sale)}
                      >
                        <Eye size={14} />
                        <span>Angalia</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invoice Reprint Panel */}
      <div className="col-md-4">
        {selectedSale ? (
          <div className="premium-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white mb-0">Mchanganuo wa Invois</h5>
              <button 
                className="btn btn-premium-primary py-1 px-3 d-flex align-items-center gap-2"
                onClick={() => window.print()}
              >
                <Printer size={16} />
                <span>Print</span>
              </button>
            </div>

            {/* Receipt Format */}
            <div 
              className="p-3 bg-dark bg-opacity-50 rounded-3 font-monospace text-xs" 
              style={{ border: '1px dashed #334155' }}
            >
              <div className="text-center fw-bold border-bottom border-secondary border-opacity-25 pb-2 mb-3">
                SALAMA HEALTHCARE PMS
                <div className="text-xs text-secondary mt-1">Dar es Salaam, Tanzania</div>
              </div>
              
              <div className="d-flex justify-content-between mb-1">
                <span>INVOICE:</span>
                <span>{selectedSale.invoice_number.slice(0, 15)}...</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>DATE:</span>
                <span>{new Date(selectedSale.created_at).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 border-bottom border-secondary border-opacity-25 pb-2">
                <span>CASHIER:</span>
                <span>{selectedSale.cashier_name}</span>
              </div>

              {/* Items */}
              <div className="mb-3 border-bottom border-secondary border-opacity-25 pb-2">
                {selectedSale.items.map((item, idx) => (
                  <div key={idx} className="mb-2">
                    <div className="d-flex justify-content-between">
                      <span>{item.drug_name}</span>
                      <span>{parseFloat(item.total_price).toLocaleString()} TZS</span>
                    </div>
                    <div className="text-secondary text-xs">{item.quantity} x {parseFloat(item.unit_price).toLocaleString()} TZS</div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="d-flex justify-content-between mb-1">
                <span>SUBTOTAL:</span>
                <span>{parseFloat(selectedSale.subtotal).toLocaleString()} TZS</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>TRA VAT:</span>
                <span>{parseFloat(selectedSale.tax_amount).toLocaleString()} TZS</span>
              </div>
              <div className="d-flex justify-content-between mb-2 fw-bold text-success">
                <span>TOTAL PAID:</span>
                <span>{parseFloat(selectedSale.total_amount).toLocaleString()} TZS</span>
              </div>

              {/* NHIF details */}
              {selectedSale.nhif_claim && (
                <div className="mt-3 pt-2 border-top border-secondary border-opacity-25">
                  <div className="fw-bold">NHIF CLAIM DETAILS:</div>
                  <div>Card: {selectedSale.nhif_claim.card_number}</div>
                  <div>Patient: {selectedSale.nhif_claim.patient_name}</div>
                  <div>Status: {selectedSale.nhif_claim.status}</div>
                </div>
              )}

              {/* TRA VFD Info */}
              {selectedSale.tra_vfd_signed && (
                <div className="mt-3 pt-3 border-top border-secondary border-opacity-25 text-center">
                  <div className="fw-bold text-success mb-1">TRA VFD FISCAL RECEIPT</div>
                  <div className="text-xs mb-2">RECEIPT NO: <code>{selectedSale.tra_vfd_receipt_number}</code></div>
                  <div className="text-secondary text-xs">
                    <a href={selectedSale.tra_vfd_verification_url} target="_blank" rel="noreferrer" className="text-success text-decoration-none">
                      Verify Receipt
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="premium-card p-4 text-center text-secondary py-5">
            <Calendar size={36} className="mx-auto mb-3" />
            <p>Chagua invois upande wa kushoto kuona mchanganuo wake.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;
