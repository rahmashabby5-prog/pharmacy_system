# Salama PMS - Pharmacy Management System (Phase 1)

Mfumo wa Kibiashara wa Usimamizi wa Pharmacy nchini Tanzania. 
Inajumuisha **Django REST Framework (Backend)** na **React + Vite (Frontend)** kwa kutumia **XAMPP MySQL** kama database.

---

## 1. Prerequisites (Mahitaji ya Mfumo)
Kabla ya kuanza, hakikisha kompyuta yako ina:
1. **XAMPP** (Hakikisha moduli za **Apache** na **MySQL** ziko **Active/Running**).
2. **Python 3** (Iliyosakinishwa tayari kwenye miniconda/python).
3. **Node.js** (Kwa ajili ya kuendesha React).

---

## 2. Jinsi ya Kufanya Setup ya Backend (Django)

Fungua terminal yako (CMD au PowerShell) na uende kwenye folda ya `backend/`:

### Hatua ya A: Anzisha Database ya XAMPP
Hakikisha XAMPP MySQL inafanya kazi kwenye port `3306` (default).

### Hatua ya B: Run Database Creator Script
Mfumo una script ya kipekee itakayotengeneza Database ya `pharmacy_pms_db` moja kwa moja kwenye XAMPP:
```bash
cd backend
venv\Scripts\python create_db.py
```
*(Ukiona ujumbe wa `Success: Database 'pharmacy_pms_db' checked/created successfully.`, inamaanisha kila kitu kiko tayari).*

### Hatua ya C: Sakinisha Dependencies (Kama zilifeli wakati wa kwanza)
Kama internet ilikuwa na upepo mdogo na ikafeli, kamilisha usakinishaji kwa amri hii:
```bash
venv\Scripts\pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pymysql
```

### Hatua ya D: Tengeneza na Run Migrations
Hii itatengeneza majedwali (tables) yote ya mfumo kwenye MySQL yako ya XAMPP:
```bash
venv\Scripts\python manage.py makemigrations users inventory sales
venv\Scripts\python manage.py migrate
```

### Hatua ya E: Tengeneza Akaunti ya Mmiliki (Owner/Admin)
Tengeneza akaunti ya Kiongozi/Mmiliki wa Pharmacy:
```bash
venv\Scripts\python manage.py createsuperuser
```
*(Ingiza username, email, na password utakayotumia kuingilia kwenye mfumo. Baada ya hapo unaweza pia kuingia kwenye Django Admin ya `/admin` ukipenda).*

### Hatua ya F: Washa Server ya Backend
Washa server sasa:
```bash
venv\Scripts\python manage.py runserver
```
Server itawaka kwenye: `http://127.0.0.1:8000/`

---

## 3. Jinsi ya Kufanya Setup ya Frontend (React)

Fungua terminal mpya na uende kwenye folda ya `frontend/`:

### Hatua ya A: Sakinisha Node Modules
Sakinisha maktaba (packages) zote za React:
```bash
cd frontend
npm install
```

### Hatua ya B: Washa React Dev Server
Washa mfumo wa muonekano (frontend):
```bash
npm run dev
```
Mfumo utakupa link mfano: `http://localhost:5173/`

Fungua link hiyo kwenye browser yako, na uingie kwa kutumia **username** na **password** uliyotengeneza kwenye hatua ya **createsuperuser**.

---

## 4. Utaratibu wa Mtumiaji na Ulinzi (Roles & Features)
* **Owner (Mmiliki)**: Anaona ripoti zote, faida (margins), stoki iliyopo, na anaweza kusajili dawa au suppliers.
* **Pharmacist (Mfamasia)**: Anaweza kuongeza stoki kupitia **GRN (Stock Intake)**, kusimamia dawa zinazoisha muda, lakini hawezi kuona ripoti za fedha au faida za mauzo.
* **Cashier (Mhudumu)**: Anaona terminal ya mauzo tu (**POS Billing**) kwa ajili ya kuuza dawa, kupokea malipo ya Cash, Mobile Money, au Bima (NHIF), na kutoa risiti za TRA VFD. Hawezi kubadilisha bei za dawa wala kuona ripoti.
