'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  Wallet,
  Clock,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  BarChart2,
  PieChart,
  Activity,
  Zap,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { useRealtime } from '@/lib/realtime-context';


/* â”€â”€ Animated counter hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function useCounter(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(ease * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

/* â”€â”€ Animated progress bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AnimBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 80 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ background: '#f1f5f9', borderRadius: 99, height: 7, overflow: 'hidden', flex: 1 }}>
      <div style={{
        height: '100%', width: `${w}%`, background: color, borderRadius: 99,
        transition: `width 0.95s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        boxShadow: `0 0 8px ${color}55`,
      }} />
    </div>
  );
}

/* â”€â”€ Mini SVG sparkline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const W = 80, H = 30;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`);
  const fillD = `M${pts[0]} L${pts.join(' L')} L${W},${H} L0,${H} Z`;
  const gradId = `sg${color.replace('#', '')}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gradId})`} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* â”€â”€ Radial ring (SVG donut) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Ring({ pct, color, size = 82 }: { pct: number; color: string; size?: number }) {
  const [p, setP] = useState(0);
  useEffect(() => { const t = setTimeout(() => setP(pct), 200); return () => clearTimeout(t); }, [pct]);
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={7} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${(p / 100) * circ} ${circ - (p / 100) * circ}`}
        strokeDashoffset={circ / 4} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1.3s cubic-bezier(0.16,1,0.3,1)' }}
      />
      <text x={size/2} y={size/2 + 5} textAnchor="middle" fontSize={13} fontWeight={800} fill={color}>{p}%</text>
    </svg>
  );
}

/* â”€â”€ Status pill â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Pill({ s }: { s: 'active' | 'expiring' | 'expired' }) {
  const m = {
    active:   { bg: '#ecfdf5', c: '#059669', t: 'Active' },
    expiring: { bg: '#fffbeb', c: '#d97706', t: 'Expiring' },
    expired:  { bg: '#fef2f2', c: '#dc2626', t: 'Expired' },
  }[s];
  return <span style={{ background: m.bg, color: m.c, fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 99, border: `1px solid ${m.c}25` }}>{m.t}</span>;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function ReportsPage() {
  const { products, metrics, refreshData } = useRealtime();
  const [timeRange, setTimeRange] = useState<'30days' | '6months' | 'ytd'>('30days');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [spinning, setSpinning] = useState(false);

  /* animated counters */
  const cAssetVal  = useCounter(metrics.totalAssetValue, 1400);
  const cActive    = useCounter(metrics.activeWarranties, 900);
  const cExpiring  = useCounter(metrics.expiringThisMonth, 800);
  const cExpired   = useCounter(metrics.expiredWarranties, 800);
  const cCoverage  = useCounter(metrics.coveragePercentage, 1000);
  const cSvcSpend  = useCounter(metrics.totalServiceSpend, 1100);

  /* auto-refresh every 30 s */
  useEffect(() => {
    const id = setInterval(async () => {
      await refreshData();
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(id);
  }, [refreshData]);

  const doRefresh = async () => {
    setSpinning(true);
    await refreshData();
    setLastRefresh(new Date());
    setTimeout(() => setSpinning(false), 700);
  };

  /* category breakdown */
  const catMap: Record<string, { label: string; value: number; count: number }> = {};
  products.forEach((p) => {
    const k = p.categoryLabel || 'General';
    if (!catMap[k]) catMap[k] = { label: k, value: 0, count: 0 };
    catMap[k].value += p.purchasePrice;
    catMap[k].count += 1;
  });
  const totalVal = Math.max(1, metrics.totalAssetValue);
  const palette  = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
  const catRows  = Object.values(catMap)
    .sort((a, b) => b.value - a.value)
    .map((c, i) => ({ ...c, pct: Math.round((c.value / totalVal) * 100), color: palette[i % palette.length] }));

  /* status counts */
  const nActive   = products.filter((p) => p.status === 'active').length;
  const nExpiring = products.filter((p) => p.status === 'expiring').length;
  const nExpired  = products.filter((p) => p.status === 'expired').length;
  const total     = products.length || 1;

  /* sparkline datasets */
  const sparks: Record<string, number[]> = {
    '30days':  [4200,5100,4900,6200,5800,7100,7400,8200,7900,9100,9800,11000],
    '6months': [6000,7200,8100,8900,9600,11000],
    'ytd':     [5000,6500,7200,8000,8700,9500,10100,10800,11194],
  };

  /* expiry timeline */
  const timeline = [...products]
    .filter((p) => p.status !== 'expired')
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 5);

  /* savings */
  const estSavings = Math.round(metrics.activeWarranties * 184);
  const cSavings   = useCounter(estSavings, 1300);

  /* export */
  const dl = (content: string, name: string, type: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    Object.assign(document.createElement('a'), { href: url, download: name }).click();
  };
  const exportPDF = () => dl(
    `WarrantyWise Report â€” ${new Date().toLocaleString()}\n\nTotal Asset Value: $${metrics.totalAssetValue.toLocaleString()}\nActive: ${metrics.activeWarranties}  Expiring: ${metrics.expiringThisMonth}  Expired: ${metrics.expiredWarranties}\nCoverage: ${metrics.coveragePercentage}%  Service Spend: $${metrics.totalServiceSpend}\n\nProducts:\n${products.map((p) => `â€¢ ${p.name} | ${p.status} | Exp: ${p.expiryDate} | $${p.purchasePrice}`).join('\n')}`,
    `WarrantyWise_Report_${new Date().toISOString().split('T')[0]}.txt`, 'text/plain'
  );
  const exportCSV = () => dl(
    'Name,Brand,Category,Purchase Date,Expiry Date,Price,Status,Days Left\n' +
    products.map((p) => `"${p.name}","${p.brand}","${p.categoryLabel}","${p.purchaseDate}","${p.expiryDate}",${p.purchasePrice},"${p.status}",${p.daysRemaining}`).join('\n'),
    `WarrantyWise_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv'
  );

  /* â”€â”€ inline style objects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 16, padding: '22px 24px',
    border: '1px solid #e8edf4', boxShadow: '0 2px 10px rgba(15,23,42,0.06)',
  };
  const kpiCard: React.CSSProperties = {
    ...card, cursor: 'default',
    transition: 'transform 0.2s, box-shadow 0.2s',
  };
  const iconBox = (bg: string): React.CSSProperties => ({
    width: 40, height: 40, borderRadius: 10, background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  });
  const badge = (pos: boolean, neu?: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700,
    padding: '3px 8px', borderRadius: 99,
    background: neu ? '#f8fafc' : pos ? '#ecfdf5' : '#fef2f2',
    color: neu ? '#64748b' : pos ? '#059669' : '#dc2626',
  });
  const pillBtn = (active: boolean): React.CSSProperties => ({
    padding: '5px 13px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
    border: 'none', cursor: 'pointer',
    background: active ? '#fff' : 'transparent',
    color: active ? '#2563eb' : '#64748b',
    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
    transition: 'all 0.2s',
  });
  const btnOutline: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 13px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
    border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151',
    cursor: 'pointer', transition: 'all 0.15s',
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1240, margin: '0 auto', fontFamily: 'var(--font-body)' }}>

      {/* â”€â”€ HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
            Analytics &amp; Reports
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Live real-time asset performance Â· auto-refreshes every 30 s
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* live badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: 99 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981aa', display: 'inline-block', animation: 'rpPulse 1.8s ease infinite' }} />
            Live Â· {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>

          {/* time range */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 3, gap: 2 }}>
            {(['30days', '6months', 'ytd'] as const).map((r) => (
              <button key={r} style={pillBtn(timeRange === r)} onClick={() => setTimeRange(r)}>
                {r === '30days' ? '30 Days' : r === '6months' ? '6 Mo' : 'YTD'}
              </button>
            ))}
          </div>

          {/* refresh */}
          <button style={{ ...btnOutline, background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }} onClick={doRefresh}>
            <RefreshCw size={13} style={{ transform: spinning ? 'rotate(360deg)' : 'none', transition: 'transform 0.7s linear' }} />
            Refresh
          </button>

          <button style={btnOutline} onClick={exportPDF}><FileText size={13} /> PDF</button>
          <button style={btnOutline} onClick={exportCSV}><Download size={13} /> CSV</button>
        </div>
      </div>

      {/* â”€â”€ 4 KPI CARDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>

        {/* Total Asset Value */}
        <div style={kpiCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={iconBox('#eff6ff')}><Wallet size={18} color="#2563eb" /></div>
            <span style={badge(true)}><ArrowUpRight size={11} />+4.2%</span>
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>Total Asset Value</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
            ${cAssetVal.toLocaleString()}
          </div>
          <div style={{ marginTop: 12 }}><Sparkline data={sparks[timeRange]} color="#2563eb" /></div>
        </div>

        {/* Active Warranties */}
        <div style={kpiCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={iconBox('#ecfdf5')}><ShieldCheck size={18} color="#10b981" /></div>
            <span style={badge(true)}><CheckCircle size={11} />Optimal</span>
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>Active Warranties</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#059669', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>{cActive}</div>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Coverage</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>{cCoverage}%</span>
            </div>
            <AnimBar pct={cCoverage} color="#10b981" />
          </div>
        </div>

        {/* Expiring Soon */}
        <div style={kpiCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={iconBox('#fffbeb')}><AlertTriangle size={18} color="#f59e0b" /></div>
            <span style={badge(false, true)}><Clock size={11} />Monitor</span>
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>Expiring This Month</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>{cExpiring}</div>
          <div style={{ marginTop: 10, fontSize: 12, color: '#94a3b8' }}>
            {cExpired} expired &nbsp;Â·&nbsp; {cActive} fully active
          </div>
        </div>

        {/* Service Spend */}
        <div style={kpiCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={iconBox('#f5f3ff')}><DollarSign size={18} color="#8b5cf6" /></div>
            <span style={badge(true)}><ArrowDownRight size={11} />-12% YoY</span>
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>Service Spend</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>${cSvcSpend.toLocaleString()}</div>
          <div style={{ marginTop: 10 }}>
            <AnimBar pct={Math.min(100, Math.round((cSvcSpend / 420) * 100))} color="#8b5cf6" />
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>vs. avg $420</div>
          </div>
        </div>

      </div>

      {/* â”€â”€ MAIN 2-COL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Category Breakdown */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Asset Breakdown by Category</h2>
              <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{products.length} products Â· ${metrics.totalAssetValue.toLocaleString()} total</p>
            </div>
            <BarChart2 size={18} color="#cbd5e1" />
          </div>

          {catRows.length === 0
            ? <p style={{ color: '#94a3b8', fontSize: 13 }}>No products yet.</p>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                {catRows.map((item, idx) => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0, boxShadow: `0 0 8px ${item.color}66`, display: 'inline-block' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{item.label}</span>
                        <span style={{ fontSize: 11, background: '#f1f5f9', color: '#64748b', borderRadius: 99, padding: '1px 7px' }}>{item.count}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>${item.value.toLocaleString()}</span>
                        <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 5 }}>{item.pct}%</span>
                      </div>
                    </div>
                    <AnimBar pct={item.pct} color={item.color} delay={idx * 75} />
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Warranty Health */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Warranty Health</h2>
              <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>Real-time status distribution</p>
            </div>
            <PieChart size={18} color="#cbd5e1" />
          </div>

          {/* Radial rings */}
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 22 }}>
            {[
              { label: 'Active',   n: nActive,   pct: Math.round((nActive   / total) * 100), color: '#10b981', tc: '#059669' },
              { label: 'Expiring', n: nExpiring, pct: Math.round((nExpiring / total) * 100), color: '#f59e0b', tc: '#d97706' },
              { label: 'Expired',  n: nExpired,  pct: Math.round((nExpired  / total) * 100), color: '#ef4444', tc: '#dc2626' },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <Ring pct={item.pct} color={item.color} size={84} />
                <div style={{ fontSize: 11.5, fontWeight: 600, color: item.tc, marginTop: 6 }}>{item.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: item.tc }}>{item.n}</div>
              </div>
            ))}
          </div>

          {/* Coverage summary */}
          <div style={{ background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)', borderRadius: 12, padding: '14px 16px', border: '1px solid #e0e7ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#4338ca' }}>Overall Coverage</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#2563eb' }}>{cCoverage}%</span>
            </div>
            <AnimBar pct={cCoverage} color="#2563eb" />
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 7 }}>
              {metrics.activeWarranties} of {metrics.totalProducts} products protected
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€ BOTTOM: TIMELINE + ROI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

        {/* Expiry timeline */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Upcoming Warranty Expirations</h2>
              <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>Sorted by days remaining Â· live data</p>
            </div>
            <Activity size={18} color="#cbd5e1" />
          </div>

          {timeline.length === 0
            ? <p style={{ color: '#94a3b8', fontSize: 13 }}>No upcoming expirations.</p>
            : <div>
                {timeline.map((p, idx) => {
                  const urgent = p.daysRemaining <= 30;
                  const warn   = p.daysRemaining <= 90;
                  const chipBg = urgent ? '#fef2f2' : warn ? '#fffbeb' : '#f0fdf4';
                  const chipBorder = urgent ? '#fecaca' : warn ? '#fde68a' : '#bbf7d0';
                  const chipColor  = urgent ? '#dc2626' : warn ? '#d97706' : '#16a34a';
                  return (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '11px 0',
                      borderBottom: idx < timeline.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background 0.15s',
                    }}>
                      {/* days chip */}
                      <div style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0, background: chipBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${chipBorder}` }}>
                        <span style={{ fontSize: 16, fontWeight: 900, color: chipColor, lineHeight: 1 }}>{p.daysRemaining}</span>
                        <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>DAYS</span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 1 }}>{p.brand} Â· Expires {p.expiryDate}</div>
                        <div style={{ marginTop: 6 }}>
                          <AnimBar pct={p.progressPercent} color={chipColor} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                        <Pill s={p.status} />
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: '#374151' }}>${p.purchasePrice.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>

        {/* ROI & Savings */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Warranty ROI &amp; Savings</h2>
              <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>Estimated protection value</p>
            </div>
            <Zap size={18} color="#cbd5e1" />
          </div>

          {/* Savings banner */}
          <div style={{ background: 'linear-gradient(135deg,#059669 0%,#0891b2 100%)', borderRadius: 14, padding: '18px 16px', marginBottom: 18, textAlign: 'center', boxShadow: '0 8px 24px rgba(5,150,105,0.22)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#a7f3d0', letterSpacing: '0.08em', marginBottom: 4 }}>ESTIMATED SAVINGS</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>${cSavings.toLocaleString()}</div>
            <div style={{ fontSize: 11.5, color: '#a7f3d0', marginTop: 6 }}>Avg $184 saved per active warranty</div>
          </div>

          {/* Metric rows */}
          {[
            { label: 'Warranty Claim Rate',    val: '16.4%',     icon: <TrendingUp   size={13} color="#2563eb" /> },
            { label: 'Avg Repair Cost Covered',val: '$245',      icon: <ShieldCheck  size={13} color="#10b981" /> },
            { label: 'Products at Risk',        val: `${nExpiring + nExpired}`, icon: <AlertTriangle size={13} color="#f59e0b" /> },
            { label: 'Avg Product Age',         val: `${metrics.averageProductAge} yrs`, icon: <Clock size={13} color="#8b5cf6" /> },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#64748b' }}>
                {row.icon} {row.label}
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>{row.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* keyframes */}
      <style>{`
        @keyframes rpPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.4); }
        }
        @media (max-width: 1024px) {
          .rp-kpi-grid  { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .rp-main-grid, .rp-bottom-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
