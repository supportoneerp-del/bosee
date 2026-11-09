export interface CaraKerjaSection {
  id: string;
  title: string;
  icon: string;
  content: string;
  citations: number[];
}

export interface ScientificReference {
  id: number;
  authorsAndTitle: string;
  source: string;
  url?: string;
  doi?: string;
}

export const CARA_KERJA_SECTIONS_ID: CaraKerjaSection[] = [
  {
    id: "masalah",
    title: "1. Masalahnya",
    icon: "alert-triangle",
    content: "Boraks (Na₂B₄O₇·10H₂O) dilarang sebagai bahan tambahan pangan di Indonesia [1]. Pada hewan, asupan tinggi dikaitkan dengan gangguan reproduksi dan perkembangan [2]. Boraks masih ditemukan pada bakso di pasar [3, 4]. Tes stik kunyit memang murah, tetapi tidak dapat mendeteksi 0,1 % [5], ikut berubah merah pada makanan yang bersifat basa [7], dan harus dinilai dengan mata.",
    citations: [1, 2, 3, 4, 5, 7]
  },
  {
    id: "nata_de_coco",
    title: "2. Nata de coco – wadah strip (biologi)",
    icon: "layers",
    content: "Nata de coco adalah selulosa bakteri yang dihasilkan oleh bakteri Komagataeibacter xylinus saat memfermentasi air kelapa. Seratnya sangat halus (20–100 nm) dan membentuk jaring tiga dimensi yang dapat menahan air lebih dari 100 kali beratnya sendiri [6]. Karena itu nata menyerap ekstrak kunyit dan cairan sampel dengan rata, aman untuk pangan, dan murah. Nata de coco sudah pernah dipakai sebagai wadah pereaksi sensor glukosa [8] dan sebagai label indikator kurkumin [7].\n\nCara membuat strip:\n1. Nata diiris tipis lalu ditekan.\n2. Nata direbus dan direndam air bersih untuk membuang gula dan asam.\n3. Nata direndam dalam ekstrak kunyit (kunyit parut dikocok dengan alkohol, lalu disaring) yang ditambah asam sitrat 10 %, lalu dikeringkan.\n\nPad yang tipis memberi warna yang lebih mudah dibaca.",
    citations: [6, 8, 7]
  },
  {
    id: "kurkumin",
    title: "3. Kurkumin – cara mendeteksi boraks (kimia)",
    icon: "flask",
    content: "Kurkumin adalah pigmen kuning dari kunyit (Curcuma longa).\n- Tahap 1: dalam suasana asam dan saat mengering, asam borat dari boraks bergabung dengan kurkumin membentuk rosocyanine, kompleks berwarna merah. Reaksi ini dasar metode standar penentuan boron dengan kurkumin [9]. Makin banyak boraks, makin merah sampai merah-cokelat tua.\n- Masalah pH: kurkumin juga indikator asam–basa yang menjadi merah-cokelat di suasana basa [7]. Makanan basa (misalnya mi kuning) bisa terbaca palsu sebagai boraks. Asam sitrat dalam strip menjaga suasana tetap asam, sehingga warna merah hanya muncul karena boraks.\n- Tahap 2 – konfirmasi amonia: warna boraks pada kurkumin dipastikan dengan basa. Amonia mengubahnya menjadi hijau-kehitaman [10]. Warna merah yang hanya karena makanan basa tidak berubah seperti itu.",
    citations: [9, 7, 10]
  },
  {
    id: "kartu",
    title: "4. Kartu BoraScan",
    icon: "credit-card",
    content: "Empat kotak hitam di sudut adalah marker ArUco [12]. Aplikasi memakainya untuk menemukan dan meluruskan kartu secara otomatis. Enam patch warna (W putih, G abu-abu, 0 kuning, 1 oranye, 2 merah, B+ hijau gelap) adalah warna pembanding. Karena dicetak di kartu yang sama, patch ini terkena cahaya yang sama dengan pad.",
    citations: [12]
  },
  {
    id: "cara_baca",
    title: "5. Cara aplikasi membaca hasil (Analisis Standar)",
    icon: "cpu",
    content: "1. Menemukan kartu: mendeteksi 4 marker, lalu meluruskan foto menjadi gambar kartu yang lurus.\n2. Cek kualitas: fokus, pantulan, terang-gelap, posisi pad, dan noda pada kartu. Patch yang bernoda tidak dipakai.\n3. Koreksi cahaya: warna terukur keenam patch dibandingkan dengan warna aslinya untuk menghitung matriks koreksi 3 × 3. Ini mengurangi perbedaan antar-HP dan antar-cahaya [11].\n4. Membaca pad: hanya bagian pad yang tidak mengkilap dan tidak terlalu gelap yang dipakai. Warnanya diubah ke ruang warna CIELAB (L* terang, a* merah–hijau, b* kuning–biru, sudut warna h) [13].\n5. Memutuskan kode:\n   - Pergeseran warna dari kuning ke merah (Δh) menunjukkan ada atau tidaknya boraks: Δh ≥ 12° → kode 2, 6–12° → kode 1.\n   - Penyerapan cahaya hijau (A_G) dibandingkan dengan kalibrasi batch strip (QR di sachet) untuk memperkirakan kadar dalam % dan mg/kg. Batas deteksi dihitung dengan 3,3 σ / slope [14].\n   - Kalau pad terlalu gelap, aplikasi tetap melaporkan boraks dari pergeseran warnanya, tetapi kadarnya ditulis \"≥ batas kalibrasi\".\n6. Tes amonia: foto sebelum dan sesudah amonia dibandingkan.\n   - Warna merah hilang atau pad menjadi hijau-kehitaman → B+.\n   - Merah tetap → B−.\n   - Tidak bisa dinilai → \"Tidak pasti / Indikasi kuat boraks\".",
    citations: [11, 13, 14]
  },
  {
    id: "analisis_ai",
    title: "6. Bagaimana AI menganalisis (Analisis Detail AI)",
    icon: "sparkles",
    content: "Setelah Analisis Standar selesai, aplikasi dapat meminta pendapat kedua dari model AI Gemini [20]. Ini hanya berjalan jika Analisis AI aktif, ada internet, dan kunci AI sudah diatur.\n- Yang dikirim: hanya gambar kartu yang sudah diluruskan (tanpa latar, wajah, atau lokasi) dan angka hasil ukur (L*, a*, b*, h, Δh, A_G, kualitas foto, kode standar). Pada tes amonia, gambar sebelum dan sesudah dikirim bersama agar AI bisa membandingkan.\n- Yang diminta dari AI: AI diberi penjelasan tentang kartu, patch, reaksi kurkumin–boraks dan tes amonia. Lalu AI diminta menjawab dalam format tetap: apakah pad terlihat; deskripsi warna dan masalah foto (pad tebal, pantulan, noda, di luar slot, buram); patch yang paling mirip; apakah boraks kemungkinan ada (ya / tidak / tidak pasti); perubahan setelah amonia (hijau-kehitaman / hanya lebih gelap / tidak berubah); tingkat keyakinan; penjelasan singkat dalam Bahasa Indonesia dan Inggris.\n- Cara menggabungkan: Analisis Standar tetap hasil utama. AI hanya boleh menambah kewaspadaan:\n   - Standar 0/1 tetapi AI yakin ada boraks → hasil naik menjadi \"Kemungkinan boraks – lakukan tes amonia\".\n   - Standar B− tetapi AI melihat hijau-kehitaman → \"Tidak pasti – ulangi / uji lab\".\n   - AI tidak pernah mengubah hasil positif menjadi aman.\n- Batasan AI: AI bisa salah membaca warna dari foto. Karena itu jawabannya ditampilkan terpisah, lengkap dengan tingkat keyakinan, dan tidak menggantikan uji laboratorium.",
    citations: [20]
  },
  {
    id: "aksesibilitas",
    title: "7. Untuk semua orang, termasuk buta warna",
    icon: "eye",
    content: "Sekitar 1 dari 12 laki-laki mengalami buta warna [15]. Karena itu warna tidak pernah menjadi satu-satunya tanda [16]. Setiap hasil ditampilkan sebagai kode + simbol + pola + tulisan, dibacakan, dan diberi getaran yang berbeda. Warnanya memakai palet Okabe–Ito [17] dan sudah dicek dengan simulasi buta warna [18].",
    citations: [15, 16, 17, 18]
  },
  {
    id: "lapor_bpom",
    title: "8. Lapor ke BPOM",
    icon: "send",
    content: "Hasil B+ bisa dikirim ke kanal pengaduan HaloBPOM lewat WhatsApp (+62 811 9181 533) [19]. Isinya jenis makanan, tanggal, hasil, perkiraan kadar, batch strip, dan foto strip.",
    citations: [19]
  },
  {
    id: "batasan",
    title: "9. Batasan",
    icon: "shield-alert",
    content: "BoraScan adalah tes skrining, bukan hasil laboratorium. Hasil positif perlu dikonfirmasi laboratorium. Ketepatan bergantung pada strip yang baik (tipis, kering, belum kedaluwarsa), kartu yang bersih, dan foto sesuai panduan.",
    citations: []
  }
];

export const REFERENCES_LIST: ScientificReference[] = [
  { id: 1, authorsAndTitle: "Kementerian Kesehatan RI", source: "Permenkes No. 033 Tahun 2012 tentang Bahan Tambahan Pangan, Jakarta, 2012" },
  { id: 2, authorsAndTitle: "Hadrup N., Frederiksen M., Sharma A.K.", source: "Toxicity of boric acid, borax and other boron containing compounds: A review, Regulatory Toxicology and Pharmacology 121 (2021) 104873", url: "https://doi.org/10.1016/j.yrtph.2021.104873" },
  { id: 3, authorsAndTitle: "Suseno D.", source: "Analisis kualitatif dan kuantitatif kandungan boraks pada bakso…, Indonesia Journal of Halal 2(1) (2019) 1–9", url: "https://doi.org/10.14710/halal.v2i1.4968" },
  { id: 4, authorsAndTitle: "Rahma D.A., Sari E.M., Nurfajriah S.", source: "Identifikasi kandungan boraks pada bakso… Tambun Selatan, J. Research and Education Chemistry 5(1) (2023)", url: "https://doi.org/10.25299/jrec.2023.vol5(1).12502" },
  { id: 5, authorsAndTitle: "Darmawati et al.", source: "Detection of borax in meatball snacks using curcumin sticks, AICH 2(1) (2025) 25–33", url: "https://journal.poltekkesaceh.ac.id/index.php/aich/article/view/1064" },
  { id: 6, authorsAndTitle: "Gorgieva S., Trček J.", source: "Bacterial cellulose: Production, modification and perspectives in biomedical applications, Nanomaterials 9(10) (2019) 1352", url: "https://doi.org/10.3390/nano9101352" },
  { id: 7, authorsAndTitle: "Rahmayanti H.D. et al.", source: "Visual pH-sensing films based nata de coco containing curcumin…, Proc. iCAST-ES (2022) 663–668", url: "https://doi.org/10.5220/0011862000003575" },
  { id: 8, authorsAndTitle: "Indarti D., Asnawati", source: "Characterization of nata de coco–Benedict film… as sensor for glucose, Jurnal Ilmu Dasar 12(2) (2011) 200–209", url: "https://jurnal.unej.ac.id/index.php/JID/article/view/68" },
  { id: 9, authorsAndTitle: "APHA, AWWA, WEF", source: "Method 4500-B B: Boron by curcumin method, Standard Methods for the Examination of Water and Wastewater, 23rd ed., 2017" },
  { id: 10, authorsAndTitle: "Svehla G.", source: "Vogel's Qualitative Inorganic Analysis, 7th ed., Longman, 1996" },
  { id: 11, authorsAndTitle: "Fyfe C. et al.", source: "RGB color correction and gamut limitations in smartphone-based kinetic analysis…, Analytical and Bioanalytical Chemistry 417(25) (2025) 5753–5770", url: "https://doi.org/10.1007/s00216-025-06021-9" },
  { id: 12, authorsAndTitle: "Garrido-Jurado S. et al.", source: "Automatic generation and detection of highly reliable fiducial markers under occlusion, Pattern Recognition 47(6) (2014) 2280–2292", url: "https://doi.org/10.1016/j.patcog.2014.01.005" },
  { id: 13, authorsAndTitle: "CIE", source: "Colorimetry, 4th ed., CIE 015:2018", url: "https://doi.org/10.25039/TR.015.2018" },
  { id: 14, authorsAndTitle: "ICH", source: "Q2(R1) Validation of Analytical Procedures: Text and Methodology, 2005" },
  { id: 15, authorsAndTitle: "National Eye Institute", source: "Color Blindness", url: "https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/color-blindness" },
  { id: 16, authorsAndTitle: "W3C", source: "Understanding Success Criterion 1.4.1: Use of Color, WCAG 2.2", url: "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html" },
  { id: 17, authorsAndTitle: "Okabe M., Ito K.", source: "Color Universal Design (CUD), J*Fly, 2008", url: "https://jfly.uni-koeln.de/color" },
  { id: 18, authorsAndTitle: "Machado G.M., Oliveira M.M., Fernandes L.A.F.", source: "A physiologically-based model for simulation of color vision deficiency, IEEE TVCG 15(6) (2009) 1291–1298", url: "https://lume.ufrgs.br/handle/10183/27630" },
  { id: 19, authorsAndTitle: "BPOM", source: "Laporkan melalui BPOM Mobile (HaloBPOM)", url: "https://www.pom.go.id/katabpom/laporkan-melalui-bpom-mobile" },
  { id: 20, authorsAndTitle: "Google", source: "Gemini API documentation", url: "https://ai.google.dev/gemini-api/docs" }
];
