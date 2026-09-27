/* ─────────────────────────────────────────────────────────────
   ALTYAZILAR / CAPTIONS — düzenlenebilir.
   Kısa, tek fikir, 7. sınıf dili. start/end saniye cinsinden.
   note: öğretmen için önerilen seslendirme cümlesi.
   ───────────────────────────────────────────────────────────── */
(function (root) {
  const CAPTIONS = [
    { scene: 1, start: 4.4, end: 10.2, tr: 'Bir zar, iki olay', en: 'One die, two events',
      note: 'Bir zar atıyoruz. A olayı: çift sayı gelmesi. B olayı: 3’ten büyük gelmesi. 4 ve 6 iki olayda da var.' },
    { scene: 2, start: 10.8, end: 18.8, tr: 'Tek ve çift: ayrık', en: 'Odd and even: disjoint',
      note: 'Ölçütümüz: iki olayın ortak çıktısı var mı? Tek ve çift sayı gelmesinin ortak çıktısı yok. Bu olaylar ayrık.' },
    { scene: 2, start: 19.0, end: 27.8, tr: 'Ortak 4 ve 6: ayrık değil', en: '4 and 6 shared: not disjoint',
      note: 'Çift ve 3’ten büyük gelmesinin ortak çıktıları 4 ve 6. Bu olaylar ayrık değil.' },
    { scene: 3, start: 28.8, end: 37.4, tr: '6 ve 5 · asal ve çift', en: '6 and 5 · prime and even',
      note: '6 gelmesi ile 5 gelmesi: ortak çıktı yok, ayrık. Asal sayı ile çift sayı: ortak çıktı 2, ayrık değil.' },
    { scene: 3, start: 37.6, end: 45.8, tr: '1 ve tek · 5’ten büyük ve 3’ten küçük', en: '1 and odd · above 5 and below 3',
      note: '1 gelmesi ile tek sayı: ortak çıktı 1, ayrık değil. 5’ten büyük ile 3’ten küçük: ortak çıktı yok, ayrık.' },
    { scene: 4, start: 46.8, end: 57.8, tr: 'Ayrık ve ayrık değil', en: 'Disjoint and not disjoint',
      note: 'Olayları ortak çıktılarına göre iki sütuna ayıralım: ortak çıktısı olmayanlar ayrık, olanlar ayrık değil.' },
    { scene: 4, start: 58.0, end: 63.8, tr: 'Etiketle', en: 'Label them',
      note: 'Her olay çifti bir etiket aldı.' },
    { scene: 5, start: 64.8, end: 73.8, tr: 'Kesişmeyen kümeler', en: 'Sets that do not meet',
      note: 'Kümelerle gösterelim: tek ve çift sayıların kümeleri kesişmez. Çift ve 3’ten büyük sayıların kümeleri 4 ve 6’da kesişir.' },
    { scene: 5, start: 74.0, end: 79.8, tr: 'Aynı anda olamaz', en: 'They cannot happen together',
      note: 'Ayrık olaylar aynı anda gerçekleşemez: bir zar hem tek hem çift gelemez.' },
    { scene: 6, start: 80.6, end: 86.4, tr: 'Ortak çıktı var mı?', en: 'Is there a shared outcome?',
      note: 'Aklında kalsın: ortak çıktı yoksa olaylar ayrık, varsa ayrık değil.' },
    { scene: 6, start: 86.8, end: 91.0, tr: 'Ayrık olaylar aynı anda olamaz!', en: 'Disjoint events cannot happen together!',
      note: 'Ayrık olaylar aynı anda olamaz!' },
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = CAPTIONS;
  else { root.LI = root.LI || {}; root.LI.CAPTIONS = CAPTIONS; }
})(typeof window !== 'undefined' ? window : globalThis);
