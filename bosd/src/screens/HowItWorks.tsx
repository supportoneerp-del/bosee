import React, { useState, useEffect } from 'react';
import { CARA_KERJA_SECTIONS_ID, SCIENTIFIC_REFERENCES } from '../content/caraKerja.id';
import { CARA_KERJA_SECTIONS_EN } from '../content/caraKerja.en';

interface HowItWorksProps {
  lang?: 'id' | 'en';
  initialSegment?: 'kunci' | 'cara_kerja';
  targetSectionId?: string;
  onNavigateBack?: () => void;
}

export const CANDIDATE_MODELS = [
  { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash (Rekomendasi - Cepat & Akurat)' },
  { id: 'gemini-2.0-flash', label: 'gemini-2.0-flash (Alternatif Cepat)' },
  { id: 'gemini-1.5-flash', label: 'gemini-1.5-flash (Stabil & Ringan)' },
  { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro (Kualitas Penalaran Tinggi)' },
  { id: 'gemini-1.5-pro', label: 'gemini-1.5-pro (Model Pro Stabil)' },
];

export const HowItWorks: React.FC<HowItWorksProps> = ({
  lang: initialLang = 'id',
  initialSegment = 'kunci',
  targetSectionId,
  onNavigateBack
}) => {
  const [currentLang, setCurrentLang] = useState<'id' | 'en'>(initialLang);
  const [activeSegment, setActiveSegment] = useState<'kunci' | 'cara_kerja'>(initialSegment);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    masalah: true,
    cara_baca: true,
    analisis_ai: true
  });
  const [speakingSection, setSpeakingSection] = useState<string | null>(null);

  // AI Key & Model state
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);
  const [customKey, setCustomKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [savedKeyExists, setSavedKeyExists] = useState<boolean>(false);
  const [hasEnvKey, setHasEnvKey] = useState<boolean>(false);

  const sections = currentLang === 'en' ? CARA_KERJA_SECTIONS_EN : CARA_KERJA_SECTIONS_ID;

  useEffect(() => {
    try {
      const storedLang = localStorage.getItem('borascan_lang') as 'id' | 'en';
      if (storedLang) setCurrentLang(storedLang);

      const storedModel = localStorage.getItem('borascan_selected_model');
      if (storedModel) setSelectedModel(storedModel);

      const storedKey = localStorage.getItem('borascan_custom_gemini_api_key') || '';
      if (storedKey) {
        setCustomKey(storedKey);
        setSavedKeyExists(true);
      }
      const storedAiSwitch = localStorage.getItem('borascan_ai_enabled');
      if (storedAiSwitch !== null) {
        setAiEnabled(storedAiSwitch !== 'false');
      }
      const envKey = (typeof process !== 'undefined' && (process.env?.API_KEY || process.env?.GEMINI_API_KEY)) ||
                     (window as any).__BoraScanEnvApiKey || '';
      if (envKey && envKey.trim().length > 10 && !envKey.includes('Placeholder')) {
        setHasEnvKey(true);
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }

    if (targetSectionId) {
      setOpenSections(prev => ({ ...prev, [targetSectionId]: true }));
      setTimeout(() => {
        const el = document.getElementById(`section-${targetSectionId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [targetSectionId]);

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLangChange = (l: 'id' | 'en') => {
    setCurrentLang(l);
    try {
      localStorage.setItem('borascan_lang', l);
    } catch (e) {}
  };

  const handleModelChange = (m: string) => {
    setSelectedModel(m);
    try {
      localStorage.setItem('borascan_selected_model', m);
    } catch (e) {}
  };

  const speakText = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingSection === id) {
      window.speechSynthesis.cancel();
      setSpeakingSection(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLang === 'id' ? 'id-ID' : 'en-US';
    utterance.onend = () => setSpeakingSection(null);
    utterance.onerror = () => setSpeakingSection(null);
    setSpeakingSection(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveKey = () => {
    const trimmed = customKey.trim();
    if (!trimmed) {
      handleDeleteKey();
      return;
    }
    try {
      localStorage.setItem('borascan_custom_gemini_api_key', trimmed);
      setSavedKeyExists(true);
      setStatusMessage(currentLang === 'id' ? 'Kunci berhasil disimpan di perangkat ini.' : 'Key successfully saved to device.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (e) {
      setStatusMessage('Gagal menyimpan kunci.');
    }
  };

  const handleDeleteKey = () => {
    try {
      localStorage.removeItem('borascan_custom_gemini_api_key');
      setCustomKey('');
      setSavedKeyExists(false);
      setConnectionStatus('idle');
      setStatusMessage(currentLang === 'id' ? 'Kunci dihapus.' : 'Key removed.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleToggleAiSwitch = (val: boolean) => {
    setAiEnabled(val);
    try {
      localStorage.setItem('borascan_ai_enabled', String(val));
    } catch (e) {}
  };

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setStatusMessage(currentLang === 'id' ? `Menghubungi model ${selectedModel}...` : `Connecting to model ${selectedModel}...`);

    const activeKey = customKey.trim() ||
      ((typeof process !== 'undefined' && (process.env?.API_KEY || process.env?.GEMINI_API_KEY)) ||
       (window as any).__BoraScanEnvApiKey || '');

    if (!activeKey) {
      setConnectionStatus('error');
      setStatusMessage(currentLang === 'id' ? 'Tidak ada kunci untuk diuji.' : 'No API key provided to test.');
      return;
    }

    // Candidate models to attempt with auto-fallback
    const modelsToTry = [selectedModel, ...CANDIDATE_MODELS.map(m => m.id).filter(m => m !== selectedModel)];

    let lastError = '';
    for (const model of modelsToTry) {
      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(activeKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'BoraScan test. Reply OK.' }] }],
              generationConfig: { maxOutputTokens: 5 }
            })
          }
        );

        if (resp.ok) {
          handleModelChange(model);
          setConnectionStatus('connected');
          const msg = model !== selectedModel
            ? (currentLang === 'id'
                ? `✓ Model ${selectedModel} tidak tersedia. Terhubung via fallback: ${model}!`
                : `✓ Model ${selectedModel} unavailable. Connected via fallback: ${model}!`)
            : (currentLang === 'id' ? `✓ Terhubung! Model ${model} aktif.` : `✓ Connected! Model ${model} active.`);
          setStatusMessage(msg);
          return;
        }

        const errorData = await resp.json().catch(() => ({}));
        lastError = errorData.error?.message || `HTTP ${resp.status}`;
        if (resp.status === 400 && /API_KEY_INVALID|API key not valid/i.test(lastError)) {
          setConnectionStatus('error');
          setStatusMessage(currentLang === 'id' ? 'API key tidak valid.' : 'API key is invalid.');
          return;
        }
      } catch (err: any) {
        lastError = err.message || 'Koneksi gagal atau offline.';
      }
    }

    setConnectionStatus('error');
    setStatusMessage(currentLang === 'id' ? `Gagal: ${lastError}` : `Failed: ${lastError}`);
  };

  const getStatusPill = () => {
    if (!aiEnabled) {
      return { text: currentLang === 'id' ? 'AI: Dinonaktifkan' : 'AI: Disabled', bg: '#6B7280', color: '#FFFFFF' };
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { text: currentLang === 'id' ? 'AI: Offline' : 'AI: Offline', bg: '#D97706', color: '#FFFFFF' };
    }
    if (connectionStatus === 'connected') {
      return { text: currentLang === 'id' ? 'AI: Aktif ✓' : 'AI: Active ✓', bg: '#059669', color: '#FFFFFF' };
    }
    if (connectionStatus === 'error') {
      return { text: currentLang === 'id' ? 'AI: Kunci salah' : 'AI: Invalid key', bg: '#DC2626', color: '#FFFFFF' };
    }
    if (savedKeyExists || hasEnvKey) {
      return { text: currentLang === 'id' ? 'AI: Siap' : 'AI: Ready', bg: '#2563EB', color: '#FFFFFF' };
    }
    return { text: currentLang === 'id' ? 'AI: Belum ada kunci' : 'AI: No key set', bg: '#E11D48', color: '#FFFFFF' };
  };

  const pill = getStatusPill();

  const renderCitationText = (text: string) => {
    const parts = text.split(/(\[\d+(?:,\s*\d+)*\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/^\[(.*)\]$/);
      if (match) {
        const nums = match[1].split(',').map(s => s.trim());
        return (
          <span key={idx}>
            [
            {nums.map((numStr, nIdx) => (
              <React.Fragment key={nIdx}>
                {nIdx > 0 && ', '}
                <a
                  href={`#ref-item-${numStr}`}
                  style={{ color: '#7B1E2E', fontWeight: 'bold', textDecoration: 'underline' }}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(`ref-item-${numStr}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  {numStr}
                </a>
              </React.Fragment>
            ))}
            ]
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 16px 80px 16px', color: '#1F2937', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onNavigateBack && (
            <button
              onClick={onNavigateBack}
              aria-label="Kembali"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B1E2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
          )}
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#7B1E2E' }}>
              {currentLang === 'id' ? 'Cara Kerja & Kunci AI' : 'How It Works & AI Key'}
            </h1>
            {/* Language toggle */}
            <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
              <button
                type="button"
                onClick={() => handleLangChange('id')}
                style={{
                  fontSize: 10,
                  fontWeight: currentLang === 'id' ? 700 : 500,
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: 'none',
                  background: currentLang === 'id' ? '#7B1E2E' : '#E5E7EB',
                  color: currentLang === 'id' ? '#FFF' : '#4B5563',
                  cursor: 'pointer'
                }}
              >
                🇮🇩 ID
              </button>
              <button
                type="button"
                onClick={() => handleLangChange('en')}
                style={{
                  fontSize: 10,
                  fontWeight: currentLang === 'en' ? 700 : 500,
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: 'none',
                  background: currentLang === 'en' ? '#7B1E2E' : '#E5E7EB',
                  color: currentLang === 'en' ? '#FFF' : '#4B5563',
                  cursor: 'pointer'
                }}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <span
          style={{
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            background: pill.bg,
            color: pill.color,
            whiteSpace: 'nowrap'
          }}
        >
          {pill.text}
        </span>
      </div>

      {/* Segmented Controls */}
      <div
        role="tablist"
        style={{
          display: 'flex',
          background: '#F3F4F6',
          borderRadius: 10,
          padding: 4,
          marginBottom: 16
        }}
      >
        <button
          role="tab"
          aria-selected={activeSegment === 'kunci'}
          onClick={() => setActiveSegment('kunci')}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 8,
            border: 'none',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            background: activeSegment === 'kunci' ? '#FFFFFF' : 'transparent',
            color: activeSegment === 'kunci' ? '#7B1E2E' : '#6B7280',
            boxShadow: activeSegment === 'kunci' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            minHeight: 48
          }}
        >
          {currentLang === 'id' ? 'Kunci AI & Model' : 'AI Key & Model'}
        </button>
        <button
          role="tab"
          aria-selected={activeSegment === 'cara_kerja'}
          onClick={() => setActiveSegment('cara_kerja')}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 8,
            border: 'none',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            background: activeSegment === 'cara_kerja' ? '#FFFFFF' : 'transparent',
            color: activeSegment === 'cara_kerja' ? '#7B1E2E' : '#6B7280',
            boxShadow: activeSegment === 'cara_kerja' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            minHeight: 48
          }}
        >
          {currentLang === 'id' ? 'Cara Kerja' : 'How It Works'}
        </button>
      </div>

      {/* SEGMENT 1: Kunci AI & Model */}
      {activeSegment === 'kunci' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status Card */}
          <div
            style={{
              background: '#FFF5F6',
              border: '1px solid #FECDD3',
              borderRadius: 12,
              padding: 14
            }}
          >
            <div style={{ fontWeight: 600, color: '#7B1E2E', marginBottom: 4 }}>
              {currentLang === 'id' ? 'Status Kunci AI' : 'AI Key Status'}
            </div>
            <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>
              {savedKeyExists
                ? (currentLang === 'id' ? 'Sumber: Kunci yang kamu masukkan' : 'Source: Custom key entered by user')
                : hasEnvKey
                ? (currentLang === 'id' ? 'Sumber: Kunci dari AI Studio' : 'Source: Key from AI Studio')
                : (currentLang === 'id' ? 'Belum ada kunci tersimpan atau terkonfigurasi.' : 'No key saved or configured.')}
            </div>
            <div style={{ fontSize: 12, color: '#7B1E2E', marginTop: 4, fontWeight: 600 }}>
              {currentLang === 'id' ? 'Model Aktif: ' : 'Active Model: '}
              <code style={{ fontFamily: 'monospace' }}>{selectedModel}</code>
            </div>
          </div>

          {/* Model Selection with Fallback */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              padding: '14px 16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label htmlFor="model-select-dropdown" style={{ fontWeight: 600, fontSize: 14 }}>
                {currentLang === 'id' ? 'Pilih Model Gemini' : 'Select Gemini Model'}
              </label>
              <span style={{ fontSize: 11, background: '#FFF5F6', color: '#7B1E2E', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>
                Auto-Fallback
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 10px 0' }}>
              {currentLang === 'id'
                ? 'Pilih model yang ingin digunakan. Jika model sudah tidak tersedia (404), BoraScan otomatis mencoba model fallback berikutnya.'
                : 'Select your preferred model. If unavailable, BoraScan automatically tries fallback models.'}
            </p>
            <select
              id="model-select-dropdown"
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #D1D5DB',
                fontSize: 13,
                fontWeight: 600,
                color: '#1F2937',
                background: '#FFFFFF',
                minHeight: 48
              }}
            >
              {CANDIDATE_MODELS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Switch: Analisis AI (butuh internet) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              padding: '14px 16px'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {currentLang === 'id' ? 'Analisis AI (butuh internet)' : 'AI Analysis (needs internet)'}
              </div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>
                {currentLang === 'id' ? 'Memberikan pendapat kedua berbasis Gemini' : 'Second opinion via Gemini model'}
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 50, height: 28 }}>
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => handleToggleAiSwitch(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: aiEnabled ? '#7B1E2E' : '#D1D5DB',
                  transition: '0.3s',
                  borderRadius: 28
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    content: '""',
                    height: 22,
                    width: 22,
                    left: aiEnabled ? 25 : 3,
                    bottom: 3,
                    backgroundColor: 'white',
                    transition: '0.3s',
                    borderRadius: '50%'
                  }}
                />
              </span>
            </label>
          </div>

          {/* Gemini API Key Input */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              padding: 16
            }}
          >
            <label
              htmlFor="gemini-api-key-input"
              style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8 }}
            >
              Gemini API Key
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <input
                id="gemini-api-key-input"
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 12px',
                  borderRadius: 8,
                  border: '1px solid #D1D5DB',
                  fontSize: 14,
                  boxSizing: 'border-box',
                  fontFamily: 'monospace'
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? 'Sembunyikan kunci' : 'Tampilkan kunci'}
                style={{
                  position: 'absolute',
                  right: 8,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 8,
                  color: '#6B7280',
                  minHeight: 44,
                  minWidth: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Action Buttons: Simpan, Tes koneksi, Hapus kunci */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              <button
                onClick={handleSaveKey}
                style={{
                  flex: 1,
                  minHeight: 48,
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#7B1E2E',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                {currentLang === 'id' ? 'Simpan' : 'Save'}
              </button>
              <button
                onClick={handleTestConnection}
                disabled={connectionStatus === 'testing'}
                style={{
                  flex: 1,
                  minHeight: 48,
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid #7B1E2E',
                  background: '#FFFFFF',
                  color: '#7B1E2E',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                {connectionStatus === 'testing' ? (currentLang === 'id' ? 'Menguji...' : 'Testing...') : (currentLang === 'id' ? 'Tes koneksi' : 'Test connection')}
              </button>
              {savedKeyExists && (
                <button
                  onClick={handleDeleteKey}
                  style={{
                    minHeight: 48,
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: '1px solid #DC2626',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  {currentLang === 'id' ? 'Hapus kunci' : 'Delete key'}
                </button>
              )}
            </div>

            {statusMessage && (
              <div
                style={{
                  padding: 10,
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 12,
                  background: connectionStatus === 'connected' ? '#ECFDF5' : connectionStatus === 'error' ? '#FEF2F2' : '#F3F4F6',
                  color: connectionStatus === 'connected' ? '#065F46' : connectionStatus === 'error' ? '#991B1B' : '#374151'
                }}
              >
                {statusMessage}
              </div>
            )}

            {/* Help Text */}
            <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 6px 0' }}>
                {currentLang === 'id'
                  ? 'Cara mendapatkan kunci: buka Google AI Studio → Get API key → buat kunci → salin dan tempel di sini. '
                  : 'How to obtain an API key: open Google AI Studio → Get API key → create key → copy and paste here. '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#7B1E2E', textDecoration: 'underline', fontWeight: 600 }}
                >
                  https://aistudio.google.com/app/apikey
                </a>
              </p>
              <p style={{ margin: 0, color: '#9CA3AF' }}>
                {currentLang === 'id'
                  ? 'Hanya gambar kartu dan angka hasil ukur yang dikirim ke AI – tanpa lokasi, tanpa nama. Disimpan lokal di perangkat ini saja.'
                  : 'Only rectified card images and measurements are sent to the AI – no location, no identity. Stored locally on this device only.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 2: Cara Kerja (9 Sections Accordion) */}
      {activeSegment === 'cara_kerja' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sections.map((sec) => {
            const isOpen = !!openSections[sec.id];
            const isSpeaking = speakingSection === sec.id;
            return (
              <div
                key={sec.id}
                id={`section-${sec.id}`}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: 12,
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    background: isOpen ? '#FAFAFA' : '#FFFFFF',
                    borderBottom: isOpen ? '1px solid #F3F4F6' : 'none'
                  }}
                  onClick={() => toggleSection(sec.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <span style={{ fontSize: 18 }}>
                      {sec.id === 'masalah' ? '⚠️' :
                       sec.id === 'nata_de_coco' ? '🥥' :
                       sec.id === 'kurkumin' ? '🧪' :
                       sec.id === 'kartu' ? '💳' :
                       sec.id === 'cara_baca' ? '⚙️' :
                       sec.id === 'analisis_ai' ? '✨' :
                       sec.id === 'aksesibilitas' ? '👁️' :
                       sec.id === 'lapor_bpom' ? '📢' : '🛡️'}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>
                      {sec.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      aria-label="Bacakan teks"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(sec.id, `${sec.title}. ${sec.content}`);
                      }}
                      style={{
                        background: isSpeaking ? '#7B1E2E' : '#F3F4F6',
                        color: isSpeaking ? '#FFFFFF' : '#374151',
                        border: 'none',
                        borderRadius: 8,
                        minWidth: 44,
                        minHeight: 44,
                        cursor: 'pointer',
                        fontSize: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {isSpeaking ? '⏹' : '🔊'}
                    </button>
                    <span style={{ fontSize: 18, color: '#9CA3AF', padding: '0 4px' }}>
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <div
                    style={{
                      padding: 16,
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: '#374151',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {renderCitationText(sec.content)}
                  </div>
                )}
              </div>
            );
          })}

          {/* References List (1..20) */}
          <div
            id="reference-list-container"
            style={{
              marginTop: 24,
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              padding: 16
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px 0', color: '#7B1E2E' }}>
              {currentLang === 'id' ? 'Daftar Referensi Ilmiah' : 'Scientific References'}
            </h3>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.6, color: '#4B5563' }}>
              {SCIENTIFIC_REFERENCES.map((ref) => (
                <li key={ref.id} id={`ref-item-${ref.id}`} style={{ marginBottom: 10, scrollMarginTop: 80 }}>
                  <span style={{ fontWeight: 600, color: '#1F2937' }}>{ref.authorsAndTitle}</span>
                  {ref.source && <span>, <em>{ref.source}</em></span>}
                  {ref.url && (
                    <div style={{ marginTop: 2 }}>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#7B1E2E', wordBreak: 'break-all', textDecoration: 'underline' }}
                      >
                        {ref.url}
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default HowItWorks;
