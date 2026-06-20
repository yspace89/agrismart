'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUserMode } from '@/contexts/UserModeContext';
import { usePathname } from 'next/navigation';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatPanel() {
  const { mode } = useUserMode();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (['/register', '/forgot-password', '/update-password'].some(p => pathname.startsWith(p))) return null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Focus input saat panel dibuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    // Pembatasan 20 pesan untuk guest (di halaman login)
    if (pathname === '/login') {
      const guestCount = parseInt(localStorage.getItem('guest_chat_count') || '0', 10);
      if (guestCount >= 20) {
        setError('Batas maksimal percakapan tamu (20 pesan) telah tercapai. Silakan login untuk melanjutkan ngobrol bersama Tiva.');
        return;
      }
      localStorage.setItem('guest_chat_count', (guestCount + 1).toString());
    }

    // Tambahkan pesan user ke daftar
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    setMessages(newMessages);
    setInput('');
    setError(null);
    setIsLoading(true);
    setStreamingText('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        // Coba baca error dari JSON
        try {
          const errData = await response.json();
          throw new Error(errData.error || `Error ${response.status}`);
        } catch {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }

      if (!response.body) {
        throw new Error('Response body kosong');
      }

      // Baca stream teks secara real-time
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        // Deteksi jika server Vercel/Next.js malah nge-stream error HTML/RSC payload
        if (fullText.length === 0 && (chunk.trim().startsWith('<!DOCTYPE') || chunk.trim().startsWith('["$","'))) {
          throw new Error('API Key SumoPod di Vercel tidak valid atau salah ketik (ada spasi/tanda kutip). Harap periksa Vercel Environment Variables dan redeploy.');
        }

        fullText += chunk;
        setStreamingText(fullText);
      }

      // Setelah streaming selesai, simpan sebagai pesan permanen
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: fullText },
      ]);
      setStreamingText('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      if (message.includes('429') || message.includes('kuota')) {
        setError('Limit pertanyaan harian (10x) sudah habis. Upgrade ke Pro ya!');
      } else {
        setError(message || 'Gagal menghubungi AI. Coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const accentColor = mode === 'pro' ? 'bg-agritiva-green' : 'bg-emerald-500';
  const accentHover = mode === 'pro' ? 'hover:bg-agritiva-dark' : 'hover:bg-emerald-600';

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Buka Tanya Tani AI"
        className={cn(
          'fixed bottom-[84px] right-4 md:bottom-8 md:right-8 rounded-full shadow-2xl transition-all duration-300 z-[60] hover:scale-110 hover:-translate-y-2 group',
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 animate-bounce'
        )}
        style={{ animationDuration: '3s' }}
      >
        <div className="relative">
          <img src="/tiva-avatar.png" alt="Tiva" className="w-16 h-16 rounded-full object-cover shadow-[0_0_20px_rgba(16,185,129,0.3)] border-2 border-white group-hover:border-agritiva-emerald group-hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all" />
          <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-[#25D366] border-2 border-white rounded-full animate-pulse" />
        </div>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sliding Panel */}
      <div
        className={cn(
          'fixed top-0 md:top-auto bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[400px] h-[100dvh] md:h-[600px] max-h-screen bg-white md:rounded-3xl shadow-2xl z-[70] flex flex-col transition-transform duration-300 ease-in-out border border-slate-100 overflow-hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-[120%]'
        )}
      >
        {/* Header */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-4 bg-slate-50/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img src="/tiva-avatar.png" alt="Tiva" className="w-10 h-10 rounded-full object-cover border-2 border-emerald-100" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 leading-tight">Tiva</h3>
              <p className="text-xs font-medium text-slate-500">
                Asisten Pertanian & Peternakan
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Tutup panel AI"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages.length === 0 && !streamingText && (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="relative mb-4">
                <img src="/tiva-avatar.png" alt="Tiva" className="w-20 h-20 rounded-full object-cover border-4 border-emerald-100 shadow-md" />
                <span className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
              </div>
              <p className="text-slate-700 font-semibold text-base">Halo! Aku Tiva 👋</p>
              <p className="text-sm text-slate-400 mt-1 max-w-[220px]">Asisten pertanian & peternakan kamu. Tanyakan apa saja, aku siap membantu! 🌱</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn('flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? cn('text-white rounded-br-sm', accentColor)
                    : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm shadow-sm'
                )}
              >
                {msg.role === 'user' ? (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                ) : (
                  <div className="prose prose-sm prose-slate max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:font-bold prose-strong:text-slate-800">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Streaming bubble */}
          {streamingText && (
            <div className="flex w-full justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed bg-white border border-slate-100 text-slate-700 shadow-sm">
                <div className="prose prose-sm prose-slate max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:font-bold prose-strong:text-slate-800">
                  <ReactMarkdown>{streamingText}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Loading dots saat belum ada text */}
          {isLoading && !streamingText && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya soal tanaman..."
              disabled={isLoading}
              autoComplete="off"
              className="flex-1 w-full min-w-0 rounded-full bg-slate-50 border border-slate-200 h-11 px-4 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={cn(
                'w-11 h-11 rounded-full p-0 flex items-center justify-center shrink-0 text-white border-0',
                accentColor,
                accentHover
              )}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </form>
          {mode !== 'pro' && (
            <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
              Free plan: Maksimal 10 pertanyaan per hari
            </p>
          )}
        </div>
      </div>
    </>
  );
}
