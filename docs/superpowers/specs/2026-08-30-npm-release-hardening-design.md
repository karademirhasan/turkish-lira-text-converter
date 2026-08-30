# npm Yayın Güçlendirme Tasarımı

## Amaç

Paketi Node.js, CommonJS, TypeScript ve modern web tarayıcısı tüketicileri için
yayına hazır hâle getirmek. Public API tek bir açık isim kullanacak, yayınlanan
tarball gerçek tüketici projelerinde doğrulanacak ve npm yayını uzun ömürlü
token yerine Trusted Publishing ile yapılacak.

## Public API

Paket yalnızca aşağıdaki fonksiyonu dışa aktaracak:

```js
import { convertTurkishLiraToText } from 'turkish-lira-number-to-text-converter';
```

`convertTurkishLiraToText(amount)` mevcut dönüştürme ve hata davranışını
koruyacak. Eski `tryToTextConverter` ve `TryToTextConverter` adları için alias
veya deprecated export bulunmayacak. Paket henüz ilk kararlı yayına çıkmadan
isim değiştirildiği için geçiş katmanı eklenmeyecek.

## Paket girişleri ve çalışma ortamları

Node.js desteği `>=22` olacak. CI, desteklenen LTS hatları olan Node.js 22 ve 24
üzerinde çalışacak.

Paket ESM kaynağını, üretilen CommonJS girişini ve TypeScript bildirimini
yayınlayacak. `package.json` içindeki `exports` girdisi `types`, `import` ve
`require` koşullarını tanımlayacak; `types` ilk koşul olacak. Eski araçlarla
uyumluluk için aynı girişlere işaret eden `main`, `module` ve üst düzey `types`
alanları bulunacak.

Kütüphane çalışma zamanı bağımlılığı içermeyecek ve kaynak dosyası Node'a özgü
API kullanmayacak. Bu nedenle aynı ESM girişi modern browser bundler'larında ve
URL üzerinden ESM sunan CDN'lerde kullanılacak; ayrı bir browser bundle
üretilmeyecek.

## Browser kullanımı

README iki browser senaryosunu ayrı gösterecek:

1. Vite, webpack veya benzeri bir bundler ile npm paket adından import.
2. CDN URL'sinden `<script type="module">` ile doğrudan import.

Çıplak npm paket adlarının browsersız bir import map veya bundler olmadan
çözülemeyeceği açıkça belirtilecek. Demo aynı public fonksiyon adını kullanacak.

Browser doğrulaması, ağır ve kalıcı bir browser test framework'ü eklemeden
yapılacak. Test, yayınlanacak ESM girişini gerçek bir browser modül grafiğine
uygun şekilde paketleyip yükleyebilen hafif bir geliştirme aracıyla smoke test
edecek; sonuç metni doğrulanacak. Browser test aracı yalnızca geliştirme
bağımlılığı olacak ve yayınlanan tarball'a girmeyecek.

## Yayınlanmış paket sözleşmesi

Testler yalnızca repository içindeki self-reference importlarına dayanmayacak.
Bir paketleme doğrulama scripti şunları yapacak:

- `npm pack` ile tarball oluşturmak,
- tarball içeriğinin izin verilen dosyalarla sınırlı olduğunu kontrol etmek,
- geçici ESM ve CommonJS tüketicilerinde paketi kurup gerçek import/require
  çağrılarını çalıştırmak,
- geçici TypeScript tüketicisinde bildirim dosyasını çözümlemek,
- geçici dosyaları her sonuçta temizlemek.

Bu doğrulama yerel `npm run verify:package`, CI ve publish workflow'unda
çalışacak. Paketleme sırasında CommonJS çıktısı önce yeniden üretilecek.

## Test kapsamı

Mevcut dönüştürme testleri yeni API adına taşınacak. Aşağıdaki sınırlar ayrıca
korunacak:

- sıfır lira ve 1/10 kuruş değerleri,
- başında sıfır bulunan stringler,
- geçerli en büyük ölçek ve bunun üzerindeki değer,
- tüm ölçek adlarının en az bir örneği,
- hatalı Türkçe binlik gruplama,
- `-0` davranışı,
- Unicode veya beklenmeyen whitespace,
- number/string eşdeğerliği,
- çıktıda rakam, `undefined`, çift veya kenar boşluk bulunmaması.

Testler mevcut sözleşmeyle çelişen bir beklenti ortaya çıkarırsa mevcut belgeli
davranış korunacak; yeni bir davranış sessizce eklenmeyecek.

## Dokümantasyon ve metadata

README aşağıdakileri içerecek:

- Node ESM, CommonJS ve TypeScript örnekleri,
- bundler ve doğrudan browser/CDN örnekleri,
- kabul edilen input biçimleri ve hata sınıfları,
- maksimum desteklenen ölçek,
- sıfır kuruşun sonuçta yazılmaması,
- çalışma zamanı bağımlılığı bulunmadığı bilgisi.

Paket açıklaması ve anahtar kelimeler keşfedilebilirlik için
`turkish-lira`, `number-to-words`, `currency-to-text`, `browser` ve `node`
terimlerini kapsayacak. `CHANGELOG.md` ilk `0.1.0` sürümünü kaydedecek ve
yayınlanan dosyalara eklenecek. Eski yerel tasarım/plan belgelerindeki public
API adı güncel kararla uyumlu hâle getirilecek.

## CI ve güvenli yayın

CI; test, TypeScript, lint, format, CommonJS build, browser smoke testi ve
paketlenmiş tüketici doğrulamasını çalıştıracak.

Publish workflow yalnızca `vX.Y.Z` tag'lerinde çalışacak ve tag sürümü ile
`package.json` sürümünün birebir eşleşmesini kontrol edecek. Yayından önce tam
doğrulama zinciri çalışacak. npm kimlik doğrulaması GitHub Actions OIDC tabanlı
Trusted Publishing ile yapılacak; repository secret içindeki uzun ömürlü
`NPM_TOKEN` kullanılmayacak. Workflow `id-token: write` ve en düşük gerekli
diğer izinlerle çalışacak. npm tarafındaki trusted publisher bağlantısı kullanıcı
tarafından bir defa tanımlanacak.

## Başarı ölçütleri

- Tek public export `convertTurkishLiraToText` olur.
- Node.js 22 ve 24 CI doğrulamaları geçer.
- ESM, CommonJS, TypeScript ve browser tüketici kontrolleri geçer.
- `npm pack` yalnızca amaçlanan dosyaları içerir.
- Runtime bağımlılığı bulunmaz.
- README tüm desteklenen kullanım yollarını doğru gösterir.
- Publish workflow token secret olmadan Trusted Publishing'e hazır olur.
- Tag ve paket sürümü uyuşmadan yayın yapılamaz.
