/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Phone, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  Hammer,
  UtensilsCrossed,
  LayoutGrid,
  ClipboardCheck,
  Loader2,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Star,
  Settings,
  LogIn,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Save,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  db, 
  auth, 
  loginWithGoogle, 
  logout, 
  onAuthStateChanged, 
  User,
  handleFirestoreError,
  OperationType
} from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';

const SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop',
    title: 'Gulshan Luxury Living',
    subtitle: 'Crafting elegance in the heart of Dhaka'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1556911223-e1520288c057?q=80&w=2000&auto=format&fit=crop',
    title: 'Banani Modern Kitchens',
    subtitle: 'Where functionality meets Dhaka style'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2000&auto=format&fit=crop',
    title: 'Dhanmondi Renovations',
    subtitle: 'Transforming heritage into modern reality'
  }
];

// ==========================================
// EDIT HEADER MENU ITEMS HERE
// ==========================================
const MENU_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'kitchens', label: 'Kitchens' },
  { id: 'renovation', label: 'Renovation' }
] as const;

type TabType = typeof MENU_ITEMS[number]['id'];
// ==========================================

const RECENT_POSTS = [
  {
    id: 1,
    title: 'The Future of Minimalist Design',
    excerpt: 'Discover how less is becoming more in modern urban apartments.',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=800&auto=format&fit=crop',
    date: 'March 15, 2026'
  },
  {
    id: 2,
    title: 'Top 5 Kitchen Trends for 2026',
    excerpt: 'From smart appliances to sustainable materials, here is what is hot.',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800&auto=format&fit=crop',
    date: 'March 10, 2026'
  },
  {
    id: 3,
    title: 'Renovation: Before and After',
    excerpt: 'A deep dive into our latest penthouse transformation project.',
    image: 'https://images.unsplash.com/photo-1503387762-592dee58c160?q=80&w=800&auto=format&fit=crop',
    date: 'March 05, 2026'
  }
];

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Ahmed Kabir',
    role: 'Homeowner',
    content: 'Altasmim Engineering transformed my old apartment into a modern masterpiece. Their attention to detail in the kitchen design was exceptional.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Sarah Rahman',
    role: 'Business Owner',
    content: 'The renovation process was smooth and professional. They stayed on schedule and the final result exceeded my expectations.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Tanvir Hasan',
    role: 'Penthouse Owner',
    content: 'Truly the best interior engineering firm in the city. Their minimalist approach is exactly what I was looking for.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
  }
];

const PROJECTS_DATA = [
  { id: 1, name: 'Gulshan Residence', category: 'Residential', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop', description: 'A luxurious residential project in Gulshan featuring modern architecture and high-end interior finishes.' },
  { id: 2, name: 'Banani Penthouse', category: 'Residential', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop', description: 'Exclusive penthouse design in Banani with panoramic city views and bespoke furniture.' },
  { id: 3, name: 'Dhanmondi Office', category: 'Commercial', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop', description: 'Modern corporate office space in Dhanmondi designed for productivity and employee well-being.' },
  { id: 4, name: 'Uttara Luxury Villa', category: 'Residential', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800&auto=format&fit=crop', description: 'Spacious villa in Uttara with a blend of traditional and contemporary design elements.' },
  { id: 5, name: 'Baridhara Studio', category: 'Residential', image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=800&auto=format&fit=crop', description: 'Compact yet elegant studio apartment in Baridhara, maximizing space and light.' },
  { id: 6, name: 'Bashundhara Apartment', category: 'Residential', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop', description: 'Family-friendly apartment in Bashundhara with a focus on comfort and durability.' },
  { id: 7, name: 'Purbachal Eco-Home', category: 'Residential', image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=800&auto=format&fit=crop', description: 'Sustainable and eco-friendly home design in Purbachal, integrating green technology.' },
  { id: 8, name: 'Mohakhali Loft', category: 'Residential', image: 'https://images.unsplash.com/photo-1536376074432-a228d0677e4f?q=80&w=800&auto=format&fit=crop', description: 'Industrial-style loft in Mohakhali with open floor plans and exposed structural elements.' },
  { id: 9, name: 'Mirpur Art Space', category: 'Commercial', image: 'https://images.unsplash.com/photo-1554188248-986adbb73be4?q=80&w=800&auto=format&fit=crop', description: 'Creative art studio and gallery space in Mirpur, designed to inspire.' },
  { id: 10, name: 'Nikunja Smart Home', category: 'Residential', image: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?q=80&w=800&auto=format&fit=crop', description: 'Fully automated smart home in Nikunja, featuring the latest in home automation tech.' },
];

const KITCHENS_DATA = [
  { id: 1, name: 'Gulshan Modern', category: 'Modern', image: 'https://images.unsplash.com/photo-1556911223-e1520288c057?q=80&w=800&auto=format&fit=crop', description: 'Sleek modern kitchen in Gulshan with high-gloss finishes and integrated appliances.' },
  { id: 2, name: 'Banani Modular', category: 'Functional', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800&auto=format&fit=crop', description: 'Highly functional modular kitchen in Banani, optimized for storage and workflow.' },
  { id: 3, name: 'Dhanmondi Open', category: 'Spacious', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=800&auto=format&fit=crop', description: 'Open-plan kitchen in Dhanmondi that seamlessly connects with the living area.' },
  { id: 4, name: 'Uttara Traditional', category: 'Traditional', image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=800&auto=format&fit=crop', description: 'Warm and inviting traditional kitchen in Uttara with wooden cabinetry and classic details.' },
  { id: 5, name: 'Baridhara Sleek', category: 'Sleek', image: 'https://images.unsplash.com/photo-1565182999561-18d7dc63c394?q=80&w=800&auto=format&fit=crop', description: 'Minimalist sleek kitchen in Baridhara with handle-less cabinets and stone countertops.' },
  { id: 6, name: 'Bashundhara Compact', category: 'Small Space', image: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=800&auto=format&fit=crop', description: 'Space-saving compact kitchen in Bashundhara, perfect for smaller apartments.' },
  { id: 7, name: 'Purbachal Chef\'s', category: 'Professional', image: 'https://images.unsplash.com/photo-1520974285082-615583bb99a2?q=80&w=800&auto=format&fit=crop', description: 'Professional-grade chef\'s kitchen in Purbachal with high-performance equipment.' },
  { id: 8, name: 'Mohakhali Classic', category: 'Classic', image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=800&auto=format&fit=crop', description: 'Timeless classic kitchen in Mohakhali with elegant moldings and premium hardware.' },
  { id: 9, name: 'Mirpur Luxury', category: 'Luxury', image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=800&auto=format&fit=crop', description: 'Ultra-luxury kitchen in Mirpur featuring exotic materials and custom craftsmanship.' },
  { id: 10, name: 'Nikunja Minimalist', category: 'Minimalist', image: 'https://images.unsplash.com/photo-1556912177-4517fa26df0e?q=80&w=800&auto=format&fit=crop', description: 'Simple and clean minimalist kitchen in Nikunja, focusing on essential forms.' },
];

const RENOVATIONS_DATA = [
  { id: 1, name: 'Old Dhaka Restore', category: 'Heritage', image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=800&auto=format&fit=crop', description: 'Careful restoration of a heritage building in Old Dhaka, preserving its historical character.' },
  { id: 2, name: 'Gulshan Makeover', category: 'Interior', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop', description: 'Complete interior makeover of a Gulshan residence, updating it for modern living.' },
  { id: 3, name: 'Banani Structural', category: 'Structural', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop', description: 'Major structural renovation in Banani to improve safety and open up floor plans.' },
  { id: 4, name: 'Dhanmondi Basement', category: 'Structural', image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5db?q=80&w=800&auto=format&fit=crop', description: 'Transforming a Dhanmondi basement into a functional living and entertainment space.' },
  { id: 5, name: 'Uttara Exterior', category: 'Exterior', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop', description: 'Refreshing the exterior facade of an Uttara villa with modern materials and lighting.' },
  { id: 6, name: 'Baridhara Fit-out', category: 'Commercial', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=800&auto=format&fit=crop', description: 'Commercial fit-out for a Baridhara office, creating a professional and modern environment.' },
  { id: 7, name: 'Bashundhara Bedroom', category: 'Interior', image: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=800&auto=format&fit=crop', description: 'Cozy and modern bedroom renovation in Bashundhara, focusing on relaxation.' },
  { id: 8, name: 'Purbachal Landscape', category: 'Outdoor', image: 'https://images.unsplash.com/photo-1558904541-efa8c1965f1e?q=80&w=800&auto=format&fit=crop', description: 'Complete landscaping project in Purbachal, creating a beautiful outdoor oasis.' },
  { id: 9, name: 'Mohakhali Suite', category: 'Interior', image: 'https://images.unsplash.com/photo-1503387762-592dee58c160?q=80&w=800&auto=format&fit=crop', description: 'Renovating a Mohakhali suite with premium finishes and a sophisticated color palette.' },
  { id: 10, name: 'Full Dhaka Overhaul', category: 'Complete', image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=800&auto=format&fit=crop', description: 'A comprehensive overhaul of a property in Dhaka, from structural changes to interior design.' },
];

// --- Firebase Interfaces ---
interface SiteSettings {
  logoUrl: string;
  siteName: string;
  contactPhone: string;
  contactEmail: string;
  footerText: string;
  fontFamily?: 'font-sans' | 'font-serif' | 'font-mono' | 'font-montserrat' | 'font-optima' | 'custom';
  customFontName?: string;
  themeColor?: string;
  customThemeColor?: string;
}

interface Post {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  content: string;
  createdAt?: any;
}

interface Review {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

interface FloatingAd {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  link?: string;
  isActive: boolean;
  occasion?: string;
}

interface Quote {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  message: string;
  createdAt: any;
}

// --- Components ---

function FloatingAdPopup({ ad }: { ad: FloatingAd }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-8 left-8 z-[60] max-w-sm w-full"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden relative">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
        
        {ad.imageUrl && (
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
        )}
        
        <div className="p-8">
          {ad.occasion && (
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 mb-2 block">
              {ad.occasion}
            </span>
          )}
          <h3 className="text-2xl font-bold mb-3 tracking-tight">{ad.title}</h3>
          <p className="text-stone-500 text-sm leading-relaxed mb-6">{ad.message}</p>
          
          {ad.link && (
            <a 
              href={ad.link}
              className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all"
            >
              Learn More <ArrowRight className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function AdminPanel({ 
  settings, 
  posts, 
  reviews, 
  ads, 
  quotes,
  onClose 
}: { 
  settings: SiteSettings; 
  posts: Post[]; 
  reviews: Review[]; 
  ads: FloatingAd[];
  quotes: Quote[];
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'settings' | 'styles' | 'posts' | 'reviews' | 'ads' | 'quotes'>('settings');
  const [isSaving, setIsSaving] = useState(false);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState(settings);

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), settingsForm);
      alert('Settings saved successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/global');
    } finally {
      setIsSaving(false);
    }
  };

  // Generic CRUD Handlers
  const handleDelete = async (collectionName: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-stone-900/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
    >
      <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
            <p className="text-stone-400 text-xs uppercase tracking-widest font-semibold mt-1">Manage your website content</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-stone-100 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-100 px-8 bg-white overflow-x-auto no-scrollbar">
          {[
            { id: 'settings', label: 'Site Settings', icon: Settings },
            { id: 'styles', label: 'Style & Fonts', icon: ImageIcon },
            { id: 'posts', label: 'Recent Posts', icon: LayoutGrid },
            { id: 'reviews', label: 'Reviews', icon: Star },
            { id: 'quotes', label: 'Quote Requests', icon: ClipboardCheck },
            { id: 'ads', label: 'Floating Ads', icon: ImageIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-5 text-sm font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id 
                ? 'border-stone-900 text-stone-900' 
                : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-stone-50/30">
          {activeTab === 'settings' && (
            <form onSubmit={handleSettingsSave} className="max-w-2xl space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Site Name</label>
                  <input 
                    type="text" 
                    value={settingsForm.siteName}
                    onChange={(e) => setSettingsForm({...settingsForm, siteName: e.target.value})}
                    className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Logo URL</label>
                  <input 
                    type="text" 
                    value={settingsForm.logoUrl}
                    onChange={(e) => setSettingsForm({...settingsForm, logoUrl: e.target.value})}
                    className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Contact Phone</label>
                  <input 
                    type="text" 
                    value={settingsForm.contactPhone}
                    onChange={(e) => setSettingsForm({...settingsForm, contactPhone: e.target.value})}
                    className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Contact Email</label>
                  <input 
                    type="email" 
                    value={settingsForm.contactEmail}
                    onChange={(e) => setSettingsForm({...settingsForm, contactEmail: e.target.value})}
                    className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Footer Text</label>
                <textarea 
                  value={settingsForm.footerText}
                  onChange={(e) => setSettingsForm({...settingsForm, footerText: e.target.value})}
                  rows={3}
                  className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none transition-all"
                />
              </div>
              <button 
                disabled={isSaving}
                type="submit"
                className="bg-stone-900 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Settings
              </button>
            </form>
          )}

          {activeTab === 'styles' && (
            <form onSubmit={handleSettingsSave} className="max-w-2xl space-y-12">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <h3 className="text-lg font-bold">Typography</h3>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Choose a preset or use system font</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { id: 'font-sans', name: 'Modern Sans', preview: 'Abc' },
                    { id: 'font-serif', name: 'Elegant Serif', preview: 'Abc' },
                    { id: 'font-mono', name: 'Technical Mono', preview: 'Abc' },
                    { id: 'font-montserrat', name: 'Montserrat', preview: 'Abc' },
                    { id: 'font-optima', name: 'Optima Style', preview: 'Abc' },
                  ].map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setSettingsForm({...settingsForm, fontFamily: font.id as any})}
                      className={`p-6 rounded-3xl border-2 text-left transition-all ${
                        settingsForm.fontFamily === font.id 
                        ? 'border-stone-900 bg-stone-50' 
                        : 'border-stone-100 hover:border-stone-200'
                      }`}
                    >
                      <span className={`text-3xl block mb-2 ${font.id}`}>{font.preview}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{font.name}</span>
                    </button>
                  ))}

                  <div className={`p-6 rounded-3xl border-2 transition-all ${
                    settingsForm.fontFamily === 'custom' 
                    ? 'border-stone-900 bg-stone-50' 
                    : 'border-stone-100'
                  }`}>
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Custom System Font</span>
                      <input 
                        type="text" 
                        placeholder="Font Name (e.g. Arial)"
                        value={settingsForm.customFontName || ''}
                        onChange={(e) => setSettingsForm({...settingsForm, fontFamily: 'custom', customFontName: e.target.value})}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:border-stone-900 outline-none transition-all"
                      />
                      {settingsForm.customFontName && (
                        <span className="text-xl mt-1 truncate" style={{ fontFamily: settingsForm.customFontName }}>
                          Preview Text
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold">Theme Color</h3>
                <div className="flex flex-wrap gap-4 items-center">
                  {[
                    { id: 'stone', color: '#1c1917' },
                    { id: 'emerald', color: '#059669' },
                    { id: 'indigo', color: '#4f46e5' },
                    { id: 'rose', color: '#e11d48' },
                    { id: 'amber', color: '#d97706' },
                  ].map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSettingsForm({...settingsForm, themeColor: color.id})}
                      className={`w-12 h-12 rounded-full border-4 transition-all ${
                        settingsForm.themeColor === color.id 
                        ? 'border-stone-900 scale-110' 
                        : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.color }}
                    />
                  ))}
                  
                  <div className="flex items-center gap-3 ml-4 p-3 bg-stone-100 rounded-2xl">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                      <input 
                        type="color" 
                        value={settingsForm.customThemeColor || '#000000'}
                        onChange={(e) => setSettingsForm({...settingsForm, themeColor: 'custom', customThemeColor: e.target.value})}
                        className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                      />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Custom Color</span>
                  </div>
                </div>
              </div>

              <button 
                disabled={isSaving}
                type="submit"
                className="bg-stone-900 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Apply Style Changes
              </button>
            </form>
          )}

          {activeTab === 'posts' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Manage Posts</h3>
                <button 
                  onClick={async () => {
                    const title = prompt('Post Title:');
                    if (!title) return;
                    try {
                      await addDoc(collection(db, 'posts'), {
                        title,
                        excerpt: 'New post excerpt...',
                        image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=800&auto=format&fit=crop',
                        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                        content: 'Full content here...',
                        createdAt: serverTimestamp()
                      });
                    } catch (error) {
                      handleFirestoreError(error, OperationType.CREATE, 'posts');
                    }
                  }}
                  className="bg-stone-900 text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-stone-800 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add New Post
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm group">
                    <img src={post.image} alt={post.title} className="w-full h-32 object-cover rounded-2xl mb-4" referrerPolicy="no-referrer" />
                    <h4 className="font-bold mb-2 line-clamp-1">{post.title}</h4>
                    <p className="text-stone-400 text-xs mb-6 line-clamp-2">{post.excerpt}</p>
                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => handleDelete('posts', post.id)}
                        className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-stone-300 hover:text-stone-900 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Manage Reviews</h3>
                <button 
                  onClick={async () => {
                    const name = prompt('Reviewer Name:');
                    if (!name) return;
                    try {
                      await addDoc(collection(db, 'reviews'), {
                        name,
                        role: 'Client',
                        content: 'Great service!',
                        rating: 5,
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
                        createdAt: serverTimestamp()
                      });
                    } catch (error) {
                      handleFirestoreError(error, OperationType.CREATE, 'reviews');
                    }
                  }}
                  className="bg-stone-900 text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-stone-800 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add New Review
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="font-bold text-sm">{review.name}</h4>
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest">{review.role}</p>
                      </div>
                    </div>
                    <p className="text-stone-500 text-xs mb-6 line-clamp-3 italic">"{review.content}"</p>
                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => handleDelete('reviews', review.id)}
                        className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex gap-0.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-stone-900 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'quotes' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Quote Requests</h3>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{quotes.length} total requests</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {quotes.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-stone-100">
                    <ClipboardCheck className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                    <p className="text-stone-400 font-medium">No quote requests yet.</p>
                  </div>
                ) : (
                  quotes.map((quote) => (
                    <div key={quote.id} className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-600 font-bold">
                            {quote.fullName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold">{quote.fullName}</h4>
                            <p className="text-[10px] text-stone-400 uppercase tracking-widest">{quote.serviceType}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center gap-2 text-xs text-stone-500">
                            <Mail className="w-3 h-3" /> {quote.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-stone-500">
                            <Phone className="w-3 h-3" /> {quote.phone}
                          </div>
                        </div>
                        <div className="bg-stone-50 p-4 rounded-2xl">
                          <p className="text-xs text-stone-600 leading-relaxed">{quote.message}</p>
                        </div>
                      </div>
                      <div className="flex md:flex-col justify-between items-end">
                        <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">
                          {quote.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                        </span>
                        <button 
                          onClick={() => handleDelete('quotes', quote.id)}
                          className="p-3 text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Manage Ads</h3>
                <button 
                  onClick={async () => {
                    const title = prompt('Ad Title:');
                    if (!title) return;
                    try {
                      await addDoc(collection(db, 'ads'), {
                        title,
                        message: 'Special offer message...',
                        isActive: false,
                        occasion: 'Special Occasion',
                        imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop'
                      });
                    } catch (error) {
                      handleFirestoreError(error, OperationType.CREATE, 'ads');
                    }
                  }}
                  className="bg-stone-900 text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-stone-800 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add New Ad
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map((ad) => (
                  <div key={ad.id} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-sm">{ad.title}</h4>
                      <button 
                        onClick={async () => {
                          try {
                            await updateDoc(doc(db, 'ads', ad.id), { isActive: !ad.isActive });
                          } catch (error) {
                            handleFirestoreError(error, OperationType.UPDATE, `ads/${ad.id}`);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all ${
                          ad.isActive 
                          ? 'bg-emerald-100 text-emerald-600' 
                          : 'bg-stone-100 text-stone-400'
                        }`}
                      >
                        {ad.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                    <p className="text-stone-500 text-xs mb-6 line-clamp-2">{ad.message}</p>
                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => handleDelete('ads', ad.id)}
                        className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFormStatus, setReviewFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  // --- Firebase State ---
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    logoUrl: 'https://picsum.photos/seed/altasmim/200/200',
    siteName: 'Altasmim Engineering',
    contactPhone: '+880 1703862448',
    contactEmail: 'info@altasmim.com',
    footerText: '',
    fontFamily: 'font-sans',
    customFontName: '',
    themeColor: 'stone',
    customThemeColor: '#1c1917'
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ads, setAds] = useState<FloatingAd[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  // --- Theme Color Map ---
  const themeColors: Record<string, string> = {
    stone: '#1c1917',
    emerald: '#059669',
    indigo: '#4f46e5',
    rose: '#e11d48',
    amber: '#d97706'
  };

  const activeColorHex = siteSettings.themeColor === 'custom' 
    ? siteSettings.customThemeColor || '#1c1917'
    : themeColors[siteSettings.themeColor || 'stone'] || '#1c1917';

  // --- Firebase Effects ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user && user.email === 'mrmunna774@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Site Settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSiteSettings(doc.data() as SiteSettings);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/global'));

    // Posts
    const qPosts = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(3));
    const unsubPosts = onSnapshot(qPosts, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(postsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'posts'));

    // Reviews
    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(reviewsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'reviews'));

    // Ads
    const unsubAds = onSnapshot(collection(db, 'ads'), (snapshot) => {
      const adsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FloatingAd));
      setAds(adsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'ads'));

    return () => {
      unsubSettings();
      unsubPosts();
      unsubReviews();
      unsubAds();
    };
  }, []);

  // Admin-only data
  useEffect(() => {
    if (!isAdmin) {
      setQuotes([]);
      return;
    }

    const unsubQuotes = onSnapshot(query(collection(db, 'quotes'), orderBy('createdAt', 'desc')), (snapshot) => {
      const quotesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quote));
      setQuotes(quotesData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'quotes'));

    return () => unsubQuotes();
  }, [isAdmin]);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    const formData = new FormData(e.target as HTMLFormElement);
    const quoteData = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      serviceType: formData.get('serviceType'),
      message: formData.get('message'),
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'quotes'), quoteData);
      
      // Send email notification via backend
      try {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quoteData)
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // We don't fail the whole process if email fails, as Firestore already has the data
      }

      setFormStatus('success');
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setFormStatus('idle'), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'quotes');
      setFormStatus('idle');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewFormStatus('submitting');
    
    const formData = new FormData(e.target as HTMLFormElement);
    const reviewData = {
      name: formData.get('name'),
      role: formData.get('role') || 'Client',
      content: formData.get('content'),
      rating: Number(formData.get('rating')),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.get('name')}`,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'reviews'), reviewData);
      setReviewFormStatus('success');
      setTimeout(() => {
        setShowReviewForm(false);
        setReviewFormStatus('idle');
      }, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
      setReviewFormStatus('idle');
    }
  };

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div 
      className={`min-h-screen bg-white text-[#1a1a1a] ${siteSettings.fontFamily === 'custom' ? '' : (siteSettings.fontFamily || 'font-sans')} selection-theme`}
      style={{ 
        '--theme-color': activeColorHex,
        fontFamily: siteSettings.fontFamily === 'custom' ? siteSettings.customFontName : undefined
      } as any}
    >
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-stone-900/95 backdrop-blur-xl z-50 border-b border-stone-800 shadow-lg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setActiveTab('home');
                setSelectedItem(null);
                setIsMenuOpen(false);
              }}
              className="flex-shrink-0 flex items-center gap-2 cursor-pointer group"
            >
              <img 
                src={siteSettings.logoUrl} 
                alt={siteSettings.siteName} 
                className="h-10 w-auto brightness-0 invert"
                referrerPolicy="no-referrer"
              />
              <span className="text-lg sm:text-xl font-bold tracking-tighter uppercase group-hover:text-stone-300 transition-colors">
                {siteSettings.siteName.split(' ')[0]} <span className="text-stone-400 hidden xs:inline">{siteSettings.siteName.split(' ').slice(1).join(' ')}</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center sm:space-x-4 md:space-x-8">
              {MENU_ITEMS.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveTab(item.id); }} 
                  className={`text-xs md:text-sm font-medium transition-colors uppercase tracking-widest ${activeTab === item.id ? 'text-white border-b-2 border-white' : 'text-stone-400 hover:text-white'}`}
                >
                  {item.label}
                </button>
              ))}
              <a href="#quote" className="text-xs md:text-sm font-bold text-white border-b-2 border-white pb-1 uppercase tracking-widest">Get Quote</a>
            </div>

            {/* Contact & Mobile Toggle */}
            <div className="flex items-center gap-4">
              <a 
                href={`tel:${siteSettings.contactPhone}`}
                className="hidden sm:flex items-center gap-2 bg-white text-stone-900 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-stone-200 transition-all shadow-lg shadow-stone-900/20"
              >
                <Phone className="w-4 h-4" />
                <span>{siteSettings.contactPhone}</span>
              </a>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden p-2 text-white"
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden bg-stone-900 border-b border-stone-800 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-4">
                {MENU_ITEMS.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveTab(item.id); setIsMenuOpen(false); }} 
                    className={`block w-full text-left text-lg font-medium py-2 ${activeTab === item.id ? 'text-white' : 'text-stone-400'}`}
                  >
                    {item.label}
                  </button>
                ))}
                <a href="#quote" onClick={() => setIsMenuOpen(false)} className="block text-lg font-bold text-white py-2">Get Quote</a>
                <a href={`tel:${siteSettings.contactPhone}`} className="flex items-center gap-2 text-stone-400 py-2">
                  <Phone className="w-5 h-5" />
                  <span>Call Us: {siteSettings.contactPhone}</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content Area */}
      <main className="pt-20">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Floating Ad */}
        {ads.filter(ad => ad.isActive).map(ad => (
          <FloatingAdPopup key={ad.id} ad={ad} />
        ))}

        {/* Admin Panel */}
        <AnimatePresence>
          {showAdminPanel && (
            <AdminPanel 
              settings={siteSettings}
              posts={posts}
              reviews={reviews}
              ads={ads}
              quotes={quotes}
              onClose={() => setShowAdminPanel(false)}
            />
          )}
        </AnimatePresence>

        {/* Hero Slider */}
              <section className="relative h-[80vh] sm:h-screen overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                  >
                    <div className="absolute inset-0 bg-black/40 z-10" />
                    <img 
                      src={SLIDES[currentSlide].image} 
                      alt={SLIDES[currentSlide].title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-4">
                      <div className="max-w-4xl">
                        <motion.span 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="inline-block text-white/80 text-sm uppercase tracking-[0.4em] mb-4 font-medium"
                        >
                          Altasmim Engineering
                        </motion.span>
                        <motion.h1 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-bold text-white mb-6 tracking-tighter"
                        >
                          {SLIDES[currentSlide].title}
                        </motion.h1>
                        <motion.p 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                          className="text-lg md:text-xl text-white/90 mb-10 font-light px-4"
                        >
                          {SLIDES[currentSlide].subtitle}
                        </motion.p>
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.8 }}
                        >
                          <button 
                            onClick={() => setActiveTab('projects')}
                            className="bg-white text-stone-900 px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold uppercase tracking-widest hover:bg-stone-100 transition-all shadow-2xl text-sm sm:text-base"
                          >
                            Explore Projects
                          </button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Slider Controls */}
                <div className="absolute bottom-10 right-10 z-30 flex gap-4">
                  <button 
                    onClick={prevSlide}
                    className="w-12 h-12 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all"
                  >
                    <ChevronLeft />
                  </button>
                  <button 
                    onClick={nextSlide}
                    className="w-12 h-12 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all"
                  >
                    <ChevronRight />
                  </button>
                </div>

                {/* Progress Indicators */}
                <div className="absolute bottom-10 left-10 z-30 flex gap-2">
                  {SLIDES.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1 transition-all duration-300 ${idx === currentSlide ? 'w-12 bg-white' : 'w-4 bg-white/30'}`}
                    />
                  ))}
                </div>
              </section>

              {/* Recent Posts Section */}
              <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                      <span className="text-stone-400 text-sm uppercase tracking-[0.3em] font-semibold mb-4 block">Our Journal</span>
                      <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">Recent Insights</h2>
                    </div>
                    <button className="text-stone-900 font-bold border-b-2 border-stone-900 pb-1 uppercase tracking-widest text-sm">
                      View All Posts
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {posts.length > 0 ? posts.map((post) => (
                      <article key={post.id} className="group cursor-pointer" onClick={() => setSelectedItem(post)}>
                        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl mb-6">
                          <img 
                            src={post.image} 
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            {post.date}
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 group-hover:text-stone-600 transition-colors leading-tight">
                          {post.title}
                        </h3>
                        <p className="text-stone-500 line-clamp-2 mb-4 font-light leading-relaxed">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-widest">
                          Read Article <ArrowRight className="w-3 h-3" />
                        </div>
                      </article>
                    )) : (
                      <div className="col-span-3 text-center py-12 text-stone-400 italic">
                        No recent posts available.
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Customer Reviews Section */}
              <section className="py-24 bg-stone-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="text-center md:text-left">
                      <span className="text-stone-400 text-sm uppercase tracking-[0.3em] font-semibold mb-4 block">Testimonials</span>
                      <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">What Our Clients Say</h2>
                    </div>
                    <button 
                      onClick={() => setShowReviewForm(true)}
                      className="bg-stone-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-all shadow-lg self-center md:self-end"
                    >
                      Write a Review
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.length > 0 ? reviews.map((review) => (
                      <div key={review.id} className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-500">
                        <div className="flex gap-1 mb-6">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-stone-900 fill-current" />
                          ))}
                        </div>
                        <p className="text-stone-600 italic mb-8 leading-relaxed">
                          "{review.content}"
                        </p>
                        <div className="flex items-center gap-4">
                          <img 
                            src={review.avatar} 
                            alt={review.name} 
                            className="w-12 h-12 rounded-full object-cover border-2 border-stone-100"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="font-bold text-stone-900">{review.name}</h4>
                            <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold">{review.role}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-3 text-center py-12 text-stone-400 italic">
                        No reviews yet.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="py-24"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <span className="text-stone-400 text-sm uppercase tracking-[0.3em] font-semibold mb-4 block">Our Portfolio</span>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">Featured Projects</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {PROJECTS_DATA.map((project) => (
                    <div 
                      key={project.id} 
                      onClick={() => setSelectedItem(project)}
                      className="group relative overflow-hidden rounded-2xl aspect-square cursor-pointer"
                    >
                      <img src={project.image} alt={project.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        <p className="text-white font-bold text-lg">{project.name}</p>
                        <p className="text-white/70 text-xs uppercase tracking-widest">{project.category}</p>
                        <div className="mt-4 flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                          View Details <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'kitchens' && (
            <motion.div
              key="kitchens"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="py-24"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <span className="text-stone-400 text-sm uppercase tracking-[0.3em] font-semibold mb-4 block">Culinary Spaces</span>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">Kitchen Designs</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {KITCHENS_DATA.map((kitchen) => (
                    <div 
                      key={kitchen.id} 
                      onClick={() => setSelectedItem(kitchen)}
                      className="group relative overflow-hidden rounded-2xl aspect-square cursor-pointer"
                    >
                      <img src={kitchen.image} alt={kitchen.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        <p className="text-white font-bold text-lg">{kitchen.name}</p>
                        <p className="text-white/70 text-xs uppercase tracking-widest">{kitchen.category}</p>
                        <div className="mt-4 flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                          View Details <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'renovation' && (
            <motion.div
              key="renovation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="py-24"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <span className="text-stone-400 text-sm uppercase tracking-[0.3em] font-semibold mb-4 block">Transformations</span>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">Renovation Services</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {RENOVATIONS_DATA.map((renovation) => (
                    <div 
                      key={renovation.id} 
                      onClick={() => setSelectedItem(renovation)}
                      className="group relative overflow-hidden rounded-2xl aspect-square cursor-pointer"
                    >
                      <img src={renovation.image} alt={renovation.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        <p className="text-white font-bold text-lg">{renovation.name}</p>
                        <p className="text-white/70 text-xs uppercase tracking-widest">{renovation.category}</p>
                        <div className="mt-4 flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                          View Details <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Get Quote Form Section */}
      <section id="quote" className="py-24 bg-stone-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-stone-500 text-sm uppercase tracking-[0.3em] font-semibold mb-4 block">Consultation</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">Get a Free Quote</h2>
            <p className="mt-4 text-stone-400">Fill out the form below and we'll get back to you within 24 hours.</p>
          </div>

          {formStatus === 'success' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur p-12 rounded-3xl text-center border border-white/20"
            >
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardCheck className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
              <p className="text-stone-400">Your request has been sent successfully. A notification has been sent to our engineering team, and we will contact you shortly.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleQuoteSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Full Name</label>
                  <input required name="fullName" type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white transition-colors" placeholder="Name" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Email Address</label>
                  <input required name="email" type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white transition-colors" placeholder="john@example.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Phone Number</label>
                  <input required name="phone" type="tel" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white transition-colors" placeholder="+880 1XXX XXXXXX" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Service Type</label>
                  <select required name="serviceType" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white transition-colors appearance-none">
                    <option className="bg-stone-900">Interior Project</option>
                    <option className="bg-stone-900">Kitchen Design</option>
                    <option className="bg-stone-900">Full Renovation</option>
                    <option className="bg-stone-900">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Message</label>
                <textarea required name="message" rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white transition-colors" placeholder="Tell us about your dream project..."></textarea>
              </div>
              <button 
                disabled={formStatus === 'submitting'}
                type="submit" 
                className="w-full bg-white text-stone-900 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-stone-100 transition-all flex items-center justify-center gap-2"
              >
                {formStatus === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : 'Send Request'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/20"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2 aspect-square lg:aspect-auto">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
                  <span className="text-stone-400 text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
                    {selectedItem.category}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-6 uppercase tracking-tight leading-tight">
                    {selectedItem.name}
                  </h2>
                  <div className="w-12 h-1 bg-stone-900 mb-8"></div>
                  <p className="text-stone-600 leading-relaxed mb-8 text-lg">
                    {selectedItem.description}
                  </p>
                  <button 
                    onClick={() => {
                      setSelectedItem(null);
                      document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-stone-900 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-all self-start"
                  >
                    Discuss This Project
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Submission Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowReviewForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowReviewForm(false)}
                className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold tracking-tight">Share Your Experience</h3>
                <p className="text-stone-400 text-sm mt-2 font-light">We value your feedback and insights.</p>
              </div>

              {reviewFormStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 fill-current" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Thank You!</h4>
                  <p className="text-stone-500">Your review has been submitted successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Your Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <label key={num} className="cursor-pointer group">
                          <input type="radio" name="rating" value={num} required className="hidden peer" />
                          <Star className="w-8 h-8 text-stone-200 peer-checked:text-stone-900 group-hover:text-stone-400 transition-colors fill-current" />
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Full Name</label>
                      <input required name="name" type="text" className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 focus:outline-none focus:border-stone-900 transition-all text-sm" placeholder="Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Role / Company</label>
                      <input name="role" type="text" className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 focus:outline-none focus:border-stone-900 transition-all text-sm" placeholder="CEO, Example Inc" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Your Review</label>
                    <textarea required name="content" rows={4} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 focus:outline-none focus:border-stone-900 transition-all text-sm resize-none" placeholder="Tell us about your experience working with us..."></textarea>
                  </div>

                  <button 
                    disabled={reviewFormStatus === 'submitting'}
                    type="submit" 
                    className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
                  >
                    {reviewFormStatus === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : 'Submit Review'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-[#0c0a09] text-white pt-24 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-stone-500/20 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-8">
                <img 
                  src={siteSettings.logoUrl} 
                  alt={siteSettings.siteName} 
                  className="h-10 w-auto brightness-0 invert"
                  referrerPolicy="no-referrer"
                />
                <span className="text-2xl font-bold tracking-tighter uppercase">
                  {siteSettings.siteName.split(' ')[0]} <span className="text-stone-500">{siteSettings.siteName.split(' ').slice(1).join(' ')}</span>
                </span>
              </div>
              <p className="text-stone-400 max-w-md text-lg font-light leading-relaxed">
                Leading the way in premium interior design and engineering solutions. We transform spaces into experiences.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-8">Quick Links</h4>
              <ul className="space-y-4 text-stone-400">
                <li><button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveTab('projects'); }} className="hover:text-white transition-colors">Projects</button></li>
                <li><button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveTab('kitchens'); }} className="hover:text-white transition-colors">Kitchens</button></li>
                <li><button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveTab('renovation'); }} className="hover:text-white transition-colors">Renovation</button></li>
                <li><a href="#quote" className="hover:text-white transition-colors">Get Quote</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-8">Connect</h4>
              <div className="flex gap-4 mb-8">
                <a href="#" className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
              <p className="text-stone-400 text-sm">
                Email: {siteSettings.contactEmail}<br />
                Phone: {siteSettings.contactPhone}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar with different background */}
        <div className="bg-[#080706] py-12 border-t border-stone-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <p className="text-stone-500 text-sm">
              {siteSettings.footerText || `© ${new Date().getFullYear()} ${siteSettings.siteName}. All rights reserved.`}
            </p>
            
            <p className="text-stone-500 text-xs font-medium uppercase tracking-[0.2em]">
              Developed by <span className="text-white hover:text-stone-300 transition-colors cursor-default">Munna</span>
            </p>

            <div className="flex gap-8 text-stone-500 text-sm items-center">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              {isAdmin ? (
                <button 
                  onClick={() => setShowAdminPanel(true)}
                  className="flex items-center gap-1 text-emerald-400 hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4" /> Admin Panel
                </button>
              ) : (
                <button 
                  onClick={loginWithGoogle}
                  className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Admin Login
                </button>
              )}
              {user && (
                <button 
                  onClick={logout}
                  className="flex items-center gap-1 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
