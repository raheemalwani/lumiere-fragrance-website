/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  ChevronRight, 
  Search, 
  Heart, 
  Instagram, 
  Twitter, 
  Facebook, 
  MessageCircle, 
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
type FragranceNote = 'Floral' | 'Woody' | 'Smoky' | 'Citrus' | 'Fresh' | 'Oriental' | 'Musky' | 'Sweet';

interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  image: string;
  notes: FragranceNote[];
  isBestSeller?: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

// Data
const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Noir Absolute',
    tagline: 'The essence of night.',
    description: 'A deep, mysterious blend of aged oud and smoked birch.',
    price: 245,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop',
    notes: ['Woody', 'Smoky', 'Oriental'],
    isBestSeller: true
  },
  {
    id: '2',
    name: 'Lumière Rose',
    tagline: 'Elegance in bloom.',
    description: 'A sophisticated bouquet of Bulgarian rose and white musk.',
    price: 195,
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop',
    notes: ['Floral', 'Sweet', 'Musky'],
    isBestSeller: true
  },
  {
    id: '3',
    name: 'Ocean Mist',
    tagline: 'Breath of the sea.',
    description: 'Crisp sea salt paired with zesty bergamot and neroli.',
    price: 165,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
    notes: ['Fresh', 'Citrus'],
    isBestSeller: false
  },
  {
    id: '4',
    name: 'Royal Oud',
    tagline: 'Imperial majesty.',
    description: 'Rare Cambodian oud infused with saffron and warm amber.',
    price: 320,
    image: 'https://images.unsplash.com/photo-1585232351009-aa87416fca90?q=80&w=800&auto=format&fit=crop',
    notes: ['Woody', 'Oriental', 'Smoky'],
    isBestSeller: true
  },
  {
    id: '5',
    name: 'Golden Amber',
    tagline: 'Warmth of the sun.',
    description: 'Vanilla bean and rich amber with a hint of roasted tonka.',
    price: 210,
    image: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=800&auto=format&fit=crop',
    notes: ['Sweet', 'Musky', 'Oriental'],
    isBestSeller: false
  },
  {
    id: '6',
    name: 'Citrus Dawn',
    tagline: 'First light energy.',
    description: 'Explosive grapefruit and lime with a heart of white lotus.',
    price: 155,
    image: 'https://images.unsplash.com/photo-1557170334-a7c3c467b9f4?q=80&w=800&auto=format&fit=crop',
    notes: ['Citrus', 'Fresh'],
    isBestSeller: false
  }
];

const NOTES_OPTIONS: FragranceNote[] = ['Floral', 'Woody', 'Smoky', 'Citrus', 'Fresh', 'Oriental', 'Musky', 'Sweet'];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<FragranceNote[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [hasSearchedRec, setHasSearchedRec] = useState(false);

  // Cart Logic
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handlePlaceOrder = () => {
    setShowConfirmation(true);
    setIsCartOpen(false);
    setCart([]);
  };

  const handleContinueShopping = () => {
    setShowConfirmation(false);
    scrollToSection('collections');
  };

  // Recommendation Logic
  const toggleNote = (note: FragranceNote) => {
    setSelectedNotes(prev => 
      prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note]
    );
  };

  const getRecommendations = () => {
    if (selectedNotes.length === 0) return;
    const matches = PRODUCTS.filter(p => 
      p.notes.some(n => selectedNotes.includes(n))
    ).sort((a, b) => {
      const aMatches = a.notes.filter(n => selectedNotes.includes(n)).length;
      const bMatches = b.notes.filter(n => selectedNotes.includes(n)).length;
      return bMatches - aMatches;
    });
    setRecommendations(matches);
    setHasSearchedRec(true);
  };

  const resetRec = () => {
    setSelectedNotes([]);
    setRecommendations([]);
    setHasSearchedRec(false);
  };

  // Sections scroll
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-noir selection:bg-gold selection:text-noir flex flex-col">
      
      {/* Navigation */}
      <nav className="h-24 geometric-border-h border-gold/30 flex items-center justify-between px-12 bg-charcoal z-50 fixed w-full top-0 left-0">
        <div className="hidden md:flex items-center gap-12 font-display text-[11px] uppercase tracking-[0.3em]">
          <button onClick={() => scrollToSection('collections')} className="hover:text-gold transition-colors">Collections</button>
          <button onClick={() => scrollToSection('best-sellers')} className="hover:text-gold transition-colors">Best Sellers</button>
        </div>
        
        <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-gold">
          <Menu size={24} />
        </button>

        <div className="text-center absolute left-1/2 -translate-x-1/2">
          <h1 className="text-gold text-2xl font-serif tracking-[0.5em] uppercase font-light leading-none italic">
            Lumière
          </h1>
          <p className="text-[8px] uppercase tracking-[0.6em] text-white/40 mt-1">Fragrance</p>
        </div>

        <div className="flex items-center gap-8 font-display text-[11px] uppercase tracking-[0.3em]">
          <button onClick={() => scrollToSection('contact')} className="hidden md:block hover:text-gold transition-colors">Contact</button>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-4 group text-gold"
          >
            <div className="w-5 h-5 border border-gold flex items-center justify-center relative">
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-noir rounded-full w-4 h-4 flex items-center justify-center font-bold text-[9px]">
                  {cartCount}
                </span>
              )}
              <ShoppingBag size={12} />
            </div>
            <span className="hidden sm:inline">Cart</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pt-24">
        
        {/* Hero Section: Geometric Balance style */}
        <section id="home" className="flex flex-col md:flex-row min-h-[calc(100vh-6rem)] border-b border-gold/20">
          {/* Hero Left: Text Content */}
          <div className="w-full md:w-1/2 flex flex-col justify-center px-12 md:px-20 py-20 border-r border-gold/20">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-gold text-xs uppercase tracking-[0.4em] mb-6 flex items-center gap-4 font-display"
            >
              <div className="w-12 h-[1px] bg-gold"></div> New Collection
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-8xl font-serif font-light mb-8 leading-tight italic"
            >
              Essence of <br/>
              <span className="not-italic text-gold">Midnight Gold</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/60 text-sm leading-relaxed max-w-sm mb-12 tracking-wide font-light"
            >
              A masterful symphony of saffron, dark oud, and golden amber. Crafted for the bold, refined for the elegant. Discover the artifact of scent.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4"
            >
              <button 
                onClick={() => scrollToSection('collections')}
                className="px-8 py-4 bg-gold text-black text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gold-hover transition-colors"
              >
                Shop Collection
              </button>
              <button 
                onClick={() => setIsRecModalOpen(true)}
                className="px-8 py-4 border border-gold text-gold text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gold/10 transition-all"
              >
                Find Your Scent
              </button>
            </motion.div>
          </div>

          {/* Hero Right: Visuals */}
          <div className="w-full md:w-1/2 bg-[#080808] relative flex flex-col min-h-[400px]">
             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at 70% 30%, #D4AF37 0%, transparent 70%)' }}></div>
             
             <div className="flex-1 flex items-center justify-center relative p-12">
                {/* Visual Representation of the Bottle */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  className="w-56 h-80 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border-2 border-gold/40 relative flex flex-col p-2 shadow-2xl shadow-gold/10 overflow-hidden"
                >
                   <img 
                    src="https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800" 
                    alt="Noir Absolute" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                   />
                   <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-16 h-12 bg-gold flex flex-col items-center justify-center shadow-lg">
                      <div className="w-full h-1 bg-black/20"></div>
                   </div>
                   <div className="flex-1 border border-gold/20 flex flex-col items-center justify-center text-center p-4 relative z-10 backdrop-blur-[2px] bg-black/20">
                      <div className="text-gold font-serif text-xl tracking-[0.2em] mb-1 uppercase font-bold italic">Noir Absolute</div>
                      <div className="w-8 h-[1px] bg-gold mb-4"></div>
                      <div className="text-[8px] text-white/60 uppercase tracking-[0.3em] font-display">Eau de Parfum</div>
                   </div>
                </motion.div>
             </div>

             {/* Hero Stats Row */}
             <div className="h-32 border-t border-gold/20 grid grid-cols-3">
                <div className="border-r border-gold/20 flex flex-col items-center justify-center">
                   <span className="text-gold text-lg font-serif italic">Top</span>
                   <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-display">Bergamot</span>
                </div>
                <div className="border-r border-gold/20 flex flex-col items-center justify-center">
                   <span className="text-gold text-lg font-serif italic">Heart</span>
                   <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-display">Dark Rose</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                   <span className="text-gold text-lg font-serif italic">Base</span>
                   <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-display">Oud Wood</span>
                </div>
             </div>
          </div>
        </section>

        {/* Collections: Geometric Balance style */}
        <section id="collections" className="py-32 border-b border-gold/20 bg-noir">
          <div className="px-12 mb-20 text-center md:text-left">
             <span className="text-gold text-[10px] uppercase tracking-[0.5em] mb-4 block font-display">The Archives</span>
             <h2 className="text-4xl md:text-7xl font-serif italic mb-6">Fragrance Catalog</h2>
             <div className="w-24 h-[1px] bg-gold/30 mx-auto md:mx-0"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((product, idx) => (
              <motion.div 
                key={product.id}
                whileHover={{ backgroundColor: 'rgba(212, 175, 55, 0.03)' }}
                className={`p-12 border-gold/10 flex flex-col space-y-8
                  ${idx % 3 !== 2 ? 'lg:border-r' : ''}
                  ${idx >= 3 ? 'lg:border-t' : ''}
                  ${idx % 2 !== 1 ? 'md:border-r' : 'md:border-r-0 lg:border-r'}
                  ${idx >= 2 ? 'md:border-t' : 'md:border-t-0 lg:border-t-0'}
                  border-b md:border-b-0
                `}
              >
                <div className="aspect-[4/5] bg-[#0c0c0c] border border-gold/10 relative group overflow-hidden shadow-2xl">
                   <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000"
                   />
                   <div className="absolute inset-0 bg-noir/40 group-hover:bg-noir/0 transition-colors"></div>
                   {product.isBestSeller && (
                    <div className="absolute top-0 right-0 bg-gold text-noir text-[8px] font-bold uppercase tracking-widest px-4 py-1">
                      Best Desired
                    </div>
                   )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-2xl font-serif italic mb-1">{product.name}</h4>
                      <p className="text-[10px] uppercase tracking-widest text-gold font-display">{product.notes.join(' • ')}</p>
                    </div>
                    <span className="text-gold font-display text-sm">${product.price}</span>
                  </div>
                  <p className="text-white/50 text-xs font-light leading-relaxed h-12 overflow-hidden">{product.description}</p>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full py-4 border border-gold/30 text-gold text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-gold hover:text-noir transition-all"
                  >
                    Add to Bag
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Discovery Bar: Geometric Balance style */}
        <section className="h-auto md:h-56 border-b border-gold/30 flex flex-col md:flex-row bg-charcoal">
          <div className="w-full md:w-1/4 p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gold/20">
            <h4 className="text-gold font-serif italic text-2xl mb-2">Find Your Scent</h4>
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-display">Take the Lumière Quiz</p>
          </div>
          
          <div className="flex-1 flex flex-wrap items-center justify-around gap-8 p-12">
            {[
              { note: 'Floral' as const, icon: <div className="w-1 h-1 bg-gold rounded-full" /> },
              { note: 'Woody' as const, icon: <div className="w-3 h-3 border border-gold transform rotate-45" /> },
              { note: 'Citrus' as const, icon: <div className="w-4 h-[1px] bg-gold" /> },
              { note: 'Oriental' as const, icon: <div className="w-2 h-4 border border-gold rounded-full" /> },
            ].map((item) => (
              <button 
                key={item.note} 
                onClick={() => { setSelectedNotes([item.note]); setIsRecModalOpen(true); }}
                className="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity group"
              >
                <div className="w-14 h-14 rounded-full border border-gold/40 mb-3 flex items-center justify-center group-hover:border-gold transition-colors">
                  {item.icon}
                </div>
                <span className="text-[9px] uppercase tracking-[0.2em] font-display">{item.note}</span>
              </button>
            ))}
          </div>

          <div 
            onClick={() => scrollToSection('contact')}
            className="w-full md:w-1/4 bg-gold p-12 flex flex-col justify-center items-center text-black group cursor-pointer hover:bg-gold-hover transition-colors"
          >
             <span className="text-[10px] uppercase tracking-[0.4em] font-bold mb-3 font-display">Newsletter</span>
             <p className="text-sm font-serif text-center italic">Join the Inner Circle for exclusive access.</p>
             <div className="mt-4 w-12 h-[1px] bg-black/30 group-hover:w-full transition-all duration-500"></div>
          </div>
        </section>

      </main>

      <main className="flex-1 flex flex-col pt-24">
        {/* ... (Hero, Collections, Discovery Bar are already updated) ... */}

        {/* Best Sellers: Geometric Balance style */}
        <section id="best-sellers" className="py-32 px-12 border-b border-gold/20">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <div className="text-center mb-24">
               <span className="text-gold uppercase tracking-[0.6em] text-[10px] mb-4 block font-display">Icons of Lumière</span>
               <h2 className="text-5xl md:text-8xl font-serif italic mb-4">Most Desired</h2>
               <div className="w-12 h-[1px] bg-gold mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-24 w-full">
              {PRODUCTS.filter(p => p.isBestSeller).map((product, idx) => (
                <div key={product.id} className={`flex flex-col group ${idx % 2 === 1 ? 'md:mt-32' : ''}`}>
                  <div className="aspect-[16/10] mb-10 overflow-hidden border border-gold/10 relative shadow-2xl">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                    />
                    <div className="absolute inset-0 bg-noir/20 group-hover:bg-noir/0 transition-colors"></div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                       <h4 className="text-4xl font-serif italic text-gold">{product.name}</h4>
                       <span className="text-gold/40 text-[10px] uppercase tracking-widest font-display">Featured</span>
                    </div>
                    <p className="text-white/60 font-light leading-loose max-w-lg tracking-wide text-sm">{product.description}</p>
                    <button 
                      onClick={() => addToCart(product)}
                      className="group flex items-center gap-4 text-white text-[10px] uppercase tracking-[0.4em] font-display hover:text-gold transition-colors"
                    >
                      Acquire Fragrance <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section: Geometric Balance style */}
        <section id="contact" className="grid grid-cols-1 md:grid-cols-12 min-h-[600px] border-b border-gold/20">
          <div className="md:col-span-5 p-12 md:p-24 border-b md:border-b-0 md:border-r border-gold/20 flex flex-col justify-center space-y-12 bg-charcoal">
            <div>
              <span className="text-gold uppercase tracking-[0.4em] text-[10px] mb-4 block font-display">Personal Consultation</span>
              <h2 className="text-4xl md:text-7xl font-serif italic">Let's <br/><span className="not-italic text-gold">Dialogue</span></h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 text-[10px] uppercase tracking-widest font-display text-white/60">
              <div className="space-y-4">
                <p className="text-gold">Studio Location</p>
                <p className="leading-relaxed">123 Avenue Montaigne<br/>Paris, France</p>
              </div>
              <div className="space-y-4">
                <p className="text-gold">Concierge</p>
                <p>concierge@lumiere.com<br/>+33 1 23 45 67 89</p>
              </div>
              <div className="space-y-4 col-span-2 pt-8 border-t border-gold/10">
                <p className="text-gold">Social Channels</p>
                <div className="flex gap-6">
                  <Instagram size={16} className="hover:text-gold cursor-pointer transition-colors" />
                  <Facebook size={16} className="hover:text-gold cursor-pointer transition-colors" />
                  <Twitter size={16} className="hover:text-gold cursor-pointer transition-colors" />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 p-12 md:p-24 flex flex-col justify-center bg-noir">
             <form className="space-y-12 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="text-[9px] uppercase text-gold tracking-widest font-display">Identity</label>
                    <input type="text" placeholder="Your Name" className="w-full bg-transparent border-b border-gold/20 py-4 focus:outline-none focus:border-gold transition-colors font-light text-sm" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[9px] uppercase text-gold tracking-widest font-display">Digital Mail</label>
                    <input type="email" placeholder="Your Email" className="w-full bg-transparent border-b border-gold/20 py-4 focus:outline-none focus:border-gold transition-colors font-light text-sm" />
                  </div>
                </div>
                <div className="space-y-4">
                    <label className="text-[9px] uppercase text-gold tracking-widest font-display">Essence of Inquiry</label>
                    <textarea rows={3} placeholder="How may we assist your scent journey?" className="w-full bg-transparent border-b border-gold/20 py-4 focus:outline-none focus:border-gold transition-colors font-light text-sm resize-none" />
                </div>
                <button className="px-12 py-5 bg-[#D4AF37] text-black text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#B59120] transition-colors self-start shadow-xl shadow-gold/5">
                  Send Inquiry
                </button>
             </form>
          </div>
        </section>

        {/* Footer: Geometric Balance style */}
        <footer className="py-16 px-12 bg-noir">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
              <h2 className="text-xl font-serif tracking-[0.4em] italic uppercase text-gold">Lumière</h2>
              <div className="w-[1px] h-8 bg-gold/20 hidden md:block"></div>
              <p className="text-[9px] uppercase tracking-widest text-white/30 hidden md:block">Since 1928</p>
            </div>
            
            <div className="flex gap-12 text-[9px] uppercase tracking-[0.2em] font-display text-white/40">
              <button className="hover:text-gold transition-colors">Digital Privacy</button>
              <button className="hover:text-gold transition-colors">Sovereign Terms</button>
              <button className="hover:text-gold transition-colors">Returns</button>
            </div>

            <p className="text-[9px] uppercase tracking-widest text-white/20">© 2026 Lumiere Fragrance</p>
          </div>
        </footer>
      </main>

      {/* Floating WhatsApp Button */}
      <motion.a 
        href="https://wa.me/1234567890" 
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-8 right-8 z-[100] w-16 h-16 gold-gradient-bg rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center text-noir group transition-all"
      >
        <MessageCircle size={32} />
        <span className="absolute right-20 bg-noir text-gold border border-gold px-4 py-2 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest text-[10px] pointer-events-none">
          Concierge Chat
        </span>
      </motion.a>

      {/* Recommendation Modal */}
      <AnimatePresence>
        {isRecModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-noir/95 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-charcoal max-w-4xl w-full gold-border p-8 md:p-12 relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => { setIsRecModalOpen(false); resetRec(); }} className="absolute top-6 right-6 text-white/50 hover:text-white">
                <X size={24} />
              </button>

              {!hasSearchedRec ? (
                <div className="space-y-12">
                   <div className="text-center">
                    <h3 className="text-gold uppercase tracking-[0.4em] text-xs mb-4 font-display">Fragrance Discovery</h3>
                    <h2 className="text-3xl md:text-5xl font-serif italic">What Notes Defined You?</h2>
                    <p className="text-white/50 mt-4 font-light">Select one or more notes that resonate with your spirit.</p>
                   </div>
                   
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {NOTES_OPTIONS.map(note => (
                        <button 
                          key={note}
                          onClick={() => toggleNote(note)}
                          className={`py-8 px-4 border transition-all text-center group ${selectedNotes.includes(note) ? 'bg-gold border-gold text-noir' : 'border-white/10 hover:border-gold text-white'}`}
                        >
                          <p className={`uppercase tracking-widest text-xs font-display ${selectedNotes.includes(note) ? 'font-bold' : 'group-hover:text-gold'}`}>{note}</p>
                        </button>
                      ))}
                   </div>

                   <button 
                    disabled={selectedNotes.length === 0}
                    onClick={getRecommendations}
                    className="w-full py-6 gold-gradient-bg text-noir font-display font-bold uppercase tracking-[0.2em] disabled:opacity-30 transition-all hover:scale-[1.01]"
                   >
                    Discover My Scent
                   </button>
                </div>
              ) : (
                <div className="space-y-12">
                   <div className="text-center">
                      <h3 className="text-gold uppercase tracking-[0.4em] text-xs mb-4 font-display">Your Perfect Match</h3>
                      <h2 className="text-3xl md:text-5xl font-serif italic">Recommended for You</h2>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {recommendations.length > 0 ? (
                        recommendations.map(product => (
                          <div key={product.id} className="flex gap-6 items-center bg-noir/50 p-4 gold-border">
                            <img src={product.image} alt={product.name} className="w-24 h-32 object-cover" />
                            <div className="flex-1 space-y-2">
                               <h4 className="text-xl font-serif italic text-gold">{product.name}</h4>
                               <p className="text-[10px] text-white/40 uppercase tracking-widest">{product.notes.join(' • ')}</p>
                               <p className="text-xs font-light text-white/70 line-clamp-2">{product.description}</p>
                               <button 
                                onClick={() => { addToCart(product); setIsRecModalOpen(false); resetRec(); }}
                                className="text-gold underline uppercase text-[10px] font-display hover:text-white transition-colors"
                               >
                                Add to Cart
                               </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center col-span-2 text-white/50 py-20">We couldn't find a direct match. Try selecting different notes.</p>
                      )}
                   </div>

                   <button 
                    onClick={resetRec}
                    className="w-full py-4 border border-gold text-gold font-display uppercase tracking-widest hover:bg-gold hover:text-noir transition-all"
                   >
                    Retake Quiz
                   </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-[110] bg-noir/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md z-[120] bg-noir shadow-2xl flex flex-col border-l border-gold/30"
            >
              <div className="p-10 border-b border-gold/20 flex justify-between items-center bg-charcoal">
                <div className="flex items-center gap-6">
                   <div className="w-10 h-10 border border-gold flex items-center justify-center">
                    <ShoppingBag size={18} className="text-gold" />
                   </div>
                   <div>
                    <h2 className="text-2xl font-serif italic text-white uppercase tracking-widest">Bag</h2>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/30">{cartCount} Artifacts Selected</p>
                   </div>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-white/30 hover:text-gold transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-noir">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-16 h-16 border border-gold/10 flex items-center justify-center rounded-full text-gold/20">
                      <ShoppingBag size={32} />
                    </div>
                    <p className="text-white/30 font-light italic uppercase tracking-widest text-[10px]">Your bag is currently vacant.</p>
                    <button 
                      onClick={() => { setIsCartOpen(false); scrollToSection('collections'); }}
                      className="text-gold border-b border-gold/40 pb-1 uppercase tracking-widest text-[10px] font-display hover:text-white hover:border-white transition-all"
                    >
                      Browse Catalog
                    </button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-6 p-6 border border-gold/10 relative group bg-charcoal/30">
                      <div className="w-24 h-28 bg-noir overflow-hidden shadow-lg border border-gold/10">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                           <h4 className="font-serif italic text-xl text-gold">{item.name}</h4>
                           <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-white/20 hover:text-gold transition-colors"
                           >
                            <Trash2 size={16} />
                           </button>
                        </div>
                        <p className="text-white/50 font-display text-xs mb-6 uppercase tracking-widest">${item.price}</p>
                        <div className="flex items-center gap-6">
                           <div className="flex items-center border border-gold/20 bg-noir">
                              <button onClick={() => updateQuantity(item.id, -1)} className="p-2 px-3 hover:bg-gold/10 text-gold"><Minus size={10} /></button>
                              <span className="px-3 text-xs font-display w-8 text-center text-white">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="p-2 px-3 hover:bg-gold/10 text-gold"><Plus size={10} /></button>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-10 border-t border-gold/20 space-y-8 bg-charcoal">
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] uppercase tracking-widest font-display">
                      <span className="text-white/40 font-light">Subtotal</span>
                      <span className="text-white">${cartTotal}</span>
                    </div>
                    <div className="flex justify-between text-[10px] uppercase tracking-widest font-display">
                      <span className="text-white/40 font-light">Digital Logistics</span>
                      <span className="text-gold tracking-[0.2em] italic">Complimentary</span>
                    </div>
                    <div className="flex justify-between text-3xl font-serif pt-6 border-t border-gold/10">
                      <span className="italic">Total</span>
                      <span className="text-gold">${cartTotal}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handlePlaceOrder}
                    className="w-full py-6 bg-gold text-black font-display font-bold uppercase tracking-[0.4em] text-[11px] hover:bg-gold-hover transition-all shadow-xl shadow-gold/5"
                  >
                    Acquire Selection
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Order Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-noir/98 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-charcoal max-w-lg w-full gold-border p-12 text-center space-y-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 gold-gradient-bg"></div>
              
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 border-2 border-gold rounded-full flex items-center justify-center mx-auto"
              >
                <Check size={40} className="text-gold" />
              </motion.div>

              <div className="space-y-4">
                <h2 className="text-3xl font-serif italic text-gold uppercase tracking-[0.2em]">Transaction Complete</h2>
                <p className="text-white/70 font-light leading-relaxed">
                  Thank you for ordering from <span className="text-white font-medium italic">Lumiere Fragrance</span>. Your selection has been secured and will be dispatched directly to your location soon.
                </p>
              </div>

              <div className="py-6 border-y border-gold/10">
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-2 font-display">Logistics Status</p>
                <p className="text-gold italic font-serif">Estimated delivery: 3–5 business days</p>
              </div>

              <button 
                onClick={handleContinueShopping}
                className="w-full py-5 gold-gradient-bg text-noir font-display font-bold uppercase tracking-[0.3em] text-[11px] hover:gold-glow transition-all"
              >
                Continue Shopping
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
