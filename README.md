# Ekşi Sözlük Entry Silici

Bu projenin amacı, Ekşi Sözlük kullanıcılarının entry'lerini tek tek veya toplu halde kolayca silebilmelerine yardımcı olmaktır. Ekşi Sözlük yönetimi, 30 saniyede bir entry'nin silinmesine izin verirken, bu eklenti, silmek istediğiniz entry'leri sıraya alır ve 30 saniyede bir otomatik olarak siler.

## Kurulum

Chrome ve Edge kullanıcıları için eklentinin yüklenebileceği adres: [Chrome Web Mağazası](https://chrome.google.com/webstore/detail/ek%C5%9Fis%C3%B6zl%C3%BCk-entry-silici/mmomeigkfemlkoibogenkdijibpdjnpi)

## Nasıl Kullanılır

### Tek Tek Silme

1. Silmek istediğiniz entry'nin menüsünden (...) "silme listesine ekle" seçeneğini seçin.

### Toplu Silme

1. Sözlük sayfasında sağ üstten "ben" linkine tıklayarak profilinizi açın.
2. Entry listesinin üstünde "tüm entry'leri silme listesine ekle" butonunu göreceksiniz.

## Notlar

- Entry'lerin silinebilmesi için en az bir eksisozluk.com sekmesinin açık olması gerekir.
- Sözlük tekrar açıldığında liste kaldığı yerden otomatik olarak devam eder.
- Tarayıcı eklentileri kısmından uygulamaya tıklayarak entry'lerin durumuna bakabilirsiniz.
- Sözlük üzerinden ayarlar -> tercihler "sildiğim entry'leri çöpe atmadan komple sil" seçeğini işaretlemek düşünülebilir. Şart değil, daha sonra çöpü komple boşaltabilirsiniz tek seferde.

## Geliştirme

Build adımı ya da bağımlılık yok; eklenti `extension/` klasöründeki düz JavaScript dosyalarından oluşur.

- `manifest.json`: izinler ve ekşi sözlük alan adları. Yeni bir alan adı eklemek için `host_permissions` ve `content_scripts.matches` listelerini güncelleyin.
- `background.js`: silme kuyruğu. 31 saniyede bir açık bir ekşi sözlük sekmesinde sıradaki entry'yi siler, 3 kez silinemeyen entry'leri "silinemeyenler" listesine taşır.
- `content.js`: entry menüsüne "silme listesine ekle" seçeneğini ve profile "tüm entry'leri silme listesine ekle" butonunu ekler.
- `popup.html` / `popup.js`: kuyruk, duraklat/devam et, silinemeyenler ve silinenler.

### Yerelde çalıştırma

1. `chrome://extensions` sayfasında "Geliştirici modu"nu açın.
2. "Paketlenmemiş öğe yükle" ile `extension/` klasörünü seçin.
3. Değişiklikten sonra eklenti kartındaki yenile butonuna basın ve ekşi sözlük sekmesini yenileyin.

Firefox için `about:debugging` → "Geçici eklenti yükle" ile `extension/manifest.json` seçilebilir (Firefox 128+).

### Yayınlama

`manifest.json` içindeki `version` değerini artırın ve zip'leyin:

```bash
cd extension && zip -r ../eksi-entry-silici.zip . -x '.*'
```

## English Summary

This project, called "Ekşi Sözlük Entry Silici" (Ekşi Sözlük Entry Deleter), is designed to help users of Ekşi Sözlük (a popular Turkish social platform similar to Reddit) to delete their entries individually or in bulk easily. The extension queues the entries you want to delete and automatically deletes one entry every 30 seconds, as the Ekşi Sözlük administration only allows one entry to be deleted every 30 seconds.

The extension can be installed from the [Chrome Web Store](https://chrome.google.com/webstore/detail/ek%C5%9Fis%C3%B6zl%C3%BCk-entry-silici/mmomeigkfemlkoibogenkdijibpdjnpi). 
