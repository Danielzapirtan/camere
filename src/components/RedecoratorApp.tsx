import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, Sparkles, Palette, Lightbulb, Sofa, ArrowRight, Loader2, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { PanoramaViewer } from './PanoramaViewer';
import { analyzeRoom, generatePanorama, RedecorationSuggestion } from '@/src/lib/gemini';
import { toast } from 'sonner';

export default function RedecoratorApp() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<RedecorationSuggestion | null>(null);
  const [panoramaUrl, setPanoramaUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setSuggestion(null);
        setPanoramaUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeRoom(image);
      setSuggestion(result);
      toast.success("Camera a fost analizată cu succes!");
    } catch (error) {
      console.error(error);
      toast.error("Analiza camerei a eșuat. Te rugăm să încerci din nou.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGeneratePanorama = async () => {
    if (!suggestion) return;
    setIsGenerating(true);
    try {
      const url = await generatePanorama(suggestion.imagePrompt);
      setPanoramaUrl(url);
      toast.success("Panorama a fost generată!");
    } catch (error) {
      console.error(error);
      toast.error("Generarea panoramei a eșuat.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!panoramaUrl) return;
    const link = document.createElement('a');
    link.href = panoramaUrl;
    link.download = `redecorare-panorama-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Descărcarea a început!");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30">
      {/* Header */}
      <header className="border-b border-white/10 p-6 flex justify-between items-center backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            <Sparkles className="text-black w-6 h-6" />
          </div>
          <h1 className="text-xl font-light tracking-tighter uppercase">
            Panorama <span className="font-bold text-orange-500">Decor</span>
          </h1>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="border-white/10 hover:bg-white/5 rounded-full px-6"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Încarcă Cameră
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input & Analysis */}
        <div className="lg:col-span-5 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">Spațiul Original</h2>
              {image && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-orange-500 hover:text-orange-400 p-0 h-auto"
                  onClick={() => setImage(null)}
                >
                  <RefreshCw className="w-3 h-3 mr-1" /> Resetează
                </Button>
              )}
            </div>
            
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 group">
              {image ? (
                <img src={image} alt="Uploaded room" className="w-full h-full object-cover" />
              ) : (
                <div 
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-12 h-12 text-white/20 mb-4" />
                  <p className="text-white/40 text-sm">Încarcă o fotografie a camerei tale pentru a începe</p>
                </div>
              )}
              
              {image && !suggestion && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    className="bg-orange-500 hover:bg-orange-600 text-black rounded-full px-8 py-6 text-lg font-bold"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>Analizează Spațiul <ArrowRight className="ml-2 w-5 h-5" /></>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </section>

          <AnimatePresence>
            {suggestion && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 px-3 py-1 rounded-full uppercase text-[10px] tracking-widest">
                    Analiza AI Finalizată
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                      <Palette className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">{suggestion.style}</h3>
                      <div className="flex gap-2 mt-2">
                        {suggestion.colorPalette.map((color, i) => (
                          <div 
                            key={i} 
                            className="w-6 h-6 rounded-full border border-white/20" 
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                      <Sofa className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">Mobilier și Amenajare</h4>
                      <ul className="space-y-2">
                        {suggestion.furnitureSuggestions.map((item, i) => (
                          <li key={i} className="text-sm text-white/80 flex items-center gap-2">
                            <div className="w-1 h-1 bg-orange-500 rounded-full" /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                      <Lightbulb className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-1">Sfaturi pentru Iluminat</h4>
                      <p className="text-sm text-white/80 leading-relaxed">{suggestion.lightingAdvice}</p>
                    </div>
                  </div>
                </div>

                {!panoramaUrl && (
                  <Button 
                    className="w-full bg-white text-black hover:bg-white/90 rounded-full py-8 text-lg font-bold shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    onClick={handleGeneratePanorama}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Se generează panorama de 400°...</span>
                      </div>
                    ) : (
                      <>Vizualizează în 400° <Sparkles className="ml-2 w-5 h-5" /></>
                    )}
                  </Button>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-7">
          <div className="sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">Vizualizarea Redecorării</h2>
              <div className="flex items-center gap-2">
                {panoramaUrl && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white/50 hover:text-white hover:bg-white/5 h-8 w-8 p-0 rounded-full"
                      onClick={handleDownload}
                      title="Descarcă Panorama"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Badge variant="outline" className="border-orange-500/50 text-orange-500">
                      400° Cilindrică
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <div className="aspect-video lg:aspect-square rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex flex-col items-center justify-center relative">
              {panoramaUrl ? (
                <div className="w-full h-full flex flex-col p-4 space-y-4">
                  <PanoramaViewer imageUrl={panoramaUrl} />
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Transformări Cheie</h3>
                    <ScrollArea className="h-full pr-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {suggestion?.keyChanges.map((change, i) => (
                          <Card key={i} className="bg-white/5 border-white/10">
                            <CardContent className="p-4">
                              <p className="text-sm text-white/90">{change}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <div className="text-center p-12">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <Sparkles className="w-10 h-10 text-white/20" />
                  </div>
                  <h3 className="text-xl font-medium mb-2 text-white/60">Nicio vizualizare încă</h3>
                  <p className="text-white/30 text-sm max-w-xs mx-auto">
                    Analizează mai întâi camera pentru a genera o panoramă personalizată de 400 de grade a noului tău spațiu.
                  </p>
                </div>
              )}
            </div>

            {panoramaUrl && (
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Rezoluție</p>
                  <p className="text-sm font-bold">4K Ultra HD</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Proiecție</p>
                  <p className="text-sm font-bold">Cilindrică</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Câmp Vizual</p>
                  <p className="text-sm font-bold">400°</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/10 p-12 text-center">
        <p className="text-white/20 text-xs uppercase tracking-[0.3em]">
          Susținut de Gemini 3.1 și Panorama Decor AI
        </p>
      </footer>
    </div>
  );
}
