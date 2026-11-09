# BoraScan – NEW MENU "Cara Kerja & Kunci AI" (paste into the same AI Studio project)

Add **one new menu page**. Do not change anything else in the app.

## 1. Where it appears (all three are required)

1. **Bottom navigation:** add a tab **"Cara Kerja"** with a **key icon** (inline SVG line icon). Order: Beranda · Riwayat · Panduan · **Cara Kerja** · Pengaturan. If the Referensi tab from the last prompt exists, replace it with this tab (its content moves here).
2. **Home screen:** add a full-width button **"Cara Kerja & Kunci AI"** (key icon) under "Mulai tes baru".
3. **Result screens:** the AI card's "API key belum diatur" message and the link "Kenapa hasilnya begini?" open this page.

**Implementation:**
- Create `src/screens/HowItWorks.tsx` with the route `/cara-kerja`.
- Add the route to the router.
- Add the item to the bottom-navigation items array.
- Put all texts in `src/content/caraKerja.id.ts` and `src/content/caraKerja.en.ts`.

**When finished, show me the changed lines of the router and of the bottom-navigation component** so I can check that the tab really exists.

## 2. Page layout

**Title:** **"Cara Kerja & Kunci AI"**.

**Top of the page:** a status pill with the AI status, then two segments (tabs inside the page):
- **"Kunci AI"**: the settings form (§3).
- **"Cara Kerja"**: the explanation (§4), as accordion sections. Each section has a line icon, a speaker button that reads it aloud, and citation numbers that scroll to the reference list.

**Language:** Bahasa Indonesia is the default. The English version is a faithful translation with the same citation numbers.

**Accessibility:**
- touch targets ≥ 48 px;
- all text readable by TalkBack;
- the text works offline; links open in the external browser.

## 3. Segment "Kunci AI" (settings for the AI)

- **Status card:** "AI: Aktif ✓ / Belum ada kunci / Offline / Kunci salah". Show which key is used: "Kunci dari AI Studio" or "Kunci yang kamu masukkan".
- **Switch:** "Analisis AI (butuh internet)", default ON. Move it here from Pengaturan.
- **Field "Gemini API key":**
  - password input with a show/hide eye button;
  - buttons **Simpan**, **Tes koneksi** and **Hapus kunci**;
  - *Tes koneksi* sends one tiny text request to the model and shows "✓ Terhubung" or the error message.
- **Key order:**
  1. the key provided by AI Studio, from the environment variable this project already uses (`process.env.API_KEY` or `process.env.GEMINI_API_KEY`);
  2. the key saved here.
- **Storage:** save the key only on this device (IndexedDB settings). Never show it in logs, PDF, CSV or the BPOM message.
- **Help text with link:**
  > "Cara mendapatkan kunci: buka Google AI Studio → **Get API key** → buat kunci → salin dan tempel di sini. https://aistudio.google.com/app/apikey"
  > "Hanya gambar kartu dan angka hasil ukur yang dikirim ke AI – tanpa lokasi, tanpa nama."
- **Model:** show the model name from `config.ts` (`AI_MODEL`) as read-only text.

## 4. Segment "Cara Kerja" – text to show (Bahasa Indonesia)

**1. Masalahnya**
Boraks (Na₂B₄O₇·10H₂O) dilarang sebagai bahan tambahan pangan di Indonesia [1]. Pada hewan, asupan tinggi dikaitkan dengan gangguan reproduksi dan perkembangan [2]. Boraks masih ditemukan pada bakso di pasar [3, 4]. Tes stik kunyit memang murah, tetapi tidak dapat mendeteksi 0,1 % [5], ikut berubah merah pada makanan yang bersifat basa [7], dan harus dinilai dengan mata.

**2. Nata de coco – wadah strip (biologi)**
Nata de coco adalah **selulosa bakteri** yang dihasilkan oleh bakteri *Komagataeibacter xylinus* saat memfermentasi air kelapa. Seratnya sangat halus (20–100 nm) dan membentuk jaring tiga dimensi yang dapat menahan air lebih dari 100 kali beratnya sendiri [6]. Karena itu nata menyerap ekstrak kunyit dan cairan sampel dengan rata, aman untuk pangan, dan murah. Nata de coco sudah pernah dipakai sebagai wadah pereaksi sensor glukosa [8] dan sebagai label indikator kurkumin [7].
*Cara membuat strip:*
1. Nata diiris tipis lalu ditekan.
2. Nata direbus dan direndam air bersih untuk membuang gula dan asam.
3. Nata direndam dalam ekstrak kunyit (kunyit parut dikocok dengan alkohol, lalu disaring) yang ditambah asam sitrat 10 %, lalu dikeringkan.

**Pad yang tipis memberi warna yang lebih mudah dibaca.**

**3. Kurkumin – cara mendeteksi boraks (kimia)**
Kurkumin adalah pigmen kuning dari kunyit (*Curcuma longa*).
- **Tahap 1:** dalam suasana asam dan saat mengering, asam borat dari boraks bergabung dengan kurkumin membentuk **rosocyanine**, kompleks berwarna **merah**. Reaksi ini dasar metode standar penentuan boron dengan kurkumin [9]. Makin banyak boraks, makin merah sampai merah-cokelat tua.
- **Masalah pH:** kurkumin juga indikator asam–basa yang menjadi merah-cokelat di suasana basa [7]. Makanan basa (misalnya mi kuning) bisa terbaca palsu sebagai boraks. **Asam sitrat dalam strip** menjaga suasana tetap asam, sehingga warna merah hanya muncul karena boraks.
- **Tahap 2 – konfirmasi amonia:** warna boraks pada kurkumin dipastikan dengan basa. Amonia mengubahnya menjadi **hijau-kehitaman** [10]. Warna merah yang hanya karena makanan basa tidak berubah seperti itu.

**4. Kartu BoraScan**
Empat kotak hitam di sudut adalah **marker ArUco** [12]. Aplikasi memakainya untuk menemukan dan meluruskan kartu secara otomatis. Enam patch warna (W putih, G abu-abu, 0 kuning, 1 oranye, 2 merah, B+ hijau gelap) adalah warna pembanding. Karena dicetak di kartu yang sama, patch ini terkena cahaya yang sama dengan pad.

**5. Cara aplikasi membaca hasil (Analisis Standar)**
1. **Menemukan kartu:** mendeteksi 4 marker, lalu meluruskan foto menjadi gambar kartu yang lurus.
2. **Cek kualitas:** fokus, pantulan, terang-gelap, posisi pad, dan noda pada kartu. Patch yang bernoda tidak dipakai.
3. **Koreksi cahaya:** warna terukur keenam patch dibandingkan dengan warna aslinya untuk menghitung matriks koreksi 3 × 3. Ini mengurangi perbedaan antar-HP dan antar-cahaya [11].
4. **Membaca pad:** hanya bagian pad yang tidak mengkilap dan tidak terlalu gelap yang dipakai. Warnanya diubah ke ruang warna **CIELAB** (L\* terang, a\* merah–hijau, b\* kuning–biru, sudut warna h) [13].
5. **Memutuskan kode:**
   - **Pergeseran warna dari kuning ke merah (Δh)** menunjukkan ada atau tidaknya boraks: Δh ≥ 12° → kode 2, 6–12° → kode 1.
   - **Penyerapan cahaya hijau (A_G)** dibandingkan dengan kalibrasi batch strip (QR di sachet) untuk memperkirakan **kadar dalam % dan mg/kg**. Batas deteksi dihitung dengan 3,3 σ / slope [14].
   - Kalau pad terlalu gelap, aplikasi tetap melaporkan boraks dari pergeseran warnanya, tetapi kadarnya ditulis "≥ batas kalibrasi".
6. **Tes amonia:** foto sebelum dan sesudah amonia dibandingkan.
   - Warna merah hilang atau pad menjadi hijau-kehitaman → **B+**.
   - Merah tetap → **B−**.
   - Tidak bisa dinilai → **"Tidak pasti / Indikasi kuat boraks"**.

**6. Bagaimana AI menganalisis (Analisis Detail AI)**
Setelah Analisis Standar selesai, aplikasi dapat meminta **pendapat kedua** dari model AI **Gemini** [20]. Ini hanya berjalan jika Analisis AI aktif, ada internet, dan kunci AI sudah diatur.
- **Yang dikirim:** hanya gambar kartu yang sudah diluruskan (tanpa latar, wajah, atau lokasi) dan angka hasil ukur (L\*, a\*, b\*, h, Δh, A_G, kualitas foto, kode standar). Pada tes amonia, **gambar sebelum dan sesudah dikirim bersama** agar AI bisa membandingkan.
- **Yang diminta dari AI:** AI diberi penjelasan tentang kartu, patch, reaksi kurkumin–boraks dan tes amonia. Lalu AI diminta menjawab dalam format tetap:
  - apakah pad terlihat;
  - deskripsi warna dan masalah foto (pad tebal, pantulan, noda, di luar slot, buram);
  - patch yang paling mirip;
  - apakah boraks kemungkinan ada (ya / tidak / tidak pasti);
  - perubahan setelah amonia (hijau-kehitaman / hanya lebih gelap / tidak berubah);
  - tingkat keyakinan;
  - penjelasan singkat dalam Bahasa Indonesia dan Inggris.
- **Cara menggabungkan:** **Analisis Standar tetap hasil utama.** AI hanya boleh **menambah kewaspadaan**:
  - Standar 0/1 tetapi AI yakin ada boraks → hasil naik menjadi "Kemungkinan boraks – lakukan tes amonia".
  - Standar B− tetapi AI melihat hijau-kehitaman → "Tidak pasti – ulangi / uji lab".
  - AI **tidak pernah** mengubah hasil positif menjadi aman.
- **Batasan AI:** AI bisa salah membaca warna dari foto. Karena itu jawabannya ditampilkan terpisah, lengkap dengan tingkat keyakinan, dan tidak menggantikan uji laboratorium.

**7. Untuk semua orang, termasuk buta warna**
Sekitar 1 dari 12 laki-laki mengalami buta warna [15]. Karena itu warna tidak pernah menjadi satu-satunya tanda [16]. Setiap hasil ditampilkan sebagai **kode + simbol + pola + tulisan**, dibacakan, dan diberi getaran yang berbeda. Warnanya memakai palet Okabe–Ito [17] dan sudah dicek dengan simulasi buta warna [18].

**8. Lapor ke BPOM**
Hasil B+ bisa dikirim ke kanal pengaduan HaloBPOM lewat WhatsApp (+62 811 9181 533) [19]. Isinya jenis makanan, tanggal, hasil, perkiraan kadar, batch strip, dan foto strip.

**9. Batasan**
BoraScan adalah **tes skrining, bukan hasil laboratorium**. Hasil positif perlu dikonfirmasi laboratorium. Ketepatan bergantung pada strip yang baik (tipis, kering, belum kedaluwarsa), kartu yang bersih, dan foto sesuai panduan.

## 5. Reference list (bottom of the "Cara Kerja" segment, numbered, links tappable)

1. Kementerian Kesehatan RI, Permenkes No. 033 Tahun 2012 tentang Bahan Tambahan Pangan, Jakarta, 2012.
2. Hadrup N., Frederiksen M., Sharma A.K., Toxicity of boric acid, borax and other boron containing compounds: A review, *Regulatory Toxicology and Pharmacology* 121 (2021) 104873. https://doi.org/10.1016/j.yrtph.2021.104873
3. Suseno D., Analisis kualitatif dan kuantitatif kandungan boraks pada bakso…, *Indonesia Journal of Halal* 2(1) (2019) 1–9. https://doi.org/10.14710/halal.v2i1.4968
4. Rahma D.A., Sari E.M., Nurfajriah S., Identifikasi kandungan boraks pada bakso… Tambun Selatan, *J. Research and Education Chemistry* 5(1) (2023). https://doi.org/10.25299/jrec.2023.vol5(1).12502
5. Darmawati et al., Detection of borax in meatball snacks using curcumin sticks, *AICH* 2(1) (2025) 25–33. https://journal.poltekkesaceh.ac.id/index.php/aich/article/view/1064
6. Gorgieva S., Trček J., Bacterial cellulose: Production, modification and perspectives in biomedical applications, *Nanomaterials* 9(10) (2019) 1352. https://doi.org/10.3390/nano9101352
7. Rahmayanti H.D. et al., Visual pH-sensing films based nata de coco containing curcumin…, *Proc. iCAST-ES* (2022) 663–668. https://doi.org/10.5220/0011862000003575
8. Indarti D., Asnawati, Characterization of nata de coco–Benedict film… as sensor for glucose, *Jurnal Ilmu Dasar* 12(2) (2011) 200–209. https://jurnal.unej.ac.id/index.php/JID/article/view/68
9. APHA, AWWA, WEF, Method 4500-B B: Boron by curcumin method, *Standard Methods for the Examination of Water and Wastewater*, 23rd ed., 2017.
10. Svehla G., *Vogel's Qualitative Inorganic Analysis*, 7th ed., Longman, 1996.
11. Fyfe C. et al., RGB color correction and gamut limitations in smartphone-based kinetic analysis…, *Analytical and Bioanalytical Chemistry* 417(25) (2025) 5753–5770. https://doi.org/10.1007/s00216-025-06021-9
12. Garrido-Jurado S. et al., Automatic generation and detection of highly reliable fiducial markers under occlusion, *Pattern Recognition* 47(6) (2014) 2280–2292. https://doi.org/10.1016/j.patcog.2014.01.005
13. CIE, *Colorimetry*, 4th ed., CIE 015:2018. https://doi.org/10.25039/TR.015.2018
14. ICH, Q2(R1) Validation of Analytical Procedures: Text and Methodology, 2005.
15. National Eye Institute, Color Blindness. https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/color-blindness
16. W3C, Understanding Success Criterion 1.4.1: Use of Color, WCAG 2.2. https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
17. Okabe M., Ito K., Color Universal Design (CUD), J*Fly, 2008. https://jfly.uni-koeln.de/color
18. Machado G.M., Oliveira M.M., Fernandes L.A.F., A physiologically-based model for simulation of color vision deficiency, *IEEE TVCG* 15(6) (2009) 1291–1298. https://lume.ufrgs.br/handle/10183/27630
19. BPOM, Laporkan melalui BPOM Mobile (HaloBPOM). https://www.pom.go.id/katabpom/laporkan-melalui-bpom-mobile
20. Google, Gemini API documentation. https://ai.google.dev/gemini-api/docs

## 6. Check before you finish

- [ ] The tab "Cara Kerja" (key icon) is visible in the bottom navigation on every main screen.
- [ ] The Home button "Cara Kerja & Kunci AI" opens the page.
- [ ] The segment "Kunci AI": Simpan, Tes koneksi and Hapus kunci work; the status updates.
- [ ] The segment "Cara Kerja" shows all 9 sections and the 20 references; every [n] in the text scrolls to its reference.
- [ ] The AI analysis uses the key from this page when the AI Studio key is not available.
- [ ] Show the changed router and bottom-navigation code.
