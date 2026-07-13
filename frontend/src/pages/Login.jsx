import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Pill, Lock, User as UserIcon } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, user, error, loading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    
    const result = await login(username, password);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div 
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ backgroundColor: '#05070c' }}
    >
      <div 
        className="premium-card p-5 w-100 m-3"
        style={{ maxWidth: '440px', backgroundColor: '#121824' }}
      >
        <div className="text-center mb-4">
          <div className="d-inline-flex bg-success bg-opacity-10 p-3 rounded-circle mb-3">
            <Pill className="text-success" size={40} />
          </div>
          <h3 className="text-white fw-bold">Karibu Salama PMS</h3>
          <p className="text-secondary">Pharmacy Management System</p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 text-danger bg-danger bg-opacity-10 rounded-3 mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-3">
            <label className="form-label text-secondary fw-semibold">Username</label>
            <div className="input-group">
              <span className="input-group-text border-0" style={{ backgroundColor: '#0c111c', color: '#94a3b8' }}>
                <UserIcon size={18} />
              </span>
              <input
                type="text"
                className="form-control form-premium"
                placeholder="Ingiza username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="form-label text-secondary fw-semibold">Password</label>
            <div className="input-group">
              <span className="input-group-text border-0" style={{ backgroundColor: '#0c111c', color: '#94a3b8' }}>
                <Lock size={18} />
              </span>
              <input
                type="password"
                className="form-control form-premium"
                placeholder="Ingiza password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-premium-primary w-100 py-2 d-flex justify-content-center align-items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              'Ingia Kwenye Mfumo'
            )}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <small className="text-secondary text-xs">Phase 1: Salama Healthcare Ecosystem</small>
        </div>
      </div>
    </div>
  );
};

export default Login;
