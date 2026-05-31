import { useState, useEffect, useRef } from "react";
import { Loader2, Sparkles, Copy, Check, ChevronRight } from "lucide-react";

export default function App() {
  const [brandName, setBrandName] = useState("");
  const [brandDescription, setBrandDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [slidesCount, setSlidesCount] = useState("5");
  const [visualStyle, setVisualStyle] = useState("Edu-Provocative Visual Metaphor");
  const [contentGoals, setContentGoals] = useState<string[]>(["Edukasi"]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Load saved brand data
  useEffect(() => {
    const savedName = localStorage.getItem("vca_brandName");
    const savedDesc = localStorage.getItem("vca_brandDescription");
    if (savedName) setBrandName(savedName);
    if (savedDesc) setBrandDescription(savedDesc);
  }, []);

  // Save brand data when changed
  useEffect(() => {
    localStorage.setItem("vca_brandName", brandName);
  }, [brandName]);

  useEffect(() => {
    localStorage.setItem("vca_brandDescription", brandDescription);
  }, [brandDescription]);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const visualStyles = [
    "Edu-Provocative Visual Metaphor",
    "Myth-Busting / Anti Belief Design",
    "Brutal Truth Poster",
    "Failure Highlight Design",
    "Irony & Satirical Design",
    "Before–After Cognitive Gap",
    "Playful Illustration / Dark Meaning",
    "Visual Juxtaposition",
    "Meme-Inspired Editorial",
    "Split Screen Comparison",
    "Transformation Sequence",
    "Color Psychology Contrast",
  ];

  const slideOptions = ["3", "4", "5", "6", "7"];

  const contentGoalOptions = [
    "Awareness",
    "Engagement",
    "Branding",
    "Edukasi",
    "Authority",
    "Storytelling",
    "Marketing",
    "Sales",
    "Soft Personal Selling"
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          slidesCount,
          visualStyle,
          contentGoal: contentGoals.join(", "),
          brandName,
          brandDescription
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menghasilkan konten");
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderResult = (text: string) => {
    const captionSplit = text.split("[BAGIAN CAPTION]");
    const carouselText = captionSplit[0];
    const captionText = captionSplit.length > 1 ? captionSplit[1] : null;

    const lines = carouselText.split('\n');
    let currentSlide: string[] = [];
    const slides: string[][] = [];

    lines.forEach((line) => {
      if (line.includes("[BAGIAN CAROUSEL]")) return;
      
      if (line.toUpperCase().startsWith("SLIDE ")) {
        if (currentSlide.length > 0) {
          slides.push([...currentSlide]);
        }
        currentSlide = [line];
      } else if (line.trim().length > 0) {
        currentSlide.push(line);
      }
    });

    if (currentSlide.length > 0) {
      slides.push(currentSlide);
    }

    if (slides.length === 0 || (slides.length === 1 && !slides[0][0].toUpperCase().startsWith("SLIDE"))) {
      return (
        <div className="whitespace-pre-wrap text-neutral-300 text-sm leading-relaxed p-6 bg-dark-navy/30 backdrop-blur-sm rounded-xl border border-electric-blue/20">
          {text}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {slides.map((slideLines, index) => {
          const slideTitle = slideLines[0];
          const restLines = slideLines.slice(1);
          return (
            <div key={index} className="bg-dark-navy/40 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden group hover:border-electric-blue/30 transition-colors duration-300">
              <div className="bg-dark-navy px-6 py-3 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-electric-blue font-heading text-sm font-bold tracking-widest uppercase">
                  {slideTitle}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {restLines.map((line, i) => {
                  const isKey = line.includes(":") && line.split(":")[0] === line.split(":")[0].toUpperCase();
                  if (isKey) {
                    const parts = line.split(":");
                    const key = parts[0];
                    const value = parts.slice(1).join(":").trim();
                    if (key.includes("Lanjutkan hingga tepat") || key.includes("CAPTION MEDSOS")) {
                      return null; // hide instructions leak if any
                    }
                    return (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest shrink-0 sm:w-40 sm:mt-1 opacity-70">
                          {key}
                        </span>
                        <span className={`text-neutral-200 ${key === 'HEADLINE' ? 'text-lg font-heading font-black text-white' : ''} ${key === 'IDE VISUAL' || key === 'KARAKTER HUMAN' ? 'text-neutral-300 text-sm leading-relaxed italic' : ''}`}>
                          {value || " "}
                        </span>
                      </div>
                    );
                  }
                  if (line.includes("Lanjutkan hingga tepat")) return null;
                  return (
                    <div key={i} className="text-neutral-400 text-sm ml-0 sm:ml-44">
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {captionText && (
          <div className="bg-gradient-to-br from-dark-navy/60 to-[#030811]/60 backdrop-blur-xl border border-electric-blue/30 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,123,255,0.1)] mt-8">
            <div className="bg-electric-blue/10 px-6 py-4 border-b border-electric-blue/20 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-electric-blue" />
              <h3 className="text-electric-blue font-heading text-base font-bold tracking-widest uppercase">
                CAPTION MEDIA SOSIAL
              </h3>
            </div>
            <div className="p-6 md:p-8">
              <div className="whitespace-pre-wrap text-neutral-200 text-sm md:text-base leading-relaxed font-medium">
                {captionText.replace("CAPTION MEDSOS:", "").trim()}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#060D18] text-white font-sans selection:bg-electric-blue/30 relative overflow-hidden">
      {/* Background glowing orbs representing cinematic lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-electric-blue/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-accent/10 blur-[150px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Hero Banner */}
        <div className="mb-12 rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative group">
          <img 
            src="https://www.image2url.com/r2/default/images/1779522099499-13658c8f-e580-445e-80b0-b94662ded5a8.png" 
            alt="Hero Banner" 
            className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060D18] via-transparent to-transparent opacity-80" />
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Controls Panel */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-12">
            <div className="bg-dark-navy/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-electric-blue to-orange-accent opacity-80" />
              
              {/* Input: Brand Name */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Brand / Produk Anda
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Cth: Somethinc, Kopi Kenangan..."
                  className="w-full bg-[#030811] border border-white/10 rounded-xl p-4 text-white placeholder-neutral-600 focus:outline-none focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/50 transition-all text-sm font-medium"
                />
              </div>

              {/* Input: Brand Description */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Deskripsi Singkat Produk
                </label>
                <textarea
                  value={brandDescription}
                  onChange={(e) => setBrandDescription(e.target.value)}
                  placeholder="Cth: Serum pencerah wajah dengan kandungan Niacinamide 10%, fokus untuk mencerahkan dan menyamarkan noda hitam."
                  className="w-full bg-[#030811] border border-white/10 rounded-xl p-4 text-white placeholder-neutral-600 focus:outline-none focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/50 resize-none h-20 transition-all text-sm font-medium"
                />
              </div>

              <div className="h-px w-full bg-white/5 my-2"></div>

              {/* Input: Topic */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  1. Judul / Topik Konten
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Cth: Parfummu bukan jelek. Tapi flat."
                  className="w-full bg-[#030811] border border-white/10 rounded-xl p-4 text-white placeholder-neutral-600 focus:outline-none focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/50 resize-none h-24 transition-all text-sm font-medium"
                />
              </div>

              {/* Input: Content Goal */}
              <div className="space-y-3">
                <label className="flex items-baseline gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  2. Tujuan Konten <span className="normal-case text-neutral-500 text-[10px] lowercase font-normal">(pilih satu atau lebih)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {contentGoalOptions.map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        setContentGoals(prev => 
                          prev.includes(opt) && prev.length > 1
                            ? prev.filter(g => g !== opt)
                            : prev.includes(opt)
                              ? prev // don't remove if it's the last one
                              : [...prev, opt]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        contentGoals.includes(opt) 
                          ? 'bg-electric-blue text-white border-electric-blue shadow-[0_0_10px_rgba(0,123,255,0.3)]' 
                          : 'bg-[#030811] text-neutral-400 border-white/10 hover:border-white/30 hover:text-neutral-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input: Slides Range */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  3. Jumlah Slide
                </label>
                <div className="relative">
                  <select
                    value={slidesCount}
                    onChange={(e) => setSlidesCount(e.target.value)}
                    className="w-full appearance-none bg-[#030811] border border-white/10 rounded-xl p-4 pr-10 text-white focus:outline-none focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/50 transition-all cursor-pointer text-sm font-medium"
                  >
                    {slideOptions.map(num => (
                      <option key={num} value={num}>{num} Slide</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none rotate-90" />
                </div>
              </div>

              {/* Input: Visual Style */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  4. Style Visual / Copywriting
                </label>
                <div className="relative">
                  <select
                    value={visualStyle}
                    onChange={(e) => setVisualStyle(e.target.value)}
                    className="w-full appearance-none bg-[#030811] border border-white/10 rounded-xl p-4 pr-10 text-white focus:outline-none focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/50 transition-all cursor-pointer text-sm font-medium"
                  >
                    {visualStyles.map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none rotate-90" />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading || !topic.trim()}
                className="w-full bg-electric-blue hover:bg-blue-500 text-white disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(0,123,255,0.3)] disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Engine...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Creative Output
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 text-red-400 text-sm rounded-xl backdrop-blur-md font-medium">
                {error}
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div ref={resultsRef} className="lg:col-span-8 scroll-mt-8">
            <div className="min-h-[600px] flex flex-col">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-blue-300/60 bg-dark-navy/20 border border-white/5 rounded-2xl animate-pulse backdrop-blur-sm">
                  <Sparkles className="w-12 h-12 mb-6 opacity-80 text-electric-blue" />
                  <p className="font-heading text-lg font-bold tracking-wide text-white">Merakit Psychological Hook & Visual Sequence</p>
                  <p className="text-sm mt-3 opacity-60">Membangun narasi emosional untuk {slidesCount} slide...</p>
                </div>
              ) : result ? (
                <div className="space-y-6 fade-in">
                  <div className="flex items-center justify-between pb-6 border-b border-white/10">
                    <h2 className="font-heading text-xl font-bold tracking-tight">System Output</h2>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold border border-white/10 rounded-lg transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied" : "Copy Payload"}
                    </button>
                  </div>
                  
                  {renderResult(result)}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-12 text-neutral-500 bg-dark-navy/20 border border-white/5 border-dashed rounded-2xl backdrop-blur-sm">
                  <div className="text-center max-w-sm">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-6 h-6 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-neutral-300 mb-2">Engine Ready.</h3>
                    <p className="text-sm leading-relaxed">Berikan topik untuk merangkai ide visual dan copywriting Provocative.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
