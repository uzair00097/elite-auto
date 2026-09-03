# Elite Auto — Project Plan

> **What it is:** AI-powered vehicle marketplace (cars & motorcycles) for Pakistan — built as a portfolio project to win developer job applications.
> **Not a real business launch.** No real payments, no real dealers, no moderation ops — scoped for what a hiring manager actually evaluates in a 5–10 minute review.
> **Timeline:** 2–3 weeks, solo build.

---

## 1. Positioning

> **"The smartest way to buy and sell used vehicles in Pakistan — natural language search, verified sellers, and seamless WhatsApp contact."**

### Why this angle
Pakistan's used-vehicle market is dominated by a few players, none of whom combine trust + smart discovery:

| Player | Strength | Weakness |
|---|---|---|
| PakWheels | Brand trust, large inventory | Dated UX, weak search relevance |
| OLX Pakistan | Massive reach, low posting friction | No vehicle-specific tooling, high spam |
| Facebook Marketplace/Groups | Zero friction, social trust layer | No structure, no real search, listings vanish into feed |
| Local dealer networks | High trust, in-person inspection | Zero digital discovery, doesn't scale |

**The gap:** nobody offers structured, trustworthy discovery *with* intelligent search. Rigid filter-based search (PakWheels, OLX) fails a buyer who just wants to type "automatic family car under 40 lakh in Karachi." That gap is Elite Auto's whole reason for existing — and the one feature worth actually building well.

**WhatsApp is the sector's real CRM** — every player leans on it for negotiation. Elite Auto builds around that instead of fighting it with in-app chat.

### Interview narrative
> "I identified that existing players win on trust and volume but lose on search quality, so I built the one feature that would actually move the needle — AI-powered natural language search — and scoped everything else down to prove the concept cleanly."

---

## 2. Tech Stack

| Layer | Tech | Notes |
|---|---|---|
| Frontend | Next.js + Tailwind CSS | Deployed on Vercel |
| Backend | FastAPI + SQLModel | Deployed on Railway/Render (free tier) |
| Database | PostgreSQL + pgvector | Single managed instance — no Redis, no extra infra |
| Auth | Email + password, JWT | No OTP/SMS — adds cost/complexity, zero portfolio value |
| Image Storage | Cloudinary (free tier) | Presigned uploads |
| AI | OpenAI API (embeddings + chat) | Hybrid semantic search — the core differentiator |
| Deployment | Vercel + Railway/Render | Free tiers, sufficient for a demo |

---

## 3. Scope

### Building
- Auth: register/login (email + password + JWT)
- Vehicle CRUD: create/edit/delete/mark sold, category = car or motorcycle
- Multi-image upload per listing (Cloudinary presigned URLs)
- Browse pages with filters: city, price range, make, year, category
- Listing detail page (gallery, specs, seller info, WhatsApp link button)
- Seller dashboard (my listings, edit, mark sold)
- Seed script — 20–30 realistic fake listings (scripted, not hand-typed)
- **Hybrid semantic search** — natural language query box, pgvector + SQL filters combined, ranked results
- Mobile responsive UI, loading/empty/error states throughout
- README with architecture diagram + demo video/gif

### Explicitly cut (vision-only, not built)
Real payments/webhooks · WhatsApp Business API (use a plain `wa.me/` link instead) · Phone OTP · Multi-role RBAC / admin moderation queue · Dealer profiles & subscriptions · AI price intelligence · Duplicate listing detection · SEO content engine

---

## 4. Database Schema

```
users              → id, name, email, password_hash, city, is_seller, created_at
vehicles           → id, seller_id, category, title, slug, make, model, year,
                      price, mileage, transmission, fuel_type, city, condition,
                      description, status (active/sold), created_at
vehicle_images     → id, vehicle_id, image_url, is_primary, sort_order
vehicle_embeddings → id, vehicle_id, embedding (vector)
favorites          → id, user_id, vehicle_id   [Week 3 stretch — see §5]
```

---

## 5. Week-by-Week Plan

### Week 1 — Core Marketplace
- [ ] FastAPI + PostgreSQL + SQLModel + Alembic setup
- [ ] Auth: register/login, JWT
- [ ] Vehicle CRUD endpoints
- [ ] Image upload flow (Cloudinary presigned URLs)
- [ ] Next.js + Tailwind setup
- [ ] Listing creation form (multi-step)
- [ ] Browse page with SQL filters (city, price, make, year)
- [ ] Listing detail page
- [ ] Seller dashboard (basic)
- [ ] Deploy both (Vercel + Railway/Render) — early, not last
- [ ] Seed script → 20–30 realistic listings
- [ ] **De-risking spike:** before Week 2 starts, prototype hybrid ranking in a notebook/script against ~10 seed listings — embed a handful of test queries, eyeball whether vector similarity + SQL filters actually surface sensible results on sparse data. If ranking looks noisy, adjust approach (e.g. weight SQL filters more heavily, tune embedding input fields) before building the full endpoint.

**Deliverable:** working, deployed, browsable marketplace with real (seeded) data.

### Week 2 — AI Differentiator
- [ ] Add `pgvector` extension to Postgres
- [ ] Generate embeddings for seeded listings (title + description + specs)
- [ ] `/search/semantic` endpoint: parse natural language query → combine vector similarity + SQL filters → ranked results
- [ ] Natural language search bar on homepage
- [ ] Test against real queries until results look genuinely sensible
- [ ] Stretch: "Similar vehicles" section on listing detail page

**Deliverable:** the one AI feature that makes this stand out — screen-recordable in 15 seconds.

### Week 3 — Polish
- [ ] Mobile responsive pass across all pages
- [ ] Loading/empty/error states
- [ ] WhatsApp contact button (`wa.me/` link)
- [ ] Fake "Boost Listing" button (UI only, no real payment)
- [ ] Stretch: favorites (save/unsave a listing) — only if Weeks 1–2 finished with time to spare
- [ ] Final QA pass
- [ ] README: architecture diagram, tech decisions, setup instructions, live demo link
- [ ] Record 2–3 min demo video/GIF, embed in README
- [ ] Push to GitHub with clean commit history

**Deliverable:** portfolio-ready, deployed project with a README that sells the engineering decisions.

---

## 6. README Checklist

- [ ] One-line description + live demo link at the top
- [ ] Architecture diagram (Next.js → FastAPI → Postgres/pgvector)
- [ ] Why these tech choices (2–3 sentences each)
- [ ] GIF/video of semantic search in action
- [ ] Local setup instructions
- [ ] "What I'd add with more time" section — turns cut scope into a strength

---

## 7. Definition of Done

- [ ] Live demo link works, loads fast, no broken pages
- [ ] Semantic search returns genuinely sensible results for 5+ different natural language queries
- [ ] Mobile view doesn't break
- [ ] README sells the project in the first 30 seconds
- [ ] Code pushed with reasonably clean structure
