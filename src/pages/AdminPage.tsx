import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Package, Truck, CheckCircle, Clock, LogOut, Printer, Search, RefreshCw, XCircle, TrendingUp, DollarSign, ShoppingBag, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: any;
  total_amount: number;
  status: string;
  created_at: string;
  tracking_number?: string;
  shipping_provider?: string;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [trackingInput, setTrackingInput] = useState<Record<string, { number: string, provider: string }>>({});

  // Allowed admin emails (Configurable)
  const ALLOWED_EMAILS = ['nimbuscodex@gmail.com'];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && ALLOWED_EMAILS.includes(session.user.email)) {
      fetchOrders();
    }
  }, [session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setLoginError(error.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoadingOrders(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      alert(`Error al actualizar estado: ${error.message}`);
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
  };

  const handleTrackingChange = (orderId: string, field: 'number' | 'provider', value: string) => {
    setTrackingInput(prev => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || { number: '', provider: 'Correos' }),
        [field]: value
      }
    }));
  };

  const shipOrder = async (orderId: string) => {
    const trackingData = trackingInput[orderId];
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'shipped',
        tracking_number: trackingData?.number || null,
        shipping_provider: trackingData?.provider || null,
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId);

    if (error) {
      alert(`Error al actualizar estado y tracking: ${error.message}. Asegúrate de que las columnas 'tracking_number' y 'shipping_provider' existan en tu tabla 'orders'.`);
    } else {
      // Find the order details for the email
      const order = orders.find(o => o.id === orderId);
      
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'shipped', tracking_number: trackingData?.number, shipping_provider: trackingData?.provider } : o))
      );
      setTrackingInput(prev => {
        const newData = {...prev};
        delete newData[orderId];
        return newData;
      });
      
      // Notify via email using backend
      if (order && trackingData?.number) {
        try {
          await fetch('/api/notify-shipment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.id,
              email: order.customer_email,
              name: order.customer_name,
              trackingNumber: trackingData.number,
              provider: trackingData.provider || 'Correos'
            })
          });
          alert('¡Pedido marcado como enviado y correo enviado al cliente con el enlace de tracking!');
        } catch (fetchErr) {
          console.error("Error calling notify-shipment:", fetchErr);
          alert('Pedido marcado como enviado, pero hubo un error enviando el email.');
        }
      } else {
        alert('Pedido marcado como enviado.');
      }
    }
  };

  const printReceipt = (order: Order) => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("RECIBO DE COMPRA", 105, 20, { align: "center" });
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`ID de Orden: ${order.id}`, 20, 40);
    doc.text(`Fecha: ${new Date(order.created_at).toLocaleDateString()}`, 20, 50);
    doc.text(`Estado: ${getStatusLabel(order.status)}`, 20, 60);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Datos del Cliente", 20, 80);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${order.customer_name}`, 20, 90);
    doc.text(`Email: ${order.customer_email}`, 20, 100);
    doc.text(`Teléfono: ${order.customer_phone || 'N/A'}`, 20, 110);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Dirección de Envío", 20, 130);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    if (order.shipping_address) {
      const addr = order.shipping_address.address || order.shipping_address;
      const line1 = typeof addr === 'string' ? addr : `${addr.line1 || ''} ${addr.line2 || ''}`;
      const postal = order.shipping_address.zipCode || addr?.postal_code || '';
      const city = order.shipping_address.city || addr?.city || '';
      const country = addr?.country || '';
      doc.text(`${line1}`, 20, 140);
      doc.text(`${postal} ${city}, ${country}`, 20, 150);
    } else {
      doc.text("Dirección no proporcionada", 20, 140);
    }
    
    if (order.tracking_number) {
       doc.setFontSize(14);
       doc.setFont("helvetica", "bold");
       doc.text("Información de Envío", 20, 170);
       doc.setFontSize(11);
       doc.setFont("helvetica", "normal");
       doc.text(`Proveedor: ${order.shipping_provider || 'N/A'}`, 20, 180);
       doc.text(`Tracking: ${order.tracking_number}`, 20, 190);
    }
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: ${Number(order.total_amount).toFixed(2)} EUR`, 190, 220, { align: "right" });
    
    doc.save(`Recibo_${order.id.split('-')[0]}.pdf`);
  };

  // --- METRICS & CHARTS --- (Moved above conditional returns to fix hooks rule issue)
  const kpis = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const totalOrders = orders.length;
    const averageOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
    const pendingOrders = orders.filter(o => o.status === 'paid' || o.status === 'processing').length;

    return { totalRevenue, totalOrders, averageOrderValue, pendingOrders };
  }, [orders]);

  const chartData = useMemo(() => {
    const days: Record<string, number> = {};
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    
    // Create an array of the last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
      days[dateString] = 0;
    }

    // Populate data
    validOrders.forEach(o => {
      const dateString = new Date(o.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
      if (days[dateString] !== undefined) {
        days[dateString] += Number(o.total_amount);
      }
    });

    return Object.keys(days).map(date => ({
      date,
      revenue: days[date],
    }));
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand/10">
        <RefreshCw className="animate-spin text-ink w-8 h-8" />
      </div>
    );
  }

  // --- LOGIN VIEW ---
  if (!session || !ALLOWED_EMAILS.includes(session.user?.email)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand/20 px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-sm border border-neutral-100">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl text-ink mb-2">Backoffice</h1>
            <p className="text-gray-500 font-light">Acceso exclusivo para administración.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-neutral-200 border rounded-2xl px-5 py-4 focus:ring-2 focus:ring-ink focus:border-ink outline-none transition-all"
                placeholder="tu-email@ejemplo.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-neutral-200 border rounded-2xl px-5 py-4 focus:ring-2 focus:ring-ink focus:border-ink outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-white rounded-full py-4 uppercase tracking-widest text-xs font-bold hover:bg-neutral-800 transition-all disabled:opacity-50"
            >
              {loading ? 'Iniciando sesión...' : 'Entrar al Panel'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              Si no tienes cuenta, crea una en el dashboard de Supabase y configúrala como admin.
            </p>
          </form>
          {session && !ALLOWED_EMAILS.includes(session.user?.email) && (
            <div className="mt-6 text-center">
              <p className="text-sm text-red-500 mb-2">El usuario conectado no tiene permisos.</p>
              <button onClick={handleLogout} className="text-sm text-neutral-500 underline">Cerrar Sesión</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-amber-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-ink" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Pendiente',
      paid: 'Pagado (Nuevo)',
      processing: 'En Proceso',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return statusMap[status] || status;
  };

  return (
    <div className="min-h-screen bg-sand/10 pb-20">
      {/* Topbar */}
      <header className="bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 print:hidden">
        <div className="flex items-center gap-4">
          <h1 className="font-serif text-2xl text-ink">Backoffice Tienda</h1>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-sm text-neutral-500 hidden md:block">
            {session.user.email}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm bg-neutral-100 px-4 py-2 rounded-full text-neutral-600 hover:text-ink hover:bg-neutral-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10">
        
        {/* Dashboard Analytics Section */}
        {!loadingOrders && (
          <div className="mb-12 space-y-6 print:hidden">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-[24px] shadow-sm border border-neutral-100 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-neutral-500">Ingresos Totales</h3>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-serif text-ink">€{kpis.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-neutral-400 mt-1">Ingresos netos (sin envíos cancelados)</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[24px] shadow-sm border border-neutral-100 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-neutral-500">Pedidos Totales</h3>
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-serif text-ink">{kpis.totalOrders}</div>
                  <p className="text-xs text-neutral-400 mt-1">Acumulado histórico</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[24px] shadow-sm border border-neutral-100 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-neutral-500">Ticket Medio</h3>
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-serif text-ink">€{kpis.averageOrderValue.toFixed(2)}</div>
                  <p className="text-xs text-neutral-400 mt-1">Gasto medio por pedido válido</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[24px] shadow-sm border border-neutral-100 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-neutral-500">Pendientes de Envío</h3>
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-serif text-ink">{kpis.pendingOrders}</div>
                  <p className="text-xs text-neutral-400 mt-1">Pedidos esperando procesamiento</p>
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-neutral-100">
              <h3 className="text-lg font-serif text-ink mb-6">Ingresos de los últimos 7 días</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0B0F0E" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0B0F0E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#737373', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#737373', fontSize: 12 }}
                      tickFormatter={(value) => `€${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                      formatter={(value: number) => [`€${value.toFixed(2)}`, 'Ingresos']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#0B0F0E" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
          <div>
            <h2 className="text-3xl font-serif text-ink mb-2">Gestión de Pedidos</h2>
            <p className="text-neutral-500 font-light">
              Administra los envíos, estados y datos de clientes.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white border border-neutral-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-ink w-full md:w-64"
              />
            </div>
            <button
              onClick={fetchOrders}
              className="p-3 bg-white border border-neutral-200 rounded-full text-neutral-600 hover:bg-neutral-50 transition-colors"
              title="Refrescar"
            >
              <RefreshCw className={`w-5 h-5 ${loadingOrders ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {loadingOrders ? (
            <div className="text-center py-20">
              <RefreshCw className="animate-spin w-8 h-8 text-neutral-300 mx-auto" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100">
              <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-ink mb-1">No hay pedidos</h3>
              <p className="text-neutral-500">Aún no tienes pedidos o no coinciden con la búsqueda.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-neutral-100 flex flex-col xl:flex-row gap-8 xl:items-center print:break-inside-avoid print:shadow-none print:border-neutral-300"
              >
                {/* Order Status & ID */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(order.status)}
                    <span className="font-medium uppercase tracking-wider text-xs text-ink">
                      {getStatusLabel(order.status)}
                    </span>
                    <span className="text-neutral-400 text-xs truncate max-w-[150px]">
                      ID: {order.id.split('-')[0]}...
                    </span>
                  </div>
                  <h3 className="text-xl font-serif text-ink mb-1">{order.customer_name}</h3>
                  <p className="text-neutral-500 text-sm">{order.customer_email} • {order.customer_phone || 'Sin teléfono'}</p>
                  
                  {/* Address */}
                  <div className="mt-4 p-4 bg-sand/30 rounded-2xl text-sm text-neutral-600">
                    <p className="font-medium text-ink mb-1">Dirección de envío:</p>
                    {order.shipping_address ? (
                      <p>
                        {typeof order.shipping_address.address === 'string' 
                          ? order.shipping_address.address 
                          : `${order.shipping_address.address?.line1 || ''} ${order.shipping_address.address?.line2 || ''}`}<br />
                        {order.shipping_address.zipCode || order.shipping_address.address?.postal_code} {order.shipping_address.city || order.shipping_address.address?.city}{order.shipping_address.address?.country ? `, ${order.shipping_address.address.country}` : ''}
                      </p>
                    ) : (
                      <p>Dirección no proporcionada</p>
                    )}
                  </div>
                </div>

                {/* Amount & Date */}
                <div className="flex flex-col gap-2 xl:px-8 xl:border-l xl:border-neutral-100 py-2">
                  <div className="text-2xl font-light text-ink">
                    €{Number(order.total_amount).toFixed(2)}
                  </div>
                  <div className="text-sm text-neutral-400">
                    {new Date(order.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row xl:flex-col gap-3 min-w-[200px] xl:min-w-[250px] print:hidden">
                  {order.status === 'paid' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'processing')}
                      className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-amber-100 text-amber-800 rounded-xl text-sm font-medium hover:bg-amber-200 transition-colors"
                    >
                      <Package className="w-4 h-4" /> Empezar a Preparar
                    </button>
                   )}
                  {order.status === 'processing' && (
                    <div className="flex flex-col gap-2 p-3 border border-neutral-200 rounded-xl bg-neutral-50 shadow-inner">
                      <select
                        value={trackingInput[order.id]?.provider || 'Correos'}
                        onChange={(e) => handleTrackingChange(order.id, 'provider', e.target.value)}
                        className="w-full border-neutral-200 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                      >
                        <option value="Correos">Correos</option>
                        <option value="SEUR">SEUR</option>
                        <option value="DHL">DHL</option>
                        <option value="GLS">GLS</option>
                        <option value="MRW">MRW</option>
                        <option value="Otro">Otro</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Nº Tracking (opcional)"
                        value={trackingInput[order.id]?.number || ''}
                        onChange={(e) => handleTrackingChange(order.id, 'number', e.target.value)}
                        className="w-full border-neutral-200 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                      />
                      <button
                        onClick={() => shipOrder(order.id)}
                        className="w-full mt-1 flex justify-center items-center gap-2 py-2 px-4 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600 transition-all shadow-sm"
                      >
                       <Truck className="w-4 h-4" /> Enviar Paquete
                      </button>
                    </div>
                  )}
                  {order.status === 'shipped' && (
                    <div className="w-full flex flex-col gap-2">
                       {order.tracking_number && (
                          <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-800 border border-blue-100">
                             <strong>Tracking:</strong> {order.tracking_number}<br/>
                             <strong>Empresa:</strong> {order.shipping_provider}
                          </div>
                       )}
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-ink text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" /> Marcar Entregado
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => printReceipt(order)}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-white border border-neutral-200 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Imprimir Recibo
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
