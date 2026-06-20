'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook untuk mengelola Web Push Notification:
 * - Mendaftarkan Service Worker
 * - Meminta izin notifikasi dari browser
 * - Menyimpan/menghapus PushSubscription ke Supabase
 */
export function usePushNotification() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Cek status awal saat mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    setPermission(Notification.permission);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration('/sw.js').then((reg) => {
        if (!reg) return;
        setRegistration(reg);
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
        });
      });
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Browser kamu tidak mendukung Push Notification.');
      return false;
    }

    setIsLoading(true);
    try {
      // 1. Daftarkan service worker jika belum
      let reg = registration;
      if (!reg) {
        reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        setRegistration(reg);
        // Tunggu SW aktif
        await navigator.serviceWorker.ready;
      }

      // 2. Minta izin
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        return false;
      }

      // 3. Subscribe ke Push Manager
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // 4. Kirim ke backend
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });

      if (res.ok) {
        setIsSubscribed(true);
        return true;
      } else {
        const err = await res.json();
        console.error('[Push] Backend error:', err);
        return false;
      }
    } catch (err) {
      console.error('[Push] Subscribe error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [registration]);

  const unsubscribe = useCallback(async () => {
    if (!registration) return;
    setIsLoading(true);
    try {
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        // Hapus dari backend
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint }),
        });
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error('[Push] Unsubscribe error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [registration]);

  return { permission, isSubscribed, isLoading, subscribe, unsubscribe };
}

/** Konversi VAPID public key dari base64 ke Uint8Array */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
