# Saf JavaScript Kütüphane Tasarımı

> Tarihsel belge: Güncel yayın sözleşmesi
> `2026-08-30-npm-release-hardening-design.md` tarafından değiştirilmiştir.

## Amaç

Projeyi Vite ve Sass bağımlılıklarından arındırılmış, doğrudan npm üzerinden import edilebilen saf bir JavaScript kütüphanesine dönüştürmek. Tarayıcı demosu ayrı bir `demo/` klasöründe çalışacak; dönüştürme davranışı otomatik testlerle tanımlanıp düzeltilecek.

## Paket mimarisi

Paket ESM ve CommonJS destekleyecek. `package.json`, koşullu bir `exports`
girdisiyle ESM kaynağını, üretilen CommonJS girişini ve TypeScript tanımını
yayınlayacak. Vite ve Sass kaldırılacak; çalışma zamanı bağımlılığı bulunmayacak.

Yayınlanan paket içeriği `files` alanıyla kütüphane kaynağı, README, LICENSE ve gerektiğinde demo dışındaki gerekli dosyalarla sınırlandırılacak. Tarayıcı demosu paket API'sini göreli ESM importuyla kullanacak ve üretim API'sinin ayrı bir kopyasını içermeyecek.

## Dosya yapısı

```text
src/
  index.js
demo/
  index.html
  demo.js
  style.css
  server.js
test/
  converter.test.js
package.json
README.md
LICENSE
```

`src/index.js` paketin tek genel giriş noktası olacak. Demo sunucusu yalnızca yerel geliştirme amacıyla Node'un yerleşik HTTP modüllerini kullanacak. Böylece `npm run demo` ek paket kurmadan çalışacak.

## Genel API ve girdi sözleşmesi

Kütüphane şu isimle dışa aktarılacak:

```js
import { convertTurkishLiraToText } from "turkish-lira-number-to-text-converter";
```

Paket yalnızca `convertTurkishLiraToText` fonksiyonunu dışa aktaracak; eski
isimler için alias bulunmayacak.

Fonksiyon aşağıdaki girdileri kabul edecek:

- Sonlu, negatif olmayan JavaScript sayıları: `1234.56`
- Türkçe biçimli stringler: `"1.234,56"`
- Noktalı programatik ondalık stringler: `"1234.56"`
- Tam sayılar ve ondalık bölümü olmayan stringler
- Bir ondalık basamak; ikinci basamak sıfırla tamamlanır (`12.3` → `12,30`)
- En fazla iki ondalık basamak

Davranış kuralları:

- Negatif tutarlar `RangeError` üretir.
- `NaN`, `Infinity`, boş string, harf içeren değer ve belirsiz ayırıcı kullanımı `TypeError` üretir.
- İkiden fazla ondalık basamak `RangeError` üretir; örtülü yuvarlama yapılmaz.
- Güvenli biçimde temsil edilemeyen JavaScript sayıları reddedilir; çok büyük kesin değerler string olarak verilebilir.
- Desteklenen üst sınır, tanımlı Türkçe ölçek adlarının kapsadığı en büyük üçlü grupla sınırlıdır; daha büyük değer `RangeError` üretir.

## Dönüştürme davranışı

Girdi önce kanonik lira ve kuruş bileşenlerine ayrılacak. Sayı metni sağdan üçlü gruplara bölünerek Türkçe sayı kurallarına göre üretilecek.

Özel kurallar:

- `100` için `BİR YÜZ` değil `YÜZ` kullanılır.
- `1000` için `BİR BİN` değil `BİN` kullanılır.
- Değeri sıfır olan üçlü gruplar okunmaz.
- Sıfır lira açıkça `SIFIR TÜRK LİRASI` olarak yazılır.
- Kuruş sıfırsa kuruş bölümü yazılmaz; sıfır değilse sayı ve `KURUŞ` eklenir.
- Çıktı tek satırdır; başında, sonunda veya kelimeler arasında gereksiz whitespace bulunmaz.
- Çıktı mevcut paket davranışıyla uyumlu biçimde büyük harfle döner.

Örnekler:

```text
0          → SIFIR TÜRK LİRASI
12.3       → ON İKİ TÜRK LİRASI OTUZ KURUŞ
1000       → BİN TÜRK LİRASI
1234.56    → BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ
"1.234,56" → BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ
```

## Hata yönetimi

Fonksiyon hatalı girdiyi sessizce dönüştürmeyecek ve sonuç içinde `undefined` üretmeyecek. Girdi türü veya sözdizimi yanlışsa `TypeError`; sözdizimi geçerli fakat değer desteklenen aralığın dışındaysa `RangeError` kullanılacak. Hata mesajları hatalı girdinin neden reddedildiğini belirtecek.

Demo bu hataları yakalayıp kullanıcıya metin olarak gösterecek; üretim fonksiyonu hata nesnesini değiştirmeden çağırana bırakacak.

## Test stratejisi

Testler Node'un yerleşik `node:test` ve `node:assert/strict` modüllerini kullanacak. Uygulama TDD döngüsüyle ilerleyecek: her davranış için önce başarısız test gözlemlenecek, ardından testi geçiren en küçük uygulama yazılacak.

Test kapsamı şunları içerecek:

- Birler, onlar, yüzler ve özel `YÜZ` kuralı
- Bin ve özel `BİN` kuralı
- Milyon ve daha büyük üçlü gruplar
- Ara grubu sıfır olan sayılar
- Sıfır lira ve sıfır kuruş
- Bir ve iki basamaklı kuruş
- Number, noktalı string ve Türkçe biçimli string eşdeğerliği
- Negatif, boş, alfabetik, `NaN` ve sonsuz girdiler
- Fazla ondalık basamak ve desteklenen aralık dışı değerler
- Çıktının whitespace normalizasyonu
- Yeni küçük harfli export ile eski alias'ın aynı davranışı vermesi
- Paketin kendi genel export'u üzerinden import edilebilmesi

`npm test` tüm otomatik testleri çalıştıracak. `npm run demo` manuel tarayıcı kontrolü için yerel sunucuyu başlatacak.

## Başarı ölçütleri

- `package.json` ve lock dosyasında Vite/Sass bağımlılığı kalmaz.
- `npm test` bağımlılık indirmeden başarılı olur.
- Paket genel giriş noktasından ESM ile import edilebilir.
- Demo `npm run demo` ile açılır ve aynı üretim fonksiyonunu kullanır.
- Belirlenen geçerli örnekler doğru, temiz metin üretir.
- Belirlenen geçersiz girdiler doğru hata sınıfını üretir.
- `npm pack --dry-run` yalnızca amaçlanan dosyaları listeler.
