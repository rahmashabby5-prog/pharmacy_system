import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Pill, Plus, Search, Truck, Layers } from 'lucide-react';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('drugs');
  const [drugs, setDrugs] = useState([]);
  const [batches, setBatches] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  // Search states
  const [drugSearch, setDrugSearch] = useState('');
  
  // Modal toggle states
  const [showDrugModal, setShowDrugModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // New Drug form
  const [newDrug, setNewDrug] = useState({
    generic_name: '',
    brand_name: '',
    dosage_form: 'Tablets',
    strength: '500mg',
    pack_size: 'Box of 100',
    category: 'OTC',
    tax_class: 'EXEMPT',
    reorder_level: 10
  });

  // New Supplier form
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    tin_number: '',
    phone: '',
    email: '',
    address: '',
    payment_terms: 'Cash'
  });

  useEffect(() => {
    fetchTabDetails();
  }, [activeTab]);

  const fetchTabDetails = async () => {
    try {
      if (activeTab === 'drugs') {
        const res = await api.get('inventory/drugs/');
        setDrugs(res.data);
      } else if (activeTab === 'batches') {
        const res = await api.get('inventory/batches/');
        setBatches(res.data);
      } else if (activeTab === 'suppliers') {
        const res = await api.get('inventory/suppliers/');
        setSuppliers(res.data);
      }
    } catch (err) {
      console.error('Error fetching inventory details:', err);
    }
  };

  const handleAddDrug = async (e) => {
    e.preventDefault();
    try {
      await api.post('inventory/drugs/', newDrug);
      setShowDrugModal(false);
      setNewDrug({
        generic_name: '',
        brand_name: '',
        dosage_form: 'Tablets',
        strength: '500mg',
        pack_size: 'Box of 100',
        category: 'OTC',
        tax_class: 'EXEMPT',
        reorder_level: 10
      });
      fetchTabDetails();
    } catch (err) {
      console.error('Error adding drug:', err);
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      await api.post('inventory/suppliers/', newSupplier);
      setShowSupplierModal(false);
      setNewSupplier({
        name: '',
        tin_number: '',
        phone: '',
        email: '',
        address: '',
        payment_terms: 'Cash'
      });
      fetchTabDetails();
    } catch (err) {
      console.error('Error adding supplier:', err);
    }
  };

  const filteredDrugs = drugs.filter(drug => 
    drug.generic_name.toLowerCase().includes(drugSearch.toLowerCase()) ||
    (drug.brand_name && drug.brand_name.toLowerCase().includes(drugSearch.toLowerCase()))
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-white fw-bold">Usimamizi wa Stoki na Bidhaa</h3>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-premium-primary d-flex align-items-center gap-2"
            onClick={() => setShowDrugModal(true)}
          >
            <Plus size={18} />
            <span>Sajili Dawa Mpya</span>
          </button>
          <button 
            className="btn btn-premium-secondary d-flex align-items-center gap-2"
            onClick={() => setShowSupplierModal(true)}
          >
            <Truck size={18} />
            <span>Ongeza Supplier</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs border-secondary border-opacity-25 mb-4" style={{ borderBottomWidth: '1px' }}>
        <li className="nav-item">
          <button 
            className={`nav-link border-0 text-white ${activeTab === 'drugs' ? 'active bg-success bg-opacity-10 text-success border-bottom border-success' : 'bg-transparent text-secondary'}`}
            onClick={() => setActiveTab('drugs')}
            style={{ borderBottom: activeTab === 'drugs' ? '3px solid var(--primary) !important' : 'none' }}
          >
            <div className="d-flex align-items-center gap-2">
              <Pill size={16} />
              <span>Orodha Kuu ya Dawa</span>
            </div>
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link border-0 text-white ${activeTab === 'batches' ? 'active bg-success bg-opacity-10 text-success border-bottom border-success' : 'bg-transparent text-secondary'}`}
            onClick={() => setActiveTab('batches')}
          >
            <div className="d-flex align-items-center gap-2">
              <Layers size={16} />
              <span>Batches za Stoki</span>
            </div>
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link border-0 text-white ${activeTab === 'suppliers' ? 'active bg-success bg-opacity-10 text-success border-bottom border-success' : 'bg-transparent text-secondary'}`}
            onClick={() => setActiveTab('suppliers')}
          >
            <div className="d-flex align-items-center gap-2">
              <Truck size={16} />
              <span>Ma-Supplier (Wauzaji)</span>
            </div>
          </button>
        </li>
      </ul>

      {/* Active Tab View */}
      {activeTab === 'drugs' && (
        <div className="premium-card p-4">
          <div className="row mb-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text border-0" style={{ backgroundColor: '#0c111c', color: '#94a3b8' }}>
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="form-control form-premium"
                  placeholder="Tafuta dawa kwa jina..."
                  value={drugSearch}
                  onChange={(e) => setDrugSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-premium table-hover align-middle">
              <thead>
                <tr>
                  <th>Jina la Dawa (Generic)</th>
                  <th>Brand Name</th>
                  <th>Ufungaji</th>
                  <th>Kundi la Dawa</th>
                  <th>Kodi (TRA Class)</th>
                  <th>Reorder Level</th>
                  <th>Stoki Iliyopo</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrugs.map((drug) => (
                  <tr key={drug.id}>
                    <td>
                      <div className="fw-semibold text-white">{drug.generic_name}</div>
                      <small className="text-secondary">{drug.strength} - {drug.dosage_form}</small>
                    </td>
                    <td>{drug.brand_name || '-'}</td>
                    <td>{drug.pack_size}</td>
                    <td>
                      <span className={`badge ${
                        drug.category === 'NARCOTIC' ? 'bg-danger' : 
                        drug.category === 'PRESCRIPTION' ? 'bg-warning text-dark' : 'bg-info'
                      }`}>
                        {drug.category}
                      </span>
                    </td>
                    <td><code>{drug.tax_class}</code></td>
                    <td>{drug.reorder_level}</td>
                    <td>
                      <span className={`badge fs-6 ${
                        drug.total_stock <= drug.reorder_level ? 'bg-danger bg-opacity-20 text-danger' : 'bg-success bg-opacity-20 text-success'
                      }`}>
                        {drug.total_stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'batches' && (
        <div className="premium-card p-4">
          <div className="table-responsive">
            <table className="table table-premium table-hover align-middle">
              <thead>
                <tr>
                  <th>Jina la Dawa</th>
                  <th>Batch Na.</th>
                  <th>Supplier</th>
                  <th>Baki (Stoki)</th>
                  <th>Gharama (Cost)</th>
                  <th>Bei ya Rejareja</th>
                  <th>Tarehe ya Expiry</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.id}>
                    <td>
                      <div className="fw-semibold text-white">{batch.drug_details.generic_name}</div>
                      <small className="text-secondary">{batch.drug_details.brand_name || '-'}</small>
                    </td>
                    <td><code>{batch.batch_number}</code></td>
                    <td>{batch.supplier_name || '-'}</td>
                    <td>
                      <span className="fw-bold">{batch.quantity_remaining}</span> / {batch.quantity_received}
                    </td>
                    <td>{parseFloat(batch.cost_price).toLocaleString()} TZS</td>
                    <td>{parseFloat(batch.retail_price).toLocaleString()} TZS</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className={batch.days_until_expiry <= 90 ? 'text-danger fw-bold' : 'text-white'}>
                          {batch.expiry_date}
                        </span>
                        <span className={`badge ${
                          batch.days_until_expiry <= 90 ? 'bg-danger' : 'bg-secondary'
                        }`}>
                          {batch.days_until_expiry <= 0 ? 'Expired' : `Siku ${batch.days_until_expiry}`}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="premium-card p-4">
          <div className="table-responsive">
            <table className="table table-premium table-hover align-middle">
              <thead>
                <tr>
                  <th>Jina la Wauzaji</th>
                  <th>TIN Number</th>
                  <th>Simu na Email</th>
                  <th>Anuani</th>
                  <th>Masharti ya Malipo</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((sup) => (
                  <tr key={sup.id}>
                    <td><span className="fw-semibold text-white">{sup.name}</span></td>
                    <td><code>{sup.tin_number || '-'}</code></td>
                    <td>
                      <div>{sup.phone}</div>
                      <small className="text-secondary">{sup.email || '-'}</small>
                    </td>
                    <td>{sup.address || '-'}</td>
                    <td>{sup.payment_terms || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Drug Modal */}
      {showDrugModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 premium-card text-white" style={{ backgroundColor: '#121824' }}>
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title">Sajili Dawa Mpya</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDrugModal(false)}></button>
              </div>
              <form onSubmit={handleAddDrug}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label text-secondary">Generic Name</label>
                      <input
                        type="text"
                        className="form-control form-premium"
                        value={newDrug.generic_name}
                        onChange={e => setNewDrug({...newDrug, generic_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary">Brand Name (Optional)</label>
                      <input
                        type="text"
                        className="form-control form-premium"
                        value={newDrug.brand_name}
                        onChange={e => setNewDrug({...newDrug, brand_name: e.target.value})}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary">Dosage Form</label>
                      <input
                        type="text"
                        className="form-control form-premium"
                        value={newDrug.dosage_form}
                        onChange={e => setNewDrug({...newDrug, dosage_form: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary">Strength</label>
                      <input
                        type="text"
                        className="form-control form-premium"
                        value={newDrug.strength}
                        onChange={e => setNewDrug({...newDrug, strength: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary">Pack Size</label>
                      <input
                        type="text"
                        className="form-control form-premium"
                        value={newDrug.pack_size}
                        onChange={e => setNewDrug({...newDrug, pack_size: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary">Reorder Level</label>
                      <input
                        type="number"
                        className="form-control form-premium"
                        value={newDrug.reorder_level}
                        onChange={e => setNewDrug({...newDrug, reorder_level: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary">Category</label>
                      <select 
                        className="form-select form-premium"
                        value={newDrug.category}
                        onChange={e => setNewDrug({...newDrug, category: e.target.value})}
                      >
                        <option value="OTC">OTC (Over the Counter)</option>
                        <option value="PRESCRIPTION">Prescription Only</option>
                        <option value="NARCOTIC">Narcotic</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary">Tax Class</label>
                      <select 
                        className="form-select form-premium"
                        value={newDrug.tax_class}
                        onChange={e => setNewDrug({...newDrug, tax_class: e.target.value})}
                      >
                        <option value="EXEMPT">Exempt</option>
                        <option value="VAT_18">18% VAT</option>
                        <option value="ZERO_RATED">Zero Rated</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-premium-secondary" onClick={() => setShowDrugModal(false)}>Ghairi</button>
                  <button type="submit" className="btn btn-premium-primary">Sajili</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showSupplierModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 premium-card text-white" style={{ backgroundColor: '#121824' }}>
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title">Ongeza Supplier</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowSupplierModal(false)}></button>
              </div>
              <form onSubmit={handleAddSupplier}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label text-secondary">Supplier Name</label>
                      <input
                        type="text"
                        className="form-control form-premium"
                        value={newSupplier.name}
                        onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary">TIN Number (Optional)</label>
                      <input
                        type="text"
                        className="form-control form-premium"
                        value={newSupplier.tin_number}
                        onChange={e => setNewSupplier({...newSupplier, tin_number: e.target.value})}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary">Phone Number</label>
                      <input
                        type="text"
                        className="form-control form-premium"
                        value={newSupplier.phone}
                        onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary">Email Address</label>
                      <input
                        type="email"
                        className="form-control form-premium"
                        value={newSupplier.email}
                        onChange={e => setNewSupplier({...newSupplier, email: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary">Address</label>
                      <textarea
                        className="form-control form-premium"
                        value={newSupplier.address}
                        onChange={e => setNewSupplier({...newSupplier, address: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary">Payment Terms (e.g. Credit, Cash)</label>
                      <input
                        type="text"
                        className="form-control form-premium"
                        value={newSupplier.payment_terms}
                        onChange={e => setNewSupplier({...newSupplier, payment_terms: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-premium-secondary" onClick={() => setShowSupplierModal(false)}>Ghairi</button>
                  <button type="submit" className="btn btn-premium-primary">Ongeza</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
