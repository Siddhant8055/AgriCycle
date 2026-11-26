# 🌱 AgriCycle: Smart Crop Waste Valorization Platform

## 📌 What is AgriCycle?

Every harvest season, millions of tonnes of agricultural residue (paddy straw, sugarcane leaves, soybean stover) are burned in open fields, causing severe smog, health issues, and soil damage. 

Farmers burn crop residue not by choice, but because:
1. They don't know who will buy it nearby.
2. Transportation and baling costs often wipe out their profits.
3. They lack clear economics on converting waste on their own farm into compost or biochar.

**AgriCycle solves this with "Decision Before Transaction":**  
Before a farmer spends money hauling waste to a buyer, AgriCycle calculates the **true take-home profit (Net Realizable Value - NRV)** by subtracting transportation, handling, and quality deductions. It then ranks the best pathways side-by-side so the farmer makes the most profitable choice.

---

## 🔄 How It Works in 3 Simple Steps

```mermaid
flowchart LR
    A["1. Farmer Lists Waste\n(Crop, Tons, Location)"] --> B["2. AI & NRV Engine Calculates\n(Gross - Transport - Handling)"]
    B --> C["3. Ranked Recommendation\n(Sell Raw vs Compost vs Biochar)"]
    C --> D["4. Connect with Buyer\n(Accept / Confirm Deal)"]
```

1. **List Residue:** Farmer enters crop type, available tonnage, moisture, and location.
2. **Analyze Economics:** AgriCycle compares four options:
   * **Direct Sale to Biomass Co-gen Plants** (for energy / briquettes)
   * **Direct Sale for Animal Fodder** (livestock feed)
   * **On-Farm Compost Production** (organic soil amendment)
   * **On-Farm Biochar Pyrolysis** (high-value soil carbon)
3. **Make the Best Deal:** Farmer sees an interactive profit waterfall chart, checks the **Break-Even Transport Radius**, and sends an offer to nearby verified buyers.

---

## ✨ Key Features

* 🌾 **Crop Support:** Tailored for regional crops (Paddy Straw, Sugarcane Trash, Soybean Stover, Wheat Straw, Cotton Stalks, Maize Stalks).
* 💰 **Net Realizable Value (NRV) Engine:** Evaluates real take-home income rather than naive gross prices.
* 📍 **Geospatial Matching & Break-Even Radius:** Tells the farmer the exact kilometer limit where selling to a distant buyer loses money compared to on-farm composting.
* 📊 **Interactive Financial Waterfall (Recharts):** Visual breakdown of Gross Revenue $\rightarrow$ Deductions $\rightarrow$ Final Take-Home Cash.
* 🤝 **Buyer Marketplace:** Commercial buyers (sugar mills, dairies, briquette plants) publish feedstock requirements and purchase offers.
* 🔐 **Role-Based Authentication:** Dedicated farmer and buyer dashboards secured with JWT authentication and bcrypt.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router DOM, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js, JWT, bcryptjs, Zod |
| **Database** | PostgreSQL with spatial coordinate tracking |
| **Testing** | Vitest (100% unit tests passing) |

---

## 🚀 Quick Start Guide (Run Locally)

### 1. Prerequisites
* **Node.js** (v18 or v22+)
* **PostgreSQL** running locally
* **pnpm** or **npm**

### 2. Setup Database & Environment

1. In PostgreSQL, create the database:
   ```sql
   CREATE DATABASE agricycle_db;
   ```

2. Setup backend environment in `backend/.env`:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/agricycle_db?schema=public
   JWT_SECRET=super_secret_jwt_key_agricycle_2026
   CORS_ORIGIN=http://localhost:5173
   ```

3. Setup frontend environment in `frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```

4. Run database migrations and seed demo data:
   ```bash
   npm run db:migrate
   ```

---

### 3. Start the Application

Open two terminal tabs:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
```
👉 *API runs at: `http://localhost:5000` (Health check: `http://localhost:5000/api/v1/health`)*

**Terminal 2 (Frontend Client):**
```bash
cd frontend
pnpm run dev
```
👉 *Frontend opens at: `http://localhost:5173`*

---

## 🔑 Demo Login Accounts

Test the platform instantly with these pre-seeded accounts:

| Role | Email / Identifier | Password | Description |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer.demo@agricycle.test` | `DemoPass123!` | Accesses crop listing, dashboard, and profit comparisons |
| **Buyer** | `buyer.cogen@agricycle.test` | `DemoPass123!` | Accesses buyer marketplace and feedstock demands |

---

## 🧪 Testing

Run the automated test suite:
```bash
npm run test:frontend
```
```text
✓ src/context/authStorage.test.js (4 tests)
✓ src/components/ui/Input.test.jsx (2 tests)
✓ src/pages/buyer/listingUtils.test.js (2 tests)
Tests: 8 passed (8)
```

---

## 👥 Academic Team & Attribution

**Dr. D. Y. Patil Pratishthan's College of Engineering, Salokhenagar, Kolhapur**  
*Department of Computer Science and Engineering | Final Year Project Group 3 (2026–2027)*  
*Affiliated with Shivaji University, Kolhapur*

* **Kokane Rohit Suresh** (PRN: 2023061601) - *Backend Core & Database*
* **Parit Siddhant Sanjay** (PRN: 2023057847) - *Math Modeling & NRV Valuation Engine*
* **Majgaonkar Shravani Abhijit** (PRN: 2023071872) - *Geospatial Matching & Offers*
* **Patil Priyanka Sunil** (PRN: 2023062831) - *Frontend UI & Visualizations*
* **Patil Pratiksha Maruti** (PRN: 2023057915) - *Crop Knowledge Base & Validation*

**Project Guide:** Prof. Amruta Chitari  
**Head of Department:** Dr. Mahesh P. Gaikwad  

---

## 📄 License
This project is open-source and licensed under the [ISC License](LICENSE).
