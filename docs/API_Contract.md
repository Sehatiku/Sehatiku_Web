​# API Contract — Sehatiku Backend

Dokumen ini adalah sumber kebenaran untuk seluruh endpoint API yang sudah diimplementasi.
**Setiap endpoint baru atau perubahan endpoint lama HARUS ditambahkan/diperbarui di sini**
(lihat Aturan #3 di `CLAUDE.md`).

Jangan menulis ulang seluruh dokumen saat menambah entry — tambahkan entry baru di bagian
yang sesuai, atau update entry yang sudah ada bila method+path sama.

---

## Format Entry

Gunakan format berikut untuk setiap endpoint:

````md
### `METHOD /path/ke/endpoint`

**Deskripsi:** Satu-dua kalimat tujuan endpoint ini.

**Auth:** Bearer JWT (nakes) | Bearer JWT (patient) | Public | Internal (ML microservice)

**Request**

Path params (jika ada):
| Param | Tipe | Keterangan |
|---|---|---|

Query params (jika ada):
| Param | Tipe | Wajib | Keterangan |
|---|---|---|---|

Body (jika ada):
```json
{
  "field": "tipe — keterangan singkat"
}
```

**Response — 200 OK**
```json
{
  "field": "tipe — keterangan singkat"
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 400 | ... |
| 401 | ... |
| 404 | ... |

**Catatan:** efek samping (mis. menulis ke tabel `notifications`), batasan, atau
hal non-obvious lain yang perlu diketahui pemanggil endpoint ini.
````

---

## Daftar Endpoint

### Auth

---

### `POST /api/v1/faskes/auth/register`

**Deskripsi:** Mendaftarkan fasilitas kesehatan baru. Setelah register, faskes harus login terpisah untuk mendapat token.

**Auth:** Public

**Request**

Body:
```json
{
  "name": "string — nama faskes",
  "type": "string — puskesmas | klinik",
  "address": "string — alamat lengkap",
  "region": "string — wilayah/kota",
  "username": "string — min 4, max 50 karakter",
  "password": "string — min 8 karakter",
  "phone_number": "string — format internasional, contoh: 628123456789"
}
```

**Response — 200 OK**
```json
{
  "message": "faskes berhasil didaftarkan",
  "data": null
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 400 | Body tidak valid / field wajib kosong / format `type` salah |
| 409 | `username` sudah digunakan faskes lain |
| 500 | Kegagalan server |

---

### `POST /api/v1/faskes/auth/login`

**Deskripsi:** Login faskes menggunakan username dan password. Mengembalikan access token (JWT, 12 jam) dan refresh token (opaque, 7 hari).

**Auth:** Public

**Request**

Body:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response — 200 OK**
```json
{
  "message": "login berhasil",
  "data": {
    "token": {
      "access_token": "string — JWT HS256",
      "refresh_token": "string — opaque 32-byte base64url",
      "expires_in": 43200
    },
    "faskes_id": "string — UUID faskes",
    "name": "string — nama faskes"
  }
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 400 | Body tidak valid |
| 401 | Username/password salah, atau akun `inactive` |
| 429 | Melebihi 5 percobaan gagal dalam 15 menit |
| 500 | Kegagalan server |

**Catatan:** JWT claims: `typ="faskes"`, `faskes_id`. Setelah login berhasil, notifikasi WhatsApp dikirim ke `phone_number` faskes secara fire-and-forget via whatsmeow (kegagalan WA hanya di-log, tidak memblok response). Notifikasi hanya terkirim jika server sudah dipasangkan ke nomor WA melalui `cmd/wa-setup`.

---

### `POST /api/v1/nakes/auth/login`

**Deskripsi:** Login nakes (dokter/kader/admin) menggunakan username dan password. Akun nakes dibuat oleh admin faskes — tidak ada self-register. Multi-device diperbolehkan; sesi lama tidak direvoke.

**Auth:** Public

**Request**

Body:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response — 200 OK**
```json
{
  "message": "login berhasil",
  "data": {
    "token": {
      "access_token": "string — JWT HS256",
      "refresh_token": "string — opaque 32-byte base64url",
      "expires_in": 43200
    },
    "nakes_id": "string — UUID nakes",
    "faskes_id": "string — UUID faskes tempat nakes bertugas",
    "full_name": "string",
    "role": "string — dokter | kader | admin"
  }
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 400 | Body tidak valid |
| 401 | Username/password salah, atau akun `inactive` |
| 429 | Melebihi 5 percobaan gagal dalam 15 menit |
| 500 | Kegagalan server |

**Catatan:** JWT claims: `typ="nakes"`, `nakes_id`, `faskes_id`, `role`. Refresh token berlaku 7 hari. Notifikasi WhatsApp dikirim ke `phone_number` nakes setelah login berhasil via whatsmeow (fire-and-forget; hanya terkirim jika server sudah dipasangkan via `cmd/wa-setup`).

---

### `POST /api/v1/patients/auth/login`

**Deskripsi:** Login pasien menggunakan username dan password. Akun pasien dibuat oleh nakes — tidak ada self-register. Single-device policy: login baru otomatis merevoke seluruh sesi lama.

**Auth:** Public

**Request**

Body:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response — 200 OK**
```json
{
  "message": "login berhasil",
  "data": {
    "token": {
      "access_token": "string — JWT HS256",
      "refresh_token": "string — opaque 32-byte base64url",
      "expires_in": 43200
    },
    "patient_id": "string — UUID pasien",
    "faskes_id": "string — UUID faskes yang mendaftarkan pasien",
    "full_name": "string"
  }
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 400 | Body tidak valid |
| 401 | Username/password salah, atau akun `inactive` |
| 429 | Melebihi 5 percobaan gagal dalam 15 menit |
| 500 | Kegagalan server |

**Catatan:** JWT claims: `typ="patient"`, `patient_id`, `faskes_id`. Refresh token berlaku 60 hari (UX lansia). Sebelum token baru diterbitkan, semua refresh token aktif pasien ini dihapus dari Redis (single-device). Notifikasi WhatsApp dikirim ke `phone_number` pasien via whatsmeow (fire-and-forget; hanya terkirim jika server sudah dipasangkan via `cmd/wa-setup`).

---

### `POST /api/v1/auth/refresh`

**Deskripsi:** Memperbarui access token menggunakan refresh token yang masih valid. Berlaku untuk semua aktor (faskes/nakes/patient). Menerapkan token rotation: refresh token lama dimusnahkan dan diganti yang baru dalam satu operasi atomik.

**Auth:** Public (refresh token di body, bukan header)

**Request**

Body:
```json
{
  "refresh_token": "string — opaque token yang diterima saat login atau refresh sebelumnya"
}
```

**Response — 200 OK**
```json
{
  "message": "token diperbarui",
  "data": {
    "access_token": "string — JWT baru",
    "refresh_token": "string — opaque token baru (token lama tidak bisa dipakai lagi)",
    "expires_in": 43200
  }
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 400 | Body tidak valid |
| 401 | Refresh token tidak ditemukan, sudah kadaluarsa, atau terdeteksi reuse |
| 500 | Kegagalan server |

**Catatan:** Jika refresh token yang sudah di-rotate dipakai ulang (reuse detection), seluruh sesi user langsung direvoke dan dikembalikan 401. User harus login ulang dari awal.

---

### `POST /api/v1/auth/logout`

**Deskripsi:** Mencabut refresh token aktif (logout dari perangkat ini). Berlaku untuk semua aktor. Access token yang masih beredar tetap valid sampai expired (≤ 12 jam) — ini trade-off yang disadari dari arsitektur stateless JWT.

**Auth:** Bearer JWT (faskes | nakes | patient)

**Request**

Body:
```json
{
  "refresh_token": "string — refresh token perangkat ini yang ingin di-logout"
}
```

**Response — 200 OK**
```json
{
  "message": "logout berhasil",
  "data": null
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 400 | Body tidak valid |
| 401 | Access token tidak ada / invalid / expired |
| 500 | Kegagalan server |

---

### Faskes & Nakes

---

### `GET /api/v1/faskes/profile`

**Deskripsi:** Mengambil profil faskes yang sedang login. `faskes_id` otomatis diambil dari JWT — faskes hanya dapat melihat profilnya sendiri, tidak ada path/query param.

**Auth:** Bearer JWT (faskes)

**Request**

_(tidak ada path param, query param, atau body)_

**Response — 200 OK**
```json
{
  "message": "detail faskes berhasil diambil",
  "data": {
    "faskes_id": "string — UUID faskes",
    "name": "string — nama faskes",
    "type": "string — puskesmas | klinik",
    "address": "string — alamat lengkap",
    "region": "string — wilayah/kota",
    "username": "string — username login faskes",
    "phone_number": "string — nomor WA faskes",
    "status": "string — active | inactive",
    "created_at": "string — ISO 8601 timestamp",
    "updated_at": "string — ISO 8601 timestamp"
  }
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 401 | Token faskes tidak ada atau tidak valid |
| 404 | Faskes pada JWT tidak ditemukan (mis. akun sudah dihapus) |
| 500 | Kegagalan server |

**Catatan:** `faskes_id` diambil dari JWT — tidak ada parameter tenant dari klien. `password_hash` tidak pernah dikembalikan. Field `platform_fee_idr` (lihat `docs/erd.md`) sengaja tidak diekspos di endpoint ini.

---

### `GET /api/v1/faskes/nakes`

**Deskripsi:** Mengambil daftar seluruh nakes (dokter/kader/admin) yang terdaftar di faskes yang sedang login. `faskes_id` otomatis diambil dari JWT — faskes hanya dapat melihat nakes miliknya sendiri.

**Auth:** Bearer JWT (faskes)

**Request**

_(tidak ada path param, query param, atau body)_

**Response — 200 OK**
```json
{
  "message": "daftar nakes berhasil diambil",
  "data": [
    {
      "nakes_id": "string — UUID nakes",
      "full_name": "string",
      "role": "string — dokter | kader | admin",
      "username": "string",
      "phone_number": "string",
      "status": "string — active | inactive",
      "enrolled_at": "string — ISO 8601 timestamp"
    }
  ]
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 401 | Token faskes tidak ada atau tidak valid |
| 500 | Kegagalan server |

**Catatan:** Mengembalikan semua nakes (aktif maupun tidak aktif) milik faskes, diurutkan berdasarkan `enrolled_at DESC`. Data diambil berdasarkan `faskes_id` dari JWT — tidak ada parameter tenant dari klien.

---

### `POST /api/v1/faskes/nakes/register/ktp-ocr`

**Deskripsi:** Upload foto KTP calon nakes (dokter/kader/admin). Mengembalikan data ter-ekstrak dari KTP untuk mengisi form registrasi secara otomatis. Tidak menyimpan data ke database — hanya memanggil OCR API eksternal dan mengembalikan hasilnya.

**Auth:** Bearer JWT (faskes)

**Request**

Body: `multipart/form-data`

| Field | Tipe | Keterangan |
|---|---|---|
| `file` | file (wajib) | Gambar KTP JPG/PNG, maks. 5 MB |

**Response — 200 OK**
```json
{
  "message": "KTP berhasil di-scan",
  "data": {
    "nik": "string — 16 digit NIK",
    "full_name": "string — nama lengkap dari KTP",
    "date_of_birth": "string — format YYYY-MM-DD",
    "sex": "string — male | female",
    "alamat": "string — alamat lengkap gabungan dari KTP"
  }
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 400 | Field `file` tidak ada, atau format file tidak didukung (bukan JPG/PNG) |
| 401 | Token faskes tidak ada atau tidak valid |
| 422 | KTP tidak terbaca (foto buram, pencahayaan buruk, bukan KTP) |
| 502 | OCR API eksternal tidak tersedia atau API key tidak valid |
| 500 | Kegagalan server |

**Catatan:** `alamat` dikonstruksi dari gabungan field `alamat`, `rt_rw`, `kelurahan`, `kecamatan`, `kota` yang diterima dari OCR API. Biaya Rp 150 per scan berhasil (ditagih oleh provider OCR).

---

### `POST /api/v1/faskes/nakes/register`

**Deskripsi:** Mendaftarkan nakes (dokter/kader/admin) baru ke faskes yang sedang login. `faskes_id` otomatis diambil dari JWT — tidak bisa di-override oleh klien.

**Auth:** Bearer JWT (faskes)

**Request**

Body:
```json
{
  "nik": "string — 16 digit NIK (wajib, harus unik)",
  "full_name": "string — nama lengkap (wajib)",
  "alamat": "string — alamat lengkap (wajib)",
  "phone_number": "string — nomor WA aktif (wajib)",
  "role": "string — dokter | kader | admin (wajib)",
  "username": "string — min 4, max 50 karakter (wajib, harus unik)",
  "password": "string — min 8 karakter (wajib)"
}
```

**Response — 200 OK**
```json
{
  "message": "nakes berhasil didaftarkan",
  "data": {
    "nakes_id": "string — UUID nakes baru",
    "faskes_id": "string — UUID faskes yang mendaftarkan",
    "full_name": "string",
    "role": "string — dokter | kader | admin",
    "nik": "string",
    "enrolled_at": "string — ISO 8601 timestamp"
  }
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 400 | Body tidak valid / field wajib kosong / `role` tidak valid |
| 401 | Token faskes tidak ada atau tidak valid |
| 409 | NIK atau username sudah terdaftar |
| 500 | Kegagalan server |

**Catatan:** Nakes langsung berstatus `active` setelah registrasi. Password di-hash dengan bcrypt sebelum disimpan. Setelah registrasi berhasil, kredensial login (username + password plaintext) dikirim ke `phone_number` nakes via WhatsApp (whatsmeow) secara fire-and-forget — kegagalan WA hanya di-log dan tidak memblok response. Notifikasi hanya terkirim jika server sudah dipasangkan ke nomor WA melalui `cmd/wa-setup`.

---

### `GET /api/v1/faskes/nakes/{id}`

**Deskripsi:** Mengambil profil lengkap satu nakes (dokter/kader/admin) milik faskes yang sedang login. `faskes_id` otomatis diambil dari JWT — faskes hanya dapat melihat detail nakes miliknya sendiri.

**Auth:** Bearer JWT (faskes)

**Request**

Path params:
| Param | Tipe | Keterangan |
|---|---|---|
| `id` | string (UUID) | ID nakes yang akan dilihat detailnya |

**Response — 200 OK**
```json
{
  "message": "detail nakes berhasil diambil",
  "data": {
    "nakes_id": "string — UUID nakes",
    "faskes_id": "string — UUID faskes",
    "full_name": "string — nama lengkap nakes",
    "role": "string — dokter | kader | admin",
    "nik": "string — 16 digit NIK",
    "alamat": "string — alamat lengkap",
    "phone_number": "string — nomor WA nakes",
    "username": "string — username login nakes",
    "status": "string — active | inactive",
    "enrolled_at": "string — ISO 8601 timestamp",
    "created_at": "string — ISO 8601 timestamp",
    "updated_at": "string — ISO 8601 timestamp"
  }
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 400 | `id` kosong |
| 401 | Token faskes tidak ada atau tidak valid |
| 404 | Nakes tidak ditemukan, atau nakes bukan milik faskes yang sedang login |
| 500 | Kegagalan server |

**Catatan:** `faskes_id` diambil dari JWT — faskes hanya bisa melihat nakes miliknya sendiri. Nakes milik faskes lain dikembalikan sebagai 404 (bukan 403) agar keberadaannya tidak bocor lintas tenant (konsisten dengan `GET /api/v1/faskes/patients/{id}` dan `PATCH /api/v1/faskes/nakes/{id}/status`). `password_hash` tidak pernah dikembalikan.

---

### `PATCH /api/v1/faskes/nakes/{id}/status`

**Deskripsi:** Mengubah status keaktifan seorang nakes (dokter/kader/admin) menjadi `active` atau `inactive`. Dipakai faskes untuk menonaktifkan/mengaktifkan kembali akun nakes. Nakes berstatus `inactive` tidak bisa login (lihat error 401 pada `POST /api/v1/nakes/auth/login`).

**Auth:** Bearer JWT (faskes)

**Request**

Path params:
| Param | Tipe | Keterangan |
|---|---|---|
| `id` | string (UUID) | ID nakes yang akan diubah statusnya |

Body:
```json
{
  "status": "string — active | inactive (wajib)"
}
```

**Response — 200 OK**
```json
{
  "message": "status nakes berhasil diperbarui",
  "data": {
    "nakes_id": "string — UUID nakes",
    "full_name": "string",
    "status": "string — active | inactive"
  }
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 400 | Body tidak valid / `status` bukan `active` atau `inactive` / `id` kosong |
| 401 | Token faskes tidak ada atau tidak valid |
| 404 | Nakes tidak ditemukan, atau nakes bukan milik faskes yang sedang login |
| 500 | Kegagalan server |

**Catatan:** `faskes_id` diambil dari JWT — faskes hanya bisa mengubah nakes miliknya sendiri. Nakes milik faskes lain dikembalikan sebagai 404 (bukan 403) agar keberadaannya tidak bocor lintas tenant. Operasi idempoten: mengirim status yang sama dengan status saat ini tetap mengembalikan 200.

---

### Patients

---

### `GET /api/v1/faskes/patients`

**Deskripsi:** Mengambil daftar seluruh pasien (semua status: `active` maupun `inactive`) yang dimiliki faskes yang sedang login, dengan pagination. `faskes_id` otomatis diambil dari JWT — faskes hanya dapat melihat pasien miliknya sendiri.

**Auth:** Bearer JWT (faskes)

**Request**

Query params:
| Param | Tipe | Wajib | Default | Keterangan |
|---|---|---|---|---|
| `page` | integer | Tidak | 1 | Nomor halaman (mulai dari 1) |
| `size` | integer | Tidak | 20 | Jumlah item per halaman (maks. 100) |

**Response — 200 OK**
```json
{
  "message": "daftar pasien berhasil diambil",
  "data": [
    {
      "patient_id": "string — UUID pasien",
      "full_name": "string — nama lengkap pasien",
      "nik": "string — 16 digit NIK",
      "sex": "string — male | female",
      "age": 58,
      "disease_type": "string — diabetes_t2 | hypertension | both",
      "phone_number": "string — nomor WA pasien",
      "companion_name": "string — nama pendamping",
      "companion_phone": "string — nomor WA pendamping",
      "status": "string — active | inactive",
      "enrolled_at": "string — ISO 8601 timestamp"
    }
  ],
  "paging": {
    "page": 1,
    "size": 20,
    "total_item": 8,
    "total_page": 1
  }
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 401 | Token faskes tidak ada atau tidak valid |
| 500 | Kegagalan server |

**Catatan:** Mengembalikan semua pasien (aktif maupun tidak aktif) milik faskes, diurutkan berdasarkan `enrolled_at DESC`. `age` dihitung dari `date_of_birth` (0 jika tanggal lahir kosong). Data diambil berdasarkan `faskes_id` dari JWT — tidak ada parameter tenant dari klien. Berbeda dari `GET /api/v1/nakes/dashboard/patient-queue` yang diurutkan berdasarkan risk score dan hanya menampilkan pasien `active`.

---

### `GET /api/v1/faskes/patients/{id}`

**Deskripsi:** Mengambil profil lengkap satu pasien milik faskes yang sedang login. `faskes_id` otomatis diambil dari JWT — faskes hanya dapat melihat detail pasien miliknya sendiri.

**Auth:** Bearer JWT (faskes)

**Request**

Path params:
| Param | Tipe | Keterangan |
|---|---|---|
| `id` | string (UUID) | ID pasien yang akan dilihat detailnya |

**Response — 200 OK**
```json
{
  "message": "detail pasien berhasil diambil",
  "data": {
    "patient_id": "string — UUID pasien",
    "faskes_id": "string — UUID faskes",
    "assigned_nakes_id": "string — UUID nakes penanggung jawab",
    "assigned_nakes_name": "string — nama nakes penanggung jawab, kosong jika nakes tidak ditemukan",
    "full_name": "string — nama lengkap pasien",
    "nik": "string — 16 digit NIK",
    "date_of_birth": "string — YYYY-MM-DD, kosong jika tidak ada",
    "sex": "string — male | female",
    "age": 58,
    "alamat": "string — alamat lengkap",
    "phone_number": "string — nomor WA pasien",
    "companion_name": "string — nama pendamping",
    "companion_phone": "string — nomor WA pendamping",
    "disease_type": "string — diabetes_t2 | hypertension | both",
    "username": "string — username login pasien",
    "status": "string — active | inactive",
    "enrolled_at": "string — ISO 8601 timestamp",
    "created_at": "string — ISO 8601 timestamp",
    "updated_at": "string — ISO 8601 timestamp"
  }
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 400 | `id` kosong |
| 401 | Token faskes tidak ada atau tidak valid |
| 404 | Pasien tidak ditemukan, atau pasien bukan milik faskes yang sedang login |
| 500 | Kegagalan server |

**Catatan:** `faskes_id` diambil dari JWT — faskes hanya bisa melihat pasien miliknya sendiri. Pasien milik faskes lain dikembalikan sebagai 404 (bukan 403) agar keberadaannya tidak bocor lintas tenant (konsisten dengan `PATCH /api/v1/faskes/nakes/{id}/status`). `age` dihitung dari `date_of_birth` (0 jika kosong). `password_hash` tidak pernah dikembalikan. `assigned_nakes_name` di-resolve dari `assigned_nakes_id`; bila nakes tersebut tidak ditemukan, field dibiarkan kosong dan detail pasien tetap dikembalikan.

---

### `POST /api/v1/faskes/patients/register/ktp-ocr`

**Deskripsi:** Upload foto KTP calon pasien. Mengembalikan data ter-ekstrak dari KTP untuk mengisi form registrasi pasien secara otomatis. Tidak menyimpan data ke database.

**Auth:** Bearer JWT (faskes)

**Request**

Body: `multipart/form-data`

| Field | Tipe | Keterangan |
|---|---|---|
| `file` | file (wajib) | Gambar KTP JPG/PNG, maks. 5 MB |

**Response — 200 OK**
```json
{
  "message": "KTP berhasil di-scan",
  "data": {
    "nik": "string — 16 digit NIK",
    "full_name": "string — nama lengkap dari KTP",
    "date_of_birth": "string — format YYYY-MM-DD",
    "sex": "string — male | female",
    "alamat": "string — alamat lengkap gabungan dari KTP"
  }
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 400 | Field `file` tidak ada, atau format file tidak didukung |
| 401 | Token faskes tidak ada atau tidak valid |
| 422 | KTP tidak terbaca |
| 502 | OCR API eksternal tidak tersedia atau API key tidak valid |
| 500 | Kegagalan server |

---

### `POST /api/v1/faskes/patients/register`

**Deskripsi:** Mendaftarkan pasien baru ke faskes yang sedang login. `faskes_id` otomatis diambil dari JWT faskes — tidak bisa di-override oleh klien. `assigned_nakes_id` (dokter penanggung jawab) dikirim faskes di body dan harus merujuk ke nakes milik faskes ini.

**Auth:** Bearer JWT (faskes)

**Request**

Body:
```json
{
  "assigned_nakes_id": "string — UUID nakes penanggung jawab (wajib, harus milik faskes ini)",
  "nik": "string — 16 digit NIK (wajib, harus unik)",
  "full_name": "string — nama lengkap (wajib)",
  "date_of_birth": "string — format YYYY-MM-DD (wajib)",
  "sex": "string — male | female (wajib)",
  "alamat": "string — alamat lengkap (wajib)",
  "phone_number": "string — nomor WA aktif pasien (wajib)",
  "companion_name": "string — nama pendamping/keluarga (wajib)",
  "companion_phone": "string — nomor WA pendamping (wajib)",
  "disease_type": "string — diabetes_t2 | hypertension | both (wajib)",
  "username": "string — min 4, max 50 karakter (wajib, harus unik)",
  "password": "string — min 8 karakter (wajib)"
}
```

**Response — 200 OK**
```json
{
  "message": "pasien berhasil didaftarkan",
  "data": {
    "patient_id": "string — UUID pasien baru",
    "faskes_id": "string — UUID faskes",
    "full_name": "string",
    "nik": "string",
    "disease_type": "string — diabetes_t2 | hypertension | both",
    "enrolled_at": "string — ISO 8601 timestamp"
  }
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 400 | Body tidak valid / field wajib kosong / `sex` atau `disease_type` tidak valid / `date_of_birth` bukan YYYY-MM-DD / `assigned_nakes_id` tidak valid atau bukan milik faskes ini |
| 401 | Token faskes tidak ada atau tidak valid |
| 409 | NIK atau username sudah terdaftar |
| 500 | Kegagalan server |

**Catatan:** Pasien langsung berstatus `active`. `assigned_nakes_id` di-set dari body request dan divalidasi harus merujuk ke nakes milik faskes yang sedang login (jika tidak ada atau milik faskes lain → 400, pesan diseragamkan agar tidak bocor lintas tenant). Password di-hash dengan bcrypt. Setelah registrasi berhasil, kredensial login (username + password plaintext) dikirim via WhatsApp (whatsmeow) secara fire-and-forget ke `phone_number` pasien dan ke `companion_phone` pendamping (pesan pendamping menyertakan kredensial pasien agar bisa membantu pasien lansia login). Kegagalan WA hanya di-log dan tidak memblok response; notifikasi hanya terkirim jika server sudah dipasangkan ke nomor WA melalui `cmd/wa-setup`.

### Dashboard Nakes

---

### `GET /api/v1/nakes/dashboard/summary`

**Deskripsi:** Mengambil ringkasan statistik dashboard untuk faskes yang sedang login — total pasien aktif, jumlah pasien dengan risiko bahaya, dan jumlah pasien dengan status aman. Data didasarkan pada risk score terbaru per pasien.

**Auth:** Bearer JWT (nakes)

**Request**

_(tidak ada path param, query param, atau body)_

**Response — 200 OK**
```json
{
  "message": "ringkasan dashboard berhasil diambil",
  "data": {
    "total_pasien": 8,
    "risiko_bahaya": 2,
    "status_aman": 3
  }
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 401 | Token nakes tidak ada atau tidak valid |
| 500 | Kegagalan server |

**Catatan:** `faskes_id` diambil dari JWT — nakes hanya dapat melihat data faskes miliknya. Pasien yang belum memiliki risk score tetap dihitung di `total_pasien` namun tidak masuk ke `risiko_bahaya` maupun `status_aman`.

---

### `GET /api/v1/nakes/dashboard/patient-queue`

**Deskripsi:** Mengambil daftar pasien aktif dari faskes yang sedang login, diurutkan berdasarkan risk score terbaru dari tertinggi ke terendah (AI Auto-Sorted). Mendukung pagination.

**Auth:** Bearer JWT (nakes)

**Request**

Query params:
| Param | Tipe | Wajib | Default | Keterangan |
|---|---|---|---|---|
| `page` | integer | Tidak | 1 | Nomor halaman (mulai dari 1) |
| `size` | integer | Tidak | 20 | Jumlah item per halaman (maks. 100) |

**Response — 200 OK**
```json
{
  "message": "antrian prioritas pasien berhasil diambil",
  "data": [
    {
      "patient_id": "string — UUID pasien",
      "full_name": "string — nama lengkap pasien",
      "age": 58,
      "disease_type": "string — diabetes_t2 | hypertension | both",
      "risk_score": 92,
      "risk_label": "string — kritis | sedang | rendah",
      "status": "string — bahaya | waswas | aman",
      "main_factor": "string — label Indonesia faktor SHAP tertinggi, kosong jika belum ada skor"
    }
  ],
  "paging": {
    "page": 1,
    "size": 20,
    "total_item": 8,
    "total_page": 1
  }
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 401 | Token nakes tidak ada atau tidak valid |
| 500 | Kegagalan server |

**Catatan:**
- `risk_label` dihitung dari `risk_score`: ≥ 80 → `kritis`, 50–79 → `sedang`, < 50 → `rendah`.
- `status` adalah nilai enum dari kolom `risk_scores.status` (`bahaya | waswas | aman`).
- `main_factor` diambil dari elemen pertama array `top_factors` (SHAP value tertinggi) di `risk_scores`, lalu diterjemahkan ke label Indonesia.
- Pasien tanpa risk score tetap muncul di antrian dengan `risk_score: 0`, `risk_label: "rendah"`, `status: "aman"`, `main_factor: ""`.
- `faskes_id` diambil dari JWT — tidak bisa di-override oleh klien.

---

### Dashboard Pasien

---

### `GET /api/v1/patients/dashboard`

**Deskripsi:** Mengambil data agregat untuk layar utama (home) Patient App (mobile): profil pasien, status risiko terbaru, pengukuran terakhir (gula darah & tekanan darah), status logging harian (streak), dan rekomendasi. Semua data di-scope ke pasien yang sedang login — `patient_id` diambil dari JWT, tidak pernah dari request.

**Auth:** Bearer JWT (patient)

**Request**

_(tidak ada path param, query param, atau body)_

**Response — 200 OK**
```json
{
  "message": "dashboard pasien berhasil diambil",
  "data": {
    "profile": {
      "full_name": "string — nama lengkap pasien",
      "age": 58,
      "disease_type": "string — diabetes_t2 | hypertension | both"
    },
    "risk": {
      "score": 72,
      "risk_label": "string — kritis | sedang | rendah",
      "status": "string — bahaya | waswas | aman",
      "main_factor": "string — label Indonesia faktor SHAP tertinggi, kosong jika belum ada skor",
      "scored_at": "string | null — ISO 8601 timestamp skor terakhir, null jika belum ada skor"
    },
    "latest_measurements": {
      "glucose": { "value": 180, "measured_at": "string — ISO 8601" },
      "blood_pressure": { "systolic": 140, "diastolic": 90, "measured_at": "string — ISO 8601" }
    },
    "logging": {
      "logged_today": true,
      "streak_days": 5
    },
    "recommendations": ["string — kalimat anjuran berbahasa Indonesia"]
  }
}
```

**Response — Error**
| Status | Kondisi |
|---|---|
| 401 | Token pasien tidak ada / invalid / expired |
| 500 | Kegagalan server |

**Catatan:**
- `risk_label` dihitung dari `risk.score`: ≥ 80 → `kritis`, 50–79 → `sedang`, < 50 → `rendah` (konsisten dengan dashboard nakes).
- `risk.status` adalah nilai enum `risk_scores.status`. `main_factor` = elemen pertama `top_factors` (SHAP tertinggi) diterjemahkan ke label Indonesia.
- Pasien tanpa risk score: `risk.score: 0`, `risk_label: "rendah"`, `status: "aman"`, `main_factor: ""`, `scored_at: null`.
- `latest_measurements.glucose` dan `blood_pressure` bernilai `null` jika pasien belum punya log metrik tersebut. Tekanan darah dibaca dari `health_logs.value_jsonb` (`{"systolic", "diastolic"}`).
- `logging.logged_today` = ada `health_log` dengan `measured_at::date = hari ini`. `streak_days` = jumlah hari berturut-turut yang punya log, dihitung mundur dari hari terakhir yang punya log (hari ini jika ada, kalau tidak kemarin); `0` jika log terakhir lebih lama dari kemarin.
- `recommendations` diturunkan dari hingga 3 faktor SHAP teratas (`top_factors`) yang dipetakan ke kalimat anjuran statis. Jika belum ada risk score, berisi satu pesan onboarding generik.
- **Catatan data:** `latest_measurements` dan `logging` membaca `health_logs`. Jalur input pasien sudah tersedia via `POST /api/v1/patients/health-logs`; section ini tetap mengembalikan `null`/`0` untuk pasien yang belum punya log. Ingestion via webhook WhatsApp belum dibangun.

---

### Health Logs (input harian)

---

### `POST /api/v1/patients/health-logs`

**Deskripsi:** Pasien (Patient App / mobile) mencatat **satu** pengukuran kesehatan harian
(satu metrik per request → satu baris di `health_logs`). `patient_id` diambil dari JWT,
tidak pernah dari body. `logged_by` selalu `patient` dan `source` selalu `web` (di-set
server-side). `measured_at` dikirim client supaya entri yang sempat tertunda tetap tercatat
dengan waktu pengukuran asli.

**Auth:** Bearer JWT (patient)

**Request**

Headers:
| Header | Wajib | Keterangan |
|---|---|---|
| `Authorization` | ya | `Bearer <access_token>` (patient) |
| `Idempotency-Key` | ya | UUID dibuat client; dedupe double-tap. Request kedua dengan key sama dalam 5 menit mengembalikan response yang sama tanpa insert dobel. |

Body (bentuk nilai tergantung `metric_type`):
```json
{
  "metric_type": "string — glucose | bp | med_adherence | food | activity | sleep | stress | smoking | alcohol",
  "value_numeric": "number — wajib untuk metrik numerik (semua kecuali bp & food)",
  "systolic": "int — wajib untuk metric_type=bp",
  "diastolic": "int — wajib untuk metric_type=bp",
  "value_text": "string — wajib untuk metric_type=food (maks 500 char)",
  "measured_at": "string — wajib, RFC3339 / ISO 8601, tidak boleh di masa depan"
}
```

Aturan nilai & range per `metric_type`:
| metric_type | field nilai | range | disimpan ke |
|---|---|---|---|
| `glucose` | `value_numeric` | 20–600 (mg/dL) | `value_numeric` |
| `bp` | `systolic`, `diastolic` | sys 40–300, dia 20–200, sys > dia | `value_jsonb` `{"systolic":N,"diastolic":N}` |
| `med_adherence` | `value_numeric` | 0–100 (%) | `value_numeric` |
| `food` | `value_text` | non-kosong, maks 500 char | `value_text` |
| `activity` | `value_numeric` | 0–1440 (menit) | `value_numeric` |
| `sleep` | `value_numeric` | 0–24 (jam) | `value_numeric` |
| `stress` | `value_numeric` | 1–10 | `value_numeric` |
| `smoking` | `value_numeric` | 0–200 (batang) | `value_numeric` |
| `alcohol` | `value_numeric` | 0–100 (unit) | `value_numeric` |

Contoh — glucose:
```json
{ "metric_type": "glucose", "value_numeric": 180, "measured_at": "2026-06-28T07:00:00Z" }
```

Contoh — tekanan darah (bp):
```json
{ "metric_type": "bp", "systolic": 140, "diastolic": 90, "measured_at": "2026-06-28T07:05:00Z" }
```

**Response — 201 Created**
```json
{
  "message": "data harian berhasil dicatat",
  "data": {
    "id": "string — uuid health log",
    "patient_id": "string — uuid",
    "metric_type": "string",
    "value_numeric": 180,
    "value_text": "string — hanya untuk food",
    "blood_pressure": { "systolic": 140, "diastolic": 90 },
    "measured_at": "string — ISO 8601",
    "logged_by": "string — selalu patient",
    "source": "string — selalu web",
    "created_at": "string — ISO 8601"
  }
}
```
> `value_numeric`, `value_text`, dan `blood_pressure` saling eksklusif sesuai `metric_type`
> (field yang tidak relevan dihilangkan dari JSON).

**Response — Error**
| Status | Kondisi |
|---|---|
| 400 | `Idempotency-Key` header tidak ada; body gagal validasi struct; nilai per-metric tidak valid / di luar range; `measured_at` bukan RFC3339 atau di masa depan |
| 401 | Token pasien tidak ada / invalid / expired |
| 409 | Request dengan `Idempotency-Key` yang sama masih diproses (in-flight) |
| 429 | Terlalu banyak submission dalam waktu singkat (rate limit, maks 30 / menit per pasien) |
| 500 | Kegagalan server |

**Catatan:**
- Tabel `health_logs` insert-only — tidak ada UPDATE/DELETE. Satu request = satu baris.
- `logged_by` & `source` di-set server-side (`patient` / `web`); nilai di body diabaikan.
  Pendamping/keluarga tetap input lewat WhatsApp, bukan endpoint ini.
- Konvensi `bp`: kedua angka disimpan dalam **satu baris** di `value_jsonb`
  (`{"systolic":N,"diastolic":N}`), bukan dua log terpisah — konsisten dengan cara dashboard
  pasien membacanya.
- Idempotency: key disimpan di Redis (`idempotency:{key}`, TTL 5 menit, lihat `docs/redis.md`).
  Request ulang dengan key sama dalam window mengembalikan `id` yang sama tanpa insert dobel.
- Endpoint ini mengisi `health_logs` yang dibaca `GET /api/v1/patients/dashboard`
  (`latest_measurements`, `logging.logged_today`, `streak_days`).

### Lab Results

_(belum ada)_

### Risk Scores

_(belum ada)_

### Escalations

_(belum ada)_

### Notifications

_(belum ada)_

### Webhook WhatsApp

_(belum ada)_
