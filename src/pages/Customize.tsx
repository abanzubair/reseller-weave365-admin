import { useState, useEffect } from 'react';
import {
  Save,
  Check,
  ExternalLink,
  Video,
  Image as ImageIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Palette,
  ShieldCheck,
  MessageCircle,
  Eye,
  RefreshCw,
  Sliders,
  Compass,
} from 'lucide-react';
import {
  useAdminTenant,
  StorefrontConfig,
  StorefrontHero,
  StorefrontNavLink,
  StorefrontAnnouncement,
  StorefrontTrustBadges,
} from '../lib/AdminTenantContext';

// Curated Royalty-free / Editorial Presets for Resellers
const VIDEO_PRESETS = [
  {
    name: 'Artisan Jacquard Shuttle Loom',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-woman-weaving-on-a-loom-42867-large.mp4',
    poster: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=80',
    description: 'Rhythmic traditional shuttle weaving threads into intricate silk.',
  },
  {
    name: 'Golden Zari Warp & Spindle',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-loom-weaving-threads-42866-large.mp4',
    poster: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    description: 'Mesmerizing close-up of metallic zari threads intertwining on loom.',
  },
  {
    name: 'Vibrant Silk Yarn Spools',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-spools-of-colored-thread-at-a-textile-factory-42864-large.mp4',
    poster: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80',
    description: 'Rich jewel-toned Mulberry silk thread spinning and winding.',
  },
];

const IMAGE_PRESETS = [
  {
    name: 'Katan Silk Kadwa Floral Jaal',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=85',
    description: 'Royal crimson gold brocade drape with handcrafted floral motifs.',
  },
  {
    name: 'Korvai Temple Border Heritage',
    url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=2000&q=85',
    description: 'High-contrast interlocked temple borders in pure mulberry silk.',
  },
  {
    name: 'Varanasi Master Weaver Loom',
    url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=2000&q=85',
    description: 'Atmospheric weaver workshop with golden sunlight touching the loom.',
  },
  {
    name: 'Sindoor Red & Antique Zari Bridal',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=2000&q=85',
    description: 'Opulent bridal drape with antique electroplated gold zari pallu.',
  },
];

const DEFAULT_NAV_LINKS: StorefrontNavLink[] = [
  { id: '1', label: 'Home', url: '/', is_active: true },
  { id: '2', label: 'Saree Vault', url: '#catalog', is_active: true },
  { id: '3', label: 'Artisan Looms', url: '#heritage', is_active: true },
  { id: '4', label: 'Track Order', url: '#track', is_active: true },
  { id: '5', label: 'VIP Concierge', url: '#contact', is_active: true },
];

const COLOR_PRESETS = [
  { name: 'Varanasi Gold', hex: '#d97706' },
  { name: 'Sindoor Maroon', hex: '#991b1b' },
  { name: 'Peacock Emerald', hex: '#047857' },
  { name: 'Regal Indigo', hex: '#3730a3' },
  { name: 'Rani Gulabi', hex: '#be185d' },
];

export default function Customize() {
  const { tenant, updateStorefrontConfig, getStorefrontUrl } = useAdminTenant();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'hero' | 'nav' | 'accents'>('hero');

  // Hero form state
  const [hero, setHero] = useState<StorefrontHero>({
    type: 'video',
    url: VIDEO_PRESETS[0].url,
    poster_url: VIDEO_PRESETS[0].poster,
    badge: 'Direct From Varanasi Master Looms',
    headline: 'Timeless Elegance Woven in Pure Gold & Silk',
    subtitle: 'Exquisite handwoven Banarasi & Kanjivaram treasures directly crafted by generation-old artisan clusters.',
    primary_cta_text: 'Explore Saree Vault',
    primary_cta_link: '#catalog',
    secondary_cta_text: 'Artisan Heritage',
    secondary_cta_link: '#heritage',
  });

  // Nav links state
  const [navLinks, setNavLinks] = useState<StorefrontNavLink[]>(DEFAULT_NAV_LINKS);

  // Announcement state
  const [announcement, setAnnouncement] = useState<StorefrontAnnouncement>({
    enabled: true,
    text: '✨ Complimentary Insured Express Shipping on All Pure Silk Orders Above ₹15,000',
    link: '#catalog',
  });

  // Accent color state
  const [accentColor, setAccentColor] = useState<string>('#d97706');

  // Trust Badges state
  const [trustBadges, setTrustBadges] = useState<StorefrontTrustBadges>({
    show_silk_mark: true,
    show_tested_zari: true,
    show_handloom_certified: true,
    show_direct_artisan: true,
  });

  // WhatsApp concierge greeting state
  const [whatsappGreeting, setWhatsappGreeting] = useState<string>(
    'Namaste! I am exploring your handloom collection on your boutique store and would love personalized assistance.'
  );

  // Status & Feedback
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize from tenant config
  useEffect(() => {
    if (tenant?.config) {
      const cfg = tenant.config;
      if (cfg.hero) {
        setHero((prev) => ({
          ...prev,
          ...cfg.hero,
        }));
      } else if (tenant.banner_url) {
        setHero((prev) => ({
          ...prev,
          type: 'image',
          url: tenant.banner_url || prev.url,
          subtitle: tenant.tagline || prev.subtitle,
        }));
      }

      if (cfg.nav_links && cfg.nav_links.length > 0) {
        setNavLinks(cfg.nav_links);
      }

      if (cfg.announcement) {
        setAnnouncement(cfg.announcement);
      }

      if (cfg.accent_color || tenant.accent_color) {
        setAccentColor(cfg.accent_color || tenant.accent_color || '#d97706');
      }

      if (cfg.trust_badges) {
        setTrustBadges(cfg.trust_badges);
      }

      if (cfg.whatsapp_greeting) {
        setWhatsappGreeting(cfg.whatsapp_greeting);
      }
    } else if (tenant?.banner_url) {
      setHero((prev) => ({
        ...prev,
        type: 'image',
        url: tenant.banner_url || prev.url,
        subtitle: tenant.tagline || prev.subtitle,
      }));
    }
  }, [tenant]);

  // Nav link operations
  const handleAddLink = () => {
    const newId = Date.now().toString();
    setNavLinks((prev) => [
      ...prev,
      { id: newId, label: 'Custom Collection', url: '#collection', is_active: true },
    ]);
  };

  const handleUpdateLink = (id: string, updates: Partial<StorefrontNavLink>) => {
    setNavLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveLink = (id: string) => {
    setNavLinks((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMoveLink = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= navLinks.length) return;
    const copy = [...navLinks];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setNavLinks(copy);
  };

  const handleResetDefaultNav = () => {
    setNavLinks(DEFAULT_NAV_LINKS);
  };

  // Submit Save
  const handleSaveAll = async () => {
    setSaving(true);
    setErrorMsg(null);

    const fullConfig: StorefrontConfig = {
      hero,
      nav_links: navLinks,
      announcement,
      accent_color: accentColor,
      trust_badges: trustBadges,
      whatsapp_greeting: whatsappGreeting,
    };

    const res = await updateStorefrontConfig(fullConfig);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setErrorMsg(res.error || 'Failed to update storefront configuration');
    }
    setSaving(false);
  };

  const storefrontUrl = getStorefrontUrl();

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-white/[0.07]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              STOREFRONT STUDIO
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mt-1">
            Storefront Customizer
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Configure your boutique's hero visual experience (video or photography), navigation architecture, and luxury Indian aesthetics.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <a
            href={storefrontUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-white/[0.04] hover:bg-zinc-200 dark:hover:bg-white/[0.08] border border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors flex items-center space-x-2"
          >
            <span>Preview Store</span>
            <ExternalLink size={14} />
          </a>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-semibold text-xs rounded-xl transition-colors inline-flex items-center space-x-2 shadow-sm disabled:opacity-50"
          >
            {saved ? (
              <>
                <Check size={16} />
                <span>Published</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>{saving ? 'Publishing...' : 'Publish to Storefront'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex space-x-2 border-b border-zinc-200 dark:border-white/[0.07] pb-1">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2.5 rounded-lg text-xs font-medium flex items-center space-x-2 transition-colors ${
            activeTab === 'hero'
              ? 'bg-zinc-200 dark:bg-white/[0.08] text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Video size={16} className={activeTab === 'hero' ? 'text-amber-500' : ''} />
          <span>Hero Media & Copy</span>
        </button>

        <button
          onClick={() => setActiveTab('nav')}
          className={`px-4 py-2.5 rounded-lg text-xs font-medium flex items-center space-x-2 transition-colors ${
            activeTab === 'nav'
              ? 'bg-zinc-200 dark:bg-white/[0.08] text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Compass size={16} className={activeTab === 'nav' ? 'text-amber-500' : ''} />
          <span>Navigation Links</span>
        </button>

        <button
          onClick={() => setActiveTab('accents')}
          className={`px-4 py-2.5 rounded-lg text-xs font-medium flex items-center space-x-2 transition-colors ${
            activeTab === 'accents'
              ? 'bg-zinc-200 dark:bg-white/[0.08] text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Sliders size={16} className={activeTab === 'accents' ? 'text-amber-500' : ''} />
          <span>Accents, Announcement & Badges</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left / Main Configuration Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: HERO CONFIGURATION */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              {/* Media Type Switcher */}
              <div className="p-5 bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.07] rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Hero Media Mode</h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Choose dynamic looping loom video or high-definition editorial photography.
                    </p>
                  </div>
                  <div className="flex bg-zinc-100 dark:bg-white/[0.04] p-1 rounded-xl border border-zinc-200 dark:border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setHero((prev) => ({ ...prev, type: 'video' }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors ${
                        hero.type === 'video'
                          ? 'bg-white dark:bg-white/[0.12] text-amber-600 dark:text-amber-400 shadow-sm'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      <Video size={14} />
                      <span>Video Loop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHero((prev) => ({ ...prev, type: 'image' }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors ${
                        hero.type === 'image'
                          ? 'bg-white dark:bg-white/[0.12] text-amber-600 dark:text-amber-400 shadow-sm'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      <ImageIcon size={14} />
                      <span>High-Res Photo</span>
                    </button>
                  </div>
                </div>

                {/* Preset Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center space-x-1.5">
                      <Sparkles size={13} className="text-amber-500" />
                      <span>Curated Handloom Presets (1-Click Apply)</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {hero.type === 'video'
                      ? VIDEO_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setHero((prev) => ({
                                ...prev,
                                url: p.url,
                                poster_url: p.poster,
                              }))
                            }
                            className={`p-3 text-left rounded-xl border transition-all ${
                              hero.url === p.url
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200'
                                : 'bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.12]'
                            }`}
                          >
                            <div className="font-semibold text-xs truncate">{p.name}</div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                              {p.description}
                            </div>
                          </button>
                        ))
                      : IMAGE_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setHero((prev) => ({
                                ...prev,
                                url: p.url,
                              }))
                            }
                            className={`p-3 text-left rounded-xl border transition-all ${
                              hero.url === p.url
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200'
                                : 'bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.12]'
                            }`}
                          >
                            <div className="font-semibold text-xs truncate">{p.name}</div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                              {p.description}
                            </div>
                          </button>
                        ))}
                  </div>
                </div>

                {/* Custom URL Input */}
                <div className="pt-2 border-t border-zinc-200 dark:border-white/[0.06] space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {hero.type === 'video' ? 'Direct Video URL (MP4 / WebM)' : 'Direct Image URL'}
                    </label>
                    <input
                      type="url"
                      value={hero.url || ''}
                      onChange={(e) => setHero((prev) => ({ ...prev, url: e.target.value }))}
                      placeholder={
                        hero.type === 'video'
                          ? 'https://example.com/loom-video.mp4'
                          : 'https://images.unsplash.com/...'
                      }
                      className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.08] rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {hero.type === 'video' && (
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Poster Image URL (Placeholder before video starts)
                      </label>
                      <input
                        type="url"
                        value={hero.poster_url || ''}
                        onChange={(e) => setHero((prev) => ({ ...prev, poster_url: e.target.value }))}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.08] rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Copywriting & Headings */}
              <div className="p-5 bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.07] rounded-2xl space-y-4 shadow-sm">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Hero Copywriting</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Customize your boutique's core message, heritage kicker, and storytelling subtitle.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Kicker / Eyebrow Badge
                    </label>
                    <input
                      type="text"
                      value={hero.badge || ''}
                      onChange={(e) => setHero((prev) => ({ ...prev, badge: e.target.value }))}
                      placeholder="e.g. Master Looms of Varanasi • Pure Katan Silk"
                      className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Main Headline
                    </label>
                    <input
                      type="text"
                      value={hero.headline || ''}
                      onChange={(e) => setHero((prev) => ({ ...prev, headline: e.target.value }))}
                      placeholder="e.g. Timeless Elegance Woven in Gold & Pure Silk"
                      className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Story Subtitle / Description
                    </label>
                    <textarea
                      rows={3}
                      value={hero.subtitle || ''}
                      onChange={(e) => setHero((prev) => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Tell the story of the weavers, zari work, or legacy..."
                      className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>
                </div>

                {/* Call To Action Buttons */}
                <div className="pt-3 border-t border-zinc-200 dark:border-white/[0.06] space-y-3">
                  <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Call To Action (CTA) Buttons
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Primary CTA Text
                      </label>
                      <input
                        type="text"
                        value={hero.primary_cta_text || ''}
                        onChange={(e) => setHero((prev) => ({ ...prev, primary_cta_text: e.target.value }))}
                        placeholder="Explore Saree Vault"
                        className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Primary CTA Target Link
                      </label>
                      <input
                        type="text"
                        value={hero.primary_cta_link || ''}
                        onChange={(e) => setHero((prev) => ({ ...prev, primary_cta_link: e.target.value }))}
                        placeholder="#catalog or /catalog"
                        className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.08] rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Secondary CTA Text
                      </label>
                      <input
                        type="text"
                        value={hero.secondary_cta_text || ''}
                        onChange={(e) => setHero((prev) => ({ ...prev, secondary_cta_text: e.target.value }))}
                        placeholder="Artisan Heritage"
                        className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Secondary CTA Target Link
                      </label>
                      <input
                        type="text"
                        value={hero.secondary_cta_link || ''}
                        onChange={(e) => setHero((prev) => ({ ...prev, secondary_cta_link: e.target.value }))}
                        placeholder="#heritage or /heritage"
                        className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.08] rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NAVIGATION LINKS */}
          {activeTab === 'nav' && (
            <div className="space-y-6">
              <div className="p-5 bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.07] rounded-2xl space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Storefront Navigation Links
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Define menu tabs displayed on top of your customer-facing boutique. Reorder with one click.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleResetDefaultNav}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors flex items-center space-x-1.5"
                    >
                      <RefreshCw size={12} />
                      <span>Reset Standard Links</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-950 text-[11px] font-semibold transition-colors flex items-center space-x-1"
                    >
                      <Plus size={13} />
                      <span>Add Link</span>
                    </button>
                  </div>
                </div>

                {/* Links list */}
                <div className="space-y-2.5 pt-2">
                  {navLinks.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-3 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-200 dark:border-white/[0.06] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Drag / Move controls */}
                      <div className="flex items-center space-x-2">
                        <div className="flex flex-col space-y-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveLink(index, 'up')}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={index === navLinks.length - 1}
                            onClick={() => handleMoveLink(index, 'down')}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>

                        {/* Status toggle checkbox */}
                        <input
                          type="checkbox"
                          checked={item.is_active}
                          onChange={(e) => handleUpdateLink(item.id, { is_active: e.target.checked })}
                          className="h-4 w-4 rounded border-zinc-300 dark:border-white/[0.1] text-amber-500 focus:ring-amber-400"
                        />
                      </div>

                      {/* Fields */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => handleUpdateLink(item.id, { label: e.target.value })}
                            placeholder="Link Title (e.g. Sarees)"
                            className="w-full px-3 py-1.5 bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={item.url}
                            onChange={(e) => handleUpdateLink(item.id, { url: e.target.value })}
                            placeholder="Target URL (#catalog, /custom)"
                            className="w-full px-3 py-1.5 bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(item.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors self-end sm:self-center"
                        title="Delete Link"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  {navLinks.length === 0 && (
                    <div className="p-6 text-center text-xs text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-200 dark:border-white/[0.08] rounded-xl">
                      No custom navigation links configured yet. Click "Reset Standard Links" to restore default presets.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACCENTS & BOUTIQUE PERFECTION */}
          {activeTab === 'accents' && (
            <div className="space-y-6">
              {/* Top Announcement Bar */}
              <div className="p-5 bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.07] rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Top Announcement Bar
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Highlight promotions, complimentary shipping thresholds, or festival dates.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={announcement.enabled}
                      onChange={(e) =>
                        setAnnouncement((prev) => ({ ...prev, enabled: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-amber-400"></div>
                  </label>
                </div>

                {announcement.enabled && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Announcement Ticker Text
                      </label>
                      <input
                        type="text"
                        value={announcement.text}
                        onChange={(e) =>
                          setAnnouncement((prev) => ({ ...prev, text: e.target.value }))
                        }
                        placeholder="e.g. ✨ Free Insured Courier on All Handloom Sarees"
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Optional Banner Link
                      </label>
                      <input
                        type="text"
                        value={announcement.link || ''}
                        onChange={(e) =>
                          setAnnouncement((prev) => ({ ...prev, link: e.target.value }))
                        }
                        placeholder="#catalog or https://..."
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.08] rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Indian Luxury Color Palette */}
              <div className="p-5 bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.07] rounded-2xl space-y-4 shadow-sm">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
                    <Palette size={16} className="text-amber-500" />
                    <span>Brand Accent Color</span>
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Colors inspired by traditional Indian silk dyes and antique zari brocades.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setAccentColor(preset.hex)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-xl border transition-all text-xs font-medium ${
                        accentColor.toLowerCase() === preset.hex.toLowerCase()
                          ? 'border-amber-500 bg-amber-500/10 text-zinc-900 dark:text-zinc-100 shadow-sm'
                          : 'border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.02] text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                  <div className="flex items-center space-x-2 pl-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-24 px-2 py-1 text-xs font-mono uppercase bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.08] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Authenticity Trust Badges */}
              <div className="p-5 bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.07] rounded-2xl space-y-4 shadow-sm">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span>Heritage Authenticity Badges</span>
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Reinforce customer trust with verifiable certification markers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center space-x-3 p-3 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-200 dark:border-white/[0.06] rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trustBadges.show_silk_mark}
                      onChange={(e) =>
                        setTrustBadges((prev) => ({ ...prev, show_silk_mark: e.target.checked }))
                      }
                      className="h-4 w-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Silk Mark Certified</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">100% Pure Natural Silk</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-200 dark:border-white/[0.06] rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trustBadges.show_tested_zari}
                      onChange={(e) =>
                        setTrustBadges((prev) => ({ ...prev, show_tested_zari: e.target.checked }))
                      }
                      className="h-4 w-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Tested Zari Guarantee</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Electroplated Metallic Zari</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-200 dark:border-white/[0.06] rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trustBadges.show_handloom_certified}
                      onChange={(e) =>
                        setTrustBadges((prev) => ({ ...prev, show_handloom_certified: e.target.checked }))
                      }
                      className="h-4 w-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Handloom Registered</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Pitloom & Jacquard Handcraft</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-200 dark:border-white/[0.06] rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trustBadges.show_direct_artisan}
                      onChange={(e) =>
                        setTrustBadges((prev) => ({ ...prev, show_direct_artisan: e.target.checked }))
                      }
                      className="h-4 w-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Fair Trade Artisan Direct</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Supporting Varanasi Weavers</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* WhatsApp Concierge Greeting Template */}
              <div className="p-5 bg-white dark:bg-[#111216] border border-zinc-200 dark:border-white/[0.07] rounded-2xl space-y-4 shadow-sm">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
                    <MessageCircle size={16} className="text-emerald-500" />
                    <span>WhatsApp Concierge Pre-Filled Message</span>
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    The initial greeting automatically populated when a shopper initiates WhatsApp concierge assistance.
                  </p>
                </div>

                <div>
                  <textarea
                    rows={3}
                    value={whatsappGreeting}
                    onChange={(e) => setWhatsappGreeting(e.target.value)}
                    placeholder="Namaste! I am exploring your handloom collection..."
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-[#090a0c] border border-zinc-300 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500 resize-none"
                  />
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    When patrons tap WhatsApp on your storefront, this text automatically opens in their WhatsApp app.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Interactive Storefront Mockup Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center space-x-1.5">
                <Eye size={14} className="text-amber-500" />
                <span>Live Viewport Preview</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                Synchronized
              </span>
            </div>

            {/* Mockup Frame */}
            <div className="rounded-2xl overflow-hidden border border-zinc-300 dark:border-white/[0.12] bg-zinc-950 shadow-2xl">
              {/* Browser bar */}
              <div className="px-3.5 py-2 bg-zinc-900 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-[10px] font-mono text-zinc-400 truncate max-w-[200px]">
                  {tenant?.slug}.weave365.com
                </div>
                <div className="w-8" />
              </div>

              {/* Mock Storefront Container */}
              <div className="relative bg-zinc-900 text-white min-h-[460px] flex flex-col justify-between select-none">
                {/* 1. Announcement bar */}
                {announcement.enabled && announcement.text && (
                  <div
                    className="text-[10px] text-center py-1.5 px-3 font-medium tracking-wide truncate border-b border-white/10"
                    style={{ backgroundColor: accentColor, color: '#ffffff' }}
                  >
                    {announcement.text}
                  </div>
                )}

                {/* 2. Mock Header */}
                <div className="px-4 py-3 bg-zinc-950/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-10">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: accentColor, color: '#ffffff' }}
                    >
                      {tenant?.store_name?.[0] || 'W'}
                    </div>
                    <span className="font-semibold text-xs tracking-tight text-white truncate max-w-[110px]">
                      {tenant?.store_name || 'Boutique Store'}
                    </span>
                  </div>

                  {/* Active Nav links in mini preview */}
                  <div className="hidden sm:flex items-center space-x-2.5 text-[11px] text-zinc-300">
                    {navLinks
                      .filter((l) => l.is_active)
                      .slice(0, 3)
                      .map((l) => (
                        <span key={l.id} className="hover:text-white cursor-pointer">
                          {l.label}
                        </span>
                      ))}
                  </div>

                  <div
                    className="px-2 py-0.5 rounded text-[10px] font-semibold"
                    style={{ backgroundColor: `${accentColor}33`, color: accentColor }}
                  >
                    Catalog
                  </div>
                </div>

                {/* 3. Hero Visual Container */}
                <div className="relative flex-1 flex flex-col justify-center items-center text-center px-4 py-10 overflow-hidden">
                  {/* Media background */}
                  {hero.type === 'video' && hero.url ? (
                    <video
                      key={hero.url}
                      src={hero.url}
                      poster={hero.poster_url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover opacity-45 pointer-events-none"
                    />
                  ) : hero.url ? (
                    <img
                      key={hero.url}
                      src={hero.url}
                      alt="Hero background"
                      className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 to-zinc-950" />
                  )}

                  {/* Luxury radial gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-zinc-950/80" />

                  {/* Hero Copy overlay */}
                  <div className="relative z-10 max-w-sm space-y-2.5">
                    {hero.badge && (
                      <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase bg-white/10 backdrop-blur-sm border border-white/20 text-amber-300">
                        {hero.badge}
                      </div>
                    )}

                    <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                      {hero.headline || 'Luxury Handloom Sarees'}
                    </h3>

                    <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                      {hero.subtitle || 'Direct from the sacred weaving pitlooms of Varanasi.'}
                    </p>

                    {/* CTAs */}
                    <div className="flex items-center justify-center space-x-2 pt-1">
                      {hero.primary_cta_text && (
                        <span
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold shadow-md text-white"
                          style={{ backgroundColor: accentColor }}
                        >
                          {hero.primary_cta_text}
                        </span>
                      )}
                      {hero.secondary_cta_text && (
                        <span className="px-3 py-1.5 rounded-lg text-[11px] font-medium border border-white/30 text-white bg-white/5">
                          {hero.secondary_cta_text}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Authenticity badging footer preview */}
                <div className="px-3 py-2 bg-zinc-950/90 border-t border-white/10 text-[10px] text-zinc-400 flex items-center justify-around z-10">
                  {trustBadges.show_silk_mark && (
                    <span className="flex items-center space-x-1">
                      <Check size={10} className="text-emerald-400" />
                      <span>Silk Mark</span>
                    </span>
                  )}
                  {trustBadges.show_tested_zari && (
                    <span className="flex items-center space-x-1">
                      <Check size={10} className="text-emerald-400" />
                      <span>Tested Zari</span>
                    </span>
                  )}
                  {trustBadges.show_handloom_certified && (
                    <span className="flex items-center space-x-1">
                      <Check size={10} className="text-emerald-400" />
                      <span>Handloom Certified</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900 dark:text-amber-200">
              <span className="font-semibold">Boutique Architecture:</span> When you click "Publish", these settings are instantly distributed across all your active customer-facing storefront templates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
