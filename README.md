# 📌 İzin Takip Sistemi

Modern ve kullanıcı dostu bir **izin takip sistemi**.
Excel yerine merkezi, güvenli ve otomatik hesaplama yapan bir yapı sunar.

---

## 🚀 Proje Amacı

Bu sistem, çalışanların izin süreçlerini dijital ortama taşıyarak:

* İzin takibini kolaylaştırmayı

hedefler.

---

## 🛠️ Kullanılan Teknolojiler

* **Frontend & Backend:** Next.js (App Router)
* **Deployment:** Vercel
* **Database:** PostgreSQL (Neon)
* **ORM:** Prisma
* **Styling:** Tailwind CSS

---

## ⚙️ Özellikler


---

## 🚀 Kurulum

```bash
git clone https://github.com/bugraozdmr/izin-defteri.git
cd izin-defteri

npm install
npx prisma generate
npx prisma migrate dev

npm run dev
```

---

## 🌍 Deployment

Proje **Vercel** üzerinde deploy edilmiştir.

Her `git push` işlemi sonrası otomatik olarak:

* build alınır
* preview oluşturulur
* production güncellenir

---

## 🔄 CI/CD

* Git tabanlı otomatik deployment
* Branch bazlı preview ortamı
* Production: `main` branch

---

## 📄 Lisans

MIT License
