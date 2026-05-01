import React, { useState, useEffect, useRef } from 'react';

/* ============= Sections 1-6 ============= */


/* ---- reveal observer ---- */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '-5% 0px -10% 0px' });
    document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ---- Nav ---- */
export function Nav({ onLogin }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    h();
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  const links = [
    { label: 'Özellikler', href: '#ozellikler' },
    { label: 'Nasıl Çalışır', href: '#nasil-calisir' },
    { label: 'Fiyatlandırma', href: '#fiyat' },
    { label: 'Entegrasyonlar', href: '#entegrasyonlar' },
  ];
  return (
    <nav className={`glass${scrolled ? ' glass-scrolled' : ''}`} style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'all 0.3s var(--ease-out-smooth)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 68,
      }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--brand), var(--brand-light))',
            display: 'grid', placeItems: 'center', color: 'white',
            fontWeight: 800, fontSize: 15, letterSpacing: '-0.04em',
            boxShadow: '0 4px 12px rgba(81,75,238,0.3)',
          }}>G</div>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>Gilan Smart</span>
        </a>
        <div className="nav-links" style={{ display: 'flex', gap: 28 }}>
          {links.map(l => (
            <a key={l.href} href={l.href} style={{
              fontSize: 14, fontWeight: 500, color: 'var(--ink-70)',
              position: 'relative', padding: '4px 0',
            }} className="nav-link">{l.label}</a>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onLogin?.(); }} className="nav-login" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-70)' }}>Giriş Yap</a>
          <button onClick={onLogin} className="btn btn-ghost btn-sm nav-trial">Ücretsiz Dene</button>
          <button onClick={onLogin} className="btn btn-primary btn-sm">Demo Talep Et</button>
        </div>
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menü" style={{
          display: 'none', width: 40, height: 40, borderRadius: 10, border: '1px solid var(--border)',
        }}>☰</button>
      </div>
      <style>{`
        .nav-link:hover { color: var(--ink); }
        .nav-link::after {
          content: ''; position: absolute; bottom: 0; left: 0;
          width: 0; height: 1.5px; background: var(--brand);
          transition: width 0.25s var(--ease-out-expo);
        }
        .nav-link:hover::after { width: 100%; }
        @media (max-width: 900px) {
          .nav-links, .nav-login, .nav-trial { display: none !important; }
          .nav-hamburger { display: grid !important; place-items: center; }
        }
      `}</style>
    </nav>
  );
}

/* ---- Hero ---- */
export function Hero({ headline, onLogin }) {
  const [frame, setFrame] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setFrame(f => (f + 1) % 3), 6500);
    return () => clearInterval(t);
  }, [paused]);

  const headlines = {
    A: ['Gerçek kâr.', 'Gerçek zamanlı.'],
    B: ['Ciro büyür.', 'Kâr neden büyümez?'],
    C: ['Her siparişin', 'gerçeği.'],
    D: ['E-ticaretin', 'kâr motoru.'],
  };
  const h = headlines[headline] || headlines.A;

  const frames = [
    { key: 'dashboard', label: 'Dashboard', comp: <DashboardMock animate={frame === 0 && mounted} /> },
    { key: 'sankey',    label: 'Sankey P&L', comp: <SankeyMock animate={frame === 1 && mounted} /> },
    { key: 'ai',        label: 'AI Asistan', comp: <AIAssistantMock animate={frame === 2 && mounted} /> },
  ];

  return (
    <section style={{ position: 'relative', paddingTop: 128, paddingBottom: 80, overflow: 'hidden' }}>
      {/* Ambient orbs */}
      <div className="orb" style={{ width: 520, height: 520, background: 'radial-gradient(circle, rgba(81,75,238,0.35), transparent 60%)', top: -120, right: -80 }} />
      <div className="orb" style={{ width: 420, height: 420, background: 'radial-gradient(circle, rgba(245,229,139,0.5), transparent 60%)', top: 260, left: -120, animationDelay: '-6s' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(81,75,238,0.05), transparent 70%)' }} />

      <div className="container" style={{ position: 'relative' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', textAlign: 'center' }}>
          <div className={`reveal${mounted ? ' in' : ''}`} style={{ transitionDelay: '100ms' }}>
            <span className="eyebrow">
              <span className="dot" />
              Kâr Intelligence Platformu · TR'nin İlki
            </span>
          </div>
          <h1 className="display" style={{ marginTop: 24, marginBottom: 24 }}>
            <span className={`reveal${mounted ? ' in' : ''}`} style={{ transitionDelay: '280ms', display: 'block' }}>
              {h[0]}
            </span>
            <span className={`reveal${mounted ? ' in' : ''}`} style={{ transitionDelay: '520ms', display: 'block', color: 'var(--brand)' }}>
              {h[1]}
            </span>
          </h1>
          <p className={`body-lg reveal${mounted ? ' in' : ''}`} style={{
            maxWidth: 720, margin: '0 auto', transitionDelay: '820ms',
          }}>
            Kâr Intelligence. Reklam, iade, kargo, komisyon sonrası gerçek net marj. <br/>
            <span className="ink" style={{ fontWeight: 600 }}>ikas, Trendyol, Hepsiburada, Amazon</span> ve 12+ kanal.
          </p>
          <div className={`reveal${mounted ? ' in' : ''}`} style={{
            transitionDelay: '1000ms', marginTop: 36,
            display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
          }}>
            <button onClick={onLogin} className="btn btn-primary btn-lg">Demo Talep Et</button>
            <button onClick={onLogin} className="btn btn-ghost btn-lg">Ücretsiz Dene <span style={{ opacity: 0.5 }}>→</span></button>
          </div>
          <div className={`caption reveal${mounted ? ' in' : ''}`} style={{
            transitionDelay: '1180ms', marginTop: 18,
            display: 'inline-flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center',
          }}>
            <span>Kredi kartı gerekmez</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ink-30)' }} />
            <span>14 gün ücretsiz</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ink-30)' }} />
            <span>Setup 1 gün</span>
          </div>
        </div>

        {/* 3-screen carousel */}
        <div className={`reveal-lg reveal${mounted ? ' in' : ''}`}
             style={{
               transitionDelay: '1340ms', marginTop: 64, position: 'relative',
               maxWidth: 1180, marginLeft: 'auto', marginRight: 'auto',
             }}
             onMouseEnter={() => setPaused(true)}
             onMouseLeave={() => setPaused(false)}>
          <div style={{ position: 'relative', height: 480 }}>
            {frames.map((f, i) => (
              <div key={f.key} style={{
                position: 'absolute', inset: 0,
                opacity: frame === i ? 1 : 0,
                transform: frame === i ? 'scale(1) translateY(0)' : 'scale(0.98) translateY(10px)',
                transition: 'opacity 0.7s var(--ease-out-expo), transform 0.7s var(--ease-out-expo)',
                pointerEvents: frame === i ? 'auto' : 'none',
              }}>
                {f.comp}
              </div>
            ))}
          </div>
          {/* Dots */}
          <div style={{
            display: 'flex', gap: 10, justifyContent: 'center', marginTop: 28,
          }}>
            {frames.map((f, i) => (
              <button key={f.key} onClick={() => setFrame(i)} aria-label={f.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 14px', borderRadius: 999,
                  background: frame === i ? 'var(--ink)' : 'transparent',
                  color: frame === i ? 'white' : 'var(--ink-50)',
                  border: frame === i ? 'none' : '1px solid var(--border)',
                  fontSize: 12, fontWeight: 600,
                  transition: 'all 0.3s var(--ease-out-expo)',
                }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: frame === i ? 'var(--accent)' : 'var(--ink-30)',
                }} />
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- Logo marquee ---- */
export function LogoStrip() {
  const names = ['ikas', 'TRENDYOL', 'Hepsiburada', 'amazon', 'Shopify', 'WooCommerce', 'Paraşüt', 'Logo', 'Meta Ads', 'Google Ads', 'Klaviyo', 'Slack'];
  return (
    <section style={{ padding: '60px 0 40px', background: 'var(--bg)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="container">
        <div className="caption" style={{ textAlign: 'center', marginBottom: 28, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 11 }}>
          Verinin aktığı her yerden — 12+ entegrasyon
        </div>
        <div className="marquee">
          <div className="marquee-track">
            {[...names, ...names].map((n, i) => (
              <div key={i} style={{
                fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em',
                color: 'var(--ink-50)', whiteSpace: 'nowrap',
                fontFamily: 'var(--font-sans)',
              }}>{n}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- Problem Section ---- */
export function Problem() {
  const cards = [
    {
      num: '01',
      title: 'Hangi kanal kazandırıyor?',
      body: 'Kanal raporları ortalama %34 aşırı iyimser. Reklam, iade, kargo, komisyon hesaplanınca gerçek sıralama değişir.',
      micro: 'ikas vs Trendyol vs Amazon — gerçekte hangisi?',
      viz: <ChannelViz />,
    },
    {
      num: '02',
      title: 'Hangi ürün gerçekten kârlı?',
      body: 'En çok satan ≠ en çok kazandıran. Stok devir × marj × iade birleşince %60 ürün sıralaması değişebilir.',
      micro: 'Hangi SKU parayı kilitliyor?',
      viz: <ProductViz />,
    },
    {
      num: '03',
      title: 'Hangi rakip size karşı saldırıyor?',
      body: 'Buybox kaybı dakika içinde gerçekleşir. Rakip fiyat düşürdüğünde 44 saat içinde %12 ciro kaybı olabilir.',
      micro: 'Kim, ne zaman, hangi üründe fiyatlıyor?',
      viz: <CompetitorViz />,
    },
  ];
  return (
    <section className="section section-alt" style={{ position: 'relative' }}>
      <div className="container">
        <div className="section-head reveal">
          <div className="section-num">§ 01 — PROBLEM</div>
          <h2 className="h1" style={{ marginTop: 16, marginBottom: 20 }}>
            Ciroyu biliyorsunuz.<br/>
            Ama <em style={{ fontStyle: 'italic', color: 'var(--brand)' }}>hangi kanal</em>, <em style={{ fontStyle: 'italic', color: 'var(--brand)' }}>hangi ürün</em>, <em style={{ fontStyle: 'italic', color: 'var(--brand)' }}>hangi rakip</em> gerçeği değiştiriyor?
          </h2>
          <p className="body-lg" style={{ maxWidth: 640 }}>
            3 soru. 3 gizli gerçek. Kâr Intelligence hepsine saniyede cevap veriyor.
          </p>
        </div>

        <div className="problem-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {cards.map((c, i) => (
            <div key={c.num} className="reveal problem-card" style={{
              '--i': i,
              background: 'white',
              borderRadius: 24,
              padding: 28,
              boxShadow: 'var(--sh-sm)',
              border: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', gap: 16,
              transition: 'transform 0.3s var(--ease-out-expo), box-shadow 0.3s var(--ease-out-expo)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-50)' }}>PROBLEM · {c.num}</span>
                <span style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--brand-soft)', color: 'var(--brand)', display: 'grid', placeItems: 'center', fontSize: 14 }}>
                  {i === 0 ? '⇅' : i === 1 ? '⌘' : '◎'}
                </span>
              </div>
              <h3 className="h3" style={{ fontSize: 24, lineHeight: 1.2 }}>{c.title}</h3>
              <div style={{
                height: 140, margin: '4px 0',
                background: '#FAFAFC', borderRadius: 14, border: '1px solid var(--border)',
                padding: 14, overflow: 'hidden',
              }}>
                {c.viz}
              </div>
              <p className="body" style={{ fontSize: 15 }}>{c.body}</p>
              <div className="caption" style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)', color: 'var(--ink-70)', fontStyle: 'italic' }}>
                → {c.micro}
              </div>
            </div>
          ))}
        </div>
        <style>{`
          .problem-card:hover { transform: translateY(-4px); box-shadow: var(--sh-lg); }
          @media (max-width: 900px) {
            .problem-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

export function ChannelViz() {
  const data = [
    { name: 'Trendyol', brut: 92, net: 38 },
    { name: 'Amazon',   brut: 70, net: 48 },
    { name: 'ikas',     brut: 58, net: 56 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map(r => (
        <div key={r.name}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
            <span style={{ fontWeight: 600 }}>{r.name}</span>
            <span className="mono" style={{ color: 'var(--ink-50)' }}>brüt → net</span>
          </div>
          <div style={{ position: 'relative', height: 14, background: '#F2F2F6', borderRadius: 4 }}>
            <div style={{ position: 'absolute', inset: 0, width: `${r.brut}%`, background: '#DCDCE4', borderRadius: 4 }} />
            <div style={{ position: 'absolute', inset: 0, width: `${r.net}%`, background: 'var(--brand)', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductViz() {
  const data = [
    { name: 'SKU-A23', sales: 86, profit: 12, loss: true },
    { name: 'SKU-C41', sales: 42, profit: 38 },
    { name: 'SKU-B08', sales: 28, profit: 26 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map(r => (
        <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '56px 1fr 1fr', gap: 6, alignItems: 'center', fontSize: 10 }}>
          <span className="mono" style={{ color: 'var(--ink-70)' }}>{r.name}</span>
          <div style={{ height: 10, background: '#E5E6EC', borderRadius: 3, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, width: `${r.sales}%`, background: '#CBCBD3', borderRadius: 3 }} />
          </div>
          <div style={{ height: 10, background: '#E5E6EC', borderRadius: 3, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, width: `${r.profit}%`, background: r.loss ? 'var(--danger)' : 'var(--brand)', borderRadius: 3 }} />
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 10, fontSize: 9, color: 'var(--ink-50)', marginTop: 2 }}>
        <span>■ Satış adedi</span>
        <span>■ Net kâr</span>
      </div>
    </div>
  );
}

export function CompetitorViz() {
  return (
    <div style={{ position: 'relative', height: '100%', fontSize: 11 }}>
      <div style={{
        padding: '6px 10px', background: 'white', borderRadius: 8, border: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: 'var(--sh-sm)',
      }}>
        <div>
          <div style={{ fontWeight: 600 }}>Sizin fiyatınız</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-50)' }}>₺39.240</div>
        </div>
        <span className="chip chip-green" style={{ fontSize: 9, height: 20 }}>Buybox ✓</span>
      </div>
      <div style={{ height: 8 }} />
      <div style={{
        padding: '6px 10px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontWeight: 600 }}>Foreo (rakip)</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--danger)' }}>₺36.111 · -%8</div>
        </div>
        <span className="chip" style={{ background: '#FEE2E2', color: 'var(--danger)', fontSize: 9, height: 20 }}>Saldırı</span>
      </div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-50)', fontSize: 10 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1.5s infinite' }} />
        3 dakika önce tespit edildi
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}

/* ---- Platform Reveal ---- */
export function PlatformReveal() {
  const [activeTab, setActiveTab] = useState(0);
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const tabs = [
    { label: 'Komuta Merkezi', comp: <DashboardMock animate={inView && activeTab === 0} /> },
    { label: 'Kâr Akış Haritası', comp: <SankeyMock animate={inView && activeTab === 1} /> },
    { label: 'FinOps Co-Pilot', comp: <AIAssistantMock animate={inView && activeTab === 2} /> },
  ];

  const tooltips = [
    { x: '15%', y: '22%', text: 'Her sipariş için gerçek net kâr', delay: 0 },
    { x: '72%', y: '18%', text: 'Kanal-kanal karşılaştırma', delay: 1 },
    { x: '80%', y: '62%', text: 'AI asistan cevap veriyor', delay: 2 },
    { x: '12%', y: '70%', text: 'Anomali tespiti otomatik', delay: 3 },
  ];

  return (
    <section ref={ref} className="section" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(81,75,238,0.06), transparent 70%)',
      }} />
      <div className="container" style={{ position: 'relative' }}>
        <div className="section-head center reveal">
          <div className="section-num">§ 02 — PLATFORM</div>
          <h2 className="h1" style={{ marginTop: 16, marginBottom: 20 }}>
            <em style={{ fontStyle: 'italic', color: 'var(--ink-50)', fontWeight: 400 }}>Tanış —</em> Gilan Smart.
          </h2>
          <p className="body-lg" style={{ maxWidth: 620, margin: '0 auto' }}>
            E-ticaret Kâr Intelligence'ının tek platformu.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="reveal" style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
          {tabs.map((t, i) => (
            <button key={t.label} onClick={() => setActiveTab(i)} style={{
              padding: '10px 18px', borderRadius: 999,
              background: activeTab === i ? 'var(--ink)' : 'transparent',
              color: activeTab === i ? 'white' : 'var(--ink-70)',
              border: activeTab === i ? 'none' : '1px solid var(--border)',
              fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em',
              transition: 'all 0.25s var(--ease-out-smooth)',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="reveal-lg reveal" style={{ position: 'relative', maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ position: 'relative', height: 480 }}>
            {tabs.map((t, i) => (
              <div key={t.label} style={{
                position: 'absolute', inset: 0,
                opacity: activeTab === i ? 1 : 0,
                transform: activeTab === i ? 'scale(1)' : 'scale(0.98)',
                transition: 'opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)',
                pointerEvents: activeTab === i ? 'auto' : 'none',
              }}>
                {t.comp}
              </div>
            ))}
            {/* Floating tooltips */}
            {activeTab === 0 && tooltips.map((tt, i) => (
              <div key={i} style={{
                position: 'absolute', left: tt.x, top: tt.y,
                background: 'white', padding: '8px 12px', borderRadius: 10,
                boxShadow: 'var(--sh-lg)', fontSize: 12, fontWeight: 600,
                border: '1px solid var(--border)',
                animation: inView ? `floatIn 0.6s ${1.2 + tt.delay * 0.2}s var(--ease-out-expo) both` : 'none',
                opacity: 0,
                whiteSpace: 'nowrap',
                zIndex: 5,
              }}>
                <span style={{ color: 'var(--brand)', marginRight: 6 }}>✦</span>
                {tt.text}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes floatIn { from { opacity: 0; transform: translateY(10px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
    </section>
  );
}

Object.assign(window, { Nav, Hero, LogoStrip, Problem, PlatformReveal, useReveal });


/* ============= Sections 7-12 ============= */


/* ---- Bento 7 Modules ---- */
export function Bento() {
  const cards = [
    {
      span: 'span 4', h: 260, id: 1, icon: '▦',
      title: 'Komuta Merkezi',
      body: "8 kritik KPI + canlı satışlar. Her sabah 3 saniyede \"gün nasıl gidiyor?\" cevabı.",
      viz: <BentoKPIs />, tone: 'light',
    },
    {
      span: 'span 5', h: 260, id: 2, icon: '⟋',
      title: 'Kâr Akış Haritası',
      body: 'Sankey P&L ile reklam, iade, kargo, komisyon — her gider görünür, net kâr kalanda.',
      viz: <BentoSankey />, tone: 'brand',
    },
    {
      span: 'span 3', h: 260, id: 3, icon: '✦',
      title: 'FinOps Co-Pilot',
      body: '"Bu ay en kârsız 3 ürün?" sor, cevap al. Verinizi konuşun.',
      viz: <BentoAI />, tone: 'dark',
    },
    {
      span: 'span 7', h: 240, id: 4, icon: '▤',
      title: 'Kendi Raporunu Kur',
      body: '7 modülden sürükle-bırak dashboard. 10+ hazır şablon — veya sıfırdan başla.',
      viz: <BentoBuilder />, tone: 'light',
    },
    {
      span: 'span 5', h: 240, id: 5, icon: '◎',
      title: 'Buybox & Rakip Takibi',
      body: 'Foreo fiyat düşürdü mü? Size karşı kim agresif? Saniyede öğren.',
      viz: <BentoCompetitor />, tone: 'accent',
    },
    {
      span: 'span 3', h: 260, id: 6, icon: '▥',
      title: 'ABC Pareto + Yaşlandırma',
      body: 'A-sınıfı ürünler net. 90+ gün ölü stok uyarısı.',
      viz: <BentoStock />, tone: 'light',
    },
    {
      span: 'span 9', h: 260, id: 7, icon: '⊕',
      title: '12+ Kanal Hazır',
      body: 'ikas, Trendyol, Hepsiburada, Amazon, Shopify, WooCommerce, Paraşüt, Logo, Klaviyo, Meta Ads, Google Ads… Hepsi API ile anlık senkron.',
      viz: <BentoIntegrations />, tone: 'light',
    },
  ];

  return (
    <section id="ozellikler" className="section section-alt">
      <div className="container">
        <div className="section-head reveal">
          <div className="section-num">§ 03 — ÖZELLİKLER</div>
          <h2 className="h1" style={{ marginTop: 16, marginBottom: 20 }}>
            Bir ekran. <span style={{ color: 'var(--brand)' }}>Yedi modül.</span> Tek gerçek.
          </h2>
          <p className="body-lg" style={{ maxWidth: 640 }}>
            Gilan Smart'ın 7 Kâr Intelligence modülü — hepsi aynı veride birleşir.
          </p>
        </div>

        <div className="bento-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16,
        }}>
          {cards.map((c, i) => (
            <div key={c.id} className="reveal bento-card" style={{
              '--i': i,
              gridColumn: c.span,
              minHeight: c.h,
              borderRadius: 24,
              padding: 28,
              background: c.tone === 'brand' ? 'linear-gradient(135deg, #EEEDFD, #F8F5E4)'
                         : c.tone === 'dark' ? 'linear-gradient(160deg, #1A1340, #0F0F1A)'
                         : c.tone === 'accent' ? 'linear-gradient(145deg, #FDF8D6, #FBF2B4)'
                         : 'white',
              color: c.tone === 'dark' ? 'var(--on-dark)' : 'var(--ink)',
              border: c.tone === 'light' ? '1px solid var(--border)' : 'none',
              boxShadow: c.tone === 'light' ? 'var(--sh-sm)' : 'var(--sh-md)',
              display: 'flex', flexDirection: 'column', gap: 10,
              transition: 'transform 0.35s var(--ease-out-expo), box-shadow 0.35s var(--ease-out-expo)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: c.tone === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(81,75,238,0.08)',
                  color: c.tone === 'dark' ? 'var(--accent)' : 'var(--brand)',
                  display: 'grid', placeItems: 'center', fontSize: 15,
                }}>{c.icon}</span>
                <span className="mono" style={{ fontSize: 10, opacity: 0.5 }}>0{c.id}</span>
              </div>
              <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.015em', marginTop: 4 }}>{c.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: c.tone === 'dark' ? 'var(--on-dark-70)' : 'var(--ink-70)' }}>{c.body}</p>
              <div style={{ marginTop: 'auto', flex: 1, minHeight: 60, display: 'flex', alignItems: 'flex-end' }}>
                {c.viz}
              </div>
            </div>
          ))}
        </div>
        <style>{`
          .bento-card:hover { transform: translateY(-3px); box-shadow: var(--sh-lg); }
          @media (max-width: 900px) {
            .bento-grid > * { grid-column: span 12 !important; min-height: auto !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

export function BentoKPIs() {
  return (
    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {[
        { l: 'Net Kâr', v: '₺487k' },
        { l: 'Marj', v: '%17.1' },
        { l: 'İade', v: '%8.2' },
        { l: 'ROAS', v: '3.4x' },
      ].map(k => (
        <div key={k.l} style={{ padding: 10, borderRadius: 10, background: '#FAFAFC', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--ink-50)' }}>{k.l}</div>
          <div className="mono" style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{k.v}</div>
        </div>
      ))}
    </div>
  );
}

export function BentoSankey() {
  return (
    <svg viewBox="0 0 280 100" style={{ width: '100%', height: 100 }}>
      <defs>
        <linearGradient id="bsg1" x1="0" x2="1"><stop offset="0%" stopColor="#514BEE" stopOpacity="0.6"/><stop offset="100%" stopColor="#7D5FFF" stopOpacity="0.2"/></linearGradient>
        <linearGradient id="bsg2" x1="0" x2="1"><stop offset="0%" stopColor="#514BEE" stopOpacity="0.5"/><stop offset="100%" stopColor="#F5E58B" stopOpacity="0.8"/></linearGradient>
      </defs>
      <rect x="6" y="20" width="10" height="60" rx="2" fill="#0F0F1A" />
      <path d="M 16 30 C 80 30, 180 20, 260 14" stroke="url(#bsg1)" strokeWidth="18" fill="none" />
      <path d="M 16 50 C 80 50, 180 45, 260 40" stroke="#D8D8E2" strokeWidth="10" fill="none" />
      <path d="M 16 62 C 80 62, 180 58, 260 56" stroke="#E5E6EC" strokeWidth="7" fill="none" />
      <path d="M 16 72 C 80 72, 180 78, 260 78" stroke="url(#bsg2)" strokeWidth="12" fill="none" />
      <text x="248" y="80" fontSize="9" fontWeight="700" fill="#514BEE" textAnchor="end">NET ₺487k</text>
    </svg>
  );
}

export function BentoAI() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ alignSelf: 'flex-end', padding: '6px 10px', background: 'rgba(255,255,255,0.12)', color: 'white', borderRadius: '12px 12px 2px 12px', fontSize: 11, maxWidth: '90%' }}>
        En kârsız 3 ürün?
      </div>
      <div style={{ padding: '6px 10px', background: 'white', color: 'var(--ink)', borderRadius: '12px 12px 12px 2px', fontSize: 11, maxWidth: '95%' }}>
        SKU-A23, A40, C12 — marjları sırayla -%4, -%2, %1.
      </div>
    </div>
  );
}

export function BentoBuilder() {
  return (
    <div style={{ width: '100%', display: 'flex', gap: 8, height: 100 }}>
      <div style={{ width: 100, background: '#FAFAFC', border: '1px dashed var(--border-strong)', borderRadius: 10, padding: 8, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10, color: 'var(--ink-50)' }}>
        <div>Modüller</div>
        {['KPI', 'Chart', 'Table', 'Sankey'].map(x => (
          <div key={x} style={{ padding: '3px 6px', background: 'white', borderRadius: 5, border: '1px solid var(--border)', fontSize: 10 }}>{x}</div>
        ))}
      </div>
      <div style={{ flex: 1, background: 'white', borderRadius: 10, border: '1px solid var(--border)', padding: 8, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 6 }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(81,75,238,0.12), rgba(81,75,238,0.02))', borderRadius: 6 }} />
        <div style={{ background: 'rgba(245,229,139,0.4)', borderRadius: 6 }} />
        <div style={{ gridColumn: 'span 2', background: '#F2F2F6', borderRadius: 6, height: 28 }} />
      </div>
    </div>
  );
}

export function BentoCompetitor() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ padding: '6px 10px', background: 'rgba(15,15,26,0.06)', borderRadius: 8, fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600 }}>Sizin</span><span className="mono">₺39.240</span>
      </div>
      <div style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.12)', borderRadius: 8, fontSize: 11, display: 'flex', justifyContent: 'space-between', color: '#7F1D1D' }}>
        <span style={{ fontWeight: 600 }}>Foreo -%8</span><span className="mono">₺36.111</span>
      </div>
      <div style={{ fontSize: 10, color: 'var(--ink-70)', marginTop: 2 }}>◦ 3 dk önce · Buybox risk</div>
    </div>
  );
}

export function BentoStock() {
  const bars = [{ c: 'var(--success)', h: 40 }, { c: 'var(--brand)', h: 60 }, { c: 'var(--warning)', h: 28 }, { c: 'var(--danger)', h: 18 }];
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 70 }}>
        {bars.map((b, i) => (
          <div key={i} style={{ flex: 1, background: b.c, height: `${b.h}%`, borderRadius: 3 }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--ink-50)', marginTop: 4 }}>
        <span>0-30g</span><span>31-60g</span><span>61-90g</span><span>90+g</span>
      </div>
    </div>
  );
}

export function BentoIntegrations() {
  const logos = ['ikas', 'Trendyol', 'Hepsiburada', 'Amazon', 'Shopify', 'WooCommerce', 'Paraşüt', 'Meta Ads', 'Google Ads'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, width: '100%' }}>
      {logos.map(l => (
        <div key={l} style={{
          padding: '8px 10px', background: '#FAFAFC', borderRadius: 8,
          border: '1px solid var(--border)', fontSize: 11, fontWeight: 600,
          color: 'var(--ink-70)', textAlign: 'center',
        }}>{l}</div>
      ))}
    </div>
  );
}

/* ---- Split Screen Tour ---- */
export function SplitTour() {
  const modules = [
    {
      title: 'Kârlılık', num: '01', persona: 'CFO',
      states: [
        { h: "Her ₺1'in gittiği yer.", body: "Brut ciro → ürün maliyeti → reklam → iade → kargo → komisyon → sabit gider → net kâr. 7 duraklı bir akış. Hepsi gerçek zamanlı." },
        { h: "Sankey P&L Diyagramı", body: "Her kanal, her ürün, her dönem. Tıkla, detaya in. Export: Excel, PDF, dashboard embed." },
        { h: "Her rakamın bir kaynağı.", body: "Tıkla → ilgili sipariş listesi. Denetçi ready. KVKK uyumlu audit trail." },
      ],
      viz: <SankeyMock animate />,
    },
    {
      title: 'Stok', num: '02', persona: 'Ops',
      states: [
        { h: "Stokun 3 hali.", body: "Çok hızlı (A) + yavaş (B) + ölü (C). ABC Pareto ile hangi ürün %70 ciroyu taşıyor — dakikada gör." },
        { h: "Yaşlandırma + Riskli Sermaye", body: "0-30 / 31-60 / 61-90 / 90+ gün dilimleri. 90+ gün = Riskli Sermaye uyarısı. Hızlı likidasyon önerileri." },
        { h: "Stok Devir Hızı", body: "Sektör ortalaması 3.5x. Siz nerede? Yıllık devir hızı + trend grafiği." },
      ],
      viz: <StockMock />,
    },
    {
      title: 'Rekabet', num: '03', persona: 'Ops + CEO',
      states: [
        { h: "Buybox kazanıyor musunuz?", body: "Kazandığınız ürün sayısı / toplam eşleşme. 44/64 = %69. Hangi üründe kaybediyorsunuz?" },
        { h: "En Agresif Rakip: kim?", body: "Foreo mu? Philips mi? Sizin kategorinizde en çok fiyat düşüren ve Buybox alan. Kimlik + strateji." },
        { h: "Toplu Tarama + AI Yorum", body: "Tek butonla tüm ürünleri tara. '44 ürün lider, 20 risk, 100 rakip yoğunluğu'. CEO'ya hazır brief." },
      ],
      viz: <CompetitorMock />,
    },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="section-head center reveal">
          <div className="section-num">§ 04 — CINEMATIC TOUR</div>
          <h2 className="h1" style={{ marginTop: 16, marginBottom: 20 }}>Üç modül. Üç an.</h2>
          <p className="body-lg" style={{ maxWidth: 640, margin: '0 auto' }}>
            Kârlılık, Stok ve Rekabet — kararlarınızın %80'ini belirleyen üç alan, cinematic walkthrough ile.
          </p>
        </div>

        {modules.map((m, mi) => <SplitModule key={m.title} module={m} index={mi} />)}
      </div>
    </section>
  );
}

export function SplitModule({ module, index }) {
  const [state, setState] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const observers = [];
    const stateRefs = ref.current.querySelectorAll('[data-state]');
    stateRefs.forEach((el, i) => {
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) setState(i);
      }, { rootMargin: '-40% 0px -40% 0px' });
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <div ref={ref} className="split-module" style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56,
      marginBottom: 120, position: 'relative',
    }}>
      <div className="split-visual" style={{ position: 'sticky', top: 96, height: 'fit-content', alignSelf: 'flex-start' }}>
        <div className="reveal-lg reveal" style={{ position: 'relative' }}>
          {/* Accent bg */}
          <div style={{
            position: 'absolute', inset: -20,
            background: 'radial-gradient(ellipse at 50% 50%, rgba(81,75,238,0.08), transparent 70%)',
            filter: 'blur(40px)', zIndex: -1,
          }} />
          {module.viz}
        </div>
      </div>
      <div className="split-text" style={{ display: 'flex', flexDirection: 'column', gap: 120 }}>
        <div>
          <div className="section-num">MODÜL · {module.num}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <h3 className="h1" style={{ fontSize: 'clamp(36px, 4vw, 56px)' }}>{module.title}</h3>
            <span className="chip chip-neutral">{module.persona}</span>
          </div>
        </div>
        {module.states.map((s, i) => (
          <div key={i} data-state={i} className="reveal" style={{
            opacity: state === i ? 1 : 0.3,
            transition: 'opacity 0.5s var(--ease-out-smooth)',
            paddingLeft: 20,
            borderLeft: `2px solid ${state === i ? 'var(--brand)' : 'var(--border)'}`,
          }}>
            <h4 className="h2" style={{ marginBottom: 16 }}>{s.h}</h4>
            <p className="body-lg">{s.body}</p>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 900px) {
          .split-module { grid-template-columns: 1fr !important; gap: 24px !important; }
          .split-visual { position: relative !important; top: 0 !important; }
          .split-text { gap: 48px !important; }
        }
      `}</style>
    </div>
  );
}

export function StockMock() {
  return (
    <WindowChrome title="gilansmart.app — Stok Sağlığı" accent>
      <div style={{ display: 'flex', height: 440 }}>
        <Sidebar active="Stok" />
        <div style={{ flex: 1, padding: 20, background: 'white', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--ink-50)', letterSpacing: '0.04em' }}>ABC PARETO + YAŞLANDIRMA</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2, letterSpacing: '-0.01em' }}>Stokun 3 hali.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[{ c: '#10B981', l: 'A · Hızlı', v: '42 SKU', p: '%68 ciro' },
              { c: '#F59E0B', l: 'B · Yavaş', v: '118 SKU', p: '%24 ciro' },
              { c: '#EF4444', l: 'C · Ölü', v: '37 SKU', p: '%8 ciro' }].map(x => (
              <div key={x.l} style={{ padding: 12, borderRadius: 12, border: '1px solid var(--border)', background: '#FAFAFC' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-70)', fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: x.c }}/> {x.l}
                </div>
                <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{x.v}</div>
                <div style={{ fontSize: 10, color: 'var(--ink-50)' }}>{x.p}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border)', flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>Yaşlandırma dağılımı</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 120 }}>
              {[
                { l: '0-30g', h: 90, c: '#10B981' },
                { l: '31-60g', h: 62, c: '#14B8A6' },
                { l: '61-90g', h: 42, c: '#F59E0B' },
                { l: '90+g', h: 28, c: '#EF4444', tag: '₺142k riskli sermaye' },
              ].map(b => (
                <div key={b.l} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ position: 'relative', width: '100%', height: `${b.h}%`, background: b.c, borderRadius: 4 }}>
                    {b.tag && (
                      <span style={{ position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)',
                        background: '#FEE2E2', color: '#7F1D1D', padding: '2px 6px', borderRadius: 4, fontSize: 9, whiteSpace: 'nowrap' }}>
                        {b.tag}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--ink-50)' }}>{b.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

export function CompetitorMock() {
  const rows = [
    { sku: 'SKU-A23', you: '₺39.240', rival: 'Foreo', rp: '₺36.111', delta: '-%8', loss: true },
    { sku: 'SKU-B08', you: '₺12.490', rival: 'Philips', rp: '₺12.990', delta: '+%4', loss: false },
    { sku: 'SKU-C41', you: '₺8.200',  rival: 'Braun',   rp: '₺7.550', delta: '-%8', loss: true },
    { sku: 'SKU-D17', you: '₺24.900', rival: 'Dyson',   rp: '₺25.400', delta: '+%2', loss: false },
  ];
  return (
    <WindowChrome title="gilansmart.app — Rekabet Analizi" accent>
      <div style={{ display: 'flex', height: 440 }}>
        <Sidebar active="Rekabet" />
        <div style={{ flex: 1, padding: 20, background: 'white', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--ink-50)', letterSpacing: '0.04em' }}>BUYBOX & KONUMLANDIRMA</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2, letterSpacing: '-0.01em' }}>Buybox kazanıyor musunuz?</div>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>44<span style={{ color: 'var(--ink-50)' }}>/64</span></div>
                <div style={{ fontSize: 10, color: 'var(--ink-50)' }}>Buybox kazanç</div>
              </div>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: `conic-gradient(var(--brand) 0 69%, #E8E8EF 69% 100%)`, display: 'grid', placeItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'white', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>69%</div>
              </div>
            </div>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 80px', gap: 8, padding: '10px 14px', background: '#FAFAFC', fontSize: 11, color: 'var(--ink-50)', fontWeight: 600 }}>
              <span>SKU</span><span>Siz</span><span>Rakip</span><span>Rakip Fiyat</span><span>Δ</span>
            </div>
            {rows.map((r, i) => (
              <div key={r.sku} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 80px', gap: 8, padding: '10px 14px',
                borderTop: '1px solid var(--border)', fontSize: 12,
                background: r.loss ? 'rgba(239,68,68,0.03)' : 'white',
              }}>
                <span className="mono" style={{ fontWeight: 600 }}>{r.sku}</span>
                <span className="mono">{r.you}</span>
                <span>{r.rival}</span>
                <span className="mono">{r.rp}</span>
                <span className={r.loss ? '' : ''} style={{
                  color: r.loss ? 'var(--danger)' : 'var(--success)',
                  fontWeight: 700,
                }}>{r.delta}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderRadius: 10, background: 'linear-gradient(135deg, rgba(81,75,238,0.06), rgba(245,229,139,0.1))', border: '1px solid rgba(81,75,238,0.15)' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, lineHeight: 1.5 }}>
              <span className="tag-ai" style={{ flexShrink: 0 }}>AI</span>
              <span><b>44 ürün lider</b>, 20 risk, 100 rakip yoğunluğu. Foreo kategorisinde son 7 günde 3 saldırı.</span>
            </div>
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

/* ---- How It Works ---- */
export function HowItWorks() {
  const steps = [
    { n: '01', title: 'Entegre', dur: '5 dakika', body: 'ikas ya da marketplace API anahtarını bağla. Hepsi otomatik senkronize olsun.', icon: '⊕' },
    { n: '02', title: 'Günlük veri', dur: '24 saat', body: 'İlk gün sonunda 12+ kanalın birleşik verisi. Siparişler, ürünler, gider, reklam — hepsi bir yerde.', icon: '◈' },
    { n: '03', title: 'AI Analizi', dur: 'Anlık', body: '50+ değişken ile her siparişin gerçek net kârı. AI asistan ilk üç içgörünü sunar.', icon: '✦' },
    { n: '04', title: 'Aksiyon', dur: 'Bugün', body: 'Stok tükenme uyarısı + gizli kâr fırsatı + rakip alarmı. Haftada 15 dakika yerine 2 dakika.', icon: '⚡' },
    { n: '05', title: 'Büyüme', dur: '30 gün', body: 'Ortalama ilk ay %12 kâr marjı artışı (pilotlarımızda). Daha iyi kararlar + daha fazla kâr.', icon: '↗' },
  ];
  return (
    <section id="nasil-calisir" className="section section-alt">
      <div className="container">
        <div className="section-head reveal">
          <div className="section-num">§ 05 — NASIL ÇALIŞIR</div>
          <h2 className="h1" style={{ marginTop: 16, marginBottom: 20 }}>Beş adımda <span style={{ color: 'var(--brand)' }}>Kâr Intelligence</span>.</h2>
          <p className="body-lg" style={{ maxWidth: 640 }}>
            Kurulumdan ilk iç-görüye, ilk karardan ölçeklenen büyümeye — 5 adım, 1 platform.
          </p>
        </div>

        <div className="hiw-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20, position: 'relative' }}>
          {/* connection line */}
          <div style={{
            position: 'absolute', top: 40, left: '8%', right: '8%', height: 1,
            background: 'repeating-linear-gradient(90deg, var(--brand) 0 6px, transparent 6px 14px)',
            zIndex: 0,
          }} />
          {steps.map((s, i) => (
            <div key={s.n} className="reveal hiw-step" style={{ '--i': i, position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: i === 0 ? 'var(--brand)' : 'white',
                color: i === 0 ? 'white' : 'var(--brand)',
                border: i === 0 ? 'none' : '2px solid var(--brand)',
                display: 'grid', placeItems: 'center',
                fontSize: 24, fontWeight: 700,
                margin: '0 auto 20px',
                boxShadow: i === 0 ? '0 8px 24px rgba(81,75,238,0.3)' : '0 4px 12px rgba(81,75,238,0.12)',
                position: 'relative',
              }}>
                <span style={{ fontSize: 26 }}>{s.icon}</span>
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'var(--accent)', color: 'var(--ink)',
                  display: 'grid', placeItems: 'center',
                  fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
                  border: '2px solid white',
                }}>{s.n}</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 4 }}>{s.title}</h3>
                <span className="chip chip-neutral" style={{ marginBottom: 12 }}>{s.dur}</span>
                <p className="body" style={{ fontSize: 14, marginTop: 8 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
        <style>{`
          @media (max-width: 900px) {
            .hiw-grid { grid-template-columns: 1fr !important; }
            .hiw-grid > div:first-child + div + div + div + div + div { display: none; }
          }
        `}</style>
      </div>
    </section>
  );
}

Object.assign(window, { Bento, SplitTour, HowItWorks });


/* ============= Sections 8-12 ============= */


/* ---- Integrations ---- */
export function Integrations() {
  const [filter, setFilter] = useState('Tümü');
  const items = [
    { n: 'ikas', cat: 'E-ticaret', st: 'Aktif' },
    { n: 'Shopify', cat: 'E-ticaret', st: 'Yakında' },
    { n: 'WooCommerce', cat: 'E-ticaret', st: 'Yakında' },
    { n: 'Trendyol', cat: 'Pazaryeri', st: 'Aktif' },
    { n: 'Hepsiburada', cat: 'Pazaryeri', st: 'Aktif' },
    { n: 'Amazon', cat: 'Pazaryeri', st: 'Gelişmede' },
    { n: 'N11', cat: 'Pazaryeri', st: 'Gelişmede' },
    { n: 'Paraşüt', cat: 'Muhasebe', st: 'Aktif' },
    { n: 'Logo', cat: 'Muhasebe', st: 'API hazır' },
    { n: 'Meta Ads', cat: 'Pazarlama', st: 'Aktif' },
    { n: 'Google Ads', cat: 'Pazarlama', st: 'Aktif' },
    { n: 'Klaviyo', cat: 'Pazarlama', st: 'Aktif' },
    { n: 'Slack', cat: 'İletişim', st: 'Aktif' },
  ];
  const cats = ['Tümü', 'E-ticaret', 'Pazaryeri', 'Muhasebe', 'Pazarlama', 'İletişim'];
  const filtered = filter === 'Tümü' ? items : items.filter(x => x.cat === filter);
  const stChip = (s) => s === 'Aktif' ? 'chip-green' : s === 'Yakında' ? '' : s === 'Gelişmede' ? 'chip-accent' : 'chip-neutral';

  return (
    <section id="entegrasyonlar" className="section">
      <div className="container">
        <div className="section-head reveal">
          <div className="section-num">§ 06 — ENTEGRASYONLAR</div>
          <h2 className="h1" style={{ marginTop: 16, marginBottom: 20 }}>
            Verinin olduğu her yerden. <span style={{ color: 'var(--ink-50)' }}>12+ entegrasyon, artıyor.</span>
          </h2>
          <p className="body-lg" style={{ maxWidth: 640 }}>
            E-ticaret markanızın tüm kanalları — tek Kâr Intelligence'da birleşir.
          </p>
        </div>

        <div className="reveal" style={{ display: 'flex', gap: 6, marginBottom: 32, flexWrap: 'wrap' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{
              padding: '8px 16px', borderRadius: 999,
              background: filter === c ? 'var(--ink)' : 'transparent',
              color: filter === c ? 'white' : 'var(--ink-70)',
              border: filter === c ? 'none' : '1px solid var(--border)',
              fontSize: 13, fontWeight: 600,
              transition: 'all 0.2s var(--ease-out-smooth)',
            }}>{c}</button>
          ))}
        </div>

        <div className="int-grid reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {filtered.map(i => (
            <div key={i.n} className="int-card" style={{
              background: 'white',
              borderRadius: 16,
              border: '1px solid var(--border)',
              padding: 20,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              minHeight: 140,
              transition: 'transform 0.25s var(--ease-out-expo), box-shadow 0.25s var(--ease-out-expo), border-color 0.25s',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: '#FAFAFC', border: '1px solid var(--border)',
                display: 'grid', placeItems: 'center',
                fontSize: 15, fontWeight: 700, color: 'var(--ink)',
                letterSpacing: '-0.02em',
              }}>
                {i.n.charAt(0)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em' }}>{i.n}</div>
              <span className={`chip ${stChip(i.st)}`} style={{ fontSize: 10, height: 22 }}>{i.st}</span>
            </div>
          ))}
        </div>

        <div className="reveal" style={{
          marginTop: 40, padding: 24, borderRadius: 20,
          background: 'var(--bg-alt)', border: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>Senin sistemin eklemeli mi?</div>
            <div className="body" style={{ fontSize: 14 }}>Zapier ile 5000+ uygulamaya bağlan, veya bizden özel entegrasyon iste.</div>
          </div>
          <a href="#" className="arrow-link">Entegrasyon talep et →</a>
        </div>
        <style>{`
          .int-card:hover { transform: translateY(-3px); border-color: var(--brand); box-shadow: var(--sh-md); }
          @media (max-width: 900px) { .int-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        `}</style>
      </div>
    </section>
  );
}

/* ---- Pricing ---- */
export function Pricing({ onLogin }) {
  const [annual, setAnnual] = useState(false);
  const [orders, setOrders] = useState(3500);
  const [channels, setChannels] = useState(4);

  const tiers = [
    {
      name: 'Standart', price: 990, hint: 'Başlangıç KOBİ',
      features: ['1 mağaza / pazaryeri bağlantısı', 'Temel kârlılık + Unit Economics', 'Günlük veri güncelleme', 'Ölü stok takibi', 'Satıcı Forumu erişimi', 'E-mail destek'],
      cta: 'Hemen Başla', ghost: true,
    },
    {
      name: 'Profesyonel', price: 2490, hint: 'Büyüyen e-ticaret markası', popular: true,
      features: ['5 mağazaya kadar bağlantı', 'Anlık API veri entegrasyonu', 'AI Asistan (Co-Pilot)', 'Zarar eden (Toxic) ürün bildirimi', 'Trend envanter analizleri', 'Rapor Merkezi Builder', 'Öncelikli canlı destek', 'Slack entegrasyonu'],
      cta: '14 Gün Ücretsiz Dene',
    },
    {
      name: 'Enterprise', price: 'Konuşalım', hint: 'Kurumsal / Ajans / Çoklu marka',
      features: ['Sınırsız mağaza bağlantısı', 'Özel entegrasyon geliştirme', 'SLA güvencesi (99.9% uptime)', 'On-premise deployment opsiyonu', 'Dedicated success manager', 'Özel eğitim paketi', 'API rate limit kaldırılmış', 'ISO 27001 + SOC 2 dokümantasyon'],
      cta: 'Satışa Konuş', dark: true,
    },
  ];

  const recommended = orders < 1000 ? 'Standart' : orders < 15000 ? 'Profesyonel' : 'Enterprise';
  const recPrice = recommended === 'Standart' ? 990 : recommended === 'Profesyonel' ? 2490 : null;

  return (
    <section id="fiyat" className="section section-alt">
      <div className="container">
        <div className="section-head center reveal">
          <div className="section-num">§ 07 — FİYATLANDIRMA</div>
          <h2 className="h1" style={{ marginTop: 16, marginBottom: 20 }}>Satış hacmine göre. <span style={{ color: 'var(--ink-50)' }}>Gizli ücret yok.</span></h2>
          <p className="body-lg" style={{ maxWidth: 640, margin: '0 auto 24px' }}>
            Kredi kartı gerekmez. 14 gün ücretsiz deneyin. Her zaman iptal edin.
          </p>
          <div style={{
            display: 'inline-flex', padding: 4, borderRadius: 999,
            background: 'white', border: '1px solid var(--border)',
          }}>
            <button onClick={() => setAnnual(false)} style={{
              padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              background: !annual ? 'var(--ink)' : 'transparent',
              color: !annual ? 'white' : 'var(--ink-70)',
              transition: 'all 0.2s',
            }}>Aylık</button>
            <button onClick={() => setAnnual(true)} style={{
              padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              background: annual ? 'var(--ink)' : 'transparent',
              color: annual ? 'white' : 'var(--ink-70)',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s',
            }}>Yıllık <span className="chip chip-accent" style={{ height: 18, fontSize: 9 }}>-%17</span></button>
          </div>
        </div>

        <div className="price-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, alignItems: 'stretch' }}>
          {tiers.map(t => (
            <div key={t.name} className="reveal" style={{
              background: t.popular ? 'white' : 'white',
              borderRadius: 24,
              padding: 32,
              border: t.popular ? '2px solid var(--brand)' : '1px solid var(--border)',
              boxShadow: t.popular ? '0 20px 60px rgba(81,75,238,0.18)' : 'var(--sh-sm)',
              position: 'relative',
              display: 'flex', flexDirection: 'column', gap: 20,
              transform: t.popular ? 'scale(1.02)' : 'scale(1)',
            }}>
              {t.popular && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--accent)', color: 'var(--ink)',
                  padding: '6px 14px', borderRadius: 999,
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                }}>EN POPÜLER</div>
              )}
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>{t.name}</h3>
                <div className="caption" style={{ marginTop: 4 }}>{t.hint}</div>
              </div>
              <div>
                {typeof t.price === 'number' ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span className="mono" style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em' }}>
                        ₺{(annual ? Math.round(t.price * 0.83) : t.price).toLocaleString('tr-TR')}
                      </span>
                      <span className="caption">/ ay</span>
                    </div>
                    <div className="caption" style={{ marginTop: 4 }}>+ KDV · {annual ? 'Yıllık ödeme' : 'Her ay iptal'}</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.025em' }}>{t.price}</div>
                    <div className="caption" style={{ marginTop: 4 }}>Özel fiyat + dedicated success manager</div>
                  </>
                )}
              </div>
              <a href="#" className={`btn ${t.ghost ? 'btn-ghost' : t.dark ? 'btn-primary' : 'btn-primary'}`}
                 style={{ width: '100%', background: t.dark ? 'var(--ink)' : undefined }}>
                {t.cta}
              </a>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {t.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14 }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: t.popular ? 'var(--brand)' : 'var(--brand-soft)',
                      color: t.popular ? 'white' : 'var(--brand)',
                      display: 'grid', placeItems: 'center', fontSize: 10, flexShrink: 0, marginTop: 2,
                    }}>✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Calculator */}
        <div className="reveal" style={{
          marginTop: 48, padding: 32,
          background: 'white', borderRadius: 24, border: '1px solid var(--border)',
          boxShadow: 'var(--sh-sm)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }} className="calc-grid">
            <div>
              <h3 className="h3" style={{ marginBottom: 4 }}>Fiyatınızı hesaplayın</h3>
              <div className="caption" style={{ marginBottom: 24 }}>Satış hacminize göre tavsiye.</div>
              <Slider label="Aylık sipariş" value={orders} min={100} max={50000} step={100} onChange={setOrders} format={v => v.toLocaleString('tr-TR')} />
              <Slider label="Kanal sayısı" value={channels} min={1} max={12} step={1} onChange={setChannels} format={v => v} />
            </div>
            <div style={{
              padding: 28, borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(81,75,238,0.06), rgba(245,229,139,0.12))',
              border: '1px solid rgba(81,75,238,0.12)',
            }}>
              <div className="caption">Tavsiye edilen plan</div>
              <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--brand)', marginTop: 4 }}>{recommended}</div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(81,75,238,0.12)' }}>
                <div className="caption">Aylık ücret</div>
                <div className="mono" style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em', marginTop: 2 }}>
                  {recPrice ? `₺${recPrice.toLocaleString('tr-TR')}` : 'Konuşalım'}
                </div>
                <div className="caption" style={{ marginTop: 4 }}>+ KDV · volume fee 0</div>
              </div>
              <button onClick={onLogin} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Kârınızı Görmeye Başlayın
              </button>
            </div>
          </div>
        </div>

        <div className="reveal" style={{ textAlign: 'center', marginTop: 32, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span className="caption">⭐ 4.8/5 Capterra (beta)</span>
          <span className="caption">🇹🇷 İstanbul'da geliştirildi</span>
          <span className="caption">🔒 KVKK + ISO 27001 yolunda</span>
        </div>
        <style>{`
          @media (max-width: 900px) {
            .price-grid { grid-template-columns: 1fr !important; }
            .price-grid > div { transform: none !important; }
            .calc-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

export function Slider({ label, value, min, max, step, onChange, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
        <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--brand)' }}>{format(value)}</span>
      </div>
      <div style={{ position: 'relative', height: 28, display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 6, background: 'var(--border)', borderRadius: 999 }} />
        <div style={{ position: 'absolute', left: 0, width: `${pct}%`, height: 6, background: 'var(--brand)', borderRadius: 999 }} />
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
               style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer' }} />
        <div style={{
          position: 'absolute', left: `${pct}%`, transform: 'translateX(-50%)',
          width: 20, height: 20, borderRadius: '50%',
          background: 'white', border: '2px solid var(--brand)',
          boxShadow: '0 2px 8px rgba(81,75,238,0.3)',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}

/* ---- Security ---- */
export function Security() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head reveal">
          <div className="section-num">§ 08 — GÜVENLİK</div>
          <h2 className="h1" style={{ marginTop: 16, marginBottom: 20 }}>
            Verileriniz kilitli.<br/>
            <span style={{ color: 'var(--brand)' }}>Ve denetlenebilir.</span>
          </h2>
          <p className="body-lg" style={{ maxWidth: 640 }}>
            50+ değişkenle hesapladığımız her rakam kaynağına geri gider. Denetçi ready, KVKK uyumlu.
          </p>
        </div>

        <div className="sec-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>
          <div className="reveal-lg reveal" style={{
            padding: 32, borderRadius: 24,
            background: 'linear-gradient(160deg, #0F0F1A 0%, #1A1340 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div className="eyebrow eyebrow-light" style={{ marginBottom: 20 }}>
              <span className="dot" />Veri akışı
            </div>
            <DataFlowDiagram />
          </div>

          <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '◆', title: 'Uyumluluk', body: 'KVKK ✓ · ISO 27001 (Q4 2026) · SOC 2 (2027 Q2). Her uyumluluk için public belge.', link: 'Uyumluluk belgesi →' },
              { icon: '⛶', title: 'Altyapı', body: 'EU-only hosting (AWS Frankfurt). AES-256 encryption at rest, TLS 1.3 in transit. Günlük encrypted backup.', link: null },
              { icon: '⤓', title: 'Kontrol', body: 'Tek-tıkla tam veri export. 30 gün içinde tam silme hakkı. Audit log her eylem için.', link: null },
            ].map(c => (
              <div key={c.title} style={{
                padding: 24, borderRadius: 20, background: 'white',
                border: '1px solid var(--border)', boxShadow: 'var(--sh-sm)',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    width: 36, height: 36, borderRadius: 10, background: 'var(--brand-soft)',
                    color: 'var(--brand)', display: 'grid', placeItems: 'center', fontSize: 18,
                  }}>{c.icon}</span>
                  <h4 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>{c.title}</h4>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ink-70)', lineHeight: 1.5 }}>{c.body}</p>
                {c.link && <a href="#" className="arrow-link" style={{ fontSize: 13 }}>{c.link}</a>}
              </div>
            ))}
          </div>
        </div>
        <div className="reveal" style={{ textAlign: 'center', marginTop: 48 }}>
          <p style={{ fontSize: 20, fontStyle: 'italic', color: 'var(--ink-70)', letterSpacing: '-0.01em' }}>
            "Denetlenmek istediğinizde, denetlenebilirsiniz."
          </p>
        </div>
        <style>{`@media (max-width: 900px) { .sec-grid { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    </section>
  );
}

export function DataFlowDiagram() {
  const sources = ['ikas', 'Trendyol', 'Hepsiburada', 'Amazon'];
  return (
    <svg viewBox="0 0 520 420" style={{ width: '100%', height: 'auto', display: 'block', minHeight: 360 }}>
      <defs>
        <linearGradient id="flow1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7D5FFF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#F5E58B" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {sources.map((s, i) => {
        const x = 40 + i * 120;
        return (
          <g key={s}>
            <rect x={x} y={20} width="100" height="40" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" />
            <text x={x + 50} y={44} fill="white" fontSize="12" fontWeight="600" textAnchor="middle">{s}</text>
            <path d={`M ${x + 50} 60 L ${x + 50} 120 L 260 120 L 260 160`} stroke="url(#flow1)" strokeWidth="1.5" fill="none" strokeDasharray="3 4">
              <animate attributeName="stroke-dashoffset" values="0;-14" dur="2s" repeatCount="indefinite" />
            </path>
            <circle r="3" fill="#F5E58B">
              <animateMotion dur={`${2.4 + i * 0.3}s`} repeatCount="indefinite"
                path={`M ${x + 50} 60 L ${x + 50} 120 L 260 120 L 260 160`} />
            </circle>
          </g>
        );
      })}
      {/* Boxes */}
      {[
        { y: 160, t1: 'Gilan Smart API', t2: 'AWS Frankfurt · TLS 1.3 · AES-256' },
        { y: 240, t1: '50+ değişken engine', t2: 'Kâr Intelligence' },
        { y: 320, t1: 'Encrypted Dashboard', t2: 'KVKK Audit Log' },
      ].map((b, i) => (
        <g key={i}>
          <rect x="160" y={b.y} width="200" height="56" rx="12" fill="rgba(255,255,255,0.1)" stroke="rgba(245,229,139,0.3)" strokeWidth={i === 0 ? 1 : 0.5} />
          <text x="260" y={b.y + 22} fill="white" fontSize="13" fontWeight="700" textAnchor="middle">{b.t1}</text>
          <text x="260" y={b.y + 40} fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle">{b.t2}</text>
          {i < 2 && (
            <>
              <path d={`M 260 ${b.y + 56} L 260 ${b.y + 80}`} stroke="url(#flow1)" strokeWidth="1.5" strokeDasharray="3 4">
                <animate attributeName="stroke-dashoffset" values="0;-14" dur="2s" repeatCount="indefinite" />
              </path>
              <circle r="3" fill="#F5E58B">
                <animateMotion dur="1.4s" repeatCount="indefinite" path={`M 260 ${b.y + 56} L 260 ${b.y + 80}`} />
              </circle>
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ---- Final CTA ---- */
export function FinalCTA({ onLogin }) {
  return (
    <section id="final-cta" className="section section-dark" style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(96px, 12vw, 160px) 0' }}>
      <div className="orb" style={{ width: 600, height: 600, top: '-20%', left: '-10%', background: 'radial-gradient(circle, rgba(125,95,255,0.35), transparent 60%)' }} />
      <div className="orb" style={{ width: 500, height: 500, bottom: '-30%', right: '-10%', background: 'radial-gradient(circle, rgba(245,229,139,0.2), transparent 60%)', animationDelay: '-8s' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(15,15,26,0.5) 100%)' }} />

      <div className="container" style={{ position: 'relative' }}>
        <div className="reveal" style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <span className="eyebrow eyebrow-light"><span className="dot" />Son durak</span>
          <h2 className="display" style={{ fontSize: 'clamp(44px, 6.5vw, 88px)', marginTop: 20, marginBottom: 24, color: 'white' }}>
            Kârınızı bulmak için,<br/>
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <s style={{ textDecorationColor: 'var(--accent)', textDecorationThickness: '3px' }}>Excel</s>
              <span style={{ color: 'var(--accent)' }}>'i kapatın.</span>
            </span>
          </h2>
          <p className="body-lg" style={{ color: 'var(--on-dark-70)', marginBottom: 40, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            14 gün ücretsiz. Kredi kartı gerekmez. Setup bizden.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onLogin} className="btn btn-on-dark-primary btn-lg">Ücretsiz Başlayın</button>
            <button onClick={onLogin} className="btn btn-on-dark-ghost btn-lg">Demoyu İncele</button>
          </div>
          <div style={{ marginTop: 32, display: 'inline-flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', color: 'var(--on-dark-50)', fontSize: 13 }}>
            <span>⭐ 4.8/5 Capterra</span>
            <span>12+ kanal</span>
            <span>🇹🇷 İstanbul'da el yapımı</span>
            <span>🔒 KVKK uyumlu</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- Footer ---- */
export function Footer() {
  const cols = [
    { t: 'Ürün', l: ['Home', 'Rapor Merkezi', 'Builder', 'AI Asistan', 'Entegrasyonlar', 'Fiyatlandırma', 'Changelog'] },
    { t: 'Şirket', l: ['Hakkımızda', 'Ekip', 'Kariyer', 'Basın', 'İletişim', 'Blog'] },
    { t: 'Kaynaklar', l: ['Dokümantasyon', 'API', 'Nasıl Çalışır', 'Vaka Çalışmaları', 'Yardım Merkezi', 'Durum Sayfası'] },
    { t: 'Yasal', l: ['KVKK', 'Kullanım Şartları', 'Çerez Politikası', 'Gizlilik', 'Güvenlik'] },
  ];
  return (
    <footer style={{ background: 'var(--bg-dark)', color: 'var(--on-dark-70)', padding: '80px 0 32px' }}>
      <div className="container">
        <div className="ftr-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: 40, marginBottom: 64 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--brand), var(--brand-light))', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>G</div>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>Gilan Smart</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 280 }}>
              TR'nin ilk Kâr Intelligence platformu. E-ticaret markanızın gerçek net marjını saniyede görün.
            </p>
          </div>
          {cols.map(c => (
            <div key={c.t}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>{c.t}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {c.l.map(item => (
                  <a key={item} href="#" style={{ fontSize: 14, color: 'var(--on-dark-70)' }} className="ftr-link">{item}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{
          paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
          fontSize: 13,
        }}>
          <div>© 2026 Gilan Smart. İstanbul'da el yapımı.</div>
          <div style={{ display: 'flex', gap: 14 }}>
            {['in', 'X', '▶', '⦿'].map((s, i) => (
              <a key={i} href="#" style={{
                width: 32, height: 32, borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'grid', placeItems: 'center', fontSize: 12, color: 'var(--on-dark-70)',
              }}>{s}</a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, padding: 4, borderRadius: 8, background: 'rgba(255,255,255,0.05)' }}>
            <button style={{ padding: '4px 10px', borderRadius: 4, background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 12, fontWeight: 600 }}>TR</button>
            <button style={{ padding: '4px 10px', borderRadius: 4, color: 'var(--on-dark-50)', fontSize: 12, fontWeight: 500 }}>EN</button>
          </div>
        </div>
      </div>
      <style>{`
        .ftr-link:hover { color: white; }
        @media (max-width: 900px) { .ftr-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </footer>
  );
}

Object.assign(window, { Integrations, Pricing, Security, FinalCTA, Footer });


/* ============= Dashboard Mocks (real-ish UI) ============= */


/* ---------- Small bits ---------- */
export function WindowChrome({ title = "Gilan Smart", children, accent = false }) {
  return (
    <div className="mock-window" style={{
      background: 'white',
      borderRadius: 20,
      boxShadow: '0 30px 80px rgba(81,75,238,0.22), 0 8px 24px rgba(15,15,26,0.10), inset 0 0 0 1px rgba(15,15,26,0.05)',
      overflow: 'hidden',
      width: '100%',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        height: 40, padding: '0 14px',
        borderBottom: '1px solid var(--border)',
        background: '#FAFAFC',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
        </div>
        <div style={{
          flex: 1, display: 'flex', justifyContent: 'center',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '4px 12px', background: 'white',
            border: '1px solid var(--border)', borderRadius: 8,
            fontSize: 11, color: 'var(--ink-70)',
          }}>
            <span style={{ color: 'var(--success)', fontSize: 9 }}>●</span>
            {title}
          </div>
        </div>
        {accent && <span className="chip chip-green" style={{ height: 22, fontSize: 10 }}>● CANLI</span>}
      </div>
      {children}
    </div>
  );
}

export function Sidebar({ active = 'Komuta' }) {
  const items = [
    { name: 'Komuta', icon: '▦' },
    { name: 'Kârlılık', icon: '⟋' },
    { name: 'Stok', icon: '▤' },
    { name: 'Rekabet', icon: '◎' },
    { name: 'Rapor', icon: '☰' },
    { name: 'AI', icon: '✦' },
  ];
  return (
    <div style={{
      width: 168,
      background: '#FAFAFC',
      borderRight: '1px solid var(--border)',
      padding: '16px 10px',
      display: 'flex', flexDirection: 'column', gap: 4,
      fontSize: 13,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 16px' }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: 'linear-gradient(135deg, var(--brand), var(--brand-light))',
          display: 'grid', placeItems: 'center',
          color: 'white', fontWeight: 700, fontSize: 12,
        }}>G</div>
        <span style={{ fontWeight: 600, fontSize: 13 }}>Gilan Smart</span>
      </div>
      {items.map(it => (
        <div key={it.name} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 8,
          background: active === it.name ? 'white' : 'transparent',
          boxShadow: active === it.name ? '0 1px 3px rgba(15,15,26,0.06)' : 'none',
          color: active === it.name ? 'var(--brand)' : 'var(--ink-70)',
          fontWeight: active === it.name ? 600 : 500,
        }}>
          <span style={{ fontSize: 13, width: 14, textAlign: 'center' }}>{it.icon}</span>
          {it.name}
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{
        padding: 10, fontSize: 11, color: 'var(--ink-50)',
        borderTop: '1px solid var(--border)', marginTop: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
          12 kanal bağlı
        </div>
      </div>
    </div>
  );
}

/* ---------- Dashboard (Komuta Merkezi) ---------- */
export function DashboardMock({ animate = false }) {
  const kpis = [
    { label: 'Brüt Ciro', value: '₺2.847.320', delta: '+12.4%', positive: true },
    { label: 'Net Kâr', value: '₺487.640', delta: '+8.1%', positive: true, highlight: true },
    { label: 'Net Marj', value: '%17.1', delta: '+0.4 pt', positive: true },
    { label: 'İade Oranı', value: '%8.2', delta: '-1.1 pt', positive: true },
  ];
  return (
    <WindowChrome title="gilansmart.app — Komuta Merkezi" accent>
      <div style={{ display: 'flex', height: 440 }}>
        <Sidebar active="Komuta" />
        <div style={{ flex: 1, padding: 20, background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--ink-50)', letterSpacing: '0.04em' }}>KOMUTA MERKEZİ · 24 NİSAN</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2, letterSpacing: '-0.01em' }}>Günaydın, gün iyi gidiyor.</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="chip chip-neutral" style={{ height: 26, fontSize: 11 }}>Son 30 gün</span>
              <span className="chip" style={{ height: 26, fontSize: 11 }}>Tüm kanallar</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
            {kpis.map((k, i) => (
              <div key={k.label} style={{
                padding: 12,
                borderRadius: 12,
                background: k.highlight ? 'linear-gradient(135deg, rgba(81,75,238,0.07), rgba(245,229,139,0.12))' : '#FAFAFC',
                border: k.highlight ? '1px solid rgba(81,75,238,0.25)' : '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 10, color: 'var(--ink-50)', marginBottom: 4, letterSpacing: '0.02em' }}>{k.label}</div>
                <div className="kpi-num" style={{ fontSize: 18, color: k.highlight ? 'var(--brand)' : 'var(--ink)' }}>
                  <CountUp text={k.value} animate={animate} delay={i * 120} />
                </div>
                <div style={{
                  fontSize: 10, marginTop: 4, fontWeight: 600,
                  color: k.positive ? 'var(--success)' : 'var(--danger)',
                }}>
                  {k.delta}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 10, height: 248 }}>
            <div style={{
              padding: 14, borderRadius: 12, border: '1px solid var(--border)',
              background: 'white', display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Satış & Kâr</div>
                <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--ink-50)' }}>
                  <span>• Ciro</span>
                  <span style={{ color: 'var(--brand)' }}>• Net kâr</span>
                </div>
              </div>
              <TrendChart animate={animate} />
            </div>
            <div style={{
              padding: 14, borderRadius: 12, border: '1px solid var(--border)',
              background: 'white',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Kanal Kırılımı</div>
              <ChannelBars animate={animate} />
            </div>
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

export function CountUp({ text, animate, delay = 0 }) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!animate) { setDisplay(text); return; }
    const m = text.match(/^([^\d\-]*)([-\d.,]+)(.*)$/);
    if (!m) return;
    const [, pre, numStr, suf] = m;
    const isPct = pre.includes('%') || suf.includes('%');
    const hasSep = numStr.includes('.');
    const target = parseFloat(numStr.replace(/\./g, '').replace(',', '.'));
    if (isNaN(target)) return;
    let start = 0;
    const t0 = performance.now() + delay;
    const dur = 1100;
    let raf;
    const tick = (t) => {
      if (t < t0) { raf = requestAnimationFrame(tick); return; }
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(target * eased * (hasSep ? 1 : 100)) / (hasSep ? 1 : 100);
      const formatted = hasSep ? Math.round(v).toLocaleString('tr-TR') : v.toFixed(1).replace('.', ',');
      setDisplay(`${pre}${formatted}${suf}`);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDisplay(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, text, delay]);
  return <span>{display}</span>;
}

export function TrendChart({ animate }) {
  const points = [20, 28, 24, 35, 32, 48, 44, 58, 52, 68, 64, 78];
  const profit = [12, 14, 13, 18, 16, 24, 22, 30, 28, 38, 34, 44];
  const w = 340, h = 180, pad = 8;
  const step = (w - pad * 2) / (points.length - 1);
  const max = 80;
  const toPath = (arr) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${pad + i * step} ${h - pad - (v / max) * (h - pad * 2)}`).join(' ');
  const toArea = (arr) => `${toPath(arr)} L ${pad + (arr.length - 1) * step} ${h - pad} L ${pad} ${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="ciroGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F0F1A" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0F0F1A" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="kaarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#514BEE" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#514BEE" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map(i => (
        <line key={i} x1={pad} x2={w - pad} y1={pad + ((h - pad * 2) / 3) * i} y2={pad + ((h - pad * 2) / 3) * i}
              stroke="#EEEEF3" strokeDasharray="2 4" />
      ))}
      <path d={toArea(points)} fill="url(#ciroGrad)" />
      <path d={toPath(points)} fill="none" stroke="#0F0F1A" strokeWidth="1.5"
            strokeDasharray={animate ? '500' : '0'} strokeDashoffset={animate ? '500' : '0'}
            style={{ animation: animate ? 'drawStroke 1.4s 0.3s var(--ease-out-expo) forwards' : 'none' }} />
      <path d={toArea(profit)} fill="url(#kaarGrad)" />
      <path d={toPath(profit)} fill="none" stroke="#514BEE" strokeWidth="2"
            strokeDasharray={animate ? '500' : '0'} strokeDashoffset={animate ? '500' : '0'}
            style={{ animation: animate ? 'drawStroke 1.4s 0.5s var(--ease-out-expo) forwards' : 'none' }} />
      <circle cx={pad + (profit.length - 1) * step} cy={h - pad - (profit[profit.length - 1] / max) * (h - pad * 2)}
              r="4" fill="#514BEE" stroke="white" strokeWidth="2" />
      <style>{`@keyframes drawStroke { to { stroke-dashoffset: 0; } }`}</style>
    </svg>
  );
}

export function ChannelBars({ animate }) {
  const rows = [
    { name: 'Trendyol', brut: 92, net: 38, color: '#F27A1A' },
    { name: 'ikas', brut: 68, net: 58, color: '#514BEE' },
    { name: 'Hepsiburada', brut: 54, net: 24, color: '#FF6000' },
    { name: 'Amazon', brut: 42, net: 32, color: '#FFA41C' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map((r, i) => (
        <div key={r.name}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
            <span style={{ fontWeight: 600 }}>{r.name}</span>
            <span className="mono" style={{ color: 'var(--ink-50)' }}>%{r.net}</span>
          </div>
          <div style={{ position: 'relative', height: 16, background: '#F2F2F6', borderRadius: 4 }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: animate ? `${r.brut}%` : `${r.brut}%`,
              background: '#E8E8EF', borderRadius: 4,
              transformOrigin: 'left',
              animation: animate ? `barExpand 0.8s ${0.2 + i * 0.1}s var(--ease-out-expo) both` : 'none',
            }} />
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${r.net}%`,
              background: r.color, borderRadius: 4,
              transformOrigin: 'left',
              animation: animate ? `barExpand 0.8s ${0.4 + i * 0.1}s var(--ease-out-expo) both` : 'none',
            }} />
          </div>
        </div>
      ))}
      <style>{`@keyframes barExpand { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
    </div>
  );
}

/* ---------- Sankey P&L ---------- */
export function SankeyMock({ animate = false }) {
  return (
    <WindowChrome title="gilansmart.app — Ürün & Kârlılık" accent>
      <div style={{ display: 'flex', height: 440 }}>
        <Sidebar active="Kârlılık" />
        <div style={{ flex: 1, padding: 20, background: 'white', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-50)', letterSpacing: '0.04em' }}>KÂR AKIŞ HARİTASI · SANKEY P&L</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2, letterSpacing: '-0.01em' }}>Her ₺1'in gittiği yer.</div>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <SankeyDiagram animate={animate} />
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

export function SankeyDiagram({ animate }) {
  // Left: Ciro (100) -> right: cogs 40, ads 14, returns 8, shipping 7, commission 11, fixed 3, NET 17
  const width = 580, height = 300;
  const flows = [
    { label: 'Ürün Maliyeti', val: 40, color: '#CBCBD3', y: 30 },
    { label: 'Reklam', val: 14, color: '#DDDEE4', y: 90 },
    { label: 'İade', val: 8,  color: '#E5E6EC', y: 130 },
    { label: 'Kargo', val: 7,  color: '#EAEBEF', y: 160 },
    { label: 'Komisyon', val: 11, color: '#DCDDE3', y: 190 },
    { label: 'Sabit Gider', val: 3, color: '#EEEEF3', y: 230 },
    { label: 'NET KÂR', val: 17, color: '#514BEE', y: 260, highlight: true },
  ];
  const leftX = 30, rightX = 420;
  const leftTop = 30, leftBot = 270; // ciro bar
  let flowOffset = leftTop;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
      <defs>
        {flows.map((f, i) => (
          <linearGradient key={i} id={`fl${i}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#6B4CE8" stopOpacity="0.55" />
            <stop offset="100%" stopColor={f.highlight ? '#514BEE' : f.color} stopOpacity={f.highlight ? 0.85 : 0.6} />
          </linearGradient>
        ))}
      </defs>
      {/* Ciro bar */}
      <rect x={leftX} y={leftTop} width="14" height={leftBot - leftTop} fill="#0F0F1A" rx="2" />
      <text x={leftX - 6} y={leftTop - 6} fontSize="10" fontWeight="700" fill="#0F0F1A">CİRO</text>
      <text x={leftX - 6} y={leftBot + 14} fontSize="10" className="mono" fill="#0F0F1A">₺2.847k</text>

      {flows.map((f, i) => {
        const thickness = (f.val / 100) * (leftBot - leftTop);
        const leftY = flowOffset + thickness / 2;
        flowOffset += thickness;
        const rightY = f.y + thickness / 2;
        const d = `M ${leftX + 14} ${leftY} C ${leftX + 150} ${leftY}, ${rightX - 120} ${rightY}, ${rightX} ${rightY}`;
        return (
          <g key={i}>
            <path d={d} stroke={`url(#fl${i})`} strokeWidth={thickness} fill="none" strokeLinecap="butt"
                  style={{
                    strokeDasharray: animate ? 900 : 0,
                    strokeDashoffset: animate ? 900 : 0,
                    animation: animate ? `drawStroke 1.6s ${0.2 + i * 0.12}s var(--ease-out-expo) forwards` : 'none',
                  }} />
            <rect x={rightX} y={f.y} width="10" height={thickness} fill={f.color} rx="2" />
            <text x={rightX + 16} y={rightY + 3} fontSize="10" fill={f.highlight ? '#514BEE' : '#0F0F1A'}
                  fontWeight={f.highlight ? 700 : 500}>{f.label}</text>
            <text x={rightX + 16} y={rightY + 15} fontSize="9" className="mono"
                  fill={f.highlight ? '#514BEE' : 'var(--ink-50)'}
                  fontWeight={f.highlight ? 700 : 400}>%{f.val}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- AI Asistan ---------- */
export function AIAssistantMock({ animate = false }) {
  const [typed, setTyped] = useState('');
  const fullAnswer = "Evet. Kargo gideri son 14 günde %18 arttı, buna karşılık ortalama sepet büyüklüğü aynı kaldı. En büyük kayıp: Trendyol'da 34 sipariş, desi-ağırlık uyumsuzluğu.";
  useEffect(() => {
    if (!animate) { setTyped(fullAnswer); return; }
    let i = 0;
    const t0 = setTimeout(() => {
      const t = setInterval(() => {
        i++;
        setTyped(fullAnswer.slice(0, i));
        if (i >= fullAnswer.length) clearInterval(t);
      }, 16);
    }, 1400);
    return () => clearTimeout(t0);
  }, [animate]);

  return (
    <WindowChrome title="gilansmart.app — FinOps Co-Pilot" accent>
      <div style={{ display: 'flex', height: 440 }}>
        <Sidebar active="AI" />
        <div style={{ flex: 1, padding: 20, background: '#FAFAFC', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span className="tag-ai">✦ FinOps Co-Pilot</span>
            <span style={{ fontSize: 11, color: 'var(--ink-50)' }}>Verinize doğrudan bağlı</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflow: 'hidden' }}>
            {/* User msg */}
            <div style={{ alignSelf: 'flex-end', maxWidth: '70%' }}>
              <div style={{
                background: 'var(--brand)', color: 'white',
                padding: '10px 14px', borderRadius: '18px 18px 4px 18px',
                fontSize: 13, lineHeight: 1.4,
              }}>
                Bu ay kargoda kâr kaybımız var mı?
              </div>
            </div>
            {/* Bot msg */}
            <div style={{ alignSelf: 'flex-start', maxWidth: '82%' }}>
              <div style={{
                background: 'white', color: 'var(--ink)',
                padding: '12px 14px', borderRadius: '18px 18px 18px 4px',
                fontSize: 13, lineHeight: 1.55,
                border: '1px solid var(--border)',
              }}>
                {typed}
                {animate && typed.length < fullAnswer.length && (
                  <span style={{ display: 'inline-block', width: 6, height: 14, background: 'var(--brand)', verticalAlign: 'middle', marginLeft: 2, animation: 'blink 1s infinite' }} />
                )}
              </div>
              {typed.length > 40 && (
                <div style={{
                  marginTop: 8, padding: 12, background: 'white', borderRadius: 12,
                  border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
                  animation: animate ? 'fadeUp 0.6s var(--ease-out-expo)' : 'none',
                }}>
                  <MiniStat label="Kargo Δ" val="+%18" tone="danger" />
                  <MiniStat label="Etki" val="-₺24.6k" tone="danger" />
                  <MiniStat label="Trendyol kanalı" val="34 sipariş" tone="neutral" />
                </div>
              )}
            </div>
          </div>

          <div style={{
            marginTop: 12, padding: '10px 14px',
            background: 'white', borderRadius: 14, border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink-50)',
          }}>
            <span style={{ color: 'var(--brand)' }}>✦</span>
            Sorunuzu yazın...
            <div style={{ flex: 1 }} />
            <span className="chip chip-neutral" style={{ fontSize: 10 }}>⏎</span>
          </div>
          <style>{`
            @keyframes blink { 50% { opacity: 0; } }
            @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } }
          `}</style>
        </div>
      </div>
    </WindowChrome>
  );
}

export function MiniStat({ label, val, tone = 'neutral' }) {
  const colors = {
    danger: 'var(--danger)',
    success: 'var(--success)',
    neutral: 'var(--ink)',
  };
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--ink-50)', marginBottom: 2 }}>{label}</div>
      <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: colors[tone] }}>{val}</div>
    </div>
  );
}

/* export */
Object.assign(window, {
  WindowChrome, Sidebar, DashboardMock, SankeyMock, AIAssistantMock, CountUp,
});



// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;height:22px;
    border-radius:6px;cursor:default;padding:0}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  const setTweak = React.useCallback((key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*');
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
export function TweaksPanel({ title = 'Tweaks', children }) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({ x: 16, y: 16 });
  const PAD = 16;

  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y)),
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);

  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);

  React.useEffect(() => {
    const onMsg = (e) => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);
      else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  };

  const onDragStart = (e) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy),
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  if (!open) return null;
  return (
    <>
      <style>{__TWEAKS_STYLE}</style>
      <div ref={dragRef} className="twk-panel"
           style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}>
        <div className="twk-hd" onMouseDown={onDragStart}>
          <b>{title}</b>
          <button className="twk-x" aria-label="Close tweaks"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={dismiss}>✕</button>
        </div>
        <div className="twk-body">{children}</div>
      </div>
    </>
  );
}

// ── Layout helpers ──────────────────────────────────────────────────────────

export function TweakSection({ label, children }) {
  return (
    <>
      <div className="twk-sect">{label}</div>
      {children}
    </>
  );
}

export function TweakRow({ label, value, children, inline = false }) {
  return (
    <div className={inline ? 'twk-row twk-row-h' : 'twk-row'}>
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Controls ────────────────────────────────────────────────────────────────

export function TweakSlider({ label, value, min = 0, max = 100, step = 1, unit = '', onChange }) {
  return (
    <TweakRow label={label} value={`${value}${unit}`}>
      <input type="range" className="twk-slider" min={min} max={max} step={step}
             value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </TweakRow>
  );
}

export function TweakToggle({ label, value, onChange }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <button type="button" className="twk-toggle" data-on={value ? '1' : '0'}
              role="switch" aria-checked={!!value}
              onClick={() => onChange(!value)}><i /></button>
    </div>
  );
}

export function TweakRadio({ label, value, options, onChange }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const opts = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  const idx = Math.max(0, opts.findIndex((o) => o.value === value));
  const n = opts.length;

  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  const segAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor(((clientX - r.left - 2) / inner) * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };

  const onPointerDown = (e) => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = (ev) => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <TweakRow label={label}>
      <div ref={trackRef} role="radiogroup" onPointerDown={onPointerDown}
           className={dragging ? 'twk-seg dragging' : 'twk-seg'}>
        <div className="twk-seg-thumb"
             style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
                      width: `calc((100% - 4px) / ${n})` }} />
        {opts.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value}>
            {o.label}
          </button>
        ))}
      </div>
    </TweakRow>
  );
}

export function TweakSelect({ label, value, options, onChange }) {
  return (
    <TweakRow label={label}>
      <select className="twk-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const v = typeof o === 'object' ? o.value : o;
          const l = typeof o === 'object' ? o.label : o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </TweakRow>
  );
}

export function TweakText({ label, value, placeholder, onChange }) {
  return (
    <TweakRow label={label}>
      <input className="twk-field" type="text" value={value} placeholder={placeholder}
             onChange={(e) => onChange(e.target.value)} />
    </TweakRow>
  );
}

export function TweakNumber({ label, value, min, max, step = 1, unit = '', onChange }) {
  const clamp = (n) => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({ x: 0, val: 0 });
  const onScrubStart = (e) => {
    e.preventDefault();
    startRef.current = { x: e.clientX, val: value };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = (ev) => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <div className="twk-num">
      <span className="twk-num-lbl" onPointerDown={onScrubStart}>{label}</span>
      <input type="number" value={value} min={min} max={max} step={step}
             onChange={(e) => onChange(clamp(Number(e.target.value)))} />
      {unit && <span className="twk-num-unit">{unit}</span>}
    </div>
  );
}

export function TweakColor({ label, value, onChange }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <input type="color" className="twk-swatch" value={value}
             onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function TweakButton({ label, onClick, secondary = false }) {
  return (
    <button type="button" className={secondary ? 'twk-btn secondary' : 'twk-btn'}
            onClick={onClick}>{label}</button>
  );
}

Object.assign(window, {
  useTweaks, TweaksPanel, TweakSection, TweakRow,
  TweakSlider, TweakToggle, TweakRadio, TweakSelect,
  TweakText, TweakNumber, TweakColor, TweakButton,
});


