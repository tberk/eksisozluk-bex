# Gizlilik Politikası

*Son güncelleme: 25 Ekim 2026*

Ekşi Sözlük Entry Silici hiçbir kişisel veri toplamaz, kimseyle paylaşmaz ve hiçbir sunucuya göndermez.

## Saklanan veriler

Eklenti yalnızca çalışabilmek için gereken şu bilgileri tarayıcınızın yerel deposunda (`chrome.storage.local`) tutar:

- silme listesindeki, silinen ve silinemeyen entry'lerin numaraları
- silinemeyen entry'ler için deneme sayısı
- silmenin duraklatılıp duraklatılmadığı
- en son kullanılan ekşi sözlük adresi (popup'taki bağlantılar için)

Bu veriler cihazınızdan çıkmaz ve senkronize edilmez. Eklentiyi kaldırdığınızda tarayıcı tarafından silinir.

## Ağ istekleri

Eklentinin kendine ait bir sunucusu yoktur ve analiz, reklam ya da takip aracı kullanmaz. Tek ağ isteği, entry silmek için açık eksisozluk.com sekmenizden, sitenin kendi oturumunuzla `eksisozluk.com/entry/sil` adresine yapılan istektir. Bu, sitede entry'yi elle sildiğinizde yapılan istekle aynıdır.

## İzinler

- `storage`: yukarıdaki listeleri saklamak için.
- `alarms`: ekşi sözlük'ün izin verdiği şekilde 30 saniyede bir entry silmek için.
- `scripting`: silme isteğini ve bildirim mesajını açık eksisozluk.com sekmesinde çalıştırmak için.
- `https://*.eksisozluk.com/*`: entry menülerine "silme listesine ekle" seçeneğini eklemek ve silme işlemini yapmak için. Eklenti başka hiçbir sitede çalışmaz.

## İletişim

Sorularınız için: [github.com/tberk/eksisozluk-bex/issues](https://github.com/tberk/eksisozluk-bex/issues)

---

# Privacy Policy

*Last updated: October 25, 2026*

Ekşi Sözlük Entry Silici does not collect, share or transmit any personal data.

**Stored data.** To work, the extension keeps the following in your browser's local storage (`chrome.storage.local`): the numbers of queued, deleted and failed entries, retry counts for failed entries, whether deletion is paused, and the last eksisozluk.com address used (for links in the popup). This data never leaves your device, is not synced, and is removed by the browser when you uninstall the extension.

**Network requests.** The extension has no server of its own and uses no analytics, ads or tracking. Its only network request is the one that deletes an entry: it is sent to `eksisozluk.com/entry/sil` from your open eksisozluk.com tab, using your existing session, exactly as when you delete an entry on the site yourself.

**Permissions.** `storage` holds the lists above; `alarms` deletes one entry every 30 seconds, the rate ekşi sözlük allows; `scripting` runs the delete request and notification message in your open eksisozluk.com tab; access to `https://*.eksisozluk.com/*` adds the "silme listesine ekle" menu item and performs deletions. The extension runs on no other site.

**Contact.** [github.com/tberk/eksisozluk-bex/issues](https://github.com/tberk/eksisozluk-bex/issues)
