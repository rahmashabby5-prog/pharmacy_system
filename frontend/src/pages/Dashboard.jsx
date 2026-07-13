import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  TrendingUp, 
  ShoppingCart, 
  Calendar, 
  AlertTriangle,
  Pill
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    revenue_today: 0.0,
    transactions_today: 0,
    expiring_batches_count: 0,
    expired_batches_count: 0,
    low_stock_count: 0
  });
  const [lowStockDrugs, setLowStockDrugs] = useState([]);
  const [expiringBatches, setExpiringBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get('sales/history/dashboard_stats/');
        setStats(statsRes.data);

        // Fetch low stock items
        const lowStockRes = await api.get('inventory/drugs/low_stock/');
        setLowStockDrugs(lowStockRes.data.slice(0, 5)); // show top 5

        // Fetch expiring batches (next 6 months)
        const expiringRes = await api.get('inventory/batches/expiring/?days=180');
        setExpiringBatches(expiringRes.data.slice(0, 5)); // show top 5
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
    <div>
      <h3 className="text-white fw-bold mb-4">Muhtasari wa Duka (Dashboard)</h3>

      {/* KPI Row */}
      <div className="row g-4 mb-4">
        {/* Revenue */}
        <div className="col-md-3">
          <div className="premium-card metric-card-green p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-secondary fw-semibold">Mauzo ya Leo</span>
              <div className="bg-success bg-opacity-20 p-2 rounded-3 text-success">
                <TrendingUp size={20} />
              </div>
            </div>
            <h2 className="text-white fw-bold">{stats.revenue_today.toLocaleString()} <span className="fs-6 fw-normal text-secondary">TZS</span></h2>
            <small className="text-success">Inajumuisha TRA VAT</small>
          </div>
        </div>

        {/* Transactions */}
        <div className="col-md-3">
          <div className="premium-card metric-card-blue p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-secondary fw-semibold">Wateja Waliohudumiwa</span>
              <div className="bg-info bg-opacity-20 p-2 rounded-3 text-info">
                <ShoppingCart size={20} />
              </div>
            </div>
            <h2 className="text-white fw-bold">{stats.transactions_today}</h2>
            <small className="text-secondary">Wateja wa Leo</small>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="col-md-3">
          <div className="premium-card metric-card-orange p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-secondary fw-semibold">Zinazoisha Muda (&lt; 6m)</span>
              <div className="bg-warning bg-opacity-20 p-2 rounded-3 text-warning">
                <Calendar size={20} />
              </div>
            </div>
            <h2 className="text-white fw-bold">{stats.expiring_batches_count}</h2>
            <small className="text-warning">Zitolewe FEFO haraka</small>
          </div>
        </div>

        {/* Low Stock count */}
        <div className="col-md-3">
          <div className="premium-card metric-card-red p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-secondary fw-semibold">Zilizopungua Stoki</span>
              <div className="bg-danger bg-opacity-20 p-2 rounded-3 text-danger">
                <AlertTriangle size={20} />
              </div>
            </div>
            <h2 className="text-white fw-bold">{stats.low_stock_count}</h2>
            <small className="text-danger">Zinahitaji kuagizwa</small>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Low Stock Alert Table */}
        <div className="col-md-6">
          <div className="premium-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-white mb-0 d-flex align-items-center gap-2">
                <AlertTriangle className="text-danger" size={20} />
                <span>Tahadhari ya Stoki iliyo Chini</span>
              </h5>
            </div>
            {lowStockDrugs.length === 0 ? (
              <p className="text-secondary my-4 text-center">Stoki yako iko sawa, hakuna dawa iliyo chini ya reorder level.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-premium table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Dawa (Generic)</th>
                      <th>Brand</th>
                      <th>Baki</th>
                      <th>Kiwango Min</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockDrugs.map((drug) => (
                      <tr key={drug.id}>
                        <td><span className="fw-semibold">{drug.generic_name}</span></td>
                        <td><span className="text-secondary">{drug.brand_name || '-'}</span></td>
                        <td><span className="badge bg-danger bg-opacity-20 text-danger">{drug.total_stock}</span></td>
                        <td>{drug.reorder_level}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Expiring Soon Table */}
        <div className="col-md-6">
          <div className="premium-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-white mb-0 d-flex align-items-center gap-2">
                <Calendar className="text-warning" size={20} />
                <span>Dawa Zinazokaribia Kuisha Muda (FEFO Queue)</span>
              </h5>
            </div>
            {expiringBatches.length === 0 ? (
              <p className="text-secondary my-4 text-center">Hongera! Hakuna dawa inayokaribia kuisha muda ndani ya miezi 6.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-premium table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Dawa</th>
                      <th>Batch Na.</th>
                      <th>Kuisha Muda</th>
                      <th>Siku Zilizobaki</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiringBatches.map((batch) => (
                      <tr key={batch.id}>
                        <td>
                          <div className="fw-semibold text-white">{batch.drug_details.generic_name}</div>
                          <small className="text-secondary">{batch.drug_details.brand_name || '-'}</small>
                        </td>
                        <td><code>{batch.batch_number}</code></td>
                        <td><span className="text-warning">{batch.expiry_date}</span></td>
                        <td>
                          <span className={`badge ${
                            batch.days_until_expiry <= 90 ? 'bg-danger' : 'bg-warning text-dark'
                          }`}>
                            Siku {batch.days_until_expiry}
                          </span>
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
    </div>
  );
};

export default Dashboard;
