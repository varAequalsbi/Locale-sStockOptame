import React, { useState, useEffect } from 'react';

export default function StockOptameApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [stocks, setStocks] = useState([]);
  const [todaySales, setTodaySales] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Transaction State
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [saleTime, setSaleTime] = useState('');
  
  // Restock State
  const [selectedStock, setSelectedStock] = useState('');
  const [restockAmount, setRestockAmount] = useState('');
  
  // Management State
  const [newProductName, setNewProductName] = useState('');
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientUnit, setNewIngredientUnit] = useState('g');
  const [newIngredientMin, setNewIngredientMin] = useState(100);

  // --- NEW: CANCELLATION STATE ---
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [saleToCancel, setSaleToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const CANCEL_REASONS = [
    "Salah Input Produk",
    "Pelanggan Batal Beli",
    "Ubah Pesanan",
    "Stok Tidak Cukup",
    "Pembayaran Gagal"
  ];

  // --- INITIALIZATION ---
  useEffect(() => {
    const cachedStocks = localStorage.getItem('stocks');
    const cachedSales = localStorage.getItem('todaySales');
    const cachedProducts = localStorage.getItem('products');
    
    if (cachedStocks) {
      setStocks(JSON.parse(cachedStocks));
    } else {
      const initialStocks = [
        { id: 1, name: 'Susu (Milk)', current: 2200, unit: 'ml', min: 1000 },
        { id: 2, name: 'Kopi (Coffee Beans)', current: 450, unit: 'g', min: 500 },
        { id: 3, name: 'Air (Water)', current: 5000, unit: 'ml', min: 2000 },
        { id: 4, name: 'Gelas (Cups)', current: 45, unit: 'pcs', min: 30 }
      ];
      setStocks(initialStocks);
      localStorage.setItem('stocks', JSON.stringify(initialStocks));
    }
    
    if (cachedSales) {
      setTodaySales(JSON.parse(cachedSales));
    }
    
    if (cachedProducts) {
      setProducts(JSON.parse(cachedProducts));
    } else {
      const initialProducts = [
        { id: 1, name: 'Latte', recipe: { 'susu': 120, 'kopi': 16, 'gelas': 1 } },
        { id: 2, name: 'Cappuccino', recipe: { 'susu': 100, 'kopi': 18, 'gelas': 1 } },
        { id: 3, name: 'Americano', recipe: { 'air': 150, 'kopi': 16, 'gelas': 1 } },
        { id: 4, name: 'Espresso', recipe: { 'kopi': 18, 'gelas': 1 } }
      ];
      setProducts(initialProducts);
      localStorage.setItem('products', JSON.stringify(initialProducts));
    }
  }, []);

  const getStockStatus = (stock) => {
    if (stock.current < stock.min) return 'low';
    if (stock.current < stock.min * 1.5) return 'medium';
    return 'good';
  };

  // --- LOGIC FUNCTIONS ---

  // 1. Trigger the Modal
  const initiateCancelSale = (sale) => {
    setSaleToCancel(sale);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  // 2. Execute Cancellation with Reason
  const handleConfirmCancel = () => {
    if (!saleToCancel) return;
    if (!cancelReason.trim()) {
      alert("Mohon isi alasan pembatalan!");
      return;
    }

    // Restore the stocks
    const newStocks = [...stocks];
    Object.entries(saleToCancel.recipe).forEach(([ingredientKey, amount]) => {
      const stockIndex = newStocks.findIndex(s => s.name.toLowerCase().includes(ingredientKey));
      if (stockIndex !== -1) {
        newStocks[stockIndex].current += (amount * saleToCancel.quantity);
      }
    });

    // Mark sale as Cancelled (instead of deleting it completely, so we keep the record)
    const updatedSales = todaySales.map(s => {
      if (s.id === saleToCancel.id) {
        return { ...s, cancelled: true, cancelReason: cancelReason };
      }
      return s;
    });

    // Update State & Storage
    setStocks(newStocks);
    setTodaySales(updatedSales);
    localStorage.setItem('stocks', JSON.stringify(newStocks));
    localStorage.setItem('todaySales', JSON.stringify(updatedSales));

    // Reset UI
    setCancelModalOpen(false);
    setSaleToCancel(null);
    setCancelReason('');
  };

  const handleSale = () => {
    if (!selectedProduct || quantity < 1 || !saleTime) {
      alert('Pilih produk, jumlah, dan waktu yang valid!');
      return;
    }

    const product = products.find(p => p.name === selectedProduct);
    if (!product) return;

    const newStocks = [...stocks];
    let canProcess = true;
    let missingItem = '';

    Object.entries(product.recipe).forEach(([ingredientKey, amount]) => {
      const stock = newStocks.find(s => s.name.toLowerCase().includes(ingredientKey));
      if (!stock) {
         canProcess = false;
         missingItem = `Data stok untuk "${ingredientKey}" tidak ditemukan`;
      } else if (stock.current < amount * quantity) {
        canProcess = false;
        missingItem = `Stok ${stock.name} tidak cukup`;
      }
    });

    if (!canProcess) {
      alert('Gagal: ' + missingItem);
      return;
    }

    Object.entries(product.recipe).forEach(([ingredientKey, amount]) => {
      const stockIndex = newStocks.findIndex(s => s.name.toLowerCase().includes(ingredientKey));
      if (stockIndex !== -1) {
        newStocks[stockIndex].current -= amount * quantity;
      }
    });

    const newSale = {
      id: Date.now(),
      product: selectedProduct,
      quantity: quantity,
      recipe: product.recipe,
      time: saleTime,
      cancelled: false,
      cancelReason: ''
    };

    const updatedSales = [newSale, ...todaySales];
    setStocks(newStocks);
    setTodaySales(updatedSales);
    localStorage.setItem('stocks', JSON.stringify(newStocks));
    localStorage.setItem('todaySales', JSON.stringify(updatedSales));
    
    setSelectedProduct('');
    setQuantity(1);
    setSaleTime('');
    alert('✅ Penjualan berhasil dicatat!');
  };

  const handleRestock = () => {
    if (!selectedStock || !restockAmount || restockAmount < 1) {
      alert('Pilih bahan dan jumlah yang valid!');
      return;
    }
    const newStocks = stocks.map(stock => {
      if (stock.name === selectedStock) {
        return { ...stock, current: stock.current + parseInt(restockAmount) };
      }
      return stock;
    });
    setStocks(newStocks);
    localStorage.setItem('stocks', JSON.stringify(newStocks));
    setSelectedStock('');
    setRestockAmount('');
    alert('Stok berhasil ditambahkan!');
    setCurrentView('dashboard');
  };

  const handleAddProduct = () => {
    if (!newProductName.trim()) return;
    const newProduct = { id: Date.now(), name: newProductName.trim(), recipe: {} };
    const updated = [...products, newProduct];
    setProducts(updated);
    localStorage.setItem('products', JSON.stringify(updated));
    setNewProductName('');
  };

  const handleDeleteProduct = (id) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem('products', JSON.stringify(updated));
  };

  const handleAddIngredient = () => {
    if (!newIngredientName) return;
    const newStock = { id: Date.now(), name: newIngredientName, unit: newIngredientUnit, current: 0, min: Number(newIngredientMin) };
    const updated = [...stocks, newStock];
    setStocks(updated);
    localStorage.setItem('stocks', JSON.stringify(updated));
    setNewIngredientName('');
  };

  const handleDeleteStock = (id) => {
    if(window.confirm("Apakah Anda yakin ingin menghapus bahan ini?")) {
      const updated = stocks.filter(s => s.id !== id);
      setStocks(updated);
      localStorage.setItem('stocks', JSON.stringify(updated));
    }
  };

  const updateRecipeAmount = (productId, key, value) => {
    const updated = products.map(p => {
      if (p.id !== productId) return p;
      return { ...p, recipe: { ...p.recipe, [key]: Number(value) } };
    });
    setProducts(updated);
    localStorage.setItem('products', JSON.stringify(updated));
  };

  const addIngredientToRecipe = (productId, name) => {
    const key = name.toLowerCase().split(' ')[0];
    const updated = products.map(p => {
      if (p.id !== productId) return p;
      return { ...p, recipe: { ...p.recipe, [key]: 1 } };
    });
    setProducts(updated);
    localStorage.setItem('products', JSON.stringify(updated));
  };

  const removeIngredientFromRecipe = (productId, keyToRemove) => {
    const updated = products.map(p => {
      if (p.id !== productId) return p;
      
      const newRecipe = { ...p.recipe };
      delete newRecipe[keyToRemove];
      
      return { ...p, recipe: newRecipe };
    });
    setProducts(updated);
    localStorage.setItem('products', JSON.stringify(updated));
  };

  // --- RENDER ---
  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', paddingBottom: 100, fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ background: 'white', padding: '16px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>StockOptame</h1>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
        
        {/* === VIEW: DASHBOARD === */}
        {currentView === 'dashboard' && (
          <div className="view-dashboard">
            <div style={{ background: 'linear-gradient(135deg, #0061f2 0%, #00ba88 100%)', color: 'white', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 12px rgba(0,97,242,0.3)' }}>
              <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>Halo, Barista! 👋</h2>
              <p style={{ fontSize: 14, opacity: 0.9, margin: 0 }}>Siap mencatat penjualan hari ini?</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <button onClick={() => setCurrentView('sales')} style={{ background: 'white', border: 'none', padding: 24, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: 32, marginBottom: 8 }}>🛒</span>
                <span style={{ fontWeight: 'bold', color: '#1a1a1a' }}>Catat Jual</span>
              </button>
              <button onClick={() => setCurrentView('restock')} style={{ background: 'white', border: 'none', padding: 24, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: 32, marginBottom: 8 }}>📦</span>
                <span style={{ fontWeight: 'bold', color: '#1a1a1a' }}>Restock</span>
              </button>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#444' }}>Status Stok</h3>
            {stocks.map(stock => {
              const status = getStockStatus(stock);
              const color = status === 'low' ? '#e02424' : status === 'medium' ? '#d69e2e' : '#0e9f6e';
              return (
                <div key={stock.id} style={{ background: 'white', padding: 16, borderRadius: 12, marginBottom: 12, borderLeft: `5px solid ${color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>{stock.name}</span>
                    <span style={{ color: color, fontWeight: 'bold', fontSize: 12 }}>{stock.current} {stock.unit}</span>
                  </div>
                  {status === 'low' && <div style={{ fontSize: 11, color: '#e02424' }}>⚠️ Stok menipis (Min: {stock.min})</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* === VIEW: SALES (CATAT PENJUALAN) === */}
        {currentView === 'sales' && (
          <div className="view-sales">
             <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
               <button onClick={() => setCurrentView('dashboard')} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 0, marginRight: 8 }}>←</button>
               <h2 style={{ fontSize: 18, fontWeight: 'bold', margin: 0 }}>Catat Penjualan</h2>
             </div>

            <div style={{ background: 'white', padding: 20, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 6 }}>PRODUK</label>
                <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 16, background: '#fff' }}>
                  <option value="">Pilih Produk...</option>
                  {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 6 }}>JUMLAH</label>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 16, boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 6 }}>JAM</label>
                  <input type="time" value={saleTime} onChange={(e) => setSaleTime(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 16, boxSizing: 'border-box' }} />
                </div>
              </div>

              <button onClick={handleSale} style={{ width: '100%', background: '#0061f2', color: 'white', padding: 16, borderRadius: 12, border: 'none', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>
                Simpan Penjualan
              </button>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#444' }}>Riwayat Hari Ini</h3>
            {todaySales.length === 0 ? <p style={{ color: '#888', fontStyle: 'italic' }}>Belum ada penjualan.</p> : null}

            {todaySales.map(sale => (
              <div key={sale.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: sale.cancelled ? '#f9fafb' : 'white', 
                padding: '12px 16px', 
                borderRadius: 12, 
                marginBottom: 8, 
                borderLeft: sale.cancelled ? '4px solid #9ca3af' : '4px solid #0e9f6e',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                opacity: sale.cancelled ? 0.7 : 1
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', textDecoration: sale.cancelled ? 'line-through' : 'none' }}>
                    {sale.product} <span style={{fontSize: 12, color: '#666'}}>x{sale.quantity}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#888' }}>{sale.time}</div>
                  {sale.cancelled && (
                    <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>
                      Dibatalkan: {sale.cancelReason}
                    </div>
                  )}
                </div>
                
                {!sale.cancelled && (
                  <button 
                    onClick={() => initiateCancelSale(sale)}
                    style={{
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    Batal
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* === VIEW: RESTOCK === */}
        {currentView === 'restock' && (
          <div className="view-restock">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
               <button onClick={() => setCurrentView('dashboard')} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 0, marginRight: 8 }}>←</button>
               <h2 style={{ fontSize: 18, fontWeight: 'bold', margin: 0 }}>Tambah Stok</h2>
             </div>
            
            <div style={{ background: 'white', padding: 20, borderRadius: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 6 }}>BAHAN</label>
                <select value={selectedStock} onChange={(e) => setSelectedStock(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 16, background: '#fff' }}>
                  <option value="">Pilih Bahan...</option>
                  {stocks.map(s => <option key={s.id} value={s.name}>{s.name} (Sisa: {s.current})</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 6 }}>JUMLAH TAMBAH</label>
                <input type="number" placeholder="0" value={restockAmount} onChange={(e) => setRestockAmount(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 16, boxSizing: 'border-box' }} />
              </div>
              <button onClick={handleRestock} style={{ width: '100%', background: '#00ba88', color: 'white', padding: 16, borderRadius: 12, border: 'none', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>
                Konfirmasi Restock
              </button>
            </div>
          </div>
        )}

        {/* === VIEW: REPORTS (LAPORAN) === */}
        {currentView === 'reports' && (
          <div className="view-reports">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
               <h2 style={{ fontSize: 18, fontWeight: 'bold', margin: 0 }}>Laporan Harian</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'white', padding: 16, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 12, color: '#666' }}>Terjual</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0e9f6e' }}>
                  {todaySales.filter(s => !s.cancelled).reduce((acc, curr) => acc + Number(curr.quantity), 0)}
                </div>
                <div style={{ fontSize: 10, color: '#888' }}>Items</div>
              </div>
              <div style={{ background: 'white', padding: 16, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 12, color: '#666' }}>Dibatalkan</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#e02424' }}>
                  {todaySales.filter(s => s.cancelled).reduce((acc, curr) => acc + Number(curr.quantity), 0)}
                </div>
                <div style={{ fontSize: 10, color: '#888' }}>Items</div>
              </div>
            </div>

            <div style={{ background: 'white', padding: 20, borderRadius: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 'bold', margin: '0 0 12px 0', color: '#444' }}>Stok Kritis</h3>
              {stocks.filter(s => getStockStatus(s) === 'low').length === 0 ? 
                <p style={{ fontSize: 14, color: '#0e9f6e' }}>Semua stok aman!</p> :
                stocks.filter(s => getStockStatus(s) === 'low').map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                    <span>{s.name}</span>
                    <span style={{ color: '#e02424', fontWeight: 'bold' }}>{s.current} {s.unit}</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* === VIEW: SETTINGS === */}
        {currentView === 'settings' && (
          <div className="view-settings">
            <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Pengaturan</h2>
            <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div onClick={() => setCurrentView('manage-products')} style={{ padding: 16, borderBottom: '1px solid #eee', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                <span>☕ Kelola Produk</span>
                <span style={{ color: '#ccc' }}>›</span>
              </div>
              <div onClick={() => setCurrentView('manage-recipes')} style={{ padding: 16, borderBottom: '1px solid #eee', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                <span>📝 Kelola Resep</span>
                <span style={{ color: '#ccc' }}>›</span>
              </div>
              <div onClick={() => setCurrentView('manage-ingredients')} style={{ padding: 16, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                <span>📦 Kelola Bahan Baku</span>
                <span style={{ color: '#ccc' }}>›</span>
              </div>
            </div>
          </div>
        )}

        {/* === VIEW: SUB-SETTINGS (Manage Products) === */}
        {currentView === 'manage-products' && (
          <div>
            <button onClick={() => setCurrentView('settings')} style={{ background: 'none', border: 'none', color: '#0061f2', marginBottom: 16, cursor: 'pointer' }}>← Kembali</button>
            <div style={{ background: 'white', padding: 20, borderRadius: 16 }}>
               <h3 style={{ marginTop: 0 }}>Tambah Produk</h3>
               <div style={{ display: 'flex', gap: 8 }}>
                 <input value={newProductName} onChange={e => setNewProductName(e.target.value)} placeholder="Nama produk" style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 8 }} />
                 <button onClick={handleAddProduct} style={{ background: '#0e9f6e', color: 'white', border: 'none', borderRadius: 8, padding: '0 16px' }}>+</button>
               </div>
               <div style={{ marginTop: 20 }}>
                 {products.map(p => (
                   <div key={p.id} style={{ padding: '12px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                     {p.name}
                     <button onClick={() => handleDeleteProduct(p.id)} style={{ color: '#e02424', background: 'none', border: 'none' }}>Hapus</button>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

         {/* === VIEW: SUB-SETTINGS (Manage Ingredients) === */}
         {currentView === 'manage-ingredients' && (
          <div>
            <button onClick={() => setCurrentView('settings')} style={{ background: 'none', border: 'none', color: '#0061f2', marginBottom: 16, cursor: 'pointer' }}>← Kembali</button>
            <div style={{ background: 'white', padding: 20, borderRadius: 16 }}>
               <h3 style={{ marginTop: 0 }}>Tambah Bahan</h3>
               <input value={newIngredientName} onChange={e => setNewIngredientName(e.target.value)} placeholder="Nama (e.g. Gula)" style={{ width: '100%', padding: 8, marginBottom: 8, border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }} />
               <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                 <input value={newIngredientUnit} onChange={e => setNewIngredientUnit(e.target.value)} placeholder="Satuan" style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 8 }} />
                 <input type="number" value={newIngredientMin} onChange={e => setNewIngredientMin(e.target.value)} placeholder="Min" style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 8 }} />
               </div>
               <button onClick={handleAddIngredient} style={{ width: '100%', background: '#0e9f6e', color: 'white', border: 'none', borderRadius: 8, padding: 12 }}>Simpan Bahan</button>

               <div style={{ marginTop: 20 }}>
                 {stocks.map(s => (
                   <div key={s.id} style={{ padding: '12px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span>{s.name} ({s.unit})</span>
                     <button onClick={() => handleDeleteStock(s.id)} style={{ color: '#e02424', background: 'none', border: 'none', cursor: 'pointer' }}>Hapus</button>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* === VIEW: SUB-SETTINGS (Manage Recipes) === */}
        {currentView === 'manage-recipes' && (
          <div>
            <button onClick={() => setCurrentView('settings')} style={{ background: 'none', border: 'none', color: '#0061f2', marginBottom: 16, cursor: 'pointer' }}>← Kembali</button>
            {products.map(p => (
              <div key={p.id} style={{ background: 'white', padding: 16, borderRadius: 16, marginBottom: 16 }}>
                <strong>{p.name}</strong>
                <div style={{ marginTop: 8, padding: 8, background: '#f9fafb', borderRadius: 8 }}>
                  {Object.entries(p.recipe).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, flex: 1 }}>{key}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="number" value={val} onChange={(e) => updateRecipeAmount(p.id, key, e.target.value)} style={{ width: 50, padding: 4, borderRadius: 4, border: '1px solid #ddd' }} />
                        <button 
                          onClick={() => removeIngredientFromRecipe(p.id, key)} 
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  <select onChange={(e) => { addIngredientToRecipe(p.id, e.target.value); e.target.value=''; }} style={{ width: '100%', marginTop: 8, padding: 8, borderRadius: 4, border: '1px solid #ddd' }}>
                    <option value="">+ Tambah Bahan</option>
                    {stocks.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* FIXED BOTTOM NAVBAR */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        width: '100%', 
        background: 'white', 
        borderTop: '1px solid #eee', 
        display: 'flex', 
        paddingBottom: 'env(safe-area-inset-bottom)', // for iPhone X+
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        zIndex: 1000
      }}>
        <button 
          onClick={() => setCurrentView('dashboard')} 
          style={{ 
            flex: 1, 
            background: 'none', 
            border: 'none', 
            padding: '12px 0', 
            cursor: 'pointer',
            color: currentView === 'dashboard' ? '#0061f2' : '#9ca3af' 
          }}
        >
          <div style={{ fontSize: 20 }}>🏠</div>
          <div style={{ fontSize: 11, marginTop: 4, fontWeight: currentView === 'dashboard' ? 'bold' : 'normal' }}>Home</div>
        </button>
        
        <button 
          onClick={() => setCurrentView('reports')} 
          style={{ 
            flex: 1, 
            background: 'none', 
            border: 'none', 
            padding: '12px 0', 
            cursor: 'pointer',
            color: currentView === 'reports' ? '#0061f2' : '#9ca3af' 
          }}
        >
          <div style={{ fontSize: 20 }}>📊</div>
          <div style={{ fontSize: 11, marginTop: 4, fontWeight: currentView === 'reports' ? 'bold' : 'normal' }}>Laporan</div>
        </button>
        
        <button 
          onClick={() => setCurrentView('settings')} 
          style={{ 
            flex: 1, 
            background: 'none', 
            border: 'none', 
            padding: '12px 0', 
            cursor: 'pointer',
            color: currentView.startsWith('settings') || currentView.startsWith('manage') ? '#0061f2' : '#9ca3af' 
          }}
        >
          <div style={{ fontSize: 20 }}>⚙️</div>
          <div style={{ fontSize: 11, marginTop: 4, fontWeight: currentView === 'settings' ? 'bold' : 'normal' }}>Setting</div>
        </button>
      </div>

      {/* === NEW: CANCEL REASON MODAL === */}
      {cancelModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 16, width: '85%', maxWidth: 400 }}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Batalkan Transaksi?</h3>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
              Stok akan dikembalikan. Masukkan alasan pembatalan:
            </p>
            
            {/* Input Reason */}
            <input 
              value={cancelReason} 
              onChange={e => setCancelReason(e.target.value)} 
              placeholder="Ketik alasan pembatalan..."
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginBottom: 12, boxSizing: 'border-box' }}
            />

            {/* Template Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {CANCEL_REASONS.map(reason => (
                <button 
                  key={reason}
                  onClick={() => setCancelReason(reason)}
                  style={{
                    background: cancelReason === reason ? '#e0f2fe' : '#f3f4f6',
                    color: cancelReason === reason ? '#0369a1' : '#4b5563',
                    border: cancelReason === reason ? '1px solid #0ea5e9' : '1px solid transparent',
                    borderRadius: 20, padding: '6px 12px', fontSize: 11, cursor: 'pointer'
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setCancelModalOpen(false)} 
                style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}
              >
                Kembali
              </button>
              <button 
                onClick={handleConfirmCancel} 
                style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}