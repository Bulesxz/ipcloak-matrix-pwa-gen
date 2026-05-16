'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Smartphone, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        throw new Error('Failed to scan');
      }

      const data = await res.json();
      // Store data in sessionStorage for the editor
      sessionStorage.setItem('scannedApp', JSON.stringify(data));
      router.push('/editor');
    } catch (error) {
      console.error(error);
      alert('Failed to scan the URL. Please check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white overflow-hidden relative selection:bg-purple-500/30">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] bg-indigo-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">

        <div className="text-center max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-200 mb-4 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI-Powered PWA Installer Generator</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 drop-shadow-sm">
            Turn any website into <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">an App instantly.</span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Enter your website URL below. We'll extract your icon, name, and description to generate a beautiful, custom installation landing page in seconds.
          </p>

          <Card className="max-w-xl mx-auto mt-10 bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
            <CardContent className="p-2">
              <form onSubmit={handleScan} className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="bg-transparent border-transparent text-white placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-lg"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 px-6 bg-white text-black hover:bg-neutral-200 transition-all font-semibold rounded-lg"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Scan Now'}
                  {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left opacity-80">
            <div className="flex flex-col gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">Instant Preview</h3>
              <p className="text-sm text-neutral-400">See exactly how your installation page will look on mobile devices.</p>
            </div>
            <div className="flex flex-col gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 mb-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">Auto-Magic Extraction</h3>
              <p className="text-sm text-neutral-400">We crawl your manifest and meta tags to find the best assets automatically.</p>
            </div>
            <div className="flex flex-col gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
                <div className="font-bold">iOS</div>
              </div>
              <h3 className="font-semibold text-white">Cross-Platform</h3>
              <p className="text-sm text-neutral-400">Tailored instructions for iOS Safari and Android Chrome users.</p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
