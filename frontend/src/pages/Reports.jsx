import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import { TrendingUp, FileSpreadsheet, DollarSign, Percent, RefreshCw } from 'lucide-react';

const Reports = () => {
  const { user } = useAuthStore();
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Only fetch if Owner
    if (user?.role === 'OWNER') {
      fetchFinancialReport();
    } else {
      setLoading(false);
      setErrorMsg('Huna mamlaka ya kuona ripoti hizi. Ni kwa ajili ya Mmiliki tu.');
    }
  }, []);

  const fetchFinancialReport = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(`sales/history/financial_report/?start_date=${startDate}&end_date=${endDate}`);
      setReport(res.data);
    } catch (err) {
      console.error('Error fetching financial report:', err);
      setErrorMsg('Imefeli kupakia ripoti ya fedha.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'OWNER') {
    return (
      <div className="alert alert-danger border-0 text-danger bg-danger bg-opacity-10 p-4 rounded-3" role="alert">
        <h5>Kizuizi cha Ufikiaji (Access Denied)</h5>
        <p className="mb-0">Akaunti yako haina sifa za kuona taarifa za faida na mauzo ya duka. Tafadhali wasiliana na mmiliki.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-white fw-bold">Ripoti za Kibiashara (Financial Analytics)</h3>
        <button 
          className="btn btn-premium-primary d-flex align-items-center gap-2"
          onClick={fetchFinancialReport}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Sasisha (Fetch)</span>
        </button>
      </div>

      {/* Date Filter Panel */}
      <div className="premium-card p-4 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label text-secondary fw-semibold">Kuanzia Tarehe (Start Date)</label>
            <input
              type="date"
              className="form-control form-premium"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label text-secondary fw-semibold">Hadi Tarehe (End Date)</label>
            <input
              type="date"
              className="form-control form-premium"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <button 
              className="btn btn-premium-primary w-100 py-2"
              onClick={fetchFinancialReport}
              disabled={loading}
            >
              Kagua Kipindi Hiki
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-danger border-0 text-danger bg-danger bg-opacity-10 rounded-3 mb-4">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="d-flex align-items-center justify-content-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Inapakia ripoti...</span>
          </div>
        </div>
      ) : report ? (
        <div>
          {/* Metrics summary */}
          <div className="row g-4 mb-4">
            {/* Total Revenue */}
            <div className="col-md-3">
              <div className="premium-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-secondary fw-semibold">Jumla ya Mauzo (Revenue)</span>
                  <div className="bg-success bg-opacity-10 p-2 rounded-3 text-success">
                    <DollarSign size={20} />
                  </div>
                </div>
                <h3 className="text-white fw-bold">{report.total_revenue.toLocaleString()} TZS</h3>
                <small className="text-secondary">VAT Inajumuishwa</small>
              </div>
            </div>

            {/* Total COGS */}
            <div className="col-md-3">
              <div className="premium-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-secondary fw-semibold">Gharama ya Ununuzi (COGS)</span>
                  <div className="bg-danger bg-opacity-10 p-2 rounded-3 text-danger">
                    <FileSpreadsheet size={20} />
                  </div>
                </div>
                <h3 className="text-white fw-bold">{report.total_cogs.toLocaleString()} TZS</h3>
                <small className="text-secondary">Historical Unit Cost</small>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="col-md-3">
              <div className="premium-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-secondary fw-semibold">Faida Ghafi (Profit)</span>
                  <div className="bg-info bg-opacity-10 p-2 rounded-3 text-info">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <h3 className="text-success fw-bold">{report.gross_profit.toLocaleString()} TZS</h3>
                <small className="text-secondary">Faida baada ya kutoa gharama</small>
              </div>
            </div>

            {/* Profit Margin */}
            <div className="col-md-3">
              <div className="premium-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-secondary fw-semibold">Asilimia ya Faida (Margin)</span>
                  <div className="bg-warning bg-opacity-10 p-2 rounded-3 text-warning">
                    <Percent size={20} />
                  </div>
                </div>
                <h3 className="text-white fw-bold">{report.profit_margin_percent}%</h3>
                <small className="text-secondary">Weighted Margin</small>
              </div>
            </div>
          </div>

          {/* Detailed breakdown card */}
          <div className="premium-card p-4">
            <h5 className="text-white mb-4">Taarifa ya Jumla ya Miamala</h5>
            
            <div className="row g-4">
              <div className="col-md-6 border-end border-secondary border-opacity-25">
                <div className="d-flex justify-content-between py-2 border-bottom border-secondary border-opacity-10">
                  <span className="text-secondary">Jumla ya Risiti Zilizotolewa:</span>
                  <span className="text-white fw-bold">{report.total_transactions}</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom border-secondary border-opacity-10">
                  <span className="text-secondary">Wastani wa Thamani ya Risiti:</span>
                  <span className="text-white fw-bold">
                    {report.total_transactions > 0 
                      ? Math.round(report.total_revenue / report.total_transactions).toLocaleString() 
                      : 0
                    } TZS
                  </span>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="d-flex justify-content-between py-2 border-bottom border-secondary border-opacity-10">
                  <span className="text-secondary">Punguzo Lililotolewa (Discounts):</span>
                  <span className="text-danger fw-bold">{report.total_discount_given.toLocaleString()} TZS</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom border-secondary border-opacity-10">
                  <span className="text-secondary">Makadirio ya Kodi (TRA VAT Collected):</span>
                  <span className="text-warning fw-bold">{report.total_tax_collected.toLocaleString()} TZS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-secondary py-5">
          Tafadhali sasisha kupata ripoti.
        </div>
      )}
    </div>
  );
};

export default Reports;
