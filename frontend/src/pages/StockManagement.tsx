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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string | ''>('');
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const canManage = authHelper.isAdmin() || authHelper.getUser()?.role === 'procurement';

  // 1. Initial Load: Fetch categories first
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const headers = api.getHeaders();
      if (!headers.Authorization) {
        setError('Authentication session expired. Please login again.');
        setLoading(false);
        return;
      }

      console.log('Fetching material categories...');
      const catRes = await axios.get(api.url('/stock/material-category/'), { headers });
      console.log('Categories loaded successfully:', catRes.data);

      const rawCats = catRes.data.materialCategories || catRes.data.rows || (Array.isArray(catRes.data) ? catRes.data : []);
      const sortedCats = [...rawCats].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setCategories(sortedCats);
      
      // Do not automatically select a category or fetch stock items initially
      setSelectedCategoryId(''); // Ensure no category is selected
      setStockItems([]); // Clear any previous stock items
      setLoading(false);
    } catch (err: any) {
      console.error('CRITICAL: Category Fetch Failure');
      console.error('Status:', err.response?.status);
      console.error('Data:', err.response?.data);
      console.error('Full Error Object:', err);
      
      setError(err.response?.data?.message || 'Failed to load categories');
      setLoading(false);
    }
  };

  // 2. Fetch stock items by specific Category ID
  const fetchStockItems = async (material_category_id: number | string) => {
    // STRICT GUARD: Terminate early if the ID is undefined or missing
    if (material_category_id === undefined || material_category_id === null || material_category_id === '') {
      setStockItems([]);
      setLoading(false); // Ensure loading is turned off if guard is hit
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log(`Fetching stock items for Category ID: ${material_category_id}`);
      const url = api.url(`/stock/stock-by-category/${material_category_id}`);
      const res = await axios.get(url, { headers: api.getHeaders() });
      console.log('Stock items loaded successfully:', res.data);
      
      const items = res.data.stocks || res.data.rows || (Array.isArray(res.data) ? res.data : []);
      setStockItems(items);
    } catch (err: any) {
      console.error(`CRITICAL: Stock Fetch Failure for ID: ${material_category_id}`);
      console.error('Status:', err.response?.status);
      console.error('Data:', err.response?.data);
      console.error('Full Error Object:', err);

      setError(err.response?.data?.message || 'Failed to load stock items');
      setStockItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleCategoryChange = (material_category_id: number | string) => {
    setSelectedCategoryId(material_category_id);
    if (material_category_id !== undefined && material_category_id !== null && material_category_id !== '') {
      fetchStockItems(material_category_id);
    } else {
      setStockItems([]);
    }
  };

  const processedItems = stockItems
    .filter(item => (item.items_description || '').toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (typeof a.id === 'number' && typeof b.id === 'number') {
        return a.id - b.id;
      }
      return String(a.id).localeCompare(String(b.id));
    });

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

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-container text-error rounded-2xl border border-error/10">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-grow">
            <p className="text-sm font-bold uppercase tracking-wider">An Error Occurred</p>
            <p className="text-xs opacity-80">{error}</p>
          </div>
          <button onClick={fetchData} className="ml-auto text-xs underline font-bold">Retry</button>
        </div>
      )}

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
              {categories.map((cat) => {
                const catId = (cat as any).material_category_id || cat.id || (cat as any)._id;
                if (catId === undefined || catId === null || catId === '') return null;
                return (
                  <button
                    key={catId}
                    onClick={() => handleCategoryChange(catId)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex justify-between items-center group ${
                      selectedCategoryId === catId 
                      ? 'bg-primary text-on-primary shadow-md' 
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {cat.name}
                    <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${selectedCategoryId === catId ? 'opacity-100' : ''}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Stock Table */}
        <main className="lg:col-span-3">
          <div className="bg-surface-container rounded-3xl overflow-hidden shadow-sm border border-outline-variant/10">
            <div className="p-1">
              <div className="bg-surface-container-lowest rounded-[1.25rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label text-[11px] uppercase tracking-[0.2em]">
                      <th className="px-8 py-5 font-semibold">Description</th>
                      <th className="px-8 py-5 font-semibold">Category</th>
                      <th className="px-8 py-5 font-semibold text-center">Qty Available</th>
                      <th className="px-8 py-5 font-semibold">Unit</th>
                      <th className="px-8 py-5 font-semibold">Registered</th>
                      <th className="px-8 py-5 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low">
                    {/* Conditional rendering for loading, empty state, or data */}
                    {loading && selectedCategoryId !== '' ? ( // Case 3: Category selected, fetching stock items
                      <tr>
                        <td colSpan={6} className="px-8 py-12 text-center">
                          <Loader2 className="animate-spin text-primary w-8 h-8 mx-auto mb-2" />
                          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Loading inventory items...</p>
                        </td>
                      </tr>
                    ) : selectedCategoryId === '' ? ( // Case 2: No category selected yet
                      <tr>
                        <td colSpan={6} className="px-8 py-12 text-center">
                          <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Select a material category to view stock items</p>
                        </td>
                      </tr>
                    ) : processedItems.length === 0 ? (
                      <tr> {/* Case 4: Category selected, no stock items found */}
                        <td colSpan={6} className="px-8 py-12 text-center">
                          <div className="flex flex-col items-center opacity-40">
                            <Package className="w-12 h-12 mb-2" /> {/* Using Package icon for "No stock records" */}
                            <p className="text-sm font-bold uppercase tracking-widest">No stock records found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      processedItems.map((item) => (
                        <tr key={item.id} className="group hover:bg-surface-container-low transition-colors duration-200">
                          <td className="px-8 py-6">
                            <p className="font-headline font-bold text-primary">{item.items_description}</p>
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">
                              ID: STR-{item.id ? item.id.toString().padStart(4, '0') : '0000'}
                            </p>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full uppercase tracking-tighter">
                              {categories.find(c => {
                                const cid = (c as any).material_category_id || c.id || (c as any)._id;
                                return cid === item.material_category_id;
                              })?.name || 'N/A'}
                            </span>
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
                          <td className="px-8 py-6">
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '---'}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className={`w-2 h-2 rounded-full ml-auto ${item.available_qty > 0 ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]' : 'bg-red-500'}`} />
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