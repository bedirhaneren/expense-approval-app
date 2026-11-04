# Masraf Bildirim ve Onay SaaS — Uygulama Planı

> Kaynak: `Masraf_Bildirim_SaaS_Teknik_Case_Guncel.pdf`
> Hedef: Next.js + NestJS + PostgreSQL ile uçtan uca çalışan MVP
> Tahmini emek: ~8–12 saat (3–5 gün)

---

## 0. Teknik Kararlar

| Konu | Karar | Neden |
|---|---|---|
| Repo yapısı | Monorepo: `apps/api` (NestJS), `apps/web` (Next.js) | Tek repo, tek README, tek docker-compose |
| Paket yöneticisi | npm, her uygulama kendi `package.json`'ı ile bağımsız; kökte kısayol script'leri | Basit kurulum, Docker'da hoisting sorunu yok |
| ORM | Prisma | Şema, migration ve seed tek yerde |
| Veritabanı | PostgreSQL 16 (Docker, host portu **5433**) | Zorunlu, kalıcı volume; yerel Postgres 5432'yi kullandığı için 5433 |
| Auth | JWT (Bearer) + bcrypt | Basit, stateless |
| Yetki | `JwtAuthGuard` + `RolesGuard` + servis katmanında sahiplik kontrolü | UI'dan bağımsız sunucu tarafı güvenlik |
| Validasyon | `class-validator` DTO'lar + global `ValidationPipe` | Pozitif tutar, geçerli tarih, zorunlu alanlar |
| Frontend | Next.js (App Router) + Tailwind | Hızlı, sade arayüz |
| Test | Vitest (unit) + Supertest (e2e) | NestJS 12 Vitest ile hazır geliyor |
| Çalıştırma | `docker compose up` | Değerlendirici tek komutla çalıştırabilsin |

---

## 1. Veri Modeli

```
User
  id, name, email (unique), username (unique), passwordHash,
  role: EMPLOYEE | MANAGER | ACCOUNTING,
  managerId -> User (nullable)

Expense
  id, title, expenseDate, category: TRANSPORT | MEAL | ACCOMMODATION | OTHER,
  amount (Decimal 12,2), note (nullable),
  status: DRAFT | PENDING_MANAGER | PENDING_ACCOUNTING | APPROVED | REJECTED,
  ownerId -> User,
  rejectionReason (nullable), rejectedById (nullable),
  createdAt, updatedAt

ExpenseHistory (işlem geçmişi)
  id, expenseId -> Expense, actorId -> User,
  action: CREATED | UPDATED | SUBMITTED | MANAGER_APPROVED | MANAGER_REJECTED
          | ACCOUNTING_APPROVED | ACCOUNTING_REJECTED,
  fromStatus, toStatus, reason (nullable), createdAt
```

## 2. Durum Makinesi (tek kaynak)

| Mevcut durum | İşlem | Yetkili | Yeni durum | Gerekçe |
|---|---|---|---|---|
| DRAFT | update | Sahip | DRAFT | – |
| DRAFT | submit | Sahip | PENDING_MANAGER | – |
| PENDING_MANAGER | approve | Sahibin yöneticisi | PENDING_ACCOUNTING | – |
| PENDING_MANAGER | reject | Sahibin yöneticisi | REJECTED | **Zorunlu** |
| PENDING_ACCOUNTING | approve | ACCOUNTING | APPROVED | – |
| PENDING_ACCOUNTING | reject | ACCOUNTING | REJECTED | **Zorunlu** |

Diğer tüm geçişler → `409 Conflict` (geçersiz durum) veya `403 Forbidden` (yetkisiz).
Çift onay / yarış durumu → `updateMany({ where: { id, status: beklenen } })`; etkilenen satır 0 ise 409.

## 3. API Uç Noktaları

| Method | Endpoint | Rol | Açıklama |
|---|---|---|---|
| POST | `/auth/login` | Herkes | Kullanıcı adı/e-posta + şifre → JWT |
| GET | `/auth/me` | Giriş yapmış | Aktif kullanıcı bilgisi |
| GET | `/expenses` | EMPLOYEE | Kendi masrafları |
| POST | `/expenses` | EMPLOYEE | Taslak oluştur |
| GET | `/expenses/:id` | Rol bazlı | Detay + geçmiş (görme yetkisi kontrolü) |
| PATCH | `/expenses/:id` | EMPLOYEE (sahip) | Sadece DRAFT düzenlenir |
| POST | `/expenses/:id/submit` | EMPLOYEE (sahip) | DRAFT → PENDING_MANAGER |
| GET | `/approvals/manager` | MANAGER | Bağlı çalışanların PENDING_MANAGER kayıtları |
| POST | `/approvals/manager/:id/approve` | MANAGER | → PENDING_ACCOUNTING |
| POST | `/approvals/manager/:id/reject` | MANAGER | → REJECTED (reason zorunlu) |
| GET | `/approvals/accounting` | ACCOUNTING | PENDING_ACCOUNTING kayıtları |
| POST | `/approvals/accounting/:id/approve` | ACCOUNTING | → APPROVED |
| POST | `/approvals/accounting/:id/reject` | ACCOUNTING | → REJECTED (reason zorunlu) |

**Görme kuralı (`GET /expenses/:id`):**
- EMPLOYEE → yalnızca `ownerId === me`
- MANAGER → yalnızca `owner.managerId === me` ve kayıt hiç DRAFT değil (onay akışına girmiş)
- ACCOUNTING → yalnızca PENDING_ACCOUNTING veya muhasebe aşamasından geçmiş kayıtlar
- Yetkisiz → `404` (kaydın varlığını sızdırmamak için)

---

## 4. Adım Adım Yol Haritası

### Adım 1 — Proje iskeleti (~1 saat)
- [x] `git init`, `.gitignore`, kök `package.json` (kısayol script'leri)
- [x] `apps/api`: `nest new` ile NestJS 12 projesi (port 3001, CORS açık)
- [x] `apps/web`: `create-next-app` ile Next.js 16 (TypeScript, App Router, Tailwind)
- [x] `docker-compose.yml`: `db` servisi (volume ile); `api` ve `web` servisleri Adım 7'de eklenecek
- [x] `.env.example` dosyaları (DATABASE_URL, JWT_SECRET, NEXT_PUBLIC_API_URL)
- **Çıktı:** `docker compose up db` ile Postgres ayakta, API ve Web boş sayfa açıyor

### Adım 2 — Veritabanı ve seed (~1 saat)
- [x] Prisma 7.10.1 kurulumu (`@prisma/adapter-pg` sürücüsüyle), `prisma.config.ts`, `schema.prisma`
- [x] Tablolar `snake_case` (`users`, `expenses`, `expense_history`); kodda `camelCase`
- [x] İlk migration + veritabanı seviyesinde `CHECK (amount > 0)` kısıtı
- [x] `prisma/seed.ts`: Ali, Veli (manager = Ahmet), Ahmet (MANAGER), Ayşe (ACCOUNTING); demo şifre `Demo123!` (bcrypt)
- [x] Seed idempotent (`upsert`)
- [x] NestJS'te global `PrismaModule` / `PrismaService`
- **Çıktı:** `npm run db:setup` ile 4 kullanıcı hazır; veriler container yeniden başlatılınca korunuyor

### Adım 3 — Auth modülü (~1 saat)
- [ ] `AuthModule`: `POST /auth/login` (username veya email kabul eder), `GET /auth/me`
- [ ] `JwtStrategy`, `JwtAuthGuard` (global), `@Public()` dekoratörü
- [ ] `@Roles()` dekoratörü + `RolesGuard`
- [ ] `@CurrentUser()` param dekoratörü
- **Çıktı:** Postman/curl ile login → token → `/auth/me` çalışıyor

### Adım 4 — Masraf modülü + iş kuralları (~2 saat) ⭐ en kritik
- [ ] `expense-state-machine.ts`: geçiş tablosu + `assertTransition(from, action)` saf fonksiyonu
- [ ] `ExpensesService`: create, update (sadece DRAFT + sahip), submit, findMine, findOneForUser
- [ ] `ApprovalsService`: manager list/approve/reject, accounting list/approve/reject
- [ ] Her geçiş tek `prisma.$transaction` içinde: koşullu status update + `ExpenseHistory` kaydı
- [ ] DTO validasyonları: `@IsNotEmpty`, `@IsPositive`, `@IsDateString`, `@IsEnum`, reject için `reason` zorunlu (min 3 karakter)
- [ ] Anlaşılır Türkçe hata mesajları (ör. "Bu masraf onaya gönderildiği için düzenlenemez")
- **Çıktı:** Tüm akış API üzerinden curl ile uçtan uca çalışıyor

### Adım 5 — Otomatik testler (~1.5 saat)
- [ ] **Unit (Vitest):** state machine — tüm geçerli/geçersiz geçişler
- [ ] **E2E (Supertest + test DB):**
  - [ ] Çalışan başka çalışanın kaydını göremez (Ali → Veli'nin kaydı = 404)
  - [ ] Çalışan gönderilmiş kaydı düzenleyemez (409)
  - [ ] Muhasebe, yönetici onayı olmayan kaydı onaylayamaz (409/404)
  - [ ] Yönetici aynı kaydı iki kez onaylayamaz (409)
  - [ ] Red gerekçesiz yapılamaz (400)
  - [ ] Çalışan onay endpoint'ini çağıramaz (403)
  - [ ] PDF'teki tam senaryo (Ali 750 TL ✓, Veli 420 TL ✗ "Eksik bilgi")
- **Çıktı:** `npm test` ve `npm run test:e2e` yeşil (Vitest)

### Adım 6 — Frontend (~3 saat)
- [ ] API istemcisi (`lib/api.ts`), token saklama (httpOnly cookie veya localStorage), 401'de login'e yönlendirme
- [ ] Rol bazlı yönlendirme: login sonrası EMPLOYEE → `/expenses`, MANAGER → `/approvals/manager`, ACCOUNTING → `/approvals/accounting`
- [ ] **Giriş sayfası** — kullanıcı adı/e-posta, şifre, hata mesajı
- [ ] **Çalışan paneli**
  - [ ] Masraflarım listesi (durum rozeti, tutar, tarih)
  - [ ] Yeni masraf formu (client-side validasyon)
  - [ ] Taslak düzenle / Onaya gönder butonları (yalnızca DRAFT'ta)
  - [ ] Detay: alanlar + red gerekçesi + işlem geçmişi zaman çizelgesi
- [ ] **Yönetici paneli** — bekleyenler listesi, detay, Onayla / Reddet (gerekçe modalı)
- [ ] **Muhasebe paneli** — yöneticiyle aynı bileşenler, farklı endpoint
- [ ] Üst bar: kullanıcı adı, rol, çıkış
- [ ] Ortak bileşenler: `StatusBadge`, `ExpenseTable`, `HistoryTimeline`, `RejectDialog`
- **Çıktı:** PDF'teki 6 adımlık senaryo tarayıcıdan oynanabiliyor

### Adım 7 — Docker ve dağıtım (~1 saat)
- [ ] `apps/api/Dockerfile` (başlangıçta `migrate deploy` + `seed`)
- [ ] `apps/web/Dockerfile`
- [ ] `docker compose up --build` ile sıfırdan çalıştığını doğrula
- [ ] (Opsiyonel) Canlı demo: Railway/Render (API + Postgres) + Vercel (Web)

### Adım 8 — Dokümantasyon ve teslim (~1 saat)
- [ ] `README.md`: özet, teknolojiler, kurulum (Docker + manuel), demo kullanıcılar tablosu, varsayımlar, bilinen eksikler
- [ ] `docs/TECHNICAL.md`: veri modeli, rol/yetki yaklaşımı, onay akışı (durum diyagramı)
- [ ] E2E senaryosunu manuel olarak baştan sona dene
- [ ] 3–5 dakikalık ekran kaydı
- [ ] GitHub'a push, gerekirse erişim ver

---

## 5. Demo Kullanıcıları (seed)

| Kullanıcı adı | E-posta | Şifre | Rol | Yönetici |
|---|---|---|---|---|
| ali | ali@demo.local | Demo123! | EMPLOYEE | ahmet |
| veli | veli@demo.local | Demo123! | EMPLOYEE | ahmet |
| ahmet | ahmet@demo.local | Demo123! | MANAGER | – |
| ayse | ayse@demo.local | Demo123! | ACCOUNTING | – |

## 6. Varsayımlar (README'ye taşınacak)
- Reddedilen masraf nihai durumdur; yeniden gönderim yoktur (gerekirse yeni masraf açılır).
- Taslak silme MVP kapsamında opsiyoneldir.
- Masraf tarihi gelecekte olamaz.
- Tutar TL, en fazla 2 ondalık basamak.
- Yönetici kendi masrafını oluşturmaz (case'te tanımlı değil).
- Yetkisiz kayda erişimde varlığı gizlemek için 404 döner.

## 7. Ek Geliştirme Fikirleri (temel bitince, opsiyonel)
- Fiş/dosya yükleme
- Taslak silme
- Listelerde filtreleme (durum, tarih)
- Muhasebe için onaylanan masraflar geçmişi sekmesi

## 8. İlerleme Takibi

| Adım | Durum |
|---|---|
| 1. İskelet | ✅ |
| 2. DB + Seed | ✅ |
| 3. Auth | ⬜ |
| 4. Masraf + İş kuralları | ⬜ |
| 5. Testler | ⬜ |
| 6. Frontend | ⬜ |
| 7. Docker | ⬜ |
| 8. Dokümantasyon + Teslim | ⬜ |
