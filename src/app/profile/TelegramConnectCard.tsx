'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircleCode, CheckCircle2, Copy, ExternalLink, Bot, AlertCircle } from 'lucide-react';

interface TelegramConnectCardProps {
  userId: string;
  telegramChatId: string | null | undefined;
}

export function TelegramConnectCard({ userId, telegramChatId }: TelegramConnectCardProps) {
  const [copied, setCopied] = useState(false);
  const botUsername = "AgritivaBot"; // Replace with your actual bot username if different
  const connectCommand = `/SAMBUNG ${userId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(connectCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="shadow-soft border-slate-200/60 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm relative">
      {telegramChatId && (
        <div className="absolute top-0 right-0 p-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Terhubung
          </div>
        </div>
      )}
      
      <CardHeader className="bg-sky-50/50 border-b border-slate-100 pb-6 pt-6">
        <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
          <MessageCircleCode className="w-5 h-5 text-sky-500" /> Integrasi Notifikasi Telegram
        </CardTitle>
        <CardDescription className="text-slate-500 font-medium">
          Hubungkan akun Telegram Anda untuk menerima pengingat penyiraman & pemupukan secara gratis dan real-time.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 px-6 pb-6">
        {telegramChatId ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600 mb-2">
                Akun Agritiva Anda telah berhasil dihubungkan dengan Telegram. Notifikasi otomatis akan dikirimkan ke perangkat Anda melalui Telegram Bot.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mt-4">
                <Bot className="w-4 h-4" /> Chat ID Anda: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">{telegramChatId}</code>
              </div>
            </div>
            
            <p className="text-xs text-slate-500">
              Ingin memutus koneksi? Kirim perintah <code className="bg-slate-100 px-1 py-0.5 rounded">/PUTUS</code> langsung di chat Telegram Anda dengan @{botUsername}.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                <span className="text-sky-600 font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Buka Bot Telegram Agritiva</p>
                <p className="text-sm text-slate-500">Cari <b>@{botUsername}</b> di Telegram atau klik tombol di bawah.</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <a 
                    href={`https://t.me/${botUsername}?start=${userId}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Buka Aplikasi
                  </a>
                  <a 
                    href={`https://web.telegram.org/a/#?tgaddr=tg%3A%2F%2Fresolve%3Fdomain%3D${botUsername}%26start%3D${userId}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 transition-colors"
                  >
                    <Bot className="w-4 h-4" /> Buka di Web
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                <span className="text-sky-600 font-bold">2</span>
              </div>
              <div className="flex-1 w-full">
                <p className="text-sm font-bold text-slate-800">Kirim Kode Penyambungan</p>
                <p className="text-sm text-slate-500 mb-2">Salin dan kirimkan kode berikut ini ke dalam chat dengan bot:</p>
                
                <div className="flex items-center gap-2">
                  <code className="flex-1 block p-3 bg-slate-900 text-emerald-400 rounded-xl text-sm font-mono overflow-x-auto whitespace-nowrap">
                    {connectCommand}
                  </code>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleCopy}
                    className="h-[46px] w-[46px] rounded-xl shrink-0"
                    title="Salin ke clipboard"
                  >
                    {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-slate-500" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mt-2">
              <p className="text-xs text-amber-800 flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Setelah bot membalas <b>"Berhasil Terhubung!"</b>, refresh (muat ulang) halaman ini untuk melihat status terbaru.</span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
