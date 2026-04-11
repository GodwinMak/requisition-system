import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { authHelper } from '../lib/auth';
import { MaterialCategory } from '../types';
import { 
  ArrowLeft, 
  PackagePlus, 
  Loader2, 
  Database,
  ChevronDown
} from 'lucide-react';

export default function CreateStock() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    items_description: '',
    material_category_id: '',
    available_qty: 0,
    unit_of_measure: ''
  });

  useEffect(() => {
    const user = authHelper.getUser();
    const canManage = authHelper.isAdmin() || user?.role === 'procurement';
    if (!canManage) {
      navigate('/stock');
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await axios.get(api.url('/stock/material-category'), {
          headers: api.getHeaders()
        });
        setCategories(res.data.materialCategories || []);
      } catch (err) {
        setError('Failed to load categories');
      }
    };
    fetchCategories();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(api.url('/stock/stock'), formData, {
        headers: api.getHeaders()
      });
      navigate('/stock');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating stock item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <button 
        onClick={() => navigate('/stock')}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label text-xs uppercase tracking-widest font-bold"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Inventory
      </button>

      <div className="bg-surface-container rounded-[2rem] p-8 md:p-12 shadow-xl border border-outline-variant/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Database className="w-48 h-48" />
        </div>

        <div className="relative z-10">
          <header className="mb-10">
            <div className="w-12 h-12 industrial-gradient rounded-xl flex items-center justify-center mb-4">
              <PackagePlus className="text-white w-6 h-6" />
            </div>
            <h2 className="font-headline text-4xl font-extrabold text-primary tracking-tighter uppercase">New Resource Entry</h2>
            <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest mt-1">Operational Logistics System</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Item Description</label>
                <input 
                  required
                  type="text"
                  className="w-full px-5 py-4 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all text-on-surface font-body"
                  placeholder="e.g. Copper Cable 2.5mm² (Armoured)"
                  value={formData.items_description}
                  onChange={e => setFormData({...formData, items_description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Material Node</label>
                <div className="relative">
                  <select 
                    required
                    className="w-full px-5 py-4 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all text-on-surface font-body appearance-none"
                    value={formData.material_category_id}
                    onChange={e => setFormData({...formData, material_category_id: e.target.value})}
                  >
                    <option value="">Select Category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Unit of Measure</label>
                <input 
                  required
                  type="text"
                  className="w-full px-5 py-4 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all text-on-surface font-body"
                  placeholder="e.g. Roll, Kg, Pcs"
                  value={formData.unit_of_measure}
                  onChange={e => setFormData({...formData, unit_of_measure: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Initial Quantity</label>
                <input 
                  required
                  type="number"
                  className="w-full px-5 py-4 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all text-on-surface font-mono text-lg"
                  value={formData.available_qty}
                  onChange={e => setFormData({...formData, available_qty: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            {error && <p className="text-error text-xs font-bold bg-error-container/20 p-3 rounded-lg border border-error/20">{error}</p>}

            <button 
              disabled={loading}
              className="w-full industrial-gradient text-on-primary py-5 rounded-2xl font-headline font-bold text-xl tracking-wide shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-8"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Authorise Stock Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}