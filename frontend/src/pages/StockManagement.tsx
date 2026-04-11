import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { authHelper } from '../lib/auth';
import { StockItem, MaterialCategory } from '../types';
import { 
  Package, 
  Plus, 
  Tags, 
  Search, 
  Loader2, 
  AlertCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import CategoryModal from '../components/CategoryModal';

export default function StockManagement() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const canManage = authHelper.isAdmin() || authHelper.getUser()?.role === 'procurement';
  const userRole = authHelper.getUser()?.role;

  const fetchData = async () => {
    try {
      setLoading(true);
      const catRes = await axios.get(api.url('/stock/material-category'), {
        headers: api.getHeaders()
      });
      const cats = catRes.data.materialCategories || [];
      setCategories(cats);

      if (cats.length > 0) {
        const firstCatId = cats[0].id;
        setSelectedCategoryId(firstCatId);
        fetchStockByCategory(firstCatId);
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load stock data');
      setLoading(false);
    }
  };

  const fetchStockByCategory = async (id: number) => {
    try {
      const res = await axios.get(api.url(`/stock/stock-by-category/${id}`), {
        headers: api.getHeaders()
      });
      setStockItems(res.data.stocks || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCategoryChange = (id: number) => {
    setSelectedCategoryId(id);
    fetchStockByCategory(id);
  };

  const filteredItems = stockItems.filter(item => 
    item.items_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && categories.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
      <p className="text-on-surface-variant font-label text-xs uppercase tracking-widest">Initialising Inventory...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="font-headline text-5xl font-extrabold text-primary tracking-tighter uppercase">Inventory</h2>
          <p className="text-on-surface-variant text-sm font-label mt-2 uppercase tracking-[0.2em]">
            {canManage ? 'Logistics & Control' : 'Material Availability View'}
          </p>
        </div>
        
        {canManage && (
          <div className="flex gap-3">
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-surface-container-high text-primary rounded-xl font-bold text-sm border border-outline-variant/20 hover:bg-surface-container-highest transition-all"
            >
              <Tags className="w-4 h-4" />
              Add Category
            </button>
            <button 
              onClick={() => navigate('/stock/create')}
              className="flex items-center gap-2 px-6 py-3 industrial-gradient text-on-primary rounded-xl font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-5 h-5" />
              Register Stock
            </button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Category Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input 
              type="text"
              placeholder="Quick Search..."
              className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant/10 rounded-xl text-xs focus:ring-1 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-primary mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Material Nodes
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex justify-between items-center group ${
                    selectedCategoryId === cat.id 
                    ? 'bg-primary text-on-primary shadow-md' 
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {cat.name}
                  <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${selectedCategoryId === cat.id ? 'opacity-100' : ''}`} />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Stock Table Area */}
        <main className="lg:col-span-3">
          <div className="bg-surface-container rounded-3xl overflow-hidden shadow-sm border border-outline-variant/10">
            <div className="p-1">
              <div className="bg-surface-container-lowest rounded-[1.25rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label text-[11px] uppercase tracking-[0.2em]">
                      <th className="px-8 py-5 font-semibold">Description</th>
                      <th className="px-8 py-5 font-semibold text-center">Qty Available</th>
                      <th className="px-8 py-5 font-semibold">Unit</th>
                      <th className="px-8 py-5 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center">
                          <div className="flex flex-col items-center opacity-40">
                            <Package className="w-12 h-12 mb-2" />
                            <p className="text-sm font-bold uppercase tracking-widest">No stock records found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => (
                        <tr key={item.id} className="group hover:bg-surface-container-low transition-colors duration-200">
                          <td className="px-8 py-6">
                            <p className="font-headline font-bold text-primary">{item.items_description}</p>
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">ID: STR-{item.id.toString().padStart(4, '0')}</p>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={`inline-block px-3 py-1 rounded-lg font-mono font-bold text-lg ${item.available_qty < 10 ? 'text-error' : 'text-on-surface'}`}>
                              {item.available_qty}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-xs font-bold uppercase text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">
                              {item.unit_of_measure}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className={`w-2 h-2 rounded-full ml-auto ${item.available_qty > 0 ? 'bg-tertiary shadow-[0_0_8px_rgba(var(--tertiary),0.5)]' : 'bg-error'}`} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      <CategoryModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
        onCreated={fetchData} 
      />
    </div>
  );
}