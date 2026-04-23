/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, X } from 'lucide-react';
import { db } from './lib/firebase';
import { doc, collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

// Explicitly import images to force Vite to process and bundle them
import imgFront1 from './assets/foto-depan-1.png';
import imgBack1 from './assets/foto-belakang-1.png';
import imgFront2 from './assets/foto-depan-2.png';
import imgBack2 from './assets/foto-belakang-2.png';
import imgFront3 from './assets/foto-depan-3.jpg';
import imgBack3 from './assets/foto-belakang-3.jpg';
import iconIG from './assets/Instagram-logo.png';
import iconFB from './assets/Facebook-logo.png';
import iconTT from './assets/tiktok-logo.png';

export default function App() {
  const [isLocked, setIsLocked] = useState(true);

  // Ambil data query parameter dari URL (contoh: ?seriesNumber=9)
  const [seriesCode, setSeriesCode] = useState('001');
  const [stock, setStock] = useState<number | string>(0);
  
  // Real-time State untuk Fitur Buyback / Cashback
  const [buybackStatus, setBuybackStatus] = useState<'tutup' | 'buka'>('tutup');
  const [claimsCount, setClaimsCount] = useState<number>(0);

  // Modal / Popup State
  const [popupState, setPopupState] = useState<'closed' | 'form' | 'success' | 'failed'>('closed');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Membaca URL saat website dimuat
    const urlParams = new URLSearchParams(window.location.search);
    const paramInput = urlParams.get('seriesNumber');
    
    // Jika ada input dari URL, ubah formatnya (misal: "9" jadi "009")
    if (paramInput) {
      // padStart memastikan angkanya punya minimal 3 digit
      const formattedNumber = paramInput.padStart(3, '0');
      setSeriesCode(formattedNumber);
    }

    // Mendengarkan data secara Real-time dari Firebase Database (Inventory)
    const stockDocRef = doc(db, 'inventory', 'legong');
    const unsubscribeStock = onSnapshot(stockDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.stock !== undefined) setStock(data.stock);
        if (data.buyback_status !== undefined) setBuybackStatus(data.buyback_status);
        
        // Kunci tombol "Jual Sekarang" bergantung pada status Firebase
        setIsLocked(data.buyback_status !== 'buka');
      }
    }, (error) => {
      console.error("Firebase connection error:", error);
    });

    // Mendengarkan data jumlah Pemenang Cashback secara Real-time
    const claimsRef = collection(db, 'buyback_claims');
    const unsubscribeClaims = onSnapshot(claimsRef, (snapshot) => {
      setClaimsCount(snapshot.size); // snapshot.size menghitung jumlah dokumen/pemenang
    });

    return () => {
      unsubscribeStock();
      unsubscribeClaims();
    };
  }, []);

  const handleSellClick = () => {
    if (isLocked) return;

    if (claimsCount >= 5) {
      setPopupState('failed'); // Orang ke 6+
    } else {
      setPopupState('form');   // Dalam 5 tercepat
    }
  };

  const handleClaimSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!whatsappNumber || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Double check secara aman: Apakah tiba-tiba sudah penuh selagi dia mengetik?
      if (claimsCount >= 5) {
        setPopupState('failed');
        setIsSubmitting(false);
        return;
      }

      // Simpan data pemenang ke Firebase
      await addDoc(collection(db, 'buyback_claims'), {
        seriesCode: seriesCode,
        whatsapp: whatsappNumber,
        claimedAt: serverTimestamp()
      });

      // Menang!
      setPopupState('success');
    } catch (error) {
      console.error("Gagal mengirim klaim:", error);
      alert("Terjadi kesalahan jaringan, mohon coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5E5E5] font-inter selection:bg-[#C5A059]/30 selection:text-white relative">
      {/* Main Content Wrapper */}
      <div className="relative z-10">
        {/* Top Header - Removed based on client feedback */}
      <header className="fixed top-10 right-10 flex items-center gap-4 z-50">
      </header>

      {/* Main Layout - Centered Full Width Hero */}
      <main className="flex flex-col items-center justify-center min-h-screen pt-24 pb-16 md:pt-32 md:pb-20 px-6 md:px-8 text-center relative z-10 overflow-hidden">
        
        {/* Subtle Gold Mesh Gradient Silhouette Background Responsive */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Top Left Silhouette */}
          <div className="absolute -top-[10%] -left-[10%] w-[70vw] h-[70vw] md:-top-[20%] md:-left-[10%] md:w-[50vw] md:h-[50vw] bg-[#C5A059] rounded-full mix-blend-screen filter blur-[90px] md:blur-[120px] opacity-[0.12] md:opacity-20 transform-gpu"></div>
          
          {/* Bottom Right Silhouette (Adjusted for mobile CTA button area) */}
          <div className="absolute top-[65%] -right-[15%] w-[80vw] h-[80vw] md:-bottom-[20%] md:-right-[10%] md:w-[50vw] md:h-[50vw] bg-[#C5A059] rounded-full mix-blend-screen filter blur-[90px] md:blur-[120px] opacity-[0.12] md:opacity-20 transform-gpu"></div>
          
          {/* Center faint backdrop */}
          <div className="absolute top-1/2 left-1/2 w-[90vw] h-[90vw] md:w-[70vw] md:h-[70vw] bg-amber-900 rounded-full mix-blend-screen filter blur-[80px] md:blur-[100px] opacity-[0.04] md:opacity-[0.03] -translate-x-1/2 -translate-y-1/2 transform-gpu"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center w-full max-w-7xl mx-auto"
        >
          <div className="text-[9px] md:text-[10px] uppercase tracking-[4px] text-[#C5A059] mb-4 md:mb-6">Kioskaos collection Introducing</div>
          <h1 className="text-[3.5rem] sm:text-6xl md:text-8xl lg:text-[9rem] font-serif font-light leading-[0.95] md:leading-[0.9] mb-10 md:mb-16 tracking-tighter">
            The Queen of <br className="hidden sm:block" />
            <span className="text-[#C5A059] italic">Legong</span>
          </h1>
          
          <p className="max-w-3xl text-[13px] sm:text-sm md:text-base opacity-70 leading-relaxed font-light mb-12 md:mb-16 mx-auto">
            Sebar-luaskan <span className="font-semibold text-white">Bali kita</span>, dan <span className="font-semibold text-white">bangga-lah</span> dengan apa yang kita miliki. 
            Budaya adalah Peradaban Manusia, menggunakan produk ini adalah langkah kecil untuk menjaga Peradaban Bali.
          </p>

          {/* Product Quick Details - Horizontal Centered & Compact */}
          <div className="flex flex-row items-center justify-center gap-3 sm:gap-6 md:gap-16 mb-12 md:mb-16 w-full max-w-2xl mx-auto border-y border-[#C5A059]/10 py-5 md:py-6 px-2">
            <div className="flex flex-col items-center">
              <span className="text-[7.5px] sm:text-[9px] md:text-[10px] uppercase tracking-[1px] md:tracking-[2px] text-[#C5A059] mb-1 md:mb-2">Collection</span>
              <span className="text-[10px] sm:text-[13px] md:text-sm opacity-80 text-center leading-tight">Bali to Worldwide</span>
            </div>
            <div className="w-px h-6 sm:h-8 bg-[#C5A059]/30"></div>
            <div className="flex flex-col items-center">
              <span className="text-[7.5px] sm:text-[9px] md:text-[10px] uppercase tracking-[1px] md:tracking-[2px] text-[#C5A059] mb-1 md:mb-2">Series</span>
              <span className="text-[10px] sm:text-[13px] md:text-sm opacity-80 text-center leading-tight">Legong</span>
            </div>
            <div className="w-px h-6 sm:h-8 bg-[#C5A059]/30"></div>
            <div className="flex flex-col items-center">
              <span className="text-[7.5px] sm:text-[9px] md:text-[10px] uppercase tracking-[1px] md:tracking-[2px] text-[#C5A059] mb-1 md:mb-2">Tersisa</span>
              <span className="text-[10px] sm:text-[13px] md:text-sm opacity-80 text-center leading-tight">{Number(stock).toLocaleString('en-US')} pcs</span>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#C5A059] text-black px-6 py-2 md:px-8 md:py-3 rounded text-[10px] md:text-[11px] font-bold tracking-[3px] uppercase mb-12 md:mb-16 shadow-[0_8px_24px_-6px_rgba(197,160,89,0.6)]"
          >
            Series Code {seriesCode}
          </motion.div>

          {/* Integrated CTA Area */}
          <div className="flex flex-col items-center gap-4 md:gap-6 mt-4 w-full px-4">
            <div className={`text-[9px] md:text-[10px] px-3 py-1 rounded-sm uppercase tracking-[1px] flex items-center gap-2 ${isLocked ? 'bg-[#404040] text-white/50' : 'bg-[#C5A059]/20 text-[#C5A059]'}`}>
              {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              Status: {isLocked ? 'Terkunci' : 'Terbuka'}
            </div>

            <button
              onClick={handleSellClick}
              disabled={isLocked}
              className={`
                h-14 md:h-16 w-full max-w-sm md:w-auto md:px-24 font-semibold uppercase tracking-[3px] md:tracking-[4px] text-[13px] md:text-base border transition-all duration-500
                ${isLocked 
                  ? 'bg-[#404040]/30 border-transparent text-[#E5E5E5]/20 cursor-not-allowed' 
                  : 'bg-[#C5A059] border-[#C5A059] text-black hover:bg-transparent hover:text-[#C5A059] hover:shadow-[0_0_30px_rgba(197,160,89,0.3)]'}
              `}
            >
              {isLocked ? `TERKUNCI` : 'JUAL SEKARANG'}
            </button>

            <div className="text-[11px] opacity-50 max-w-sm text-center leading-relaxed">
              *syarat dan ketentuan cashback berlaku
            </div>
          </div>

        </motion.div>

        {/* --- Popup Modals Overlay --- */}
        <AnimatePresence>
          {popupState !== 'closed' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="bg-[#111] border border-[#C5A059]/30 relative p-8 md:p-10 w-full max-w-md shadow-2xl flex flex-col items-center text-center"
              >
                <button 
                  onClick={() => setPopupState('closed')}
                  className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {popupState === 'form' && (
                  <form onSubmit={handleClaimSubmit} className="w-full flex flex-col items-center">
                    <h3 className="text-[#C5A059] text-sm md:text-base uppercase tracking-[3px] font-semibold mb-4">Langkah Terakhir</h3>
                    <p className="text-white/80 text-xs md:text-sm leading-relaxed mb-6">
                      Anda berhasil masuk antrean! Segera masukkan nomor WhatsApp Anda agar tim kami bisa menghubungi Anda jika lolos verifikasi.
                    </p>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 08123456789"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#333] focus:border-[#C5A059] rounded-none px-4 py-3 text-white text-sm outline-none transition-colors text-center mb-6"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#C5A059] text-black font-bold uppercase tracking-[2px] py-3 text-xs md:text-sm hover:bg-white transition-colors duration-300 disabled:opacity-50"
                    >
                      {isSubmitting ? 'MENGIRIM...' : 'KLAIM CASHBACK SEKARANG'}
                    </button>
                  </form>
                )}

                {popupState === 'success' && (
                  <div className="w-full flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[#C5A059]/20 flex items-center justify-center text-[#C5A059] mb-6">
                      <Unlock className="w-8 h-8" />
                    </div>
                    <h3 className="text-[#C5A059] text-sm md:text-base uppercase tracking-[3px] font-semibold mb-3">Selamat!</h3>
                    <p className="text-white/80 text-xs md:text-sm leading-relaxed">
                      Anda berhasil mendapatkan cashback Rp 1.200.000. Tim kami akan segera memverifikasi Series Code Anda dan menghubungi ke WhatsApp Anda dalam kurun waktu 1x24 jam.
                    </p>
                  </div>
                )}

                {popupState === 'failed' && (
                  <div className="w-full flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h3 className="text-red-400 text-sm md:text-base uppercase tracking-[3px] font-semibold mb-3">Kuota Habis</h3>
                    <p className="text-white/80 text-xs md:text-sm leading-relaxed">
                      Mohon maaf, Anda kurang cepat. Kuota 5 pemenang cashback eksklusif untuk kampanye ini telah terisi penuh. 
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* --- End Popup Modals --- */}

        {/* Fading bottom edge to remove harsh transition to the next section */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none z-0"></div>
      </main>

      <section className="relative bg-[#0A0A0A] py-20 md:py-32 px-6 md:px-20 border-none">
        {/* Dark overlay specifically for this section to maintain contrast */}
        <div className="absolute inset-0 bg-[#0A0A0A] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-16 md:mb-20 text-center md:text-left will-change-[transform,opacity]"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light mb-3 md:mb-4 italic tracking-tighter">Desain Eksklusif <span className="text-[#C5A059]">Kami</span></h2>
            <div className="w-12 h-px bg-[#C5A059] mb-4 md:mb-6 hidden md:block"></div>
            <p className="text-[10px] md:text-[11px] uppercase tracking-[3px] opacity-50">Edisi Eksklusif Seni Tari Legong Autentik</p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:gap-10">
            {/* Front View */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-square bg-[#141414] border border-[#404040] flex items-center justify-center hover:border-[#C5A059]/40 transition-colors duration-500 overflow-hidden group will-change-[transform,opacity]"
            >
              {/* Gambar produk depan */}
              <img 
                src={imgFront1}
                alt="Tampilan Depan" 
                className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-1000 transform-gpu"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 opacity-80 md:opacity-70 transform-gpu"></div>
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 text-[7.5px] sm:text-[9px] uppercase tracking-[2px] sm:tracking-[4px] text-[#C5A059] font-bold z-20">Tampilan Depan</div>
            </motion.div>

            {/* Back View */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative aspect-square bg-[#141414] border border-[#404040] flex items-center justify-center hover:border-[#C5A059]/40 transition-colors duration-500 overflow-hidden group will-change-[transform,opacity]"
            >
              {/* Gambar produk belakang */}
              <img 
                src={imgBack1}
                alt="Tampilan Belakang" 
                className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-1000 transform-gpu"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 opacity-80 md:opacity-70 transform-gpu"></div>
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 text-[7.5px] sm:text-[9px] uppercase tracking-[2px] sm:tracking-[4px] text-[#C5A059] font-bold z-20">Tampilan Belakang</div>
            </motion.div>

            {/* Detail 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-square bg-[#141414] border border-[#404040] flex items-center justify-center hover:border-[#C5A059]/40 transition-colors duration-500 overflow-hidden group will-change-[transform,opacity]"
            >
              <img 
                src={imgFront2}
                alt="Tampilan Depan" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-1000 transform-gpu"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 opacity-80 md:opacity-70 transform-gpu"></div>
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 text-[7.5px] sm:text-[9px] uppercase tracking-[2px] sm:tracking-[4px] text-[#C5A059] font-bold z-20">Tampilan Depan</div>
            </motion.div>

            {/* Detail 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative aspect-square bg-[#141414] border border-[#404040] flex items-center justify-center hover:border-[#C5A059]/40 transition-colors duration-500 overflow-hidden group will-change-[transform,opacity]"
            >
              <img 
                src={imgBack2}
                alt="Tampilan Belakang" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-1000 transform-gpu"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 opacity-80 md:opacity-70 transform-gpu"></div>
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 text-[7.5px] sm:text-[9px] uppercase tracking-[2px] sm:tracking-[4px] text-[#C5A059] font-bold z-20">Tampilan Belakang</div>
            </motion.div>

            {/* Detail 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-square bg-[#141414] border border-[#404040] flex items-center justify-center hover:border-[#C5A059]/40 transition-colors duration-500 overflow-hidden group will-change-[transform,opacity]"
            >
              <img 
                src={imgFront3}
                alt="Tampilan Depan" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-1000 transform-gpu"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 opacity-80 md:opacity-70 transform-gpu"></div>
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 text-[7.5px] sm:text-[9px] uppercase tracking-[2px] sm:tracking-[4px] text-[#C5A059] font-bold z-20">Tampilan Depan</div>
            </motion.div>

            {/* Detail 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative aspect-square bg-[#141414] border border-[#404040] flex items-center justify-center hover:border-[#C5A059]/40 transition-colors duration-500 overflow-hidden group will-change-[transform,opacity]"
            >
              <img 
                src={imgBack3}
                alt="Tampilan Belakang" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-1000 transform-gpu"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 opacity-80 md:opacity-70 transform-gpu"></div>
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 text-[7.5px] sm:text-[9px] uppercase tracking-[2px] sm:tracking-[4px] text-[#C5A059] font-bold z-20">Tampilan Belakang</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials - Full Width Elegant Style */}
      <section className="relative bg-transparent py-20 md:py-32 px-6 md:px-20 pb-24 md:pb-32">
         {/* Darker overlay specifically for this section */}
         <div className="absolute inset-0 bg-[#111111]/95 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6 }}
            className="mb-12 md:mb-16 will-change-[transform,opacity]"
          >
            <h3 className="text-2xl sm:text-3xl font-serif italic text-white/90 mb-3 md:mb-4">Apa Kata <span className="text-[#C5A059]">Mereka?</span></h3>
            <div className="w-12 h-px bg-[#C5A059]"></div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="relative w-[100vw] left-1/2 -translate-x-1/2 overflow-hidden py-4 will-change-[opacity]"
          >
            {/* Fade edges */}
            <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-[#111111] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-[#111111] to-transparent z-10 pointer-events-none"></div>

            <div className="animate-marquee-right">
              {[
                { name: "Raka Sidatama", text: "Gak nyangka detail sablon emas Legong-nya se-pop itu aslinya. Bahannya tebel khas Kioskaos, tapi tetep adem dipake siang bolong. Sayang kemaren ga kebagian size L jadi ambil XL, agak kebesaran dikit tapi gapapa dapet nomor seri!" },
                { name: "Aditya Pratama", text: "Sistem buyback-nya gila sih, bikin deg-degan pas checkout. Webnya sempet loading agak lama karena rebutan, tapi untung dapet! Bajunya sendiri solid banget, worth the hype." },
                { name: "Gungde Wira", text: "Desainnya dapet banget vibe Balinya, tapi gak norak buat dipake nongkrong. Udah masuk mesin cuci dua kali sablonnya masih aman jaya. Boleh lah next rilis edisi warna lain selain hitam." },
                { name: "Dika Anggara", text: "Bangga banget dapet seri 008! Buat kualitas bahan gausah diragukan lagi lah ya kaliber pabriknya Kioskaos. Cuma box packaging-nya mungkin bisa dilapis bubble wrap lebih tebel lagi biar ga penyok di ekspedisi." },
                { name: "Krisna Birawa", text: "Worth it nungguin PO-nya. Jahitannya rapi banget, gak ada benang sisa sama sekali. Cuttingannya pas di badan. Kalo bisa admin WA-nya lebih fast respon lagi mantap tuh Bli." },
                { name: "Yande", text: "Sebagai anak seni, salut sama eksekusi grafis Legong-nya, kerasa banget sentuhan 'culture' nya. Btw, next project collab sama seniman-seniman lokal Bali lainnya dong Bli Denok!" },
                { name: "Bintang Putra", text: "Awalnya iseng ikut war karena penasaran buyback-nya, eh pas dateng malah sayang buat dijual lagi. Nyaman banget bahannya. Tolong ini beneran jangan di-restock biar tetep langka! Hahaha." },
                { name: "Agus Haryawan", text: "Bahan katunnya beda sama kaos distro biasa, ini jatuhnya lebih premium dan berat. Kerahnya juga kokoh. Masukan aja, mungkin tag merek di kerah bisa diganti model sablon aja biar leher ga gatal." },
                { name: "Hendra V.", text: "Konsep drop eksklusif pakai nomor seri gini jarang nemu di brand lokal. Keren idenya! Cutting bajunya agak boxy ya ternyata, tapi malah masuk banget dipake streetwear." },
                { name: "Oka Pradana", text: "Aslinya lebih bagus dari foto di web. Warna hitamnya bener-bener pekat. Sempet mikir harganya lumayan, tapi pas pegang langsung barangnya... okelah, harga emang ga bisa bohong. Sukses terus!" },
                // Duplicate for seamless loop
                { name: "Raka Sidatama", text: "Gak nyangka detail sablon emas Legong-nya se-pop itu aslinya. Bahannya tebel khas Kioskaos, tapi tetep adem dipake siang bolong. Sayang kemaren ga kebagian size L jadi ambil XL, agak kebesaran dikit tapi gapapa dapet nomor seri!" },
                { name: "Aditya Pratama", text: "Sistem buyback-nya gila sih, bikin deg-degan pas checkout. Webnya sempet loading agak lama karena rebutan, tapi untung dapet! Bajunya sendiri solid banget, worth the hype." },
                { name: "Gungde Wira", text: "Desainnya dapet banget vibe Balinya, tapi gak norak buat dipake nongkrong. Udah masuk mesin cuci dua kali sablonnya masih aman jaya. Boleh lah next rilis edisi warna lain selain hitam." },
                { name: "Dika Anggara", text: "Bangga banget dapet seri 008! Buat kualitas bahan gausah diragukan lagi lah ya kaliber pabriknya Kioskaos. Cuma box packaging-nya mungkin bisa dilapis bubble wrap lebih tebel lagi biar ga penyok di ekspedisi." },
                { name: "Krisna Birawa", text: "Worth it nungguin PO-nya. Jahitannya rapi banget, gak ada benang sisa sama sekali. Cuttingannya pas di badan. Kalo bisa admin WA-nya lebih fast respon lagi mantap tuh Bli." },
                { name: "Yande", text: "Sebagai anak seni, salut sama eksekusi grafis Legong-nya, kerasa banget sentuhan 'culture' nya. Btw, next project collab sama seniman-seniman lokal Bali lainnya dong Bli Denok!" },
                { name: "Bintang Putra", text: "Awalnya iseng ikut war karena penasaran buyback-nya, eh pas dateng malah sayang buat dijual lagi. Nyaman banget bahannya. Tolong ini beneran jangan di-restock biar tetep langka! Hahaha." },
                { name: "Agus Haryawan", text: "Bahan katunnya beda sama kaos distro biasa, ini jatuhnya lebih premium dan berat. Kerahnya juga kokoh. Masukan aja, mungkin tag merek di kerah bisa diganti model sablon aja biar leher ga gatal." },
                { name: "Hendra V.", text: "Konsep drop eksklusif pakai nomor seri gini jarang nemu di brand lokal. Keren idenya! Cutting bajunya agak boxy ya ternyata, tapi malah masuk banget dipake streetwear." },
                { name: "Oka Pradana", text: "Aslinya lebih bagus dari foto di web. Warna hitamnya bener-bener pekat. Sempet mikir harganya lumayan, tapi pas pegang langsung barangnya... okelah, harga emang ga bisa bohong. Sukses terus!" }
              ].map((t, i) => (
                <div key={i} className="bg-[#141414] w-[280px] sm:w-[320px] md:w-[450px] h-full flex flex-col justify-between shrink-0 p-6 md:p-10 mx-3 md:mx-4 border border-[#404040] hover:border-[#C5A059]/30 transition-colors duration-300">
                  <p className="text-[13px] md:text-[15px] font-serif italic leading-relaxed text-[#E5E5E5] mb-6 md:mb-8 opacity-90">"{t.text}"</p>
                  <div>
                    <div className="text-[9px] md:text-[10px] uppercase tracking-[2px] font-bold text-[#C5A059]">{t.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ultra-Luxury Footer Area */}
      <footer className="bg-[#050505] py-16 px-6 md:px-20 relative z-10 w-full overflow-hidden">
        {/* Subtle Gold Blur at the bottom */}
        <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-[#C5A059] opacity-[0.04] blur-[100px] pointer-events-none transform-gpu"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto flex flex-row justify-between items-start text-left gap-4 relative z-10 will-change-[transform,opacity]"
        >
          
          <div className="flex flex-col items-start gap-4 max-w-[50%] md:max-w-sm">
            <div className="flex flex-col border-l-2 border-[#C5A059]/30 pl-3 md:pl-4">
              <span className="font-serif italic text-2xl md:text-3xl lg:text-4xl text-[#C5A059] leading-none mb-1">Kioskaos</span>
              <span className="text-[7.5px] md:text-[10px] uppercase tracking-[4px] md:tracking-[6px] text-[#E5E5E5]/50 pl-1">Balinesia</span>
            </div>
            <p className="text-[8px] md:text-[10px] leading-[1.8] text-[#E5E5E5]/40 uppercase tracking-[1px] md:tracking-[2px] mt-2">
              Gg. Ratna No.09, Kesiman,<br />
              Kec. Denpasar Tim., Kota Denpasar,<br />
              Bali 80237
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 text-right">
            <span className="text-[8px] md:text-[9px] uppercase tracking-[2px] md:tracking-[4px] text-[#E5E5E5]/80 font-bold mb-1">Terhubung Dengan Kami</span>
            
            <div className="flex flex-col gap-3">
              <a href="https://www.instagram.com/kioskaosbalinesia.ofc/" target="_blank" rel="noreferrer" className="text-[8.5px] md:text-[10px] tracking-[1px] md:tracking-[2px] text-[#E5E5E5]/40 hover:text-[#C5A059] transition-all flex items-center justify-start group w-full">
                <img src={iconIG} alt="Instagram" loading="lazy" decoding="async" className="w-[12px] h-[12px] md:w-[14px] md:h-[14px] mr-3 opacity-30 group-hover:opacity-100 group-hover:brightness-0 group-hover:invert-[.6] group-hover:sepia-[.6] group-hover:saturate-[5] group-hover:hue-rotate-[10deg] transition-all duration-300 object-contain" />
                <span className="w-[110px] sm:w-[160px] md:w-[180px] text-left leading-none tracking-[1px] md:tracking-[2px]"><span className="hidden sm:inline">kioskaosbalinesia.ofc</span><span className="sm:hidden">@kioskaos</span></span>
              </a>
              
              <a href="https://www.facebook.com/profile.php?id=61552872545508" target="_blank" rel="noreferrer" className="text-[8.5px] md:text-[10px] tracking-[1px] md:tracking-[2px] text-[#E5E5E5]/40 hover:text-[#C5A059] transition-all flex items-center justify-start group w-full">
                <img src={iconFB} alt="Facebook" loading="lazy" decoding="async" className="w-[12px] h-[12px] md:w-[14px] md:h-[14px] mr-3 opacity-30 group-hover:opacity-100 group-hover:brightness-0 group-hover:invert-[.6] group-hover:sepia-[.6] group-hover:saturate-[5] group-hover:hue-rotate-[10deg] transition-all duration-300 object-contain" />
                <span className="w-[110px] sm:w-[160px] md:w-[180px] text-left leading-none tracking-[1px] md:tracking-[2px]"><span className="hidden sm:inline">kioskaosbalinesia.ofc</span><span className="sm:hidden">kioskaos</span></span>
              </a>
              
              <a href="https://www.tiktok.com/@kioskaosbalinesia.ofc" target="_blank" rel="noreferrer" className="text-[8.5px] md:text-[10px] tracking-[1px] md:tracking-[2px] text-[#E5E5E5]/40 hover:text-[#C5A059] transition-all flex items-center justify-start group w-full">
                <img src={iconTT} alt="TikTok" loading="lazy" decoding="async" className="w-[12px] h-[12px] md:w-[14px] md:h-[14px] mr-3 opacity-30 group-hover:opacity-100 group-hover:brightness-0 group-hover:invert-[.6] group-hover:sepia-[.6] group-hover:saturate-[5] group-hover:hue-rotate-[10deg] transition-all duration-300 object-contain" />
                <span className="w-[110px] sm:w-[160px] md:w-[180px] text-left leading-none tracking-[1px] md:tracking-[2px]"><span className="hidden sm:inline">kioskaosbalinesia.ofc</span><span className="sm:hidden">@kioskaos</span></span>
              </a>
            </div>
          </div>
          
        </motion.div>
        
        <div className="max-w-7xl mx-auto mt-12 md:mt-10 w-full flex justify-center opacity-70 px-4 md:px-0">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[#C5A059]/30 to-transparent w-full max-w-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-6 flex flex-col md:flex-row justify-between items-center text-[7.5px] md:text-[8px] uppercase tracking-[2px] md:tracking-[3px] text-[#E5E5E5]/30 text-center relative z-10 gap-3 md:gap-4">
          <span>&copy; {new Date().getFullYear()} Kioskaos Balinesia. Hak Cipta Dilindungi.</span>
          <span className="font-serif italic capitalize tracking-[1px] text-[11px] md:text-[12px] text-[#C5A059]/40">"Simbol Jiwa Bali"</span>
        </div>
      </footer>

      {/* Global CSS for Fonts and Elegant Overrides */}
      <style>{`
        :root {
          --accent: #C5A059;
          --bg: #0A0A0A;
          --ink: #E5E5E5;
          --muted: #404040;
          --panel: #141414;
        }

        body { overflow-x: hidden; background-color: #0A0A0A; }

        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        .font-montserrat { font-family: 'Montserrat', sans-serif; }

        .font-variant-numeric-tabular-nums { font-variant-numeric: tabular-nums; }

        /* Custom scrollbar for horizontal scrolling panels */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .vertical-rl { writing-mode: vertical-rl; }

        /* Marquee Animation */
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee-right {
          display: flex;
          width: max-content;
          animation: marquee-right 60s linear infinite;
        }
        .animate-marquee-right:hover {
          animation-play-state: paused;
        }
      `}</style>
      </div> 
    </div>
  );
}
