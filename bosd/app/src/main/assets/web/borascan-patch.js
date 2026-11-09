/**
 * BoraScan UI Patch & Enhancement Module
 * Implements:
 * 1. Bottom navigation tab "Cara Kerja" with key icon (Beranda · Riwayat · Panduan · Cara Kerja · Pengaturan)
 * 2. Home screen full-width button "Cara Kerja & Kunci AI" under "Mulai tes baru"
 * 3. Result screens dual-language support (ID / EN switcher) for both Standard and AI analysis
 * 4. Model selection & fallback system with connection test for active model
 * 5. Two-segment modal: "Kunci AI" and "Cara Kerja" (9 sections + 20 references + TTS + citations)
 * 6. 6 simulation badge buttons in S07Scan
 */

(function () {
  let isAiCardOpen = false;
  let activeModalSegment = "kunci";
  let openSectionsMap = { masalah: true, cara_baca: true, analisis_ai: true };

  const AVAILABLE_MODELS = [
    { id: "gemini-2.5-flash", label: "gemini-2.5-flash (Rekomendasi - Cepat & Akurat)" },
    { id: "gemini-2.0-flash", label: "gemini-2.0-flash (Alternatif Cepat)" },
    { id: "gemini-1.5-flash", label: "gemini-1.5-flash (Stabil & Ringan)" },
    { id: "gemini-2.5-pro", label: "gemini-2.5-pro (Kualitas Penalaran Tinggi)" },
    { id: "gemini-1.5-pro", label: "gemini-1.5-pro (Model Pro Stabil)" },
  ];

  function getSettings() {
    try {
      return JSON.parse(localStorage.getItem("borascan_settings") || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveSettings(s) {
    localStorage.setItem("borascan_settings", JSON.stringify(s));
  }

  function getActiveLang() {
    try {
      const stored = localStorage.getItem("borascan_lang");
      if (stored) return stored;
    } catch (e) {}
    const s = getSettings();
    return s.lang || "id";
  }

  function setActiveLang(l) {
    try {
      localStorage.setItem("borascan_lang", l);
    } catch (e) {}
    const s = getSettings();
    s.lang = l;
    saveSettings(s);
  }

  function getSelectedModel() {
    try {
      const stored = localStorage.getItem("borascan_selected_model");
      if (stored) return stored;
    } catch (e) {}
    return "gemini-2.5-flash";
  }

  function setSelectedModel(m) {
    try {
      localStorage.setItem("borascan_selected_model", m);
    } catch (e) {}
  }

  function getEffectiveApiKey() {
    // 1. The key provided by AI Studio, from Android BuildConfig / env
    if (window.Android && window.Android.getGeminiApiKey) {
      try {
        const k = window.Android.getGeminiApiKey();
        if (k && k.trim() && !k.includes("Placeholder")) {
          return { key: k.trim(), source: "ai_studio" };
        }
      } catch (e) {}
    }
    if (window.__BoraScanEnvApiKey && window.__BoraScanEnvApiKey.trim() && !window.__BoraScanEnvApiKey.includes("Placeholder")) {
      return { key: window.__BoraScanEnvApiKey.trim(), source: "ai_studio" };
    }
    // 2. The key saved here on this device
    try {
      const custom = localStorage.getItem("borascan_custom_gemini_api_key") || "";
      if (custom && custom.trim()) {
        return { key: custom.trim(), source: "user" };
      }
    } catch (e) {}
    const s = getSettings();
    if (s.geminiApiKey && s.geminiApiKey.trim()) {
      return { key: s.geminiApiKey.trim(), source: "user" };
    }
    return { key: "", source: "none" };
  }

  function getApiKey() {
    return getEffectiveApiKey().key;
  }

  function isAiAnalysisEnabled() {
    try {
      const stored = localStorage.getItem("borascan_ai_enabled");
      if (stored !== null) return stored !== "false";
    } catch (e) {}
    const s = getSettings();
    return s.aiAnalysisEnabled !== false;
  }

  function setAiAnalysisEnabled(val) {
    try {
      localStorage.setItem("borascan_ai_enabled", String(val));
    } catch (e) {}
    const s = getSettings();
    s.aiAnalysisEnabled = val;
    saveSettings(s);
  }

  function speakText(text, lang = "id") {
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang === "en" ? "en-US" : "id-ID";
        u.rate = 1.0;
        u.pitch = 1.0;
        window.speechSynthesis.speak(u);
      }
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  }

  // ---------------- SVG Icons ---------------- //

  const ICONS = {
    "key": `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>`,
    "book-open": `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    "alert-triangle": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    "sparkles": `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>`,
    "chevron-down": `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
    "speaker": `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
    "eye": `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
    "eye-off": `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`,
    "arrow-left": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
    "cpu": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>`,
    "layers": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    "flask": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><line x1="8.5" y1="2" x2="15.5" y2="2"/><line x1="8.5" y1="14" x2="15.5" y2="14"/></svg>`,
    "credit-card": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
    "send": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`,
    "shield-alert": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };

  // ---------------- Simulation Handler ---------------- //

  window.__runSimulationScan = function (simKey) {
    const engine = window.BoraScanEngine;
    if (!engine || !engine.SIMULATION_CASES[simKey]) return;

    const isAmmoniaScan = !!window.__isCurrentlyAmmoniaMode;
    const padStats = engine.getSimulationPadStats(simKey, isAmmoniaScan);
    window.__lastSimPadStats = padStats;

    if (window.__s07OnCapture) {
      const canvas = document.createElement("canvas");
      canvas.width = 850;
      canvas.height = 550;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 850, 550);
        ctx.fillStyle = `rgb(${padStats.medianRgb.join(",")})`;
        ctx.fillRect(360, 300, 150, 100);
        ctx.fillStyle = "#111827";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText(`SIMULASI: ${simKey}`, 380, 350);
      }
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      const imageData = ctx.getImageData(0, 0, 850, 550);
      imageData.__simPadStats = padStats;

      window.__s07OnCapture(imageData, dataUrl);
    }
  };

  // ---------------- DOM Mutation Observer & Screen Patching ---------------- //

  function patchDom() {
    try {
      patchScanScreen();
      patchResultScreens();
      patchGuideScreen();
    } catch (e) {
      console.warn("BoraScan patch:", e);
    }
  }

  // 1. S07Scan: Add 6 simulation buttons
  function patchScanScreen() {
    const isScanScreen =
      document.body.textContent.includes("Posisikan Kartu") ||
      document.body.textContent.includes("Posisikan kartu") ||
      document.querySelector("video") !== null;

    if (!isScanScreen) return;
    if (document.getElementById("borascan-sim-bar")) return;

    const overlay = document.querySelector(".relative") || document.body;
    const simBar = document.createElement("div");
    simBar.id = "borascan-sim-bar";
    simBar.className = "fixed top-3 left-0 right-0 z-50 flex justify-center gap-1.5 px-2 overflow-x-auto select-none pointer-events-auto";

    const simButtons = [
      { key: "0", label: "0 ○ Negatif", color: "bg-emerald-600 hover:bg-emerald-700" },
      { key: "1", label: "1 △ Ragu", color: "bg-amber-600 hover:bg-amber-700" },
      { key: "2", label: "2 □ Positif", color: "bg-rose-700 hover:bg-rose-800" },
      { key: "ammonia_pos", label: "B+ ⊗ Amonia", color: "bg-red-800 hover:bg-red-900" },
      { key: "ammonia_neg", label: "B− ⊖ Basa", color: "bg-sky-700 hover:bg-sky-800" },
      { key: "thick_pad", label: "Pad tebal", color: "bg-purple-800 hover:bg-purple-900" },
    ];

    simButtons.forEach((btn) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `px-2.5 py-1 rounded-full text-white text-[11px] font-bold shadow-md transition-transform active:scale-95 whitespace-nowrap ${btn.color}`;
      b.textContent = btn.label;
      b.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.__runSimulationScan(btn.key);
      };
      simBar.appendChild(b);
    });

    overlay.appendChild(simBar);
  }

  // 2. Result Screens: Both Analyses with Dual-Language Switcher (ID / EN)
  function patchResultScreens() {
    const isResultScreen =
      document.body.textContent.includes("Hasil Uji") ||
      document.body.textContent.includes("Analisis Kolorimetri") ||
      document.body.textContent.includes("Kode 0") ||
      document.body.textContent.includes("Kode 1") ||
      document.body.textContent.includes("Kode 2") ||
      document.body.textContent.includes("Hasil B+") ||
      document.body.textContent.includes("Hasil B-") ||
      document.body.textContent.includes("Hasil B−");

    if (!isResultScreen) return;
    if (document.getElementById("borascan-analyses-container")) return;

    if (!window.__BoraScanLastAnalysisResult) return;

    const lastResult = window.__BoraScanLastAnalysisResult;
    const pipeline = lastResult.pipelineResult || lastResult;
    const pad = pipeline.correctedPadLab || pipeline.padLab;
    if (!pad) return;

    const targetParent =
      document.querySelector(".space-y-4") ||
      document.querySelector(".space-y-3") ||
      document.querySelector("main") ||
      document.querySelector(".max-w-md");

    if (!targetParent || !targetParent.parentElement) return;

    const lang = getActiveLang();
    const isEn = lang === "en";

    const deltaH = pipeline.deltaH !== undefined ? Math.round(pipeline.deltaH) : Math.round(80 - (pad.h || 0));
    const agVal = pipeline.uncorrectedAG !== undefined ? pipeline.uncorrectedAG.toFixed(3) : "-";
    const validPct = Math.round((pad.valid_fraction ?? 1.0) * 100);

    // Dynamic Rule sentence in active language
    const category = String(lastResult.category || "2");
    let categoryDesc = "Positif Boraks";
    if (category === "0") categoryDesc = isEn ? "Negative" : "Negatif";
    else if (category === "1") categoryDesc = isEn ? "Trace / Inconclusive" : "Meragukan / Perlu Uji Amonia";
    else if (category === "2") categoryDesc = isEn ? "Positive Borax" : "Positif Boraks";
    else if (category === "B+") categoryDesc = isEn ? "Borax Confirmed" : "Boraks Terkonfirmasi";
    else if (category === "B-") categoryDesc = isEn ? "Alkaline Only (Not Borax)" : "Bukan Boraks (Makanan Basa)";

    const ruleSentence = isEn
      ? (pipeline.ruleSentenceEn || `Color shifted ${deltaH}° from yellow to red (h: ${Math.round(pad.h || 0)}°) → Code ${category} (${categoryDesc})`)
      : (pipeline.ruleSentence || `Warna bergeser ${deltaH}° dari kuning ke merah (h: ${Math.round(pad.h || 0)}°) → Kode ${category} (${categoryDesc})`);

    const warningBadge = pipeline.warningBadge || pipeline.quality?.warningReasonId;
    const warningBadgeEn = warningBadge === "Pad sangat gelap" ? "Very dark pad" : warningBadge;

    // AI status check
    const apiKeyInfo = getEffectiveApiKey();
    const apiKey = apiKeyInfo.key;
    const isOnline = navigator.onLine !== false;
    const isAiEnabled = isAiAnalysisEnabled();
    const currentModel = getSelectedModel();

    let aiUnavailableReason = null;
    let isNoKeyError = false;
    if (!isAiEnabled) aiUnavailableReason = isEn ? "AI disabled in settings" : "Analisis AI dinonaktifkan";
    else if (!isOnline) aiUnavailableReason = isEn ? "No internet connection (Offline)" : "Tidak ada koneksi internet (Offline)";
    else if (!apiKey) {
      aiUnavailableReason = isEn ? "API key not configured" : "API key belum diatur";
      isNoKeyError = true;
    } else if (pipeline.aiError) aiUnavailableReason = `AI error: ${pipeline.aiError}`;

    const ai = pipeline.aiResult || lastResult.aiResult;
    const confidenceText = ai
      ? isEn
        ? (ai.confidence >= 0.75 ? "High" : ai.confidence >= 0.5 ? "Medium" : "Low")
        : (ai.confidence >= 0.75 ? "Tinggi" : ai.confidence >= 0.5 ? "Sedang" : "Rendah")
      : "-";

    const aiOpinionText = ai
      ? isEn
        ? (ai.borax_likely === "yes" ? "Borax indicated" : ai.borax_likely === "no" ? "No borax indicated" : "Inconclusive")
        : (ai.borax_likely === "yes" ? "Terindikasi boraks" : ai.borax_likely === "no" ? "Tidak terindikasi" : "Tidak pasti")
      : "-";

    const aiExplanation = ai
      ? isEn
        ? (ai.explanation_en || ai.explanation_id || "")
        : (ai.explanation_id || ai.explanation_en || "")
      : "";

    const analysesDiv = document.createElement("div");
    analysesDiv.id = "borascan-analyses-container";
    analysesDiv.className = "w-full my-4 space-y-3 select-none";

    analysesDiv.innerHTML = `
      <!-- Language Switcher Bar -->
      <div class="flex items-center justify-between bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-sm text-xs">
        <span class="font-bold text-gray-600">${isEn ? "Analysis Language:" : "Bahasa Analisis:"}</span>
        <div class="inline-flex rounded-lg bg-gray-100 p-0.5 font-bold">
          <button type="button" onclick="window.__setAnalysisLang('id')" class="px-2.5 py-1 rounded-md transition ${!isEn ? 'bg-white text-[#7B1E2E] shadow-sm font-extrabold' : 'text-gray-500 hover:text-gray-900'}">
            🇮🇩 ID
          </button>
          <button type="button" onclick="window.__setAnalysisLang('en')" class="px-2.5 py-1 rounded-md transition ${isEn ? 'bg-white text-[#7B1E2E] shadow-sm font-extrabold' : 'text-gray-500 hover:text-gray-900'}">
            🇬🇧 EN
          </button>
        </div>
      </div>

      <!-- 1. Analisis Standar Kolorimetri (Always Visible) -->
      <div class="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-left">
        <div class="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
          <span class="text-xs font-extrabold uppercase text-gray-500 tracking-wider">
            ${isEn ? "Standard Colorimetric Analysis" : "Analisis Standar Kolorimetri"}
          </span>
          ${
            warningBadge
              ? `<span class="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold">${isEn ? warningBadgeEn : warningBadge}</span>`
              : ""
          }
        </div>

        <div class="grid grid-cols-4 gap-1.5 text-center bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs mb-3">
          <div><div class="text-[10px] text-gray-500 font-bold">L*</div><div class="font-mono font-bold text-gray-800">${pad.L.toFixed(1)}</div></div>
          <div><div class="text-[10px] text-gray-500 font-bold">a*</div><div class="font-mono font-bold text-gray-800">${pad.a.toFixed(1)}</div></div>
          <div><div class="text-[10px] text-gray-500 font-bold">b*</div><div class="font-mono font-bold text-gray-800">${pad.b.toFixed(1)}</div></div>
          <div><div class="text-[10px] text-gray-500 font-bold">Hue (h)</div><div class="font-mono font-bold text-gray-800">${Math.round(pad.h || 0)}°</div></div>
          <div class="pt-1.5"><div class="text-[10px] text-gray-500 font-bold">Δh</div><div class="font-mono font-bold text-gray-800">${deltaH}°</div></div>
          <div class="pt-1.5"><div class="text-[10px] text-gray-500 font-bold">A_G</div><div class="font-mono font-bold text-gray-800">${agVal}</div></div>
          <div class="pt-1.5 col-span-2"><div class="text-[10px] text-gray-500 font-bold">${isEn ? "Valid Pixels" : "Piksel Valid"}</div><div class="font-mono font-bold text-gray-800">${validPct}%</div></div>
        </div>

        <p class="text-xs text-gray-700 leading-relaxed font-medium bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
          <strong class="text-[#7B1E2E]">${isEn ? "Rule:" : "Aturan:"}</strong> ${ruleSentence}
        </p>
      </div>

      <!-- 2. Analisis Detail AI (Collapsible) -->
      <div class="border border-rose-200 rounded-2xl bg-white shadow-sm overflow-hidden" id="borascan-ai-collapsible">
        <button type="button" onclick="window.__toggleAiDetailCard()" class="w-full p-4 flex items-center justify-between text-left hover:bg-rose-50/40 transition focus:outline-none min-h-[48px]">
          <div class="flex items-center gap-2">
            <span class="text-[#7B1E2E]">${ICONS["sparkles"]}</span>
            <span class="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
              ${isEn ? "AI Detail Analysis" : "Analisis Detail AI"}
            </span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-[#7B1E2E] font-semibold">
            <span id="ai-toggle-text">${isAiCardOpen ? (isEn ? "Hide" : "Sembunyikan") : (isEn ? "Show" : "Tampilkan")}</span>
            <span id="ai-toggle-chevron" class="transform transition-transform ${isAiCardOpen ? "rotate-180" : ""}">${ICONS["chevron-down"]}</span>
          </div>
        </button>

        <div id="ai-collapsible-body" class="${isAiCardOpen ? "" : "hidden"} p-4 pt-0 border-t border-rose-100 text-xs text-gray-800 space-y-2.5">
          ${
            ai
              ? `
            <div class="pt-2 flex items-center justify-between border-b border-gray-100 pb-2">
              <span class="text-gray-500 font-bold">${isEn ? "AI Model:" : "Model AI:"}</span>
              <span class="font-mono text-[11px] text-[#7B1E2E] font-bold">${ai.modelUsed || currentModel}</span>
            </div>
            <div class="flex items-center justify-between border-b border-gray-100 pb-2">
              <span class="text-gray-500 font-bold">${isEn ? "Confidence:" : "Keyakinan:"}</span>
              <span class="font-extrabold text-[#7B1E2E] px-2 py-0.5 rounded-full bg-rose-100">${confidenceText}</span>
            </div>
            <div class="flex justify-between border-b border-gray-100 pb-2">
              <span class="text-gray-500 font-bold">${isEn ? "AI Opinion:" : "Pendapat AI:"}</span>
              <span class="font-extrabold text-gray-900">${aiOpinionText}</span>
            </div>
            <div class="flex justify-between border-b border-gray-100 pb-2">
              <span class="text-gray-500 font-bold">${isEn ? "Pad Color:" : "Warna Pad:"}</span>
              <span class="text-gray-800 font-medium">${ai.pad_description || "Merah rosocyanine"} (Patch: ${ai.closest_patch || "2"})</span>
            </div>
            ${
              ai.quality_issues && ai.quality_issues.length > 0
                ? `
              <div class="border-b border-gray-100 pb-2">
                <span class="text-gray-500 font-bold block mb-1">${isEn ? "Photo Issues:" : "Masalah Foto:"}</span>
                <div class="flex flex-wrap gap-1">
                  ${ai.quality_issues
                    .map((q) => `<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">${q.replace(/_/g, " ")}</span>`)
                    .join("")}
                </div>
              </div>
            `
                : ""
            }
            <div class="border-b border-gray-100 pb-2">
              <span class="text-gray-500 font-bold block mb-1">${isEn ? "AI Explanation:" : "Penjelasan AI:"}</span>
              <p class="leading-relaxed text-gray-700">${aiExplanation}</p>
            </div>
            <div class="flex items-center justify-between pt-1 text-[11px]">
              <span class="text-gray-500 font-bold">${isEn ? "Agreement:" : "Kesesuaian:"}</span>
              <span class="font-semibold text-emerald-700">✓ ${isEn ? "Consistent with standard analysis" : "Sesuai dengan analisis standar"}</span>
            </div>
          `
              : `
            <div class="pt-3 text-center py-4 space-y-3">
              <p class="text-gray-700 font-semibold">${aiUnavailableReason || "AI tidak aktif"}</p>
              ${
                isNoKeyError
                  ? `
                <button type="button" onclick="window.__openCaraKerja('kunci')" class="px-4 py-2.5 rounded-xl bg-[#7B1E2E] hover:bg-[#9B2A3D] text-white font-bold text-xs shadow active:scale-95 transition min-h-[48px]">
                  ${isEn ? "Configure API Key & Model" : "Atur Kunci & Model AI"} &rarr;
                </button>
              `
                  : `
                <button type="button" onclick="window.__retryAiAnalysis()" class="px-4 py-2.5 rounded-xl bg-[#7B1E2E] hover:bg-[#9B2A3D] text-white font-bold text-xs shadow active:scale-95 transition min-h-[48px]">
                  ${isEn ? "Retry Analysis" : "Coba lagi analisis"}
                </button>
              `
              }
            </div>
          `
          }
        </div>
      </div>

      <!-- Deep link to Cara Kerja & Referensi -->
      <div class="text-center pt-2">
        <button type="button" onclick="window.__openCaraKerja('cara_kerja', 'cara_baca')" class="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B1E2E] hover:underline p-1 min-h-[44px]">
          <span>${isEn ? "Why this result? Learn how it works & citations" : "Kenapa hasilnya begini? Pelajari cara kerja & rujukan"}</span>
          <span>&rarr;</span>
        </button>
      </div>
    `;

    targetParent.parentElement.insertBefore(analysesDiv, targetParent);
  }

  window.__setAnalysisLang = function (l) {
    setActiveLang(l);
    const container = document.getElementById("borascan-analyses-container");
    if (container) container.remove();
    patchResultScreens();
  };

  window.__toggleAiDetailCard = function () {
    isAiCardOpen = !isAiCardOpen;
    const body = document.getElementById("ai-collapsible-body");
    const txt = document.getElementById("ai-toggle-text");
    const chev = document.getElementById("ai-toggle-chevron");
    const isEn = getActiveLang() === "en";

    if (body) {
      if (isAiCardOpen) {
        body.classList.remove("hidden");
        if (txt) txt.textContent = isEn ? "Hide" : "Sembunyikan";
        if (chev) chev.classList.add("rotate-180");
      } else {
        body.classList.add("hidden");
        if (txt) txt.textContent = isEn ? "Show" : "Tampilkan";
        if (chev) chev.classList.remove("rotate-180");
      }
    }
  };

  window.__retryAiAnalysis = async function () {
    const btn = event.target;
    if (btn) btn.textContent = "Menganalisis...";
    const apiKey = getApiKey();
    if (!apiKey) {
      window.__openCaraKerja("kunci");
      return;
    }
    const lastResult = window.__BoraScanLastAnalysisResult || {};
    const img1 = lastResult.initialPhotoDataUrl || lastResult.photoDataUrl || "";
    if (!img1) {
      alert("Foto kartu tidak tersedia untuk dikirim.");
      if (btn) btn.textContent = "Coba lagi";
      return;
    }
    const res = await window.BoraScanEngine.callGemini({
      apiKey,
      model: getSelectedModel(),
      scan1ImageBase64: img1,
      scan1Numbers: lastResult.pipelineResult?.correctedPadLab || {},
    });
    if (res) {
      if (lastResult.pipelineResult) lastResult.pipelineResult.aiResult = res;
      lastResult.aiResult = res;
      const container = document.getElementById("borascan-analyses-container");
      if (container) container.remove();
      patchResultScreens();
    } else {
      alert("AI gagal merespons. Periksa koneksi internet, kuota model, atau API key.");
      if (btn) btn.textContent = "Coba lagi";
    }
  };

  // 3. Guide Screen: Link to Cara Kerja
  function patchGuideScreen() {
    const isGuide =
      document.body.textContent.includes("Panduan Lengkap") ||
      document.body.textContent.includes("Kartu Kalibrasi BoraScan");

    if (!isGuide) return;
    if (document.getElementById("borascan-guide-ref-card")) return;

    const container = document.querySelector(".max-w-md");
    if (!container) return;

    const isEn = getActiveLang() === "en";

    const refCard = document.createElement("div");
    refCard.id = "borascan-guide-ref-card";
    refCard.className = "mb-4 p-3.5 bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-2xl flex items-center justify-between cursor-pointer hover:shadow-sm active:scale-[0.99] transition";
    refCard.onclick = () => window.__openCaraKerja();

    refCard.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="p-2 rounded-xl bg-[#7B1E2E] text-white">${ICONS["key"]}</span>
        <div>
          <h4 class="font-bold text-sm text-gray-900">${isEn ? "How It Works & AI Key" : "Cara Kerja & Kunci AI"}</h4>
          <p class="text-xs text-gray-500">${isEn ? "Chemical principles, AI settings & 20 references" : "Prinsip kimia kurkumin, pengaturan AI, dan 20 rujukan ilmiah"}</p>
        </div>
      </div>
      <span class="text-sm font-bold text-[#7B1E2E] mr-1">&rarr;</span>
    `;

    const firstSub = container.querySelector(".flex.gap-1.5") || container.firstChild;
    container.insertBefore(refCard, firstSub);
  }

  // ---------------- Cara Kerja & Kunci AI Screen / Modal ---------------- //

  window.__openCaraKerja = function (initialSegment = "kunci", targetSectionId = null) {
    activeModalSegment = initialSegment;
    let overlay = document.getElementById("borascan-cara-kerja-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "borascan-cara-kerja-overlay";
      overlay.className = "fixed inset-0 z-50 bg-[#FBF9F7] text-[#1F2937] overflow-y-auto";
      document.body.appendChild(overlay);
    }
    overlay.style.display = "block";
    renderCaraKerjaContent(overlay, initialSegment, targetSectionId);
  };

  window.__openS21 = window.__openCaraKerja;
  window.__openS21AtSection = function (secId) {
    window.__openCaraKerja("cara_kerja", secId);
  };

  window.__closeCaraKerja = function () {
    const overlay = document.getElementById("borascan-cara-kerja-overlay");
    if (overlay) overlay.style.display = "none";
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  function renderCaraKerjaContent(container, initialSegment, targetSectionId) {
    const lang = getActiveLang();
    const isEn = lang === "en";

    const sections = (isEn ? window.CARA_KERJA_SECTIONS_EN : window.CARA_KERJA_SECTIONS_ID) || [];
    const refs = window.SCIENTIFIC_REFERENCES || [];

    const keyInfo = getEffectiveApiKey();
    const isOnline = navigator.onLine !== false;
    const isAiEnabled = isAiAnalysisEnabled();
    const currentModel = getSelectedModel();

    let pillText = isEn ? "AI: No key" : "AI: Belum ada kunci";
    let pillBg = "bg-rose-600 text-white";
    let keySourceText = isEn ? "No API key configured" : "Belum ada kunci tersimpan atau terkonfigurasi";

    if (!isAiEnabled) {
      pillText = isEn ? "AI: Disabled" : "AI: Dinonaktifkan";
      pillBg = "bg-gray-500 text-white";
    } else if (!isOnline) {
      pillText = isEn ? "AI: Offline" : "AI: Offline";
      pillBg = "bg-amber-600 text-white";
    } else if (keyInfo.key) {
      pillText = isEn ? "AI: Active ✓" : "AI: Aktif ✓";
      pillBg = "bg-emerald-600 text-white";
      keySourceText = keyInfo.source === "ai_studio"
        ? (isEn ? "Key from AI Studio" : "Kunci dari AI Studio")
        : (isEn ? "Key entered by you" : "Kunci yang kamu masukkan");
    }

    const savedCustomKey = localStorage.getItem("borascan_custom_gemini_api_key") || "";

    // Build 9 sections accordion
    let sectionsHtml = "";
    sections.forEach((sec, idx) => {
      const iconSvg = ICONS[sec.icon] || ICONS["alert-triangle"];
      const formatted = sec.content
        .replace(/\[(\d+(?:,\s*\d+)*)\]/g, (match, p1) => {
          const nums = p1.split(",").map((n) => n.trim());
          return nums
            .map(
              (n) =>
                `<a href="#ref-item-${n}" class="text-[#7B1E2E] font-bold hover:underline px-0.5" onclick="event.stopPropagation();document.getElementById('ref-item-${n}')?.scrollIntoView({behavior:'smooth'});">[${n}]</a>`
            )
            .join("");
        })
        .replace(/\n/g, "<br>");

      const isOpen = targetSectionId ? targetSectionId === sec.id : !!openSectionsMap[sec.id];

      sectionsHtml += `
        <div class="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden mb-3" id="sec-${sec.id}">
          <button type="button" class="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 focus:outline-none min-h-[48px]" onclick="window.__toggleCkSection('${sec.id}')">
            <div class="flex items-center gap-3">
              <span class="text-[#7B1E2E] flex-shrink-0">${iconSvg}</span>
              <span class="font-extrabold text-gray-900 text-sm md:text-base">${sec.title}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <button type="button" aria-label="Bacakan teks" class="p-2 text-gray-400 hover:text-[#7B1E2E] focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center" onclick="event.stopPropagation();window.__speakCkSection('${sec.id}', '${lang}')">
                ${ICONS["speaker"]}
              </button>
              <span class="text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}" id="chevron-${sec.id}">
                ${ICONS["chevron-down"]}
              </span>
            </div>
          </button>
          <div id="body-${sec.id}" class="p-4 pt-0 text-xs md:text-sm text-gray-700 leading-relaxed border-t border-gray-100 ${isOpen ? "" : "hidden"}">
            <div class="pt-3">${formatted}</div>
          </div>
        </div>
      `;
    });

    // Build 20 references
    let refsHtml = "";
    refs.forEach((r) => {
      const linkHtml = r.url
        ? `<br><a href="${r.url}" target="_blank" rel="noopener noreferrer" class="text-xs text-[#7B1E2E] hover:underline break-all inline-block mt-0.5 font-semibold">${r.url}</a>`
        : "";
      refsHtml += `
        <div id="ref-item-${r.id}" class="p-3 bg-white rounded-xl border border-gray-200 mb-2 text-xs text-gray-800 scroll-mt-24">
          <span class="font-bold text-[#7B1E2E]">[${r.id}]</span> ${r.text || r.authorsAndTitle + ", " + (r.source || "")}
          ${linkHtml}
        </div>
      `;
    });

    container.innerHTML = `
      <div class="max-w-md mx-auto min-h-screen p-4 pb-20 select-none">
        <!-- Top bar: Back, Title, Language Switcher, Status Pill -->
        <div class="flex items-center justify-between pb-3 border-b border-gray-200 mb-4 sticky top-0 bg-[#FBF9F7]/95 backdrop-blur z-20 pt-2 gap-2">
          <button type="button" onclick="window.__closeCaraKerja()" class="flex items-center gap-1 py-2 px-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs min-h-[48px]">
            ${ICONS["arrow-left"]}
            <span>${isEn ? "Back" : "Kembali"}</span>
          </button>
          
          <div class="flex flex-col items-center">
            <h1 class="text-sm font-extrabold text-[#7B1E2E] leading-tight">${isEn ? "How It Works & AI Key" : "Cara Kerja & Kunci AI"}</h1>
            <div class="flex gap-1 text-[10px] mt-0.5">
              <button type="button" onclick="window.__setModalLang('id')" class="px-1.5 py-0.5 rounded ${!isEn ? 'bg-[#7B1E2E] text-white font-bold' : 'text-gray-500'}">ID</button>
              <button type="button" onclick="window.__setModalLang('en')" class="px-1.5 py-0.5 rounded ${isEn ? 'bg-[#7B1E2E] text-white font-bold' : 'text-gray-500'}">EN</button>
            </div>
          </div>

          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${pillBg} shadow-sm" id="modal-status-pill">
            ${pillText}
          </span>
        </div>

        <!-- Segmented Control: Kunci AI vs Cara Kerja -->
        <div class="flex bg-gray-200/80 p-1 rounded-xl mb-4 text-xs font-bold">
          <button
            type="button"
            id="tab-btn-kunci"
            onclick="window.__switchModalTab('kunci')"
            class="flex-1 py-2.5 rounded-lg transition-all min-h-[48px] ${activeModalSegment === "kunci" ? "bg-white text-[#7B1E2E] shadow" : "text-gray-600 hover:text-gray-900"}"
          >
            ${isEn ? "AI Key & Model" : "Kunci AI & Model"}
          </button>
          <button
            type="button"
            id="tab-btn-cara-kerja"
            onclick="window.__switchModalTab('cara_kerja')"
            class="flex-1 py-2.5 rounded-lg transition-all min-h-[48px] ${activeModalSegment === "cara_kerja" ? "bg-white text-[#7B1E2E] shadow" : "text-gray-600 hover:text-gray-900"}"
          >
            ${isEn ? "How It Works" : "Cara Kerja"}
          </button>
        </div>

        <!-- SEGMENT 1: Kunci AI -->
        <div id="segment-kunci-content" class="${activeModalSegment === "kunci" ? "" : "hidden"} space-y-4">
          <!-- Status Card -->
          <div class="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">${isEn ? "Current AI Status" : "Status AI Saat Ini"}</span>
              <span class="text-xs font-bold text-[#7B1E2E]">${pillText}</span>
            </div>
            <p class="text-sm font-extrabold text-gray-900" id="key-source-display">${keySourceText}</p>
            <div class="text-xs text-gray-600 pt-1 border-t border-gray-100 flex justify-between items-center">
              <span>${isEn ? "Active Model:" : "Model Aktif:"}</span>
              <span class="font-mono font-bold text-[#7B1E2E]" id="modal-active-model-display">${currentModel}</span>
            </div>
          </div>

          <!-- Model Selection with Fallback Description -->
          <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <div class="flex items-center justify-between">
              <label for="modal-model-select" class="block font-extrabold text-sm text-gray-900">
                ${isEn ? "Select Gemini Model & Fallback" : "Pilih Model Gemini & Fallback"}
              </label>
              <span class="text-[10px] bg-rose-50 text-[#7B1E2E] px-2 py-0.5 rounded-full font-bold">Auto-Fallback</span>
            </div>
            <p class="text-xs text-gray-500 leading-normal">
              ${isEn ? "Choose your preferred model. If discontinued or unavailable, BoraScan will automatically try compatible fallbacks." : "Pilih model yang ingin digunakan. Jika model sudah tidak tersedia/404, sistem otomatis mencoba fallback model aktif lainnya."}
            </p>
            <select
              id="modal-model-select"
              onchange="window.__onModelSelectChange(this.value)"
              class="w-full px-3 py-2.5 rounded-xl border border-gray-300 font-sans text-xs focus:outline-none focus:border-[#7B1E2E] bg-white min-h-[48px] font-bold text-gray-800"
            >
              ${AVAILABLE_MODELS.map((m) => `<option value="${m.id}" ${m.id === currentModel ? "selected" : ""}>${m.label}</option>`).join("")}
            </select>
          </div>

          <!-- Switch: Analisis AI (butuh internet) -->
          <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <div class="font-extrabold text-sm text-gray-900">${isEn ? "AI Analysis (needs internet)" : "Analisis AI (butuh internet)"}</div>
              <div class="text-xs text-gray-500">${isEn ? "Second opinion via Gemini model" : "Memberikan pendapat kedua berbasis Gemini"}</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer min-w-[50px] min-h-[30px]">
              <input type="checkbox" id="ck-ai-toggle" class="sr-only peer" ${isAiEnabled ? "checked" : ""} onchange="window.__onModalAiToggle(this.checked)">
              <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7B1E2E]"></div>
            </label>
          </div>

          <!-- Gemini API Key Form -->
          <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <label for="modal-gemini-key-input" class="block font-extrabold text-sm text-gray-900">
              Gemini API Key
            </label>
            <div class="relative">
              <input
                type="password"
                id="modal-gemini-key-input"
                value="${savedCustomKey}"
                placeholder="AIzaSy..."
                class="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-300 font-mono text-xs focus:outline-none focus:border-[#7B1E2E] min-h-[48px]"
              >
              <button
                type="button"
                aria-label="Toggle visibility"
                onclick="window.__toggleModalKeyVis()"
                class="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700 p-1 min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <span id="modal-key-vis-icon">${ICONS["eye"]}</span>
              </button>
            </div>

            <div class="flex items-center gap-2 pt-1 flex-wrap">
              <button
                type="button"
                onclick="window.__saveModalKey()"
                class="flex-1 py-2.5 px-3 rounded-xl bg-[#7B1E2E] hover:bg-[#9B2A3D] text-white font-extrabold text-xs shadow active:scale-95 transition min-h-[48px]"
              >
                ${isEn ? "Save Key" : "Simpan"}
              </button>
              <button
                type="button"
                id="modal-btn-test-key"
                onclick="window.__testModalKey()"
                class="flex-1 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#7B1E2E] font-extrabold text-xs border border-rose-200 active:scale-95 transition min-h-[48px]"
              >
                ${isEn ? "Test Connection" : "Tes koneksi"}
              </button>
              <button
                type="button"
                onclick="window.__deleteModalKey()"
                class="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-rose-700 font-extrabold text-xs border border-gray-200 active:scale-95 transition min-h-[48px]"
              >
                ${isEn ? "Delete Key" : "Hapus kunci"}
              </button>
            </div>

            <div id="modal-key-test-feedback" class="text-xs font-semibold pt-1 hidden"></div>

            <div class="text-xs text-gray-500 space-y-1.5 pt-2 border-t border-gray-100 leading-relaxed">
              <p>
                ${
                  isEn
                    ? `How to obtain an API key: visit Google AI Studio &rarr; <strong>Get API key</strong> &rarr; create key &rarr; copy and paste here.`
                    : `Cara mendapatkan kunci: buka Google AI Studio &rarr; <strong>Get API key</strong> &rarr; buat kunci &rarr; salin dan tempel di sini.`
                }
                <br>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" class="text-[#7B1E2E] font-bold underline break-all inline-block mt-0.5">
                  https://aistudio.google.com/app/apikey
                </a>
              </p>
              <p class="text-[11px] text-gray-400">
                ${
                  isEn
                    ? "Only rectified card images and quantitative measurement metrics are transmitted to the AI – no location data, no personal identity. Stored strictly on this device."
                    : "Hanya gambar kartu dan angka hasil ukur yang dikirim ke AI – tanpa lokasi, tanpa nama. Disimpan lokal di perangkat ini saja."
                }
              </p>
            </div>
          </div>
        </div>

        <!-- SEGMENT 2: Cara Kerja -->
        <div id="segment-cara-kerja-content" class="${activeModalSegment === "cara_kerja" ? "" : "hidden"}">
          <p class="text-xs text-gray-500 mb-4 leading-relaxed">
            ${isEn ? "Scientific principles, chemical reaction mechanisms, and 20 bibliographic references." : "Prinsip ilmiah, reaksi kimia kurkumin, algoritma pembacaan, dan 20 rujukan ilmiah lengkap."}
          </p>

          <div class="space-y-1 mb-8">
            ${sectionsHtml}
          </div>

          <div class="pt-4 border-t border-gray-200">
            <h2 class="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2">
              <span>${isEn ? "Scientific References" : "Daftar Referensi Ilmiah"}</span>
              <span class="text-xs font-normal text-gray-500">(1–20)</span>
            </h2>
            <div>
              ${refsHtml}
            </div>
          </div>
        </div>

        <div class="mt-8 text-center">
          <button type="button" onclick="window.__closeCaraKerja()" class="w-full py-3.5 px-4 rounded-2xl bg-[#7B1E2E] text-white font-extrabold text-sm shadow-md min-h-[48px] active:scale-[0.99] transition">
            ${isEn ? "Back to BoraScan" : "Kembali ke Aplikasi"}
          </button>
        </div>
      </div>
    `;

    if (targetSectionId) {
      setTimeout(() => {
        const targetEl = document.getElementById(`sec-${targetSectionId}`);
        if (targetEl) targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }

  window.__setModalLang = function (l) {
    setActiveLang(l);
    const overlay = document.getElementById("borascan-cara-kerja-overlay");
    if (overlay) renderCaraKerjaContent(overlay, activeModalSegment);
  };

  window.__onModelSelectChange = function (val) {
    setSelectedModel(val);
    const disp = document.getElementById("modal-active-model-display");
    if (disp) disp.textContent = val;
  };

  window.__switchModalTab = function (tab) {
    activeModalSegment = tab;
    const kunciEl = document.getElementById("segment-kunci-content");
    const ckEl = document.getElementById("segment-cara-kerja-content");
    const btnKunci = document.getElementById("tab-btn-kunci");
    const btnCk = document.getElementById("tab-btn-cara-kerja");

    if (kunciEl && ckEl) {
      if (tab === "kunci") {
        kunciEl.classList.remove("hidden");
        ckEl.classList.add("hidden");
        if (btnKunci) {
          btnKunci.className = "flex-1 py-2.5 rounded-lg transition-all min-h-[48px] bg-white text-[#7B1E2E] shadow";
        }
        if (btnCk) {
          btnCk.className = "flex-1 py-2.5 rounded-lg transition-all min-h-[48px] text-gray-600 hover:text-gray-900";
        }
      } else {
        kunciEl.classList.add("hidden");
        ckEl.classList.remove("hidden");
        if (btnKunci) {
          btnKunci.className = "flex-1 py-2.5 rounded-lg transition-all min-h-[48px] text-gray-600 hover:text-gray-900";
        }
        if (btnCk) {
          btnCk.className = "flex-1 py-2.5 rounded-lg transition-all min-h-[48px] bg-white text-[#7B1E2E] shadow";
        }
      }
    }
  };

  window.__onModalAiToggle = function (checked) {
    setAiAnalysisEnabled(checked);
    const pill = document.getElementById("modal-status-pill");
    const isEn = getActiveLang() === "en";
    if (pill) {
      if (!checked) {
        pill.textContent = isEn ? "AI: Disabled" : "AI: Dinonaktifkan";
        pill.className = "px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-500 text-white shadow-sm";
      } else {
        const info = getEffectiveApiKey();
        if (info.key) {
          pill.textContent = isEn ? "AI: Active ✓" : "AI: Aktif ✓";
          pill.className = "px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-sm";
        } else {
          pill.textContent = isEn ? "AI: No key" : "AI: Belum ada kunci";
          pill.className = "px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow-sm";
        }
      }
    }
  };

  window.__toggleModalKeyVis = function () {
    const input = document.getElementById("modal-gemini-key-input");
    const iconSpan = document.getElementById("modal-key-vis-icon");
    if (!input || !iconSpan) return;
    if (input.type === "password") {
      input.type = "text";
      iconSpan.innerHTML = ICONS["eye-off"];
    } else {
      input.type = "password";
      iconSpan.innerHTML = ICONS["eye"];
    }
  };

  window.__saveModalKey = function () {
    const input = document.getElementById("modal-gemini-key-input");
    const feedback = document.getElementById("modal-key-test-feedback");
    const val = (input ? input.value : "").trim();

    try {
      if (val) {
        localStorage.setItem("borascan_custom_gemini_api_key", val);
        const s = getSettings();
        s.geminiApiKey = val;
        saveSettings(s);
      } else {
        localStorage.removeItem("borascan_custom_gemini_api_key");
        const s = getSettings();
        delete s.geminiApiKey;
        saveSettings(s);
      }

      if (feedback) {
        feedback.className = "text-xs font-semibold text-emerald-600 block";
        feedback.textContent = "✓ Kunci berhasil disimpan di perangkat ini.";
        setTimeout(() => feedback.classList.add("hidden"), 3000);
      }

      const keyInfo = getEffectiveApiKey();
      const pill = document.getElementById("modal-status-pill");
      const srcDisplay = document.getElementById("key-source-display");
      if (pill) {
        if (keyInfo.key) {
          pill.textContent = "AI: Aktif ✓";
          pill.className = "px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-sm";
        } else {
          pill.textContent = "AI: Belum ada kunci";
          pill.className = "px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow-sm";
        }
      }
      if (srcDisplay) {
        srcDisplay.textContent = keyInfo.source === "ai_studio"
          ? "Kunci dari AI Studio"
          : (keyInfo.source === "user" ? "Kunci yang kamu masukkan" : "Belum ada kunci tersimpan atau terkonfigurasi");
      }
    } catch (e) {
      if (feedback) {
        feedback.className = "text-xs font-semibold text-rose-600 block";
        feedback.textContent = `Gagal menyimpan: ${e.message}`;
      }
    }
  };

  window.__deleteModalKey = function () {
    try {
      localStorage.removeItem("borascan_custom_gemini_api_key");
      const s = getSettings();
      delete s.geminiApiKey;
      saveSettings(s);

      const input = document.getElementById("modal-gemini-key-input");
      if (input) input.value = "";

      const feedback = document.getElementById("modal-key-test-feedback");
      if (feedback) {
        feedback.className = "text-xs font-semibold text-gray-700 block";
        feedback.textContent = "Kunci dihapus dari perangkat ini.";
        setTimeout(() => feedback.classList.add("hidden"), 3000);
      }

      const keyInfo = getEffectiveApiKey();
      const pill = document.getElementById("modal-status-pill");
      const srcDisplay = document.getElementById("key-source-display");
      if (pill) {
        if (keyInfo.key) {
          pill.textContent = "AI: Aktif ✓";
          pill.className = "px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-sm";
        } else {
          pill.textContent = "AI: Belum ada kunci";
          pill.className = "px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow-sm";
        }
      }
      if (srcDisplay) {
        srcDisplay.textContent = keyInfo.source === "ai_studio"
          ? "Kunci dari AI Studio"
          : (keyInfo.source === "user" ? "Kunci yang kamu masukkan" : "Belum ada kunci tersimpan atau terkonfigurasi");
      }
    } catch (e) {
      console.warn(e);
    }
  };

  window.__testModalKey = async function () {
    const input = document.getElementById("modal-gemini-key-input");
    const btn = document.getElementById("modal-btn-test-key");
    const feedback = document.getElementById("modal-key-test-feedback");
    const modelSelect = document.getElementById("modal-model-select");
    const key = (input ? input.value : "").trim() || getApiKey();
    const targetModel = modelSelect ? modelSelect.value : getSelectedModel();

    if (!feedback) return;

    if (!key) {
      feedback.className = "text-xs font-semibold text-rose-600 block";
      feedback.textContent = "Silakan isi API key terlebih dahulu.";
      return;
    }

    if (btn) btn.textContent = "Menguji...";
    feedback.className = "text-xs font-semibold text-gray-500 block";
    feedback.textContent = `Menghubungi Gemini model ${targetModel}...`;

    const res = await window.BoraScanEngine.testGeminiConnection(key, targetModel);
    if (btn) btn.textContent = "Tes koneksi";

    const pill = document.getElementById("modal-status-pill");
    const disp = document.getElementById("modal-active-model-display");

    if (res.success) {
      feedback.className = "text-xs font-semibold text-emerald-600 block";
      feedback.textContent = res.fallbackUsed
        ? `✓ Model ${targetModel} tidak tersedia. Berhasil terhubung otomatis via fallback: ${res.model}!`
        : `✓ Terhubung! Model ${res.model} aktif.`;

      if (res.model && modelSelect) {
        modelSelect.value = res.model;
        if (disp) disp.textContent = res.model;
      }

      if (pill) {
        pill.textContent = "AI: Aktif ✓";
        pill.className = "px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-sm";
      }
    } else {
      feedback.className = "text-xs font-semibold text-rose-600 block";
      feedback.textContent = `Gagal: ${res.error}`;
      if (pill) {
        pill.textContent = "AI: Kunci salah";
        pill.className = "px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow-sm";
      }
    }
  };

  window.__toggleCkSection = function (id) {
    const body = document.getElementById("body-" + id);
    const chev = document.getElementById("chevron-" + id);
    if (body) {
      const isHidden = body.classList.contains("hidden");
      if (isHidden) {
        body.classList.remove("hidden");
        openSectionsMap[id] = true;
        if (chev) chev.classList.add("rotate-180");
      } else {
        body.classList.add("hidden");
        openSectionsMap[id] = false;
        if (chev) chev.classList.remove("rotate-180");
      }
    }
  };

  window.__speakCkSection = function (id, lang) {
    const sections = (lang === "en" ? window.CARA_KERJA_SECTIONS_EN : window.CARA_KERJA_SECTIONS_ID) || [];
    const sec = sections.find((s) => s.id === id);
    if (sec) {
      speakText(`${sec.title}. ${sec.content}`, lang);
    }
  };

  // Run observer
  const observer = new MutationObserver(patchDom);
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("DOMContentLoaded", patchDom);
  setInterval(patchDom, 600);
})();
