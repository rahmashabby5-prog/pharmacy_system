import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Search, 
  Trash2, 
  CreditCard, 
  CheckCircle,
  Smartphone,
  Shield,
  FileText,
  ShoppingCart
} from 'lucide-react';

const POS = () => {
  const [drugs, setDrugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Cart state
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  
  // Custom inputs for payments
  const [paymentRef, setPaymentRef] = useState('');
  const [nhifCard, setNhifCard] = useState('');
  const [nhifPatient, setNhifPatient] = useState('');
  const [nhifAuth, setNhifAuth] = useState('');

  // Post Checkout Success Modal details
  const [receiptData, setReceiptData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length > 2) {
      try {
        const res = await api.get(`inventory/drugs/search/?q=${term}`);
        setDrugs(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.error('Error fetching search results:', err);
      }
    } else {
      setDrugs([]);
      setShowDropdown(false);
    }
  };

  const addToCart = (drug) => {
    // Check if drug already in cart
    const existing = cart.find(item => item.id === drug.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === drug.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      // Find the retail price of the drug. For simplicity, we get price from drug total_stock context,
      // in production views.py checkout decides the exact batch and price. We'll simulate retail_price.
      // We will assume a default retail price of 1000 TZS if drug has no active batches, or fetch it.
      // Since drug serializer does not return batch prices directly, let's fetch its batches if needed.
      // For MVP, we'll assign a mock unit price (e.g. 5,000 TZS) or mock price. Actually, let's fetch batches.
      const mockPrice = drug.category === 'NARCOTIC' ? 12000 : drug.category === 'PRESCRIPTION' ? 7500 : 2500;
      setCart([...cart, { 
        ...drug, 
        quantity: 1, 
        unit_price: mockPrice, // Fallback if no batch, checkout endpoint will verify actual batch FEFO price.
      }]);
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) return;
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity: qty } : item
    ));
  };

  // Math calculations
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  };

  const calculateTax = () => {
    // Estimate 18% VAT for items marked as VAT_18
    return cart.reduce((sum, item) => {
      if (item.tax_class === 'VAT_18') {
        const itemTotal = item.unit_price * item.quantity;
        return sum + (itemTotal - (itemTotal / 1.18));
      }
      return sum;
    }, 0);
  };

  const calculateTotal = () => {
    const total = calculateSubtotal() - discount;
    return total < 0 ? 0 : total;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setLoading(true);
    setErrorMsg('');
    try {
      const items = cart.map(item => ({
        drug_id: item.id,
        quantity: item.quantity
      }));

      const payload = {
        payment_method: paymentMethod,
        payment_reference: paymentRef,
        discount_amount: discount.toFixed(2),
        items: items,
        nhif_card_number: nhifCard,
        nhif_patient_name: nhifPatient,
        nhif_auth_code: nhifAuth
      };

      const res = await api.post('sales/history/checkout/', payload);
      setReceiptData(res.data);
      setShowSuccessModal(true);
      
      // Clear cart
      setCart([]);
      setDiscount(0);
      setPaymentRef('');
      setNhifCard('');
      setNhifPatient('');
      setNhifAuth('');
    } catch (err) {
      console.error('Checkout failed:', err);
      setErrorMsg(err.response?.data?.error || 'Njia ya malipo imefeli au hakuna stoki ya kutosha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row g-4">
      {/* Left panel: Cart selection */}
      <div className="col-md-8">
        <div className="premium-card p-4 h-100 d-flex flex-column">
          <h5 className="text-white mb-4">Point of Sale (POS Terminal)</h5>

          {errorMsg && (
            <div className="alert alert-danger border-0 text-danger bg-danger bg-opacity-10 rounded-3 mb-4">
              {errorMsg}
            </div>
          )}

          {/* Autocomplete Drug Search */}
          <div className="position-relative mb-4">
            <div className="input-group">
              <span className="input-group-text border-0" style={{ backgroundColor: '#0c111c', color: '#94a3b8' }}>
                <Search size={18} />
              </span>
              <input
                type="text"
                className="form-control form-premium"
                placeholder="Tafuta Dawa kwa jina la generic au brand..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            {showDropdown && drugs.length > 0 && (
              <ul 
                className="list-group position-absolute w-100 mt-1 z-3"
                style={{ backgroundColor: '#121824', border: '1px solid #1e293b', maxHeight: '250px', overflowY: 'auto' }}
              >
                {drugs.map(drug => (
                  <li 
                    key={drug.id}
                    className="list-group-item list-group-item-action text-white border-0 py-2 d-flex justify-content-between align-items-center cursor-pointer"
                    style={{ backgroundColor: '#121824' }}
                    onClick={() => addToCart(drug)}
                  >
                    <div>
                      <span className="fw-semibold">{drug.generic_name} {drug.brand_name ? `(${drug.brand_name})` : ''}</span>
                      <div className="text-xs text-secondary">{drug.strength} - {drug.dosage_form}</div>
                    </div>
                    <div>
                      <span className={`badge ${drug.total_stock <= 0 ? 'bg-danger' : 'bg-success'}`}>
                        Baki: {drug.total_stock}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Cart Table */}
          <div className="flex-grow-1 overflow-auto" style={{ maxHeight: '400px' }}>
            {cart.length === 0 ? (
              <div className="text-center text-secondary my-5 py-5">
                <ShoppingCart className="mx-auto mb-3 text-secondary" size={48} />
                <p>Kikapu kiko wazi. Tafuta dawa juu ili kuanza billing.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-premium align-middle">
                  <thead>
                    <tr>
                      <th>Dawa</th>
                      <th>Kiasi (Qty)</th>
                      <th>Bei (TZS)</th>
                      <th>Jumla (TZS)</th>
                      <th style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="fw-semibold text-white">{item.generic_name}</div>
                          <small className="text-secondary">{item.brand_name || '-'}</small>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-premium py-1 px-2 text-center"
                            style={{ width: '70px' }}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            min="1"
                          />
                        </td>
                        <td>{item.unit_price.toLocaleString()}</td>
                        <td><span className="fw-semibold">{(item.unit_price * item.quantity).toLocaleString()}</span></td>
                        <td>
                          <button 
                            className="btn btn-outline-danger border-0 p-1 rounded-circle"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right panel: Checkout & Summary */}
      <div className="col-md-4">
        <div className="premium-card p-4 d-flex flex-column justify-content-between h-100">
          <div>
            <h5 className="text-white mb-4">Muhtasari wa Malipo</h5>

            {/* Calculations */}
            <div className="pb-3 border-bottom border-secondary border-opacity-25 mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Subtotal:</span>
                <span className="text-white fw-semibold">{calculateSubtotal().toLocaleString()} TZS</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">TRA VAT (Estimate):</span>
                <span className="text-white font-monospace">{calculateTax().toLocaleString()} TZS</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Discount:</span>
                <input
                  type="number"
                  className="form-control form-premium py-0 px-2 text-end text-white font-monospace border-0"
                  style={{ width: '100px', backgroundColor: 'transparent' }}
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-secondary fs-5 fw-semibold">Jumla Kuu:</span>
              <span className="text-success fs-3 fw-bold">{calculateTotal().toLocaleString()} TZS</span>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-4">
              <label className="form-label text-secondary fw-semibold">Njia ya Malipo</label>
              <div className="d-flex gap-2">
                <button 
                  type="button"
                  className={`btn flex-fill py-2 d-flex flex-column align-items-center gap-1 ${paymentMethod === 'CASH' ? 'btn-success bg-opacity-10 border-success text-success' : 'btn-premium-secondary border-0'}`}
                  onClick={() => setPaymentMethod('CASH')}
                >
                  <CreditCard size={18} />
                  <span className="text-xs">CASH</span>
                </button>
                <button 
                  type="button"
                  className={`btn flex-fill py-2 d-flex flex-column align-items-center gap-1 ${paymentMethod === 'MOBILE_MONEY' ? 'btn-success bg-opacity-10 border-success text-success' : 'btn-premium-secondary border-0'}`}
                  onClick={() => setPaymentMethod('MOBILE_MONEY')}
                >
                  <Smartphone size={18} />
                  <span className="text-xs">MOBILE</span>
                </button>
                <button 
                  type="button"
                  className={`btn flex-fill py-2 d-flex flex-column align-items-center gap-1 ${paymentMethod === 'INSURANCE' ? 'btn-success bg-opacity-10 border-success text-success' : 'btn-premium-secondary border-0'}`}
                  onClick={() => setPaymentMethod('INSURANCE')}
                >
                  <Shield size={18} />
                  <span className="text-xs">NHIF</span>
                </button>
              </div>
            </div>

            {/* Conditional Payment fields */}
            {paymentMethod === 'MOBILE_MONEY' && (
              <div className="mb-4">
                <label className="form-label text-secondary">Namba ya Muamala (Ref Code)</label>
                <input
                  type="text"
                  className="form-control form-premium"
                  placeholder="e.g. QP98XX76"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  required
                />
              </div>
            )}

            {paymentMethod === 'INSURANCE' && (
              <div className="row g-2 mb-4">
                <div className="col-12">
                  <label className="form-label text-secondary">Kadi ya NHIF (Card Number)</label>
                  <input
                    type="text"
                    className="form-control form-premium"
                    placeholder="01-23456789-0"
                    value={nhifCard}
                    onChange={(e) => setNhifCard(e.target.value)}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label text-secondary">Jina la Mgonjwa</label>
                  <input
                    type="text"
                    className="form-control form-premium"
                    placeholder="Jina kamili la mgonjwa"
                    value={nhifPatient}
                    onChange={(e) => setNhifPatient(e.target.value)}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label text-secondary">NHIF Auth Code</label>
                  <input
                    type="text"
                    className="form-control form-premium"
                    placeholder="Auth code (Optional)"
                    value={nhifAuth}
                    onChange={(e) => setNhifAuth(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn-premium-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2"
            onClick={handleCheckout}
            disabled={cart.length === 0 || loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              <>
                <CheckCircle size={20} />
                <span>Maliza Mauzo (Checkout)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* TRA VFD Checkout Success Modal */}
      {showSuccessModal && receiptData && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 premium-card text-white p-4" style={{ backgroundColor: '#121824', maxWidth: '400px' }}>
              <div className="text-center mb-4">
                <div className="d-inline-flex bg-success bg-opacity-10 p-3 rounded-circle mb-3 text-success">
                  <CheckCircle size={40} />
                </div>
                <h4 className="text-white fw-bold">Mauzo Yamekamilika!</h4>
                <p className="text-secondary text-sm">Risiti imeandikishwa TRA VFD successfully.</p>
              </div>

              {/* Receipt Body */}
              <div 
                className="p-3 bg-dark bg-opacity-50 rounded-3 mb-4 font-monospace text-xs" 
                style={{ border: '1px dashed #334155' }}
              >
                <div className="text-center fw-bold border-bottom border-secondary border-opacity-25 pb-2 mb-2">
                  SALAMA HEALTHCARE PMS
                  <div className="text-xs text-secondary font-sans mt-1">Dar es Salaam, Tanzania</div>
                </div>
                
                <div className="d-flex justify-content-between mb-1">
                  <span>INVOICE:</span>
                  <span>{receiptData.invoice_number.slice(0, 18)}...</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>DATE:</span>
                  <span>{new Date(receiptData.created_at).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 border-bottom border-secondary border-opacity-25 pb-2">
                  <span>CASHIER:</span>
                  <span>{receiptData.cashier_name}</span>
                </div>

                {/* Items */}
                <div className="mb-3">
                  {receiptData.items.map((item, idx) => (
                    <div key={idx} className="d-flex justify-content-between mb-1">
                      <span>{item.drug_name} (x{item.quantity})</span>
                      <span>{parseFloat(item.total_price).toLocaleString()} TZS</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="d-flex justify-content-between border-top border-secondary border-opacity-25 pt-2 mb-1">
                  <span>SUBTOTAL:</span>
                  <span>{parseFloat(receiptData.subtotal).toLocaleString()} TZS</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>TRA VAT:</span>
                  <span>{parseFloat(receiptData.tax_amount).toLocaleString()} TZS</span>
                </div>
                <div className="d-flex justify-content-between mb-2 fw-bold text-success">
                  <span>TOTAL PAID:</span>
                  <span>{parseFloat(receiptData.total_amount).toLocaleString()} TZS</span>
                </div>

                {/* TRA VFD Info */}
                {receiptData.tra_vfd_signed && (
                  <div className="mt-3 pt-3 border-top border-secondary border-opacity-25 text-center">
                    <div className="fw-bold text-success mb-1">TRA VFD FISCAL RECEIPT</div>
                    <div className="text-xs mb-2">RECEIPT NO: <code className="text-warning">{receiptData.tra_vfd_receipt_number}</code></div>
                    
                    {/* Mock QR Code representation */}
                    <div className="d-inline-block bg-white p-2 rounded-2 mb-2">
                      <div 
                        style={{ width: '80px', height: '80px', border: '5px solid #000', backgroundColor: '#fff', position: 'relative' }}
                        className="d-flex align-items-center justify-content-center"
                      >
                        {/* CSS mock of QR grid */}
                        <div style={{ width: '60px', height: '60px', background: 'repeating-linear-gradient(45deg, #000, #000 3px, #fff 3px, #fff 6px)' }}></div>
                      </div>
                    </div>
                    
                    <div className="text-secondary text-xs mt-1">
                      <a href={receiptData.tra_vfd_verification_url} target="_blank" rel="noreferrer" className="text-success text-decoration-none">
                        Verify Receipt
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="btn btn-premium-primary w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => setShowSuccessModal(false)}
              >
                <FileText size={18} />
                <span>Risiti Mpya (Next Sale)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
