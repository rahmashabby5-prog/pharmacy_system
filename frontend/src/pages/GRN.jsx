import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { PlusCircle, Search, Save, Check } from 'lucide-react';

const GRN = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [drugs, setDrugs] = useState([]);
  
  // Search drug states
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);

  // Status notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Form payload
  const [batchForm, setBatchForm] = useState({
    supplier: '',
    batch_number: '',
    quantity_received: '',
    manufacturing_date: '',
    expiry_date: '',
    cost_price: '',
    retail_price: ''
  });

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const suppliersRes = await api.get('inventory/suppliers/');
        setSuppliers(suppliersRes.data);
      } catch (err) {
        console.error('Error fetching suppliers:', err);
      }
    };
    fetchInitData();
  }, []);

  const handleDrugSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length > 2) {
      try {
        const res = await api.get(`inventory/drugs/search/?q=${term}`);
        setDrugs(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.error('Error searching drugs:', err);
      }
    } else {
      setDrugs([]);
      setShowDropdown(false);
    }
  };

  const handleSelectDrug = (drug) => {
    setSelectedDrug(drug);
    setSearchTerm(`${drug.generic_name} (${drug.brand_name || ''})`);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    
    if (!selectedDrug) {
      setErrorMsg('Tafadhali chagua dawa kutoka kwenye orodha kwanza.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...batchForm,
        drug: selectedDrug.id,
        quantity_remaining: batchForm.quantity_received,
        // Fallback for null dates
        manufacturing_date: batchForm.manufacturing_date || null
      };

      await api.post('inventory/batches/', payload);
      
      setSuccessMsg(`Stoki ya '${selectedDrug.generic_name}' (Batch: ${batchForm.batch_number}) imeingizwa successfully!`);
      
      // Reset form
      setBatchForm({
        supplier: '',
        batch_number: '',
        quantity_received: '',
        manufacturing_date: '',
        expiry_date: '',
        cost_price: '',
        retail_price: ''
      });
      setSelectedDrug(null);
      setSearchTerm('');
    } catch (err) {
      console.error('Error saving GRN batch:', err);
      setErrorMsg(err.response?.data ? Object.values(err.response.data).join(' ') : 'Imefeli kuingiza stoki. Angalia fomu yako.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h3 className="text-white fw-bold mb-4">Stock Intake (Goods Received Note - GRN)</h3>

      {successMsg && (
        <div className="alert alert-success border-0 text-success bg-success bg-opacity-10 rounded-3 mb-4 d-flex align-items-center gap-2" role="alert">
          <Check size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger border-0 text-danger bg-danger bg-opacity-10 rounded-3 mb-4" role="alert">
          {errorMsg}
        </div>
      )}

      <div className="row">
        <div className="col-md-8">
          <div className="premium-card p-4">
            <h5 className="text-white mb-4">Fomu ya Mapokezi ya Bidhaa</h5>
            
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                
                {/* Drug Autocomplete Search */}
                <div className="col-12 position-relative">
                  <label className="form-label text-secondary fw-semibold">Tafuta Dawa (Search Generic / Brand)</label>
                  <div className="input-group">
                    <span className="input-group-text border-0" style={{ backgroundColor: '#0c111c', color: '#94a3b8' }}>
                      <Search size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-control form-premium"
                      placeholder="Andika jina la dawa mfano: Paracetamol..."
                      value={searchTerm}
                      onChange={handleDrugSearch}
                      required
                    />
                  </div>
                  {showDropdown && drugs.length > 0 && (
                    <ul 
                      className="list-group position-absolute w-100 mt-1 z-3"
                      style={{ backgroundColor: '#121824', border: '1px solid #1e293b', maxHeight: '200px', overflowY: 'auto' }}
                    >
                      {drugs.map(drug => (
                        <li 
                          key={drug.id}
                          className="list-group-item list-group-item-action text-white border-0 py-2 cursor-pointer"
                          style={{ backgroundColor: '#121824' }}
                          onClick={() => handleSelectDrug(drug)}
                        >
                          <div className="fw-semibold">{drug.generic_name} {drug.brand_name ? `(${drug.brand_name})` : ''}</div>
                          <small className="text-secondary">{drug.strength} - {drug.dosage_form}</small>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Supplier selection */}
                <div className="col-md-6">
                  <label className="form-label text-secondary fw-semibold">Supplier (Muzaji)</label>
                  <select 
                    className="form-select form-premium"
                    value={batchForm.supplier}
                    onChange={e => setBatchForm({...batchForm, supplier: e.target.value})}
                    required
                  >
                    <option value="">-- Chagua Supplier --</option>
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name}</option>
                    ))}
                  </select>
                </div>

                {/* Batch Number */}
                <div className="col-md-6">
                  <label className="form-label text-secondary fw-semibold">Batch Number</label>
                  <input
                    type="text"
                    className="form-control form-premium"
                    placeholder="AMX-2026"
                    value={batchForm.batch_number}
                    onChange={e => setBatchForm({...batchForm, batch_number: e.target.value})}
                    required
                  />
                </div>

                {/* Quantity Received */}
                <div className="col-md-4">
                  <label className="form-label text-secondary fw-semibold">Idadi Iliyopokelewa (Qty)</label>
                  <input
                    type="number"
                    className="form-control form-premium"
                    placeholder="Mfano: 100"
                    value={batchForm.quantity_received}
                    onChange={e => setBatchForm({...batchForm, quantity_received: e.target.value})}
                    required
                  />
                </div>

                {/* Cost Price */}
                <div className="col-md-4">
                  <label className="form-label text-secondary fw-semibold">Gharama ya Dawa (Unit Cost)</label>
                  <div className="input-group">
                    <input
                      type="number"
                      step="0.01"
                      className="form-control form-premium"
                      placeholder="Bei ya ununuzi"
                      value={batchForm.cost_price}
                      onChange={e => setBatchForm({...batchForm, cost_price: e.target.value})}
                      required
                    />
                    <span className="input-group-text border-0" style={{ backgroundColor: '#0c111c', color: '#94a3b8' }}>TZS</span>
                  </div>
                </div>

                {/* Retail Price */}
                <div className="col-md-4">
                  <label className="form-label text-secondary fw-semibold">Bei ya Rejareja (Retail Price)</label>
                  <div className="input-group">
                    <input
                      type="number"
                      step="0.01"
                      className="form-control form-premium"
                      placeholder="Bei ya kuuza"
                      value={batchForm.retail_price}
                      onChange={e => setBatchForm({...batchForm, retail_price: e.target.value})}
                      required
                    />
                    <span className="input-group-text border-0" style={{ backgroundColor: '#0c111c', color: '#94a3b8' }}>TZS</span>
                  </div>
                </div>

                {/* Manufacturing Date */}
                <div className="col-md-6">
                  <label className="form-label text-secondary fw-semibold">Manufacturing Date (Optional)</label>
                  <input
                    type="date"
                    className="form-control form-premium"
                    value={batchForm.manufacturing_date}
                    onChange={e => setBatchForm({...batchForm, manufacturing_date: e.target.value})}
                  />
                </div>

                {/* Expiry Date */}
                <div className="col-md-6">
                  <label className="form-label text-secondary fw-semibold">Expiry Date (Mwisho wa Matumizi)</label>
                  <input
                    type="date"
                    className="form-control form-premium"
                    value={batchForm.expiry_date}
                    onChange={e => setBatchForm({...batchForm, expiry_date: e.target.value})}
                    required
                  />
                </div>

                <div className="col-12 mt-4">
                  <button
                    type="submit"
                    className="btn btn-premium-primary py-2 d-flex align-items-center gap-2"
                    disabled={saving}
                  >
                    <Save size={18} />
                    {saving ? 'Inahifadhi...' : 'Hifadhi Kwenye Stoki (Submit)'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GRN;
