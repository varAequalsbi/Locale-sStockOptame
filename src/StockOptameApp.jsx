import React, { useState, useEffect } from 'react';

export default function StockOptameApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [stocks, setStocks] = useState([]);
  const [todaySales, setTodaySales] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedStock, setSelectedStock] = useState('');
  const [restockAmount, setRestockAmount] = useState('');

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
        { id: 1, name: 'Latte', recipe: { milk: 120, coffee: 16 } },
        { id: 2, name: 'Cappuccino', recipe: { milk: 100, coffee: 18 } },
        { id: 3, name: 'Americano', recipe: { water: 150, coffee: 16 } },
        { id: 4, name: 'Espresso', recipe: { coffee: 18 } }
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

  const handleSale = () => {
    if (!selectedProduct || quantity < 1) {
      alert('Pilih produk dan jumlah yang valid!');
      return;
    }

    const product = products.find(p => p.name === selectedProduct);
    if (!product) return;

    const newStocks = [...stocks];
    let canProcess = true;

    Object.entries(product.recipe).forEach(([ingredient, amount]) => {
      const stock = newStocks.find(s => s.name.toLowerCase().includes(ingredient));
      if (stock && stock.current < amount * quantity) {
        canProcess = false;
        alert('Stok ' + stock.name + ' tidak cukup!');
      }
    });

    if (!canProcess) return;

    Object.entries(product.recipe).forEach(([ingredient, amount]) => {
      const stockIndex = newStocks.findIndex(s => s.name.toLowerCase().includes(ingredient));
      if (stockIndex !== -1) {
        newStocks[stockIndex].current -= amount * quantity;
      }
    });

    const newSale = {
      id: Date.now(),
      product: selectedProduct,
      quantity: quantity,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedSales = [newSale, ...todaySales];
    setStocks(newStocks);
    setTodaySales(updatedSales);
    localStorage.setItem('stocks', JSON.stringify(newStocks));
    localStorage.setItem('todaySales', JSON.stringify(updatedSales));
    
    setSelectedProduct('');
    setQuantity(1);
    alert('Penjualan berhasil dicatat!');
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

  const hasLowStock = stocks.some(s => getStockStatus(s) === 'low');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)', paddingBottom: 80 }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 16, paddingTop: 8 }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 0 }}>StockOptame</h1>
          <p style={{ fontSize: 12, color: '#6c757d' }}>Sistem Manajemen Stok Kopi</p>
        </div>

        {currentView === 'dashboard' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: 24, borderRadius: 16, marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Selamat Datang!</h2>
              <p style={{ fontSize: 14, opacity: 0.9, margin: 0 }}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div onClick={() => setCurrentView('sales')} style={{ background: '#28a745', color: 'white', padding: 24, borderRadius: 16, textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🛒</div>
                <div style={{ fontWeight: 'bold' }}>Catat Penjualan</div>
              </div>
              <div onClick={() => setCurrentView('restock')} style={{ background: '#007bff', color: 'white', padding: 24, borderRadius: 16, textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>➕</div>
                <div style={{ fontWeight: 'bold' }}>Tambah Stok</div>
              </div>
            </div>

            <h3 style={{ fontWeight: 'bold', marginBottom: 16 }}>Status Stok Hari Ini</h3>
            {stocks.map(stock => {
              const status = getStockStatus(stock);
              const percentage = Math.min((stock.current / (stock.min * 3)) * 100, 100);
              const bgColor = status === 'low' ? '#f8d7da' : status === 'medium' ? '#fff3cd' : '#d4edda';
              const barColor = status === 'low' ? '#dc3545' : status === 'medium' ? '#ffc107' : '#28a745';
              
              return (
                <div key={stock.id} style={{ background: 'white', padding: 16, borderRadius: 12, marginBottom: 12, border: '1px solid #e9ecef' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 'bold', fontSize: 14 }}>{stock.name}</span>
                    {status === 'low' && (
                      <span style={{ background: '#dc3545', color: 'white', padding: '4px 8px', borderRadius: 8, fontSize: 12 }}>
                        ⚠️ Rendah!
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 24, fontWeight: 'bold' }}>{stock.current}</span>
                      <span style={{ color: '#6c757d', marginLeft: 8, fontSize: 14 }}>{stock.unit}</span>
                    </div>
                    <span style={{ fontSize: 12, color: '#6c757d' }}>Min: {stock.min} {stock.unit}</span>
                  </div>
                  <div style={{ background: '#e9ecef', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ background: barColor, height: '100%', width: percentage + '%', transition: 'width 0.3s' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {currentView === 'sales' && (
          <div>
            <button onClick={() => setCurrentView('dashboard')} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginBottom: 16 }}>
              ← Kembali
            </button>

            <div style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 24 }}>Catat Penjualan</h2>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>Pilih Produk</label>
                <select 
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '2px solid #ced4da' }}
                >
                  <option value="">-- Pilih Produk --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>Jumlah</label>
                <input 
                  type="number" 
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '2px solid #ced4da' }}
                />
              </div>

              <button 
                onClick={handleSale}
                style={{ width: '100%', background: '#28a745', color: 'white', fontWeight: 'bold', padding: 16, borderRadius: 8, border: 'none', fontSize: 16, cursor: 'pointer' }}
              >
                ✓ Simpan Penjualan
              </button>
            </div>

            {todaySales.length > 0 && (
              <div style={{ background: 'white', padding: 24, borderRadius: 16 }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: 16 }}>Penjualan Hari Ini</h3>
                {todaySales.slice(0, 10).map(sale => (
                  <div key={sale.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#f8f9fa', borderRadius: 8, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: 14 }}>{sale.product}</div>
                      <div style={{ fontSize: 12, color: '#6c757d' }}>{sale.time}</div>
                    </div>
                    <div style={{ background: '#007bff', color: 'white', padding: '6px 12px', borderRadius: 16, fontWeight: 'bold' }}>×{sale.quantity}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'restock' && (
          <div>
            <button onClick={() => setCurrentView('dashboard')} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginBottom: 16 }}>
              ← Kembali
            </button>

            <div style={{ background: 'white', padding: 24, borderRadius: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 24 }}>Tambah Stok</h2>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>Pilih Bahan</label>
                <select 
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '2px solid #ced4da' }}
                >
                  <option value="">-- Pilih Bahan --</option>
                  {stocks.map(stock => (
                    <option key={stock.id} value={stock.name}>
                      {stock.name} (saat ini: {stock.current} {stock.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>Jumlah Ditambahkan</label>
                <input 
                  type="number" 
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  placeholder="Contoh: 1000"
                  style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '2px solid #ced4da' }}
                />
              </div>

              <button 
                onClick={handleRestock}
                style={{ width: '100%', background: '#007bff', color: 'white', fontWeight: 'bold', padding: 16, borderRadius: 8, border: 'none', fontSize: 16, cursor: 'pointer' }}
              >
                ✓ Simpan Penambahan Stok
              </button>
            </div>
          </div>
        )}

        {currentView === 'reports' && (
          <div>
            <button onClick={() => setCurrentView('dashboard')} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginBottom: 16 }}>
              ← Kembali
            </button>

            <div style={{ background: 'white', padding: 24, borderRadius: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 24 }}>Laporan Hari Ini</h2>
              
              <div style={{ background: '#d4edda', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#155724' }}>Total Penjualan</div>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#155724' }}>
                  {todaySales.reduce((sum, sale) => sum + sale.quantity, 0)} item
                </div>
              </div>

              {stocks.filter(s => getStockStatus(s) === 'low').length > 0 && (
                <div style={{ background: '#f8d7da', padding: 16, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#721c24', marginBottom: 8 }}>Perlu Diisi Ulang</div>
                  {stocks.filter(s => getStockStatus(s) === 'low').map(stock => (
                    <div key={stock.id} style={{ fontWeight: 'bold', color: '#721c24' }}>• {stock.name}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div>
            <button onClick={() => setCurrentView('dashboard')} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginBottom: 16 }}>
              ← Kembali
            </button>

            <div style={{ background: 'white', padding: 24, borderRadius: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 24 }}>Pengaturan</h2>
              
              <div onClick={() => setCurrentView('manage-products')} style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 8, cursor: 'pointer' }}>
                <div style={{ fontWeight: 'bold', fontSize: 14 }}>☕ Kelola Produk</div>
                <div style={{ fontSize: 12, color: '#6c757d' }}>Tambah/edit produk (Latte, Cappuccino, dll)</div>
              </div>
              <div onClick={() => setCurrentView('manage-recipes')} style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 8, cursor: 'pointer' }}>
                <div style={{ fontWeight: 'bold', fontSize: 14 }}>📝 Kelola Resep</div>
                <div style={{ fontSize: 12, color: '#6c757d' }}>Atur komposisi bahan per produk</div>
              </div>
              <div onClick={() => setCurrentView('manage-ingredients')} style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, cursor: 'pointer' }}>
                <div style={{ fontWeight: 'bold', fontSize: 14 }}>🥛 Kelola Bahan</div>
                <div style={{ fontSize: 12, color: '#6c757d' }}>Tambah/edit bahan baku dan stok minimum</div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'manage-products' && (
          <div>
            <button onClick={() => setCurrentView('settings')} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginBottom: 16 }}>
              ← Kembali ke Pengaturan
            </button>

            <div style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 24 }}>☕ Kelola Produk</h2>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>Nama Produk Baru</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Mocha"
                  style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '2px solid #ced4da', marginBottom: 12 }}
                />
              </div>

              <button style={{ width: '100%', background: '#28a745', color: 'white', fontWeight: 'bold', padding: 16, borderRadius: 8, border: 'none', fontSize: 16, cursor: 'pointer', marginBottom: 24 }}>
                ➕ Tambah Produk Baru
              </button>

              <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Daftar Produk</h3>
              {products.map(product => (
                <div key={product.id} style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: 14 }}>{product.name}</div>
                    <div style={{ fontSize: 12, color: '#6c757d' }}>
                      Bahan: {Object.keys(product.recipe).map(ing => ing).join(', ')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                      ✏️ Edit
                    </button>
                    <button style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'manage-recipes' && (
          <div>
            <button onClick={() => setCurrentView('settings')} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginBottom: 16 }}>
              ← Kembali ke Pengaturan
            </button>

            <div style={{ background: 'white', padding: 24, borderRadius: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 24 }}>📝 Kelola Resep</h2>
              
              {products.map(product => (
                <div key={product.id} style={{ border: '2px solid #e9ecef', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#667eea' }}>
                    ☕ {product.name}
                  </h3>

                  <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                    <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 8 }}>Komposisi Resep:</div>
                    {Object.entries(product.recipe).map(([ingredient, amount]) => {
                      const stock = stocks.find(s => s.name.toLowerCase().includes(ingredient));
                      return (
                        <div key={ingredient} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #dee2e6' }}>
                          <span style={{ fontSize: 14 }}>
                            {stock ? stock.name : ingredient}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input 
                              type="number" 
                              defaultValue={amount}
                              style={{ width: 80, padding: 8, fontSize: 14, borderRadius: 6, border: '1px solid #ced4da', textAlign: 'center' }}
                            />
                            <span style={{ fontSize: 14, color: '#6c757d', minWidth: 30 }}>
                              {stock ? stock.unit : 'unit'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8, fontSize: 12 }}>Tambah Bahan ke Resep</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select style={{ flex: 1, padding: 8, fontSize: 14, borderRadius: 6, border: '1px solid #ced4da' }}>
                        <option value="">Pilih Bahan</option>
                        {stocks.map(s => (
                          <option key={s.id} value={s.name}>{s.name} ({s.unit})</option>
                        ))}
                      </select>
                      <input 
                        type="number" 
                        placeholder="Jumlah"
                        style={{ width: 100, padding: 8, fontSize: 14, borderRadius: 6, border: '1px solid #ced4da' }}
                      />
                      <button style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>
                        ➕
                      </button>
                    </div>
                  </div>

                  <button style={{ width: '100%', background: '#007bff', color: 'white', fontWeight: 'bold', padding: 12, borderRadius: 8, border: 'none', fontSize: 14, cursor: 'pointer', marginTop: 12 }}>
                    💾 Simpan Perubahan Resep
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'manage-ingredients' && (
          <div>
            <button onClick={() => setCurrentView('settings')} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginBottom: 16 }}>
              ← Kembali ke Pengaturan
            </button>

            <div style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 24 }}>🥛 Kelola Bahan Baku</h2>
              
              <div style={{ marginBottom: 24, padding: 16, background: '#e7f3ff', borderRadius: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>➕ Tambah Bahan Baru</h3>
                
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8, fontSize: 12 }}>Nama Bahan</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Gula (Sugar)"
                    style={{ width: '100%', padding: 10, fontSize: 14, borderRadius: 6, border: '1px solid #ced4da' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8, fontSize: 12 }}>Satuan</label>
                    <select style={{ width: '100%', padding: 10, fontSize: 14, borderRadius: 6, border: '1px solid #ced4da' }}>
                      <option value="ml">ml (mililiter)</option>
                      <option value="g">g (gram)</option>
                      <option value="pcs">pcs (pieces)</option>
                      <option value="kg">kg (kilogram)</option>
                      <option value="L">L (liter)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8, fontSize: 12 }}>Stok Minimum</label>
                    <input 
                      type="number" 
                      placeholder="500"
                      style={{ width: '100%', padding: 10, fontSize: 14, borderRadius: 6, border: '1px solid #ced4da' }}
                    />
                  </div>
                </div>

                <button style={{ width: '100%', background: '#28a745', color: 'white', fontWeight: 'bold', padding: 12, borderRadius: 8, border: 'none', fontSize: 14, cursor: 'pointer' }}>
                  ✅ Tambah Bahan
                </button>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>📦 Daftar Bahan Baku</h3>
              {stocks.map(stock => {
                const status = getStockStatus(stock);
                const statusColor = status === 'low' ? '#dc3545' : status === 'medium' ? '#ffc107' : '#28a745';
                const statusText = status === 'low' ? 'Rendah' : status === 'medium' ? 'Sedang' : 'Aman';
                
                return (
                  <div key={stock.id} style={{ border: '2px solid #e9ecef', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>{stock.name}</h4>
                        <div style={{ fontSize: 12, color: '#6c757d' }}>
                          Stok Saat Ini: <strong>{stock.current} {stock.unit}</strong>
                        </div>
                      </div>
                      <span style={{ background: statusColor, color: 'white', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 'bold' }}>
                        {statusText}
                      </span>
                    </div>

                    <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Satuan</label>
                          <input 
                            type="text" 
                            defaultValue={stock.unit}
                            style={{ width: '100%', padding: 8, fontSize: 14, borderRadius: 6, border: '1px solid #ced4da' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Stok Minimum</label>
                          <input 
                            type="number" 
                            defaultValue={stock.min}
                            style={{ width: '100%', padding: 8, fontSize: 14, borderRadius: 6, border: '1px solid #ced4da' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ flex: 1, background: '#007bff', color: 'white', fontWeight: 'bold', padding: 10, borderRadius: 6, border: 'none', fontSize: 14, cursor: 'pointer' }}>
                        💾 Simpan
                      </button>
                      <button style={{ background: '#dc3545', color: 'white', fontWeight: 'bold', padding: 10, borderRadius: 6, border: 'none', fontSize: 14, cursor: 'pointer', minWidth: 80 }}>
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #dee2e6', padding: '12px 0', zIndex: 1000 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, padding: '0 16px' }}>
          <button 
            onClick={() => setCurrentView('dashboard')}
            style={{ background: currentView === 'dashboard' ? '#667eea' : 'white', color: currentView === 'dashboard' ? 'white' : '#6c757d', border: 'none', padding: 12, borderRadius: 8, cursor: 'pointer', textAlign: 'center' }}
          >
            <div style={{ fontSize: 20 }}>🏠</div>
            <div style={{ fontSize: 10, marginTop: 4 }}>Beranda</div>
          </button>
          <button 
            onClick={() => setCurrentView('sales')}
            style={{ background: currentView === 'sales' ? '#667eea' : 'white', color: currentView === 'sales' ? 'white' : '#6c757d', border: 'none', padding: 12, borderRadius: 8, cursor: 'pointer', textAlign: 'center' }}
          >
            <div style={{ fontSize: 20 }}>🛒</div>
            <div style={{ fontSize: 10, marginTop: 4 }}>Jual</div>
          </button>
          <button 
            onClick={() => setCurrentView('reports')}
            style={{ background: currentView === 'reports' ? '#667eea' : 'white', color: currentView === 'reports' ? 'white' : '#6c757d', border: 'none', padding: 12, borderRadius: 8, cursor: 'pointer', textAlign: 'center' }}
          >
            <div style={{ fontSize: 20 }}>📊</div>
            <div style={{ fontSize: 10, marginTop: 4 }}>Laporan</div>
          </button>
          <button 
            onClick={() => setCurrentView('settings')}
            style={{ background: currentView === 'settings' ? '#667eea' : 'white', color: currentView === 'settings' ? 'white' : '#6c757d', border: 'none', padding: 12, borderRadius: 8, cursor: 'pointer', textAlign: 'center', position: 'relative' }}
          >
            {hasLowStock && <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, background: '#dc3545', borderRadius: '50%' }}></span>}
            <div style={{ fontSize: 20 }}>⚙️</div>
            <div style={{ fontSize: 10, marginTop: 4 }}>Atur</div>
          </button>
        </div>
      </div>
    </div>
  );
}