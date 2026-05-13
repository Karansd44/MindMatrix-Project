/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { UI_STRINGS } from '../constants/products';
import { askKumbaraAI } from '../services/geminiService';
import { saveArtisanProfile } from '../services/artisanService';
import { BenefitCardEngine } from '../lib/canvas-engine';
import { shareToWhatsApp } from '../lib/sharing-utility';
import { Artisan, Product, Language } from '../types';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Download, Languages, Loader2, RefreshCw, Send, Sparkles, Heart, Share2, User, PenLine, Wand2 } from 'lucide-react';

type Tone = 'friendly' | 'scientific' | 'folk';

export default React.memo(function StoryGenerator() {
  const { profile, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [tone, setTone] = useState<Tone>('friendly');
  const [promptDraft, setPromptDraft] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [previewMode, setPreviewMode] = useState<'text' | 'card'>('card');
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedProduct = useMemo(
    () => products.find(product => product.id === selectedProductId) || null,
    [products, selectedProductId],
  );

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as Product));
      setProducts(list);
      setSelectedProductId(current => current || list[0]?.id || '');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (profile) {
      setArtisan({
        name: profile.name || user?.displayName || 'Anonymous',
        phone: profile.phone || '',
        location: profile.village || '',
        village: profile.village || '',
        experience: profile.experience || 0,
        heritageStory: profile.heritageStory || '',
      });
      if (profile.languagePreference) setLanguage(profile.languagePreference as Language);
    }
  }, [profile, user]);

  useEffect(() => {
    if (selectedProduct && artisan && !promptDraft) {
      setPromptDraft(buildPrompt(selectedProduct, artisan, tone));
    }
  }, [selectedProduct, artisan, tone, promptDraft]);

  const generateStory = async (promptOverride?: string) => {
    if (!selectedProduct || !artisan) {
      setMessage('Please select a product and fill artisan details');
      return;
    }

    setGenerating(true);
    setMessage(null);

    try {
      const prompt = (promptOverride ?? promptDraft).trim() || buildPrompt(selectedProduct, artisan, tone);
      setGeneratedPrompt(prompt);

      const response = await askKumbaraAI(prompt, language);
      setGeneratedText(response);

      const engine = new BenefitCardEngine(1080, 1350);
      const cardState = {
        product: selectedProduct,
        artisan,
        fontSize: 24,
        textColor: '#FFFFFF',
        template: 'traditional' as const,
        language,
      };
      const dataUrl = await engine.generate(cardState as any);
      setImageDataUrl(dataUrl);
      setPreviewMode('card');
    } catch (err) {
      console.error('Story generation failed', err);
      setMessage('Could not craft the story right now. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    await generateStory();
  };

  const handleRegenerate = async () => {
    if (!selectedProduct || !artisan) return;
    await generateStory(
      `${buildPrompt(selectedProduct, artisan, tone)} Provide a fresh variation with a more emotional, shareable opening.`,
    );
  };

  const handleSaveProfile = async () => {
    if (!artisan) return;
    setSaving(true);
    try {
      await saveArtisanProfile(artisan);
      setMessage('Artisan profile saved');
    } catch (err) {
      console.error('Save failed', err);
      setMessage('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!imageDataUrl || !selectedProduct || !artisan) return;
    const caption = `${selectedProduct.name} — ${generatedText || selectedProduct.benefit}\nMade by ${artisan.name}, ${artisan.village} • ${artisan.phone}`;
    await shareToWhatsApp(imageDataUrl, caption);
  };

  const handleNativeShare = async () => {
    if (!selectedProduct || !artisan) return;
    const text = `${selectedProduct.name} by ${artisan.name}: ${generatedText || selectedProduct.benefit}`;
    if (navigator.share) {
      await navigator.share({ title: 'Kumbara-Kala Story Card', text, url: imageDataUrl || undefined });
      return;
    }
    await navigator.clipboard.writeText(text);
    setMessage('Story copied to clipboard');
  };

  const handleDownload = () => {
    if (!imageDataUrl || !selectedProduct) return;
    const link = document.createElement('a');
    link.href = imageDataUrl;
    link.download = `${selectedProduct.name}-story-card.jpg`;
    link.click();
  };

  return (
    <div className="h-full flex flex-col px-4 py-4 sm:px-6 sm:py-6 gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] font-black text-earth-primary mb-2">AI Story Generator</p>
          <h2 className="text-2xl font-black text-earth-dark">{UI_STRINGS[language].createCard}</h2>
          <p className="text-sm text-earth-dark/40 mt-1">Turn product details into shareable craft stories.</p>
        </div>

        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={!artisan || saving}
          className="h-12 px-4 rounded-full bg-earth-dark text-white font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <User size={16} />}
          Save Profile
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {products.map(product => (
          <button
            key={product.id}
            type="button"
            onClick={() => {
              setSelectedProductId(product.id);
              if (artisan) {
                setPromptDraft(buildPrompt(product, artisan, tone));
              }
              setMessage(null);
            }}
            className={`w-32 shrink-0 rounded-2xl border p-3 text-left transition-all ${selectedProduct?.id === product.id ? 'border-earth-primary ring-2 ring-earth-primary/20 bg-earth-primary/5' : 'border-earth-dark/10 bg-white'}`}
          >
            <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-earth-light/30">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <p className="text-xs font-bold text-earth-dark line-clamp-2">{product.name}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-earth-primary mt-1">₹{product.price}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4 flex-1 min-h-0">
        <div className="rounded-2xl bg-earth-light/30 p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-earth-dark/40">Prompt Area</p>
              <p className="text-sm text-earth-dark/50">Generate a short story, benefit copy, and share text.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPromptEditor(prev => !prev)}
              className="text-sm font-bold text-earth-primary"
            >
              {showPromptEditor ? 'Hide prompt' : 'Customize prompt'}
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setTone('friendly')}
              className={`px-3 py-2 rounded-full text-xs font-black ${tone === 'friendly' ? 'bg-earth-dark text-white' : 'bg-white text-earth-dark/60'}`}
            >
              Friendly
            </button>
            <button
              type="button"
              onClick={() => setTone('scientific')}
              className={`px-3 py-2 rounded-full text-xs font-black ${tone === 'scientific' ? 'bg-earth-dark text-white' : 'bg-white text-earth-dark/60'}`}
            >
              Scientific
            </button>
            <button
              type="button"
              onClick={() => setTone('folk')}
              className={`px-3 py-2 rounded-full text-xs font-black ${tone === 'folk' ? 'bg-earth-dark text-white' : 'bg-white text-earth-dark/60'}`}
            >
              Folk
            </button>
          </div>

          {showPromptEditor && (
            <textarea
              value={promptDraft}
              onChange={(e) => setPromptDraft(e.target.value)}
              className="w-full flex-1 min-h-[160px] rounded-2xl border border-earth-dark/10 bg-white p-4 text-sm text-earth-dark shadow-inner focus:ring-2 focus:ring-earth-primary/20"
              placeholder="Write your own story prompt here..."
            />
          )}

          <div className="mt-4 flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !selectedProduct || !artisan}
              className="h-12 px-5 rounded-full bg-earth-primary text-white font-black flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-earth-primary/20"
            >
              {generating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              {generating ? 'Crafting your story...' : 'Generate Story'}
            </button>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={generating || !selectedProduct || !artisan}
              className="h-12 px-5 rounded-full bg-white border border-earth-dark/10 font-black text-earth-dark flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={18} />
              Regenerate
            </button>
          </div>

          {message && (
            <div className="mt-4 rounded-xl bg-white p-4 text-sm font-bold text-earth-dark shadow-sm">
              {message}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="inline-flex rounded-full bg-white p-1 shadow-sm border border-earth-dark/5">
              <button
                type="button"
                onClick={() => setPreviewMode('text')}
                className={`h-10 px-4 rounded-full text-xs font-black ${previewMode === 'text' ? 'bg-earth-dark text-white' : 'text-earth-dark/50'}`}
              >
                Text View
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('card')}
                className={`h-10 px-4 rounded-full text-xs font-black ${previewMode === 'card' ? 'bg-earth-dark text-white' : 'text-earth-dark/50'}`}
              >
                Card Preview
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowPromptEditor(prev => !prev)}
              className="text-xs font-black uppercase tracking-widest text-earth-primary"
            >
              {selectedProduct ? selectedProduct.category : 'No Product Selected'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-earth-dark/10 bg-white p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-earth-dark/40">Generated Content</p>
              <p className="text-sm text-earth-dark/50">Preview the story text or the branded canvas output.</p>
            </div>
            <button
              type="button"
              onClick={() => setPromptDraft('')}
              className="text-xs font-black uppercase tracking-widest text-earth-dark/40"
            >
              Reset Prompt
            </button>
          </div>

          <div className="flex-1 min-h-[320px] rounded-2xl bg-earth-light/20 border border-dashed border-earth-dark/10 p-4 overflow-hidden">
            {generating ? (
              <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-earth-dark/40 gap-4">
                <Loader2 className="animate-spin text-earth-primary" size={42} />
                <p className="font-black tracking-tight">Crafting your story...</p>
              </div>
            ) : previewMode === 'card' ? (
              imageDataUrl ? (
                <img src={imageDataUrl} alt="Story card preview" className="w-full h-full object-contain rounded-2xl" />
              ) : (
                <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center text-earth-dark/40 gap-3 px-6">
                  <Wand2 size={40} />
                  <p className="font-black text-earth-dark">Generate a story to preview the card here.</p>
                  <p className="text-sm">Choose a product, then press Generate Story.</p>
                </div>
              )
            ) : generatedText ? (
              <div className="h-full overflow-y-auto pr-1">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-earth-primary mb-3">AI Story</p>
                <p className="text-sm leading-7 text-earth-dark whitespace-pre-wrap">{generatedText}</p>
                {generatedPrompt && (
                  <div className="mt-4 rounded-xl bg-white p-3 border border-earth-dark/5 text-xs text-earth-dark/60">
                    <span className="font-black uppercase tracking-widest text-earth-dark/30 block mb-2">Prompt used</span>
                    {generatedPrompt}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center text-earth-dark/40 gap-3 px-6">
                <PenLine size={40} />
                <p className="font-black text-earth-dark">Your generated story will appear here.</p>
                <p className="text-sm">This area also supports a branded card preview.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!imageDataUrl}
              className="h-12 rounded-full border border-earth-dark/10 bg-white font-black text-earth-dark flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download size={18} />
              Download Card
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              disabled={!imageDataUrl}
              className="h-12 rounded-full bg-[#25D366] text-white font-black flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Share2 size={18} />
              Share to WhatsApp
            </button>
            <button
              type="button"
              onClick={handleNativeShare}
              disabled={!generatedText && !imageDataUrl}
              className="h-12 rounded-full bg-earth-dark text-white font-black flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send size={18} />
              Share
            </button>
            <button
              type="button"
              onClick={() => {
                if (!selectedProduct) return;
                setPromptDraft(`Add a more emotionally compelling opening to this story about ${selectedProduct.name}. Keep it concise and easy to share.`);
              }}
              className="h-12 rounded-full border border-earth-dark/10 bg-earth-light/20 font-black text-earth-dark flex items-center justify-center gap-2"
            >
              <Heart size={18} />
              Save Template
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="rounded-2xl border border-earth-dark/10 p-3 bg-white flex items-center gap-3">
              <Languages size={18} className="text-earth-primary" />
              <select value={language} onChange={e => setLanguage(e.target.value as Language)} className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="kn">Kannada</option>
                <option value="ta">Tamil</option>
              </select>
            </label>
            <label className="rounded-2xl border border-earth-dark/10 p-3 bg-white flex items-center gap-3">
              <Sparkles size={18} className="text-earth-primary" />
              <select value={tone} onChange={e => setTone(e.target.value as Tone)} className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0">
                <option value="friendly">Friendly Educator</option>
                <option value="scientific">Scientific</option>
                <option value="folk">Folk / Heritage</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
});

function buildPrompt(product: Product, artisan: Artisan, tone: Tone) {
  return `Create a short, shareable benefit card story for "${product.name}". Focus on the health and eco benefits: ${product.benefit}. Mention the artisan ${artisan.name} from ${artisan.village}. Use a ${tone} tone. Keep it concise, emotional, and under 200 characters.`;
}
