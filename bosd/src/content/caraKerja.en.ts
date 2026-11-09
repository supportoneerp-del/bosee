import { CaraKerjaSection, ScientificReference } from './caraKerja.id';

export const CARA_KERJA_SECTIONS_EN: CaraKerjaSection[] = [
  {
    id: "masalah",
    title: "1. The Problem",
    icon: "alert-triangle",
    content: "Borax (Na₂B₄O₇·10H₂O) is prohibited as a food additive in Indonesia [1]. In animal studies, high intake is associated with reproductive and developmental impairment [2]. Borax is still frequently encountered in market meatballs [3, 4]. While traditional turmeric paper strips are affordable, they cannot reliably detect 0.1% concentrations [5], turn red in alkaline foods [7], and require subjective visual assessment.",
    citations: [1, 2, 3, 4, 5, 7]
  },
  {
    id: "nata_de_coco",
    title: "2. Nata de Coco – Strip Carrier (Biology)",
    icon: "layers",
    content: "Nata de coco is bacterial cellulose synthesized by Komagataeibacter xylinus bacteria during the fermentation of coconut water. Its ultra-fine nanofibrils (20–100 nm) form a coherent 3D hydrogel network capable of holding over 100 times its dry weight in water [6]. Consequently, nata absorbs turmeric extract and liquid food samples homogeneously, is food-safe, and highly cost-effective. Nata de coco has previously been demonstrated as a substrate for glucose sensing [8] and as curcumin indicator films [7].\n\nStrip Preparation Procedure:\n1. Nata is sliced thinly and pressed mechanically.\n2. Boiled and washed thoroughly in purified water to remove residual sugars and acids.\n3. Immersed in curcumin extract (grated turmeric macerated in ethanol and filtered) acidified with 10% citric acid, then dried.\n\nThin indicator pads provide clearer and more accurate colorimetric readouts.",
    citations: [6, 8, 7]
  },
  {
    id: "kurkumin",
    title: "3. Curcumin – Borax Detection Mechanism (Chemistry)",
    icon: "flask",
    content: "Curcumin is the principal yellow polyphenol extracted from turmeric (Curcuma longa).\n- Phase 1: In acidic conditions and upon drying, boric acid derived from borax complexes with curcumin to produce rosocyanine, an intensely red coordination complex. This reaction constitutes the foundation of standard colorimetric boron analysis [9]. Higher borax concentrations yield darker red to red-brown hues.\n- pH Interferences: Curcumin also functions as a natural acid-base indicator, turning red-brown under alkaline conditions [7]. Alkaline foodstuffs (such as alkaline yellow noodles) could thus trigger false positives. Incorporating citric acid into the strip maintains an acidic microenvironment, ensuring red coloration arises exclusively from borax complexation.\n- Phase 2 – Ammonia Confirmation: Borax-induced red color is definitively verified with vapor-phase ammonia. Exposure to ammonia transforms rosocyanine into a characteristic dark greenish-black hue [10]. Alkaline-induced red artifacts do not exhibit this distinct chromic shift.",
    citations: [9, 7, 10]
  },
  {
    id: "kartu",
    title: "4. BoraScan Calibration Card",
    icon: "credit-card",
    content: "The four black corner squares are planar ArUco fiducial markers [12]. The computer vision engine uses them to locate and rectify the card perspective automatically. Six color calibration patches (W white, G gray, 0 yellow baseline, 1 orange threshold, 2 red warning, B+ dark green ammonia confirmation) serve as on-card colorimetric standards. Printed on the same substrate, these reference patches experience identical illumination conditions as the reaction pad.",
    citations: [12]
  },
  {
    id: "cara_baca",
    title: "5. How the App Analyzes Results (Standard Analysis)",
    icon: "cpu",
    content: "1. Card Detection: Identifies the 4 ArUco markers and warps the perspective into a rectified planar geometry.\n2. Quality Assessment: Evaluates focus sharpness, specular glare, lighting uniformity, pad placement, and surface blemishes. Tainted reference patches are discarded from calculations.\n3. Chromatic Correction: Measured RGB values across the 6 patches are mapped against calibrated colorimetry via a 3x3 transformation matrix, compensating for ambient illuminant spectra and smartphone camera sensor discrepancies [11].\n4. Pad Extraction: Non-glare, non-shadowed pixels within the pad ROI are sampled and converted to the CIELAB color space (L* luminance, a* red-green, b* yellow-blue, h metric hue angle) [13].\n5. Decision Logic:\n   - Hue angle shift from yellow toward red (Δh) determines borax presence: Δh ≥ 12° → Code 2 (Definite), 6°–12° → Code 1 (Trace/Suspect).\n   - Green channel optical absorbance (A_G) is calibrated against the strip batch envelope QR curve to quantify concentration in % and mg/kg. The limit of detection is defined by 3.3 σ / slope [14].\n   - If the pad exhibits optical saturation/deep coloration, borax presence is reported via hue shift with concentration qualified as \"≥ calibration limit\".\n6. Ammonia Confirmatory Test: Compares pre- and post-ammonia images.\n   - Red disappears or transitions to dark greenish-black → B+ (Confirmed).\n   - Red persists unchanged → B− (Negative / Alkaline interference).\n   - Inconclusive color dynamics → \"Inconclusive / Strong indication of borax\".",
    citations: [11, 13, 14]
  },
  {
    id: "analisis_ai",
    title: "6. How AI Analyzes (Detailed AI Analysis)",
    icon: "sparkles",
    content: "Following Standard Analysis, the application can request an independent second opinion from the Gemini multimodal AI model [20]. This runs exclusively when AI Analysis is enabled, network connectivity is present, and an API key is configured.\n- Transmitted Data: Strictly the perspective-rectified card image (isolated from backgrounds, faces, or location metadata) and quantitative measurements (L*, a*, b*, h, Δh, A_G, image quality metrics, standard classification). For ammonia tests, before-and-after cropped images are sent together for differential analysis.\n- AI Prompting: The model is prompted with structured biochemical domain context regarding the card layout, color standards, curcumin-borate rosocyanine reaction, and ammonia vapor shifts. It responds in a rigid JSON schema covering: pad visibility, color nuances and visual anomalies (thickness, glare, stains, misalignment), nearest reference patch, borax presence probability, ammonia spectral shift, confidence score, and dual-language explanations.\n- Ensemble Logic: Standard algorithmic analysis remains primary. AI serves strictly as an escalation safeguard:\n   - Standard 0 or 1 with strong AI suspicion → escalates to \"Suspected Borax – Perform ammonia confirmation\".\n   - Standard B− with AI detecting dark greenish-black → escalates to \"Inconclusive – Repeat test or send for laboratory analysis\".\n   - The AI model NEVER downgrades a positive warning into a clean/safe status.\n- Limitations: Vision models may misinterpret subtle color gradients. Hence, AI insights are partitioned transparently with explicit confidence levels and do not replace certified laboratory assays.",
    citations: [20]
  },
  {
    id: "aksesibilitas",
    title: "7. Designed for Everyone, Including Color Blindness",
    icon: "eye",
    content: "Approximately 1 in 12 men experiences some form of color vision deficiency [15]. Therefore, color is never utilized as the sole information channel [16]. Every detection outcome pairs color with a distinct Code + Symbol + Pattern + Textual verdict, accompanied by text-to-speech voicing and haptic vibration signatures. Palette colors are based on the Okabe–Ito universal design scheme [17] and validated through dichromatic vision simulation models [18].",
    citations: [15, 16, 17, 18]
  },
  {
    id: "lapor_bpom",
    title: "8. Reporting to BPOM",
    icon: "send",
    content: "Confirmed B+ violations can be submitted directly to the Indonesian FDA (BPOM) complaint channel via HaloBPOM WhatsApp (+62 811 9181 533) [19]. The pre-formatted report compiles food product type, timestamp, analytical score, estimated concentration, strip batch number, and high-resolution pad evidence.",
    citations: [19]
  },
  {
    id: "batasan",
    title: "9. Limitations",
    icon: "shield-alert",
    content: "BoraScan is a rapid on-site field screening tool, not a certified regulatory laboratory assay. Presumptive positive findings require formal laboratory verification. Analytical accuracy is contingent upon strip integrity (thin, dry, unexpired), a clean planar calibration card, and adherence to photography guidelines.",
    citations: []
  }
];

export const SCIENTIFIC_REFERENCES: ScientificReference[] = [
  {
    id: 1,
    authorsAndTitle: "Kementerian Kesehatan RI, Permenkes No. 033 Tahun 2012 tentang Bahan Tambahan Pangan",
    source: "Jakarta, 2012."
  },
  {
    id: 2,
    authorsAndTitle: "Hadrup N., Frederiksen M., Sharma A.K., Toxicity of boric acid, borax and other boron containing compounds: A review",
    source: "Regulatory Toxicology and Pharmacology 121 (2021) 104873.",
    doi: "10.1016/j.yrtph.2021.104873",
    url: "https://doi.org/10.1016/j.yrtph.2021.104873"
  },
  {
    id: 3,
    authorsAndTitle: "Suseno D., Analisis kualitatif dan kuantitatif kandungan boraks pada bakso…",
    source: "Indonesia Journal of Halal 2(1) (2019) 1–9.",
    doi: "10.14710/halal.v2i1.4968",
    url: "https://doi.org/10.14710/halal.v2i1.4968"
  },
  {
    id: 4,
    authorsAndTitle: "Rahma D.A., Sari E.M., Nurfajriah S., Identifikasi kandungan boraks pada bakso… Tambun Selatan",
    source: "J. Research and Education Chemistry 5(1) (2023).",
    doi: "10.25299/jrec.2023.vol5(1).12502",
    url: "https://doi.org/10.25299/jrec.2023.vol5(1).12502"
  },
  {
    id: 5,
    authorsAndTitle: "Darmawati et al., Detection of borax in meatball snacks using curcumin sticks",
    source: "AICH 2(1) (2025) 25–33.",
    url: "https://journal.poltekkesaceh.ac.id/index.php/aich/article/view/1064"
  },
  {
    id: 6,
    authorsAndTitle: "Gorgieva S., Trček J., Bacterial cellulose: Production, modification and perspectives in biomedical applications",
    source: "Nanomaterials 9(10) (2019) 1352.",
    doi: "10.3390/nano9101352",
    url: "https://doi.org/10.3390/nano9101352"
  },
  {
    id: 7,
    authorsAndTitle: "Rahmayanti H.D. et al., Visual pH-sensing films based nata de coco containing curcumin…",
    source: "Proc. iCAST-ES (2022) 663–668.",
    doi: "10.5220/0011862000003575",
    url: "https://doi.org/10.5220/0011862000003575"
  },
  {
    id: 8,
    authorsAndTitle: "Indarti D., Asnawati, Characterization of nata de coco–Benedict film… as sensor for glucose",
    source: "Jurnal Ilmu Dasar 12(2) (2011) 200–209.",
    url: "https://jurnal.unej.ac.id/index.php/JID/article/view/68"
  },
  {
    id: 9,
    authorsAndTitle: "APHA, AWWA, WEF, Method 4500-B B: Boron by curcumin method",
    source: "Standard Methods for the Examination of Water and Wastewater, 23rd ed., 2017."
  },
  {
    id: 10,
    authorsAndTitle: "Svehla G., Vogel's Qualitative Inorganic Analysis",
    source: "7th ed., Longman, 1996."
  },
  {
    id: 11,
    authorsAndTitle: "Fyfe C. et al., RGB color correction and gamut limitations in smartphone-based kinetic analysis…",
    source: "Analytical and Bioanalytical Chemistry 417(25) (2025) 5753–5770.",
    doi: "10.1007/s00216-025-06021-9",
    url: "https://doi.org/10.1007/s00216-025-06021-9"
  },
  {
    id: 12,
    authorsAndTitle: "Garrido-Jurado S. et al., Automatic generation and detection of highly reliable fiducial markers under occlusion",
    source: "Pattern Recognition 47(6) (2014) 2280–2292.",
    doi: "10.1016/j.patcog.2014.01.005",
    url: "https://doi.org/10.1016/j.patcog.2014.01.005"
  },
  {
    id: 13,
    authorsAndTitle: "CIE, Colorimetry, 4th ed., CIE 015:2018",
    source: "Commission Internationale de l'Éclairage.",
    doi: "10.25039/TR.015.2018",
    url: "https://doi.org/10.25039/TR.015.2018"
  },
  {
    id: 14,
    authorsAndTitle: "ICH, Q2(R1) Validation of Analytical Procedures: Text and Methodology",
    source: "International Council for Harmonisation, 2005."
  },
  {
    id: 15,
    authorsAndTitle: "National Eye Institute, Color Blindness",
    source: "National Institutes of Health.",
    url: "https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/color-blindness"
  },
  {
    id: 16,
    authorsAndTitle: "W3C, Understanding Success Criterion 1.4.1: Use of Color, WCAG 2.2",
    source: "World Wide Web Consortium.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html"
  },
  {
    id: 17,
    authorsAndTitle: "Okabe M., Ito K., Color Universal Design (CUD)",
    source: "J*Fly, 2008.",
    url: "https://jfly.uni-koeln.de/color"
  },
  {
    id: 18,
    authorsAndTitle: "Machado G.M., Oliveira M.M., Fernandes L.A.F., A physiologically-based model for simulation of color vision deficiency",
    source: "IEEE TVCG 15(6) (2009) 1291–1298.",
    url: "https://lume.ufrgs.br/handle/10183/27630"
  },
  {
    id: 19,
    authorsAndTitle: "BPOM, Laporkan melalui BPOM Mobile (HaloBPOM)",
    source: "Badan Pengawas Obat dan Makanan RI.",
    url: "https://www.pom.go.id/katabpom/laporkan-melalui-bpom-mobile"
  },
  {
    id: 20,
    authorsAndTitle: "Google, Gemini API documentation",
    source: "Google DeepMind.",
    url: "https://ai.google.dev/gemini-api/docs"
  }
];
