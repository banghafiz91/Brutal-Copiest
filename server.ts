import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Check for Gemini API key
  let ai: GoogleGenAI | null = null;
  try {
    if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
  }

  // API Routes
  app.post("/api/generate", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
      }

      const { topic, slidesCount, visualStyle, contentGoal, brandName, brandDescription } = req.body;
      const mood = req.body.mood || "dark luxury";
      const niche = req.body.niche || "branding";

      if (!topic || !slidesCount || !visualStyle || !contentGoal) {
        return res.status(400).json({ error: "Missing required fields: topic, slidesCount, visualStyle, contentGoal" });
      }

      let brandContext = "";
      if (brandName) {
         brandContext += `\nNAMA BRAND/PRODUK: "${brandName}"`;
      }
      if (brandDescription) {
         brandContext += `\nDESKRIPSI: "${brandDescription}"`;
      }

      const prompt = `Anda adalah seorang Creative Director, Copywriting Strategist, Visual Storyteller, dan Branding Psychologist kelas dunia.
Tugas Anda adalah membuat ide carousel media sosial dengan fokus pada visual storytelling, visual metaphor, dan provocative educational content.
${brandContext}
TUJUAN KONTEN: "${contentGoal}"
NICHE: "${niche}"
JUDUL/TOPIK UTAMA: "${topic}"
JUMLAH SLIDE: ${slidesCount}
GAYA VISUAL/COPYWRITING: "${visualStyle}"
MOOD VISUAL: "${mood}"

OUTPUT YANG HARUS DIHASILKAN:
Hasilkan carousel lengkap dengan visual continuity (cerita visual bersambung dan berkembang dari slide 1 hingga akhir).
Pastikan seluruh copywriting dan storytelling diarahkan secara efektif untuk mencapai TUJUAN KONTEN di atas.


Setiap slide HARUS terdiri dari:
1. HEADLINE: pendek, tajam, scroll-stopping, psychological hook.
2. SUBTEXT: 1-2 kalimat pendek, emotional, educational, provocative.
3. IDE VISUAL: WAJIB SANGAT DETAIL (background, object utama, object secondary, visual metaphor, lighting, mood, cinematic direction, CAMERA ANGLE HARUS BERVARIASI DI SETIAP SLIDE misal: close up, wide shot, dll).
4. KARAKTER HUMAN: WAJIB SANGAT DETAIL (gender, pose/peragaan tubuh, ekspresi, outfit, aktivitas, emotional state). 
   KRITIKAL: Pose, peragaan tubuh, dan interaksi karakter HARUS BENAR-BENAR BERBEDA SECARA DRASTIS DI SETIAP SLIDE! 
   Contoh pergantian pose: Slide 1 jongkok frustrasi memegang kepala, Slide 2 menunjuk tajam ke arah kamera, Slide 3 membelakangi kamera menatap layar besar, Slide 4 mengepalkan tangan di udara. JANGAN PERNAH MENGULANG TIPE POSE YANG SAMA!
5. TYPOGRAPHY: Arahan tipografi (contoh: bold condensed, brutal editorial, dll).
6. COLOR PALETTE: Arahan warna visual.

ATURAN GAYA & KONTEN:
- Terapkan gaya visual/copywriting: ${visualStyle} dengan ketat.
- Terapkan mood visual: ${mood} dengan ketat.
- Output visual harus sangat detail, memicu emosi, premium branding, dan siap di copy-paste ke AI image generator.
- JANGAN buat content generic biasa.

==================================================
RELATABLE STORYTELLING & VISUAL REALISM RULES
==================================================
PENTING: JANGAN menghasilkan visual atau copywriting yang terlalu sci-fi berlebihan, cyberpunk, terlalu abstrak, "epic", fantasy, atau dystopian.
Target market adalah: penjual parfum refill, peracik parfum, UMKM, seller medsos Indonesia.
Mereka relate dengan: trial-error racik parfum, meja racik sederhana, botol refill, customer komplain, parfum cepat hilang, parfum flat, eksperimen gagal, notes formula.

VISUAL REALISM PRIORITY (70% REAL LIFE, 20% EDITORIAL CINEMATIC, 10% FUTURISTIC AI):
Gunakan visual: meja racik parfum, pipet, botol refill, alkohol, kertas formula, notes dosis, lab sederhana modern, laptop kerja, dashboard aplikasi realistis, suasana kerja malam.
Jika menggunakan visual metaphor, buat yang masih dekat dengan kehidupan nyata (contoh: parfum flat seperti speaker kurang bass, aroma tipis seperti asap langsung hilang, botol premium isi kosong). HINDARI portal dimensi, hologram berlebihan, retakan dunia.

==================================================
STORYTELLING & AUTHORITY BRANDING RULES
==================================================
Jika Tujuan Konten mengandung "Storytelling" atau "Authority & Personal Branding":
- AI wajib menjaga relevansi antara: judul, narasi, visual, emosi, dan progression story.
- Jangan membuat visual cinematic random yang tidak mendukung inti cerita.
- Setiap slide harus terasa: nyambung, berkembang, memiliki sebab-akibat, seperti potongan perjalanan nyata.
- Fokus utama: human story > aesthetic visual.
- Jika judul/topik memakai kata: saya, dulu, vakum, capek, sadar, perjalanan, riset, maka konten wajib: personal, intimate, relatable, realistis, founder journey oriented. BUKAN generic motivational content.

==================================================
COPYWRITING LANGUAGE STYLE RULES (SANGAT PENTING)
==================================================
Aplikasi WAJIB menggunakan gaya bahasa:
- natural, conversational, ringan dibaca, relatable, emosional.
- seperti ngobrol langsung dengan audiens (gaya bahasa BenBi / social media modern Indonesia).
JANGAN menggunakan bahasa terlalu formal, baku, marketing kaku, corporate, kalimat terlalu panjang, gaya AI generic, filosofis abstrak, puitis berlebihan, atau motivasi seminar.

KARAKTER GAYA BAHASA:
Gunakan gaya: "loh", "padahal", "tau gak?", "yaudah", "masalahnya...", "kadang", "banyak orang gak sadar", "jujur aja", "yang bikin menarik tuh...", "seringnya bukan karena...", "bukan jelek... tapi...", "ini yang sering bikin salah", "kita sama-sama tau...", "udah gonta-ganti bibit", "capek trial-error".
Ritme: pendek, tajam, enak dibaca di carousel, mudah dipahami market awam.

EMOTIONAL TARGET:
Copywriting harus terasa: manusia, dekat, nyentil, kadang nyindir halus, kadang brutal tapi relate, tidak terasa seperti robot. Kisah personal founder UMKM yang struggling, observatif, realistis (bukan superhero genius).

STYLE CONVERSION (CONTOH):
JANGAN: "Produk Anda memiliki visual branding yang kurang optimal."
UBAH JADI: "Produkmu bukan jelek. Tapi presentasinya bikin orang gak percaya."
JANGAN: "Parfum dengan projection rendah akan menurunkan performa."
UBAH JADI: "Wanginya ada... tapi baru lewat dikit udah hilang."

BENBI-STYLE COPYWRITING ENGINE & TARGET MARKET THINKING:
AI harus memahami bahwa copywriting bukan sekadar menjelaskan fitur, tetapi menghubungkan fitur dengan kehidupan nyata target market.
Pola wajib: FEATURE -> MANFAAT -> LIFE RELATED.
Pikirkan rasa malu, insecure, ingin dianggap keren, haus validasi, capek trial-error. Target market beli persepsi.

ENDING STYLE & SOCIAL MEDIA FORMAT:
Kalimat harus mudah di-scan, break pendek (sering di enter), ritme cepat, punchline kuat.
CTA JANGAN hard selling! JANGAN "Beli sekarang". 
Gunakan contoh CTA: "Naik kelas pelan-pelan.", "Biar gak trial-error terus.", "Karena market sekarang beli persepsi." Hubungkan dengan realita.

FORMAT OUTPUT WAJIB SEPERTI INI (Tanpa awalan markdown yang mengganggu struktur setiap slide):

[BAGIAN CAROUSEL]
SLIDE 1
HEADLINE: [Teks headline]
SUBTEXT: [Teks subtext]
IDE VISUAL: [Deskripsi detail ide visual]
KARAKTER HUMAN: [Deskripsi detail karakter human]
TYPOGRAPHY: [Deskripsi typography direction]
COLOR PALETTE: [Deskripsi color palette]

SLIDE 2
HEADLINE: [Teks headline]
SUBTEXT: [Teks subtext]
IDE VISUAL: [Deskripsi detail ide visual]
KARAKTER HUMAN: [Deskripsi detail karakter human]
TYPOGRAPHY: [Deskripsi typography direction]
COLOR PALETTE: [Deskripsi color palette]

(Lanjutkan hingga tepat ${slidesCount} slide).

[BAGIAN CAPTION]
CAPTION MEDSOS:
[Buatkan caption singkat (1-3 paragraf pendek) bergaya storytelling/nyentil yang menciptakan 'curiosity gap' agar audiens merasa butuh dan mau swipe/membaca carousel sampai slide terakhir. Gunakan gaya bahasa asik, nyentil, natural yang sama. JANGAN gunakan bahasa formal/kaku. Sertakan 3-5 hashtag relevan di akhir. Jangan ada teks ekstra di luar format ini.]`;

      let response;
      let retries = 6;
      let retryDelay = 2000;

      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              temperature: 0.8,
            }
          });
          break; // success
        } catch (error: any) {
          if ((error?.status === 503 || error?.status === "UNAVAILABLE" || error?.message?.includes("high demand") || error?.message?.includes("503") || error?.message?.includes("UNAVAILABLE")) && retries > 1) {
            retries--;
            console.log(`Gemini API overloaded. Retrying in ${retryDelay}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            retryDelay = Math.min(retryDelay * 2, 8000); // Max delay 8s to prevent huge timeouts
          } else {
            throw error; // throw other errors or if out of retries
          }
        }
      }

      if (!response) {
         throw new Error("Failed after retries");
      }

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      let errorMessage = "Gagal menghasilkan konten. Silakan coba lagi.";
      if (error?.status === 503 || error?.message?.includes("high demand") || error?.message?.includes("503")) {
         errorMessage = "Sistem AI Google sedang mengalami request tinggi (High Demand). Silakan coba lagi dalam beberapa saat.";
      }

      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Since this is Express v4 (from package.json), we use get('*')
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
