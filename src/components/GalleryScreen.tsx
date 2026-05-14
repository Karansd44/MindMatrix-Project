/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo, useEffect, useDeferredValue, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home,
  Share2, 
  Download, 
  User, 
  Smartphone, 
  MapPin, 
  Loader2, 
  CheckCircle2, 
  Search, 
  Filter, 
  Settings2,
  X,
  Plus,
  Heart,
  Palette,
  
  Languages,
  MessageSquare,
  Send,
  Leaf,
  History,
  Info,
  LogOut,
  Camera,
  Briefcase,
  Eye,
  Package,
  ShoppingCart,
  BarChart3
} from 'lucide-react';
import { UI_STRINGS, PRODUCTS } from '../constants/products';
import { useToast } from './ToastProvider';
import { Artisan, Product, Language, TemplateType, ArtisanProduct, Order } from '../types';
import { BenefitCardEngine } from '../lib/canvas-engine';
import { shareToWhatsApp } from '../lib/sharing-utility';
import { askKumbaraAI } from '../services/geminiService';
import StoryGenerator from './StoryGenerator';
import ArtisanDashboard from './ArtisanDashboard';
import ArtisanProductForm from './ArtisanProductForm';
import InventoryManagement from './InventoryManagement';
import OrderManagement from './OrderManagement';
import Analytics from './Analytics';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, collection, query, onSnapshot, where } from 'firebase/firestore';
import ProductModal from './ProductModal';

export default function GalleryScreen() {
  const { user, profile, isArtisan } = useAuth();
  
  const [dbProducts, setDbProducts] = useState<Product[]>(PRODUCTS);
  const [artisan, setArtisan] = useState<Artisan>({
    name: profile?.name || user?.displayName || 'Anonymous',
    phone: profile?.phone || '',
    location: profile?.village || '',
    village: profile?.village || '',
    experience: profile?.experience || 0,
    heritageStory: profile?.heritageStory || '',
  });
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  useEffect(() => {
    // Sync with Firestore Products
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const prods: Product[] = [];
        snapshot.forEach((doc) => {
          prods.push({ id: doc.id, ...doc.data() } as Product);
        });
        setDbProducts(prods);
      } else {
        setDbProducts(PRODUCTS);
      }
    });

    return () => unsubscribe();
  }, []);

  // FETCH ARTISAN PRODUCTS AND ORDERS
  useEffect(() => {
    if (!isArtisan || !user) return;

    // Fetch artisan products
    const productsQ = query(collection(db, 'products'), where('artisanId', '==', user.uid));
    const productsUnsub = onSnapshot(productsQ, (snapshot) => {
      const prods: ArtisanProduct[] = [];
      snapshot.forEach((doc) => {
        prods.push({ ...doc.data(), id: doc.id } as ArtisanProduct);
      });
      setArtisanProducts(prods);
    });

    // Fetch artisan orders
    const ordersQ = query(collection(db, 'orders'), where('artisanId', '==', user.uid));
    const ordersUnsub = onSnapshot(ordersQ, (snapshot) => {
      const ordersList: Order[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        ordersList.push({ 
          ...data, 
          id: doc.id,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        } as Order);
      });
      setArtisanOrders(ordersList);
    });

    return () => {
      productsUnsub();
      ordersUnsub();
    };
  }, [isArtisan, user]);

  useEffect(() => {
    if (profile) {
      setArtisan({
        name: profile.name,
        phone: profile.phone || '',
        location: profile.village || '',
        village: profile.village || '',
        experience: profile.experience || 0,
        heritageStory: profile.heritageStory || '',
      });
      if (profile.languagePreference) setLanguage(profile.languagePreference as Language);
      if (profile.favorites) setFavorites(new Set(profile.favorites));
      // Reset profile message after sync
      setProfileMessage(null);
    }
  }, [profile]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showFavorites, setShowFavorites] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);
  
  // ARTISAN STATE
  const [artisanScreenMode, setArtisanScreenMode] = useState<'dashboard' | 'add-product' | 'inventory' | 'orders' | 'analytics'>('dashboard');
  const [artisanProducts, setArtisanProducts] = useState<ArtisanProduct[]>([]);
  const [artisanOrders, setArtisanOrders] = useState<Order[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingArtisanProduct, setEditingArtisanProduct] = useState<ArtisanProduct | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced Filter state
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minEcoScore, setMinEcoScore] = useState(90);
  const [availabilityFilter, setAvailabilityFilter] = useState<'All' | 'in-stock' | 'on-order'>('All');

  // Artisan Add/Edit Product State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showStoryGenerator, setShowStoryGenerator] = useState(false);

  // AI Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [detailEcoOpen, setDetailEcoOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<'home' | 'favorites' | 'profile' | 'ai'>('home');
  
  // Customization State
  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('minimal');
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const engine = useRef(new BenefitCardEngine());
  const toast = useToast();

  const filteredProducts = useMemo(() => {
    return dbProducts.filter(p => {
      const queryText = deferredSearchQuery.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(queryText) || 
                           p.benefit.toLowerCase().includes(queryText);
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesFavorite = !showFavorites || favorites.has(p.id);
      const matchesPrice = p.price <= maxPrice;
      const matchesEco = p.ecoScore >= minEcoScore;
      const matchesAvailability = availabilityFilter === 'All' || p.availability === availabilityFilter;
      
      return matchesSearch && matchesCategory && matchesFavorite && matchesPrice && matchesEco && matchesAvailability;
    });
  }, [dbProducts, deferredSearchQuery, activeCategory, showFavorites, favorites, maxPrice, minEcoScore, availabilityFilter]);

  const categories = useMemo(() => {
    return ['All', ...new Set(dbProducts.map(p => p.category))];
  }, [dbProducts]);

  const handleEditProduct = useCallback((product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProduct(product);
    setIsProductModalOpen(true);
  }, []);

  const handleAddProduct = useCallback(() => {
    setEditingProduct(null);
    setShowProductForm(true);
    setArtisanScreenMode('add-product');
  }, []);

  const toggleFavorite = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFavorite = favorites.has(id);
    
    setFavorites(prev => {
      const next = new Set(prev);
      if (isFavorite) next.delete(id);
      else next.add(id);
      return next;
    });

    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          favorites: isFavorite ? arrayRemove(id) : arrayUnion(id)
        });
      } catch (err) {
        console.error("Failed to update favorites in database:", err);
      }
    }
  }, [user, favorites]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: artisan.name,
        phone: artisan.phone,
        village: artisan.village,
        experience: artisan.experience,
        heritageStory: artisan.heritageStory,
        languagePreference: language
      });
      setTimeout(() => {
        setIsSaving(false);
        setIsProfileOpen(false);
      }, 500);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setProfileMessage('Failed to save profile. Check permissions.');
      setIsSaving(false);
    }
  }, [user, artisan, language]);
  const t = UI_STRINGS[language];
  const activeProductCount = filteredProducts.length;
  const favoriteCount = favorites.size;
  const productCount = dbProducts.length;

  const handleCreateCard = useCallback(async (product: Product) => {
    setSelectedProduct(product);
    setIsGenerating(true);
    setGeneratedCard(null);

    try {
      const dataUrl = await engine.current.generate({
        product,
        artisan,
        fontSize: 32,
        textColor: '#FFFFFF',
        template: activeTemplate,
        language
      });
      setGeneratedCard(dataUrl);
      setGeneratedCount(prev => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [artisan, activeTemplate, language]);

  const handleSendMessage = useCallback(async () => {
    if (!chatMessage.trim()) return;
    const msg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setIsTyping(true);
    
    const response = await askKumbaraAI(msg, language);
    setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
    setIsTyping(false);
  }, [chatMessage, language]);

  const handleQuickPrompt = useCallback((prompt: string) => {
    setChatMessage(prompt);
  }, []);

  const handleClearChat = useCallback(() => {
    if (window.confirm('Clear the entire chat history?')) {
      setChatHistory([]);
      setChatMessage('');
    }
  }, []);

  const handleVoiceInput = useCallback(async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setProfileMessage('Voice input is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : language === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript) {
        setChatMessage(transcript);
      }
    };

    recognition.start();
  }, [language]);

  const handleAttachment = useCallback(() => {
    setProfileMessage('Attachment analysis will be connected to the product photo workflow next.');
  }, []);

  const handleShare = useCallback(async () => {
    if (!generatedCard || !selectedProduct) return;
    const caption = `Legacy Clay Craft: ${selectedProduct.name}. Health Benefit: ${selectedProduct.benefit} - Crafted by ${artisan.name}`;
    await shareToWhatsApp(generatedCard, caption);
  }, [generatedCard, selectedProduct, artisan]);

  const handleDetailShare = async (product: Product) => {
    const text = `Check out ${product.name} by ${artisan.name}. ${product.benefit}`;
    if (navigator.share) {
      await navigator.share({ title: product.name, text });
      return;
    }
    await navigator.clipboard.writeText(text);
    setProfileMessage('Product details copied to clipboard');
  };

  // ARTISAN NAVIGATION
  const handleArtisanNavigate = useCallback((screen: 'add-product' | 'inventory' | 'orders' | 'analytics') => {
    setArtisanScreenMode(screen);
  }, []);

  const handleArtisanProductFormClose = useCallback(() => {
    setShowProductForm(false);
    setEditingArtisanProduct(null);
    setArtisanScreenMode('dashboard');
  }, []);

  const handleEditArtisanProduct = useCallback((product: ArtisanProduct) => {
    setEditingArtisanProduct(product);
    setShowProductForm(true);
  }, []);

  const handleContactArtisan = (product: Product) => {
    if (!artisan.phone) {
      setProfileMessage('Please add a WhatsApp number in your profile to enable inquiries.');
      return;
    }
    const msg = `Namaste! I am interested in the ${product.name} crafted by ${artisan.name}. Can you provide more details?`;
    window.location.href = `https://wa.me/${artisan.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="min-h-screen bg-earth-light/30 pb-20">
      {/* Fixed Top Navbar */}
      <nav className="fixed top-0 inset-x-0 z-40 h-16 bg-white/80 backdrop-blur-3xl border-b border-earth-dark/5 shadow-md shadow-earth-dark/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Back to top">
            <div className="bg-earth-dark p-2.5 rounded-2xl group-hover:bg-earth-primary transition-colors duration-300 shadow-md shadow-earth-dark/10 group-active:scale-95">
              <Palette size={22} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-earth-dark tracking-tight leading-none">Kumbara-Kala</h1>
              <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-earth-primary mt-0.5">Gallery</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end">
            {/* Language Switcher */}
            <div className="hidden sm:flex items-center bg-earth-light/50 rounded-full p-1.5 border border-earth-dark/5 shadow-sm hover:bg-earth-light transition-colors">
              {(['en', 'kn', 'hi', 'ta'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  title={`Switch to ${l === 'en' ? 'English' : l === 'kn' ? 'Kannada' : l === 'hi' ? 'Hindi' : 'Tamil'}`}
                  className={`w-8 h-8 rounded-full text-[10px] font-black transition-all active:scale-90 ${language === l ? 'bg-earth-dark text-white shadow-md' : 'text-earth-dark/40 hover:text-earth-dark'}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-earth-primary/10 border border-earth-primary/20 rounded-full hover:bg-earth-primary/15 transition-colors">
              <span className="text-[10px] font-black text-earth-dark/60">
                <span className="text-earth-primary font-black">{generatedCount}</span> {t.storiesShared}
              </span>
            </div>

            <button 
              onClick={() => setIsChatOpen(true)}
              title="Open AI Chat"
              className={`p-2.5 rounded-full transition-all relative group active:scale-90 ${activeNav === 'ai' ? 'bg-earth-primary text-white shadow-md' : 'bg-earth-dark text-white hover:bg-earth-primary'}`}
            >
              <MessageSquare size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse"></span>
            </button>
            
            <button
              onClick={() => setShowStoryGenerator(true)}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-earth-primary text-white rounded-full hover:bg-earth-dark transition-all shadow-md hover:shadow-lg active:scale-95"
              title="Open Story Generator"
            >
              <img src="/assets/logo.png" alt="Logo" className="w-4 h-4 object-contain" />
              <span className="text-sm font-bold">Lab</span>
            </button>
            
            <div className="h-10 w-px bg-earth-dark/10 hidden sm:block"></div>

            <button 
              onClick={() => setIsProfileOpen(true)}
              title="Open profile"
              className={`flex items-center gap-2 px-2.5 py-2 rounded-full transition-all shadow-sm hover:shadow-md group active:scale-90 ${activeNav === 'profile' ? 'bg-earth-primary text-white shadow-md' : 'bg-earth-dark/5 text-earth-dark hover:bg-earth-dark/10'}`}
            >
              <div className="w-7 h-7 rounded-full bg-earth-dark/10 flex items-center justify-center overflow-hidden group-hover:bg-earth-dark/15 transition-colors">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi" alt="Profile" />
              </div>
              <span className="text-[11px] font-bold hidden sm:inline leading-none">{t.settings}</span>
            </button>

            <button 
              onClick={handleLogout}
              className="p-2.5 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all active:scale-90"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* ARTISAN DASHBOARD OR CUSTOMER GALLERY */}
      {isArtisan && artisanScreenMode === 'dashboard' ? (
        <ArtisanDashboard
          artisanId={user?.uid || ''}
          artisanName={artisan.name}
          village={artisan.village}
          onNavigate={handleArtisanNavigate}
        />
      ) : (
        <main className="max-w-7xl mx-auto px-4 pt-20 pb-36 space-y-6">


        <section className="rounded-[28px] bg-white/80 backdrop-blur-xl p-4 sm:p-5 shadow-sm border border-earth-dark/5 space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-dark/30 group-focus-within:text-earth-primary transition-colors" />
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-12 w-full bg-white border-none rounded-full py-3 pl-12 pr-10 shadow-sm focus:ring-2 focus:ring-earth-primary/20 text-sm placeholder:text-earth-dark/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-earth-dark/5 text-earth-dark/50 hover:bg-earth-dark/10"
                aria-label="Clear search"
              >
                <X size={16} className="mx-auto" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 whitespace-nowrap no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setShowFavorites(false);
                }}
                className={`h-10 px-4 rounded-full text-sm font-bold capitalize transition-all active:scale-95 ${
                  activeCategory === cat && !showFavorites
                    ? 'bg-earth-dark text-white shadow-md' 
                    : 'bg-earth-light/50 text-earth-dark/60 hover:bg-earth-dark/5'
                }`}
              >
                {t[(cat as string).toLowerCase()] || cat}
              </button>
            ))}
            <button
              onClick={() => {
                setShowFavorites(prev => !prev);
                setActiveCategory('All');
              }}
              className={`h-10 px-4 rounded-full text-sm font-bold capitalize transition-all flex items-center gap-2 active:scale-95 ${
                showFavorites 
                  ? 'bg-red-500 text-white shadow-md' 
                  : 'bg-earth-light/50 text-earth-dark/60 hover:bg-earth-dark/5'
              }`}
            >
              <Heart size={16} fill={showFavorites ? 'currentColor' : 'none'} />
              {t.favorites} ({favorites.size})
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-10 px-4 rounded-full text-sm font-bold capitalize transition-all flex items-center gap-2 active:scale-95 ${
                showFilters 
                  ? 'bg-earth-primary text-white shadow-md' 
                  : 'bg-earth-light/50 text-earth-dark/60 hover:bg-earth-dark/5'
              }`}
            >
              <Filter size={16} />
              {t.filterTitle}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-white rounded-[24px] p-5 shadow-inner border border-earth-dark/5"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-xs font-black uppercase tracking-widest text-earth-dark/40">{t.priceRange}</label>
                      <span className="text-sm font-bold text-earth-primary">₹{maxPrice}+</span>
                    </div>
                    <input 
                      type="range" min="0" max="2000" step="50"
                      value={maxPrice}
                      onChange={e => setMaxPrice(parseInt(e.target.value))}
                      className="w-full h-2 bg-earth-light rounded-full appearance-none accent-earth-primary"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-xs font-black uppercase tracking-widest text-earth-dark/40">{t.minEcoScore}</label>
                      <span className="text-sm font-bold text-green-600">{minEcoScore}%</span>
                    </div>
                    <input 
                      type="range" min="70" max="100" step="1"
                      value={minEcoScore}
                      onChange={e => setMinEcoScore(parseInt(e.target.value))}
                      className="w-full h-2 bg-earth-light rounded-full appearance-none accent-green-600"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-earth-dark/40 block">{t.availabilityFilter}</label>
                    <div className="flex gap-2">
                      {(['All', 'in-stock', 'on-order'] as const).map(status => (
                        <button
                          key={status}
                          onClick={() => setAvailabilityFilter(status)}
                          className={`flex-1 py-3 rounded-2xl text-[10px] uppercase font-black tracking-widest border transition-all ${
                            availabilityFilter === status 
                              ? 'bg-earth-dark text-white border-earth-dark' 
                              : 'bg-transparent border-earth-dark/10 text-earth-dark/40'
                          }`}
                        >
                          {status === 'All' ? t.all : status === 'in-stock' ? t.inStock : t.onOrder}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-8 pt-6 border-t border-earth-dark/5">
                  <button 
                    type="button"
                    onClick={() => {
                      setMaxPrice(1000);
                      setMinEcoScore(90);
                      setAvailabilityFilter('All');
                    }}
                    className="text-xs font-black uppercase tracking-widest text-earth-dark/40 hover:text-earth-primary transition-colors"
                  >
                    {t.resetFilters}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setDetailProduct(product)}
              className="group relative bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-earth-dark/5 flex flex-col h-full cursor-pointer"
            >
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-earth-dark/25 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-earth-dark/20 to-transparent pointer-events-none" />
                <div className="absolute top-2 left-2 flex flex-col gap-2">
                  <div className="bg-white/90 backdrop-blur-md text-earth-dark text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                    {t[product.category] || product.category}
                  </div>
                  <div className="bg-earth-primary/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full shadow-sm">
                    Eco {product.ecoScore}
                  </div>
                </div>
                {isArtisan && (
                  <button 
                    onClick={(e) => handleEditProduct(product, e)}
                    className="absolute top-2 right-12 p-2.5 backdrop-blur-md bg-white/20 hover:bg-white text-earth-dark rounded-full transition-all shadow-sm"
                  >
                    <Settings2 size={18} />
                  </button>
                )}
                <button 
                  onClick={(e) => toggleFavorite(product.id, e)}
                    className={`absolute top-6 right-6 p-3 backdrop-blur-md border border-white/20 rounded-full transition-all shadow-sm ${
                    favorites.has(product.id) 
                      ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/20' 
                      : 'bg-white/20 hover:bg-white text-earth-dark'
                  }`}
                >
                  <Heart size={18} fill={favorites.has(product.id) ? 'currentColor' : 'none'} />
                </button>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-white">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] font-black text-white/70">{t.availability}</p>
                    <p className="text-xs font-semibold truncate capitalize">{product.availability.replace('-', ' ')}</p>
                  </div>
                  <div className="shrink-0 rounded-full bg-white/15 backdrop-blur-md border border-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]">
                    ₹{product.price}
                  </div>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="mb-4">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-earth-dark tracking-tight hover:text-earth-primary transition-colors line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase font-black tracking-[0.16em] text-earth-dark/40 mb-2">
                    <span className="flex items-center gap-1 rounded-full bg-earth-light/50 px-2.5 py-1"><History size={10} /> {product.size}</span>
                    <span className="flex items-center gap-1 rounded-full bg-earth-light/50 px-2.5 py-1"><Leaf size={10} /> {product.plasticReduced}</span>
                  </div>
                  <p className="text-earth-dark/60 text-xs leading-relaxed line-clamp-2">
                    {product.benefit}
                  </p>
                </div>

                <div className="flex gap-2 mb-3">
                  <button 
                    onClick={() => {
                      const speech = new SpeechSynthesisUtterance(`${product.name}. ${product.benefit}`);
                      speech.lang = language === 'en' ? 'en-IN' : language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'ta-IN';
                      window.speechSynthesis.speak(speech);
                    }}
                    className="p-2.5 bg-earth-primary/10 text-earth-primary rounded-full hover:bg-earth-primary hover:text-white transition-all active:scale-90"
                    title="Listen to story"
                  >
                    <Smartphone size={16} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContactArtisan(product);
                    }}
                    className="flex-1 bg-white border border-earth-dark/10 text-earth-dark font-bold text-xs rounded-2xl hover:border-earth-primary transition-all py-2.5 shadow-sm"
                  >
                    {t.availability}
                  </button>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateCard(product);
                    }}
                    className="bg-earth-dark hover:bg-earth-primary text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                  >
                    <Palette size={16} />
                    {t.digitalCard}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!artisan.phone) {
                        setProfileMessage('Please add a WhatsApp number in your profile to enable buying.');
                        return;
                      }
                      const msg = `Namaste! I am interested in buying the ${product.name} crafted by ${artisan.name}. Can you provide more details?`;
                      window.location.href = `https://wa.me/${artisan.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(msg)}`;
                    }}
                    className="bg-earth-primary hover:bg-earth-dark text-white font-bold py-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm shadow-earth-primary/20"
                  >
                    <Plus size={16} />
                    {t.buyNow}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {filteredProducts.length === 0 && (
          <div className="py-8 sm:py-16 text-center">
            <div className="bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] inline-flex flex-col items-center shadow-sm border border-earth-dark/5 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-earth-light/40 flex items-center justify-center mb-4">
                <Search size={30} className="text-earth-dark/20" />
              </div>
              <p className="text-lg font-black text-earth-dark">No results yet</p>
              <p className="text-earth-dark/50 text-sm mt-2">Try another search term or clear the filters to see the full catalog.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="h-10 px-4 rounded-full bg-earth-dark text-white font-bold"
                >
                  Clear search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowFavorites(false);
                    setActiveCategory('All');
                    setMaxPrice(1000);
                    setMinEcoScore(90);
                    setAvailabilityFilter('All');
                  }}
                  className="h-10 px-4 rounded-full bg-earth-light/40 text-earth-dark font-bold"
                >
                  Reset filters
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      )}

      {/* ARTISAN MODALS */}
      <AnimatePresence>
        {showProductForm && isArtisan && (
          <ArtisanProductForm
            product={editingArtisanProduct}
            onClose={handleArtisanProductFormClose}
            artisanId={user?.uid || ''}
            onSuccess={() => {
              handleArtisanProductFormClose();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isArtisan && artisanScreenMode === 'add-product' && (
          <ArtisanProductForm
            product={null}
            onClose={() => setArtisanScreenMode('dashboard')}
            artisanId={user?.uid || ''}
            onSuccess={() => {
              setArtisanScreenMode('dashboard');
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isArtisan && artisanScreenMode === 'inventory' && (
          <InventoryManagement
            products={artisanProducts}
            onClose={() => setArtisanScreenMode('dashboard')}
            onEditProduct={handleEditArtisanProduct}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isArtisan && artisanScreenMode === 'orders' && (
          <OrderManagement
            orders={artisanOrders}
            onClose={() => setArtisanScreenMode('dashboard')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isArtisan && artisanScreenMode === 'analytics' && (
          <Analytics
            products={artisanProducts}
            orders={artisanOrders}
            onClose={() => setArtisanScreenMode('dashboard')}
          />
        )}
      </AnimatePresence>

      {/* CUSTOMER MODALS */}
      <AnimatePresence>
        {detailProduct && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailProduct(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto"
            >
              <div className="relative w-full aspect-[4/3] bg-earth-light/20">
                <img src={detailProduct.imageUrl} alt={detailProduct.name} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setDetailProduct(null)}
                  className="absolute top-4 left-4 p-2 bg-black/30 rounded-full text-white"
                  aria-label="Back"
                >
                  <X size={18} />
                </button>
                <button
                  type="button"
                  onClick={(e) => toggleFavorite(detailProduct.id, e as any)}
                  className={`absolute top-4 right-4 p-2 rounded-full ${favorites.has(detailProduct.id) ? 'bg-white text-red-500' : 'bg-black/30 text-white'}`}
                  aria-label="Favorite product"
                >
                  <Heart size={18} fill={favorites.has(detailProduct.id) ? 'currentColor' : 'none'} />
                </button>
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2">
                  {[0, 1, 2].map(index => (
                    <span key={index} className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-white' : 'bg-white/50'}`} />
                  ))}
                </div>
              </div>

              <div className="-mt-6 bg-white rounded-t-[28px] px-6 pt-6 pb-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] font-black text-earth-primary mb-2">Product Detail</p>
                    <h3 className="text-3xl font-black text-earth-dark">{detailProduct.name}</h3>
                    <p className="text-earth-dark/40 text-sm mt-1">₹{detailProduct.price} • {detailProduct.size}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-earth-dark/5 px-3 py-2 text-xs font-black text-earth-dark">
                    <Leaf size={14} className="text-earth-primary" />
                    Eco {detailProduct.ecoScore}
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  <div className="rounded-2xl bg-earth-light/25 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-earth-dark/40 mb-2">Benefit</p>
                    <p className="text-sm leading-7 text-earth-dark/70">{detailProduct.benefit}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-earth-light/25 p-4">
                      <p className="text-[10px] uppercase tracking-widest font-black text-earth-dark/40 mb-2">Category</p>
                      <p className="font-bold text-earth-dark capitalize">{detailProduct.category}</p>
                    </div>
                    <div className="rounded-2xl bg-earth-light/25 p-4">
                      <p className="text-[10px] uppercase tracking-widest font-black text-earth-dark/40 mb-2">Availability</p>
                      <p className="font-bold text-earth-dark capitalize">{detailProduct.availability.replace('-', ' ')}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetailEcoOpen(prev => !prev)}
                    className="w-full flex items-center justify-between rounded-2xl border-b border-earth-dark/10 py-3 text-left"
                  >
                    <span className="font-bold text-earth-dark">Eco details</span>
                    <span className={`transition-transform ${detailEcoOpen ? 'rotate-180' : ''}`}>⌄</span>
                  </button>

                  {detailEcoOpen && (
                    <div className="rounded-2xl bg-earth-light/20 p-4 text-sm text-earth-dark/70">
                      This craft reduces {detailProduct.plasticReduced}. It is designed for healthier daily use and lower plastic dependency.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleContactArtisan(detailProduct)}
                    className="w-full h-14 rounded-xl bg-earth-primary text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-earth-primary/20"
                  >
                    Contact Artisan
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDetailShare(detailProduct)}
                    className="w-full h-14 rounded-xl border border-earth-dark/10 bg-white text-earth-dark font-black flex items-center justify-center gap-2"
                  >
                    <Share2 size={18} />
                    Share Product
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(true);
                      setDetailProduct(null);
                    }}
                    className="w-full rounded-xl bg-earth-light/25 p-3 text-left flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-earth-dark/10 overflow-hidden">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi" alt="Artisan avatar" />
                    </div>
                    <div>
                      <p className="font-bold text-earth-dark">View Artisan Profile</p>
                      <p className="text-xs text-earth-dark/40">Tap to edit the artisan identity and contact details.</p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStoryGenerator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-earth-dark/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowStoryGenerator(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-[36px] bg-white shadow-2xl"
            >
              <div className="p-4 sm:p-8 border-b border-earth-dark/5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-earth-dark">Story Generator</h2>
                  <p className="text-sm text-earth-dark/40">Generate a readable benefit card and share it on WhatsApp</p>
                </div>
                <button
                  onClick={() => setShowStoryGenerator(false)}
                  className="p-3 rounded-full bg-earth-light/40 hover:bg-earth-light text-earth-dark"
                >
                  <X size={20} />
                </button>
              </div>
              <StoryGenerator />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isArtisan && (
        <motion.button 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={handleAddProduct}
          className="fixed bottom-6 right-6 w-14 h-14 bg-earth-dark text-white rounded-full flex items-center justify-center shadow-lg shadow-earth-primary/30 hover:bg-earth-primary transition-all active:scale-90 z-40 group"
        >
          <div className="relative">
            <img src="/assets/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            <div className="absolute -top-12 right-0 bg-earth-dark text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
              Add New Product
            </div>
          </div>
        </motion.button>
      )}

      <ProductModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={editingProduct}
        onSuccess={() => {
          // Success is handled by the onSnapshot listener automatically
        }}
      />

      {/* Artisan Profile Drawer/Modal */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-earth-dark/40 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="relative bg-white w-full sm:max-w-2xl rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header with close button */}
              <div className="relative flex-shrink-0">
                <div className="h-32 sm:h-40 w-full bg-gradient-to-br from-earth-dark via-earth-primary to-earth-secondary"></div>
                <button 
                  onClick={() => setIsProfileOpen(false)}
                  className="absolute top-4 right-4 p-3 sm:p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md active:scale-90 z-10"
                  title="Close profile"
                >
                  <X size={24} className="sm:w-5 sm:h-5" />
                </button>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                  <div className="w-28 h-28 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi" alt="Profile" />
                  </div>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-4 sm:px-8 pt-20 pb-6 sm:pb-8">
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl font-black text-earth-dark">{t.artisanProfile}</h2>
                    <p className="text-earth-dark/40 text-xs sm:text-sm mt-1">Edit your branding and contact information</p>
                    {!isArtisan && <p className="text-red-600 text-xs mt-2 font-bold">⚠️ Not registered as artisan. Contact support if this is incorrect.</p>}
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-earth-dark/50 ml-2">Full Name</label>
                      <div className="bg-earth-light/30 p-3 sm:p-4 rounded-2xl sm:rounded-3xl flex items-center gap-3 focus-within:ring-2 focus-within:ring-earth-primary/20 transition-all border border-transparent focus-within:border-earth-primary/10">
                        <User size={18} className="text-earth-primary flex-shrink-0" />
                        <input 
                          value={artisan.name}
                          onChange={e => setArtisan({...artisan, name: e.target.value})}
                          className="bg-transparent border-none focus:ring-0 text-earth-dark font-bold w-full text-base"
                          placeholder="Your name"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-earth-dark/50 ml-2">WhatsApp Number</label>
                      <div className="bg-earth-light/30 p-3 sm:p-4 rounded-2xl sm:rounded-3xl flex items-center gap-3 focus-within:ring-2 focus-within:ring-earth-primary/20 transition-all border border-transparent focus-within:border-earth-primary/10">
                        <Smartphone size={18} className="text-earth-primary flex-shrink-0" />
                        <input 
                          value={artisan.phone}
                          onChange={e => setArtisan({...artisan, phone: e.target.value})}
                          className="bg-transparent border-none focus:ring-0 text-earth-dark font-bold w-full text-base"
                          placeholder="+91 90000 00000"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-earth-dark/50 ml-2">Craft Location</label>
                      <div className="bg-earth-light/30 p-3 sm:p-4 rounded-2xl sm:rounded-3xl flex items-center gap-3 focus-within:ring-2 focus-within:ring-earth-primary/20 transition-all border border-transparent focus-within:border-earth-primary/10">
                        <MapPin size={18} className="text-earth-primary flex-shrink-0" />
                        <input 
                          value={artisan.location}
                          onChange={e => setArtisan({...artisan, location: e.target.value})}
                          className="bg-transparent border-none focus:ring-0 text-earth-dark font-bold w-full text-base"
                          placeholder="Your village/town"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 space-y-2.5">
                    <button 
                      onClick={handleSaveProfile}
                      className={`w-full text-white py-3 sm:py-4 rounded-2xl sm:rounded-[24px] font-black text-base sm:text-lg shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 sm:gap-3 ${
                        isSaving ? 'bg-green-600' : 'bg-earth-dark hover:bg-earth-primary'
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <CheckCircle2 size={20} />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Settings2 size={20} />
                          <span>{t.saveProfile}</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        if (!isArtisan) {
                          toast.push('info', 'Switch to an Artisan account to add products');
                          return;
                        }
                        setShowProductForm(true);
                        setArtisanScreenMode('add-product');
                      }}
                      className="w-full py-3 sm:py-4 rounded-2xl sm:rounded-[24px] font-black text-base sm:text-lg text-earth-dark bg-earth-light/50 border border-earth-dark/10 hover:border-earth-primary hover:bg-earth-primary hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Add Product
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const shareText = `${artisan.name} from ${artisan.village} on Kumbara-Kala`;
                        if (navigator.share) {
                          navigator.share({ title: 'Kumbara-Kala Profile', text: shareText });
                        } else {
                          navigator.clipboard?.writeText(shareText);
                          setProfileMessage('Profile link copied to clipboard');
                        }
                      }}
                      className="w-full py-3 sm:py-4 rounded-2xl sm:rounded-[24px] font-black text-base sm:text-lg text-earth-primary bg-earth-primary/5 border border-earth-primary/20 hover:bg-earth-primary hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Share2 size={20} />
                      Share Profile
                    </button>
                  </div>
                  {profileMessage && (
                    <div className="mt-4 text-sm font-bold text-center" style={{ color: profileMessage.includes('Failed') ? '#991b1b' : '#065f46' }}>{profileMessage}</div>
                )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 inset-x-0 z-40 h-20 bg-white/95 backdrop-blur-3xl border-t border-earth-dark/5 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_32px_rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto h-20 px-3 sm:px-4 grid grid-cols-4 items-center gap-1 sm:gap-2">
          {/* ARTISAN NAVIGATION */}
          {isArtisan ? (
            <>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setArtisanScreenMode('dashboard')}
                title="Dashboard"
                className={`relative flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 rounded-2xl transition-all ${artisanScreenMode === 'dashboard' ? 'text-white' : 'text-earth-dark/50'}`}
              >
                <div className={`absolute inset-0 rounded-2xl transition-all ${artisanScreenMode === 'dashboard' ? 'bg-earth-primary shadow-lg shadow-earth-primary/30' : 'bg-earth-dark/0'}`} />
                <Home size={24} className="relative z-10" />
                <span className="text-[9px] font-black uppercase tracking-wider relative z-10">Dashboard</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setArtisanScreenMode('inventory')}
                title="Inventory"
                className={`relative flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 rounded-2xl transition-all ${artisanScreenMode === 'inventory' ? 'text-white' : 'text-earth-dark/50'}`}
              >
                <div className={`absolute inset-0 rounded-2xl transition-all ${artisanScreenMode === 'inventory' ? 'bg-earth-primary shadow-lg shadow-earth-primary/30' : 'bg-earth-dark/0'}`} />
                <Package size={24} className="relative z-10" />
                <span className="text-[9px] font-black uppercase tracking-wider relative z-10">Inventory</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setArtisanScreenMode('orders')}
                title="Orders"
                className={`relative flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 rounded-2xl transition-all ${artisanScreenMode === 'orders' ? 'text-white' : 'text-earth-dark/50'}`}
              >
                <div className={`absolute inset-0 rounded-2xl transition-all ${artisanScreenMode === 'orders' ? 'bg-earth-primary shadow-lg shadow-earth-primary/30' : 'bg-earth-dark/0'}`} />
                <ShoppingCart size={24} className="relative z-10" />
                <span className="text-[9px] font-black uppercase tracking-wider relative z-10">Orders</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setArtisanScreenMode('analytics')}
                title="Analytics"
                className={`relative flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 rounded-2xl transition-all ${artisanScreenMode === 'analytics' ? 'text-white' : 'text-earth-dark/50'}`}
              >
                <div className={`absolute inset-0 rounded-2xl transition-all ${artisanScreenMode === 'analytics' ? 'bg-earth-primary shadow-lg shadow-earth-primary/30' : 'bg-earth-dark/0'}`} />
                <BarChart3 size={24} className="relative z-10" />
                <span className="text-[9px] font-black uppercase tracking-wider relative z-10">Analytics</span>
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setActiveNav('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                title="Home"
                className={`relative flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 rounded-2xl transition-all ${activeNav === 'home' ? 'text-white' : 'text-earth-dark/50'}`}
              >
                <div className={`absolute inset-0 rounded-2xl transition-all ${activeNav === 'home' ? 'bg-earth-primary shadow-lg shadow-earth-primary/30' : 'bg-earth-dark/0 group-hover:bg-earth-dark/5'}`} />
                <Home size={24} className="relative z-10" />
                <span className="text-[9px] font-black uppercase tracking-wider relative z-10">Home</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setActiveNav('favorites');
                  setShowFavorites(prev => !prev);
                }}
                title="Favorites"
                className={`relative flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 rounded-2xl transition-all ${activeNav === 'favorites' ? 'text-white' : 'text-earth-dark/50'}`}
              >
                <div className={`absolute inset-0 rounded-2xl transition-all ${activeNav === 'favorites' ? 'bg-earth-primary shadow-lg shadow-earth-primary/30' : 'bg-earth-dark/0 group-hover:bg-earth-dark/5'}`} />
                <Heart size={24} fill={showFavorites ? 'currentColor' : 'none'} className="relative z-10" />
                <span className="text-[9px] font-black uppercase tracking-wider relative z-10">Saved</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setActiveNav('profile');
                  setIsProfileOpen(true);
                }}
                title="Profile"
                className={`relative flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 rounded-2xl transition-all ${activeNav === 'profile' ? 'text-white' : 'text-earth-dark/50'}`}
              >
                <div className={`absolute inset-0 rounded-2xl transition-all ${activeNav === 'profile' ? 'bg-earth-primary shadow-lg shadow-earth-primary/30' : 'bg-earth-dark/0 group-hover:bg-earth-dark/5'}`} />
                <User size={24} className="relative z-10" />
                <span className="text-[9px] font-black uppercase tracking-wider relative z-10">Profile</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setActiveNav('ai');
                  setIsChatOpen(true);
                }}
                title="AI Helper"
                className={`relative flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 rounded-2xl transition-all ${activeNav === 'ai' ? 'text-white' : 'text-earth-dark/50'}`}
              >
                <div className={`absolute inset-0 rounded-2xl transition-all ${activeNav === 'ai' ? 'bg-earth-primary shadow-lg shadow-earth-primary/30' : 'bg-earth-dark/0 group-hover:bg-earth-dark/5'}`} />
                <MessageSquare size={24} className="relative z-10" />
                <span className="text-[9px] font-black uppercase tracking-wider relative z-10">Ask</span>
              </motion.button>
            </>
          )}
        </div>
      </nav>

      {/* Card Customization & Preview Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-earth-dark/90 backdrop-blur-md" 
            />
            <motion.div
              layoutId={`card-${selectedProduct.id}`}
              initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateX: 20 }}
              className="relative bg-earth-light w-full max-w-lg rounded-[48px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 sm:p-12">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="font-black text-2xl text-earth-dark">Story Card</h3>
                    <p className="text-earth-dark/40 text-xs uppercase tracking-widest font-bold mt-1">Generated Success</p>
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="p-3 bg-earth-dark/5 rounded-full hover:bg-earth-dark/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="aspect-[4/5] bg-white rounded-[40px] overflow-hidden relative flex items-center justify-center shadow-inner border-4 border-white">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-6 text-earth-dark/40">
                      <div className="relative">
                        <Loader2 className="animate-spin text-earth-primary" size={64} />
                      </div>
                      <p className="font-black text-lg animate-pulse tracking-tight text-earth-dark">{t.scanning}</p>
                    </div>
                  ) : generatedCard ? (
                    <motion.img 
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={generatedCard} 
                      alt="Preview" 
                      className="w-full h-full object-contain" 
                    />
                  ) : null}
                </div>

                <div className="mt-8 pt-8 border-t border-white/20">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-earth-dark/40 mb-4">Select Story Layout</p>
                  <div className="flex gap-4">
                    {(['minimal', 'traditional', 'festival'] as TemplateType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          setActiveTemplate(type);
                          // Regenerate after short delay if already selected product
                          if(selectedProduct) handleCreateCard(selectedProduct);
                        }}
                        className={`flex-1 py-3 rounded-2xl text-[10px] uppercase font-black tracking-widest border transition-all ${activeTemplate === type ? 'bg-earth-dark text-white border-earth-dark' : 'bg-transparent border-earth-dark/10 text-earth-dark/40'}`}
                      >
                        {t[type]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  <button
                    onClick={handleShare}
                    disabled={!generatedCard}
                    className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white py-6 rounded-[28px] font-black flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl transition-all active:scale-95 translate-y-0 hover:-translate-y-1 hover:shadow-green-500/20"
                  >
                    <Share2 size={24} strokeWidth={3} />
                    {t.whatsapp}
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedCard!;
                      link.download = `${selectedProduct.name}-Legacy-Card.jpg`;
                      link.click();
                    }}
                    disabled={!generatedCard}
                    className="flex-1 bg-earth-dark hover:bg-earth-primary text-white py-6 rounded-[28px] font-black flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl transition-all active:scale-95 translate-y-0 hover:-translate-y-1 hover:shadow-earth-primary/20"
                  >
                    <Download size={24} strokeWidth={3} />
                    {t.download}
                  </button>
                </div>
                
                <div className="mt-8 flex items-center justify-center gap-3 text-earth-primary/60 text-xs font-black uppercase tracking-widest">
                  <span className="w-8 h-px bg-current opacity-20"></span>
                  <span>Premium High Definition Export</span>
                  <span className="w-8 h-px bg-current opacity-20"></span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* AI Assistant Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="absolute inset-0 bg-earth-dark/80 backdrop-blur-md" 
            />
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl h-[82vh] flex flex-col"
            >
              <div className="p-4 bg-earth-dark text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-earth-primary p-3 rounded-2xl">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">Kumbara AI</h3>
                    <p className="text-[10px] uppercase font-bold opacity-60">Pottery Benefit Expert</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleClearChat} className="p-2 border border-white/10 rounded-full hover:bg-white/10" aria-label="Clear chat">
                    <X size={18} />
                  </button>
                  <button onClick={() => setIsChatOpen(false)} className="p-2 border border-white/10 rounded-full hover:bg-white/10" aria-label="Close chat">
                    <LogOut size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col-reverse gap-3">
                <div>
                  {chatHistory.length === 0 && (
                    <div className="text-center py-10">
                      <div className="bg-earth-light/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info size={32} className="text-earth-primary" />
                      </div>
                      <p className="text-earth-dark font-bold">Ask me anything about clay!</p>
                      <p className="text-earth-dark/40 text-xs mt-2">Try a quick action or type your own question.</p>
                    </div>
                  )}

                  {chatHistory.map((chat, i) => (
                    <div key={i} className={`mb-3 flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${chat.role === 'user' ? 'bg-earth-primary text-white rounded-br-sm' : 'bg-earth-light text-earth-dark rounded-bl-sm font-medium'}`}>
                        {chat.text}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="mb-3 flex justify-start">
                      <div className="bg-earth-light p-4 rounded-full flex gap-1 pulse-animation">
                        <div className="w-1.5 h-1.5 bg-earth-dark animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1.5 h-1.5 bg-earth-dark animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 bg-earth-dark animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 pt-2 pb-3 border-t border-earth-dark/5 shrink-0 bg-white">
                <div className="flex flex-wrap gap-2 mb-3">
                  {['Write product description', 'Suggest price', 'Eco benefits'].map(action => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => handleQuickPrompt(action)}
                      className="px-3 py-2 rounded-full bg-earth-light/40 text-xs font-bold text-earth-dark/70 hover:bg-earth-primary hover:text-white transition-all"
                    >
                      {action}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input 
                    value={chatMessage}
                    onChange={e => setChatMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask Kumbara AI..."
                    className="w-full h-12 bg-earth-light/30 border-none rounded-full px-4 pr-28 text-earth-dark font-bold focus:ring-2 focus:ring-earth-primary/20"
                    aria-label="Chat message"
                  />

                  <button
                    type="button"
                    onClick={handleAttachment}
                    className="absolute right-24 top-1/2 -translate-y-1/2 p-2 rounded-full text-earth-dark/60 hover:bg-earth-dark/5"
                    aria-label="Attach image"
                  >
                    <Camera size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`absolute right-14 top-1/2 -translate-y-1/2 p-2 rounded-full ${isListening ? 'bg-red-500 text-white' : 'text-earth-dark/60 hover:bg-earth-dark/5'}`}
                    aria-label="Voice input"
                  >
                    <Smartphone size={18} />
                  </button>

                  <button 
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim() || isTyping}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-earth-primary text-white rounded-full hover:bg-earth-dark shadow-lg transition-all active:scale-90 disabled:opacity-50 flex items-center justify-center"
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
