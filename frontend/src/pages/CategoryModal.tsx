import React, { useState } from 'react';
import axios from 'axios';
import { api } from '../lib/api';
import { X, Loader2, Tags } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CategoryModal({ isOpen, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(api.url('/stock/material-category'),
        { name, description }, 
        { headers: api.getHeaders() }
      );
      setName('');
      setDescription('');
      onCreated();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-surface/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/10 overflow-hidden">
        <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Tags className="text-primary w-6 h-6" />
            <h3 className="font-headline text-2xl font-bold text-primary tracking-tight">Node Definition</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <X className="w-6 h-6 text-on-surface-variant" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Category Name</label>
              <input 
                required
                type="text"
                className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all text-on-surface"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Brief Description</label>
              <textarea 
                rows={3}
                className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all text-on-surface resize-none"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full industrial-gradient text-on-primary py-4 rounded-xl font-headline font-bold text-lg tracking-wide shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Define Category'}
          </button>
        </form>
      </div>
    </div>
  );
}