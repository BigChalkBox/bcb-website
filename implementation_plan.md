# BigChalkBox — Full-Stack SEO & Generative AI Visibility Plan

**Goal:** Maximize rankings in traditional Google Search, AI Overviews, AI Mode, Perplexity, ChatGPT, and Claude — across every signal Google's guides identify as critical.

---

## Audit Summary: What You Have (Strengths)

You've already done serious work:
- ✅ Next.js App Router with static export — good for performance
- ✅ Per-page metadata (title, description, OG, Twitter)
- ✅ Canonical tags on every page
- ✅ Rich JSON-LD on every page (Organization, SoftwareApplication, FAQPage, BreadcrumbList, Article, HowTo, Speakable)
- ✅ `sitemap.js` generating an XML sitemap
- ✅ `robots.js` with AI crawler grants (GPTBot, ClaudeBot, Perplexity, etc.)
- ✅ Google Site Verification meta tag
- ✅ `llms.txt` and `llms-full.txt` (non-harmful, fine to keep)
- ✅ 30+ blog articles with heroAnswer, sections, faqItems
- ✅ Product pages for all 5 products

---

## Audit Summary: Critical Gaps Found

### 🚨 HIGH-PRIORITY Issues

1. **robots.txt (static) references `dasesai.com` — not `bigchalkbox.com`**  
   `public/robots.txt` sitemap points to `https://dasesai.com/sitemap.xml` — wrong domain. Google will use this file for static deployments.

2. **Sitemap missing product pages, careers page, and teacher page**  
   `/products/dases`, `/products/qp-moderation`, `/products/qp-generation`, `/products/teacher-notes`, `/products/exam-prep`, `/careers`, `/teacher` are all missing from `sitemap.js`.

3. **`/products/dases` page missing canonical, OG images, and full JSON-LD**  
   The DASES product page has a barebones metadata block — no canonical URL, no OG image, no BreadcrumbList, no aggregateRating, no sameAs.

4. **OG image for homepage references `/logo/og-image.png` — file may not exist**  
   The `page.js` OG image points to `/logo/og-image.png` but `public/logo/` needs verification. Twitter card image same issue.

5. **`llms.txt` and `llms-full.txt` reference `dasesai.com` URLs throughout**  
   All URLs inside these files still say `dasesai.com` — not `bigchalkbox.com`. AI crawlers that read these will cite the wrong domain.

6. **Blog articles NOT in llms.txt match the articles in articles.js**  
   `llms.txt` references articles that may not exist (e.g. `/blog/gradescope-alternative-india`) — these are "Wave 1-6" planned articles that haven't been created yet. Google will 404 on them if linked.

7. **`output: 'export'` in next.config.mjs + static export means no server-side headers**  
   With full static export, you cannot set HTTP response headers. This means no `X-Robots-Tag`, no `Cache-Control` tuning at the HTTP level. This is acceptable but noted.

8. **No `hreflang` tags for en-IN locale specificity**  
   The site targets India (locale `en_IN`) but has no hreflang tags telling Google this is the canonical en-IN version.

9. **Missing `WebPage` and `Service` schema on product sub-pages**  
   Product pages like `/products/qp-moderation` are likely missing all structured data (need to check each).

10. **Organization schema missing social profiles beyond LinkedIn**  
    `sameAs` on Organization only has LinkedIn. Missing: Twitter/X, YouTube (if any), Crunchbase, etc.

---

### ⚠️ MEDIUM-PRIORITY Issues

11. **Blog `CollectionPage` references `DASES` as site name (should be `BigChalkBox`)**  
    Inconsistency in brand identity across structured data.

12. **Blog article Author is `Organization`, not a `Person`**  
    Google's Helpful Content guidelines reward E-E-A-T (Experience, Expertise, Authoritativeness, Trust). Articles attributed to a named human author signal more trust than a company. Even one named author person schema would help.

13. **No `dateModified` update strategy**  
    All `lastModified: new Date()` in sitemap — this means every crawl will show today as the modified date. For evergreen articles, this is fine; for the homepage it's ideal. But it inflates freshness signals inaccurately.

14. **No `ImageObject` structured data on blog article images**  
    Images used in blog posts should have `ImageObject` with `caption`, `name`, and `contentUrl` for image search eligibility.

15. **Pricing page `Offer` for Evaluation Module is missing a `price` value**  
    One Offer in the Pricing JSON-LD has no `price` field — this will fail Google's Rich Results validation.

16. **About page missing `sameAs` social links**  
    Organization schema on `/about` has `sameAs: []` — completely empty.

17. **No `Review` or `Testimonial` structured data**  
    The homepage mentions a 4.9 AggregateRating with 47 reviews — but there are no individual `Review` schema items to back them up. Google may not show the star rating without individual reviews.

18. **`speakableSpec` in blog posts uses `.hero-answer-text` CSS class — need to verify this class actually exists in the DOM**

---

### 🔧 LOW-PRIORITY / Generative AI Optimization

19. **`llms-full.txt` blog corpus ends at 33 articles but articles.js may have different slugs**  
    Need to sync these to ensure AI crawlers get accurate URLs.

20. **No `SiteLinksSearchBox` schema**  
    Could enable search box in Google SERP for the brand name.

21. **No `VideoObject` schema for demo videos (if any exist in public/videos/)**

---

## Proposed Changes

### Component 1: Fix Critical Domain/URL Issues

---

#### [MODIFY] [robots.txt](file:///Users/konalsmac/Local-Desktop/PRODUCTION-LEVEL-DASES/public/robots.txt)
- Fix sitemap URL from `dasesai.com` → `bigchalkbox.com`
- Remove incorrect GEO comment referencing old domain
- Add `Disallow: /admin` to protect admin routes

#### [MODIFY] [llms.txt](file:///Users/konalsmac/Local-Desktop/PRODUCTION-LEVEL-DASES/public/llms.txt)
- Replace all `dasesai.com` references with `bigchalkbox.com`
- Update company name to `BigChalkBox Innovations LLP`
- Sync blog article list to match what's actually in `articles.js`

#### [MODIFY] [llms-full.txt](file:///Users/konalsmac/Local-Desktop/PRODUCTION-LEVEL-DASES/public/llms-full.txt)
- Replace all `dasesai.com` references with `bigchalkbox.com`
- Update website and citation URLs

---

### Component 2: Fix Sitemap (Missing Pages)

---

#### [MODIFY] [sitemap.js](file:///Users/konalsmac/Local-Desktop/PRODUCTION-LEVEL-DASES/src/app/sitemap.js)
Add all missing pages with correct priority and changeFrequency:
- `/products/dases` — priority 0.9
- `/products/qp-moderation` — priority 0.85
- `/products/qp-generation` — priority 0.85
- `/products/teacher-notes` — priority 0.8
- `/products/exam-prep` — priority 0.8
- `/careers` — priority 0.5
- `/teacher` — priority 0.7

---

### Component 3: Fix All Product Page SEO

---

#### [MODIFY] [/products/dases/page.js](file:///Users/konalsmac/Local-Desktop/PRODUCTION-LEVEL-DASES/src/app/products/dases/page.js)
- Add canonical URL
- Add OG metadata with image
- Expand JSON-LD: add BreadcrumbList, aggregateRating, featureList, sameAs, proper Offer with price
- Add `alternates.canonical`

#### Check & Fix `/products/qp-moderation/page.js`, `/products/qp-generation/page.js`, `/products/teacher-notes/page.js`, `/products/exam-prep/page.js`
- Add complete metadata blocks
- Add JSON-LD schemas with BreadcrumbList + SoftwareApplication

---

### Component 4: Fix Layout-Level Metadata & Schema

---

#### [MODIFY] [layout.js](file:///Users/konalsmac/Local-Desktop/PRODUCTION-LEVEL-DASES/src/app/layout.js)
- Add `sameAs` social profiles to Organization (LinkedIn, Twitter, etc.)
- Add `hreflang` `en-IN` alternate link in `<head>`
- Add `SiteLinksSearchBox` JSON-LD
- Improve keywords list with more specific long-tail terms

---

### Component 5: Fix Homepage JSON-LD

---

#### [MODIFY] [page.js (homepage)](file:///Users/konalsmac/Local-Desktop/PRODUCTION-LEVEL-DASES/src/app/page.js)
- Add individual `Review` items to back up the 4.9 AggregateRating (minimum 3-5)
- Add `VideoObject` if demo video exists
- Fix Organization `sameAs` to include all social links
- Add `LocalBusiness` or `ProfessionalService` type if applicable

---

### Component 6: Fix Blog-Level Issues

---

#### [MODIFY] [blog/page.js](file:///Users/konalsmac/Local-Desktop/PRODUCTION-LEVEL-DASES/src/app/blog/page.js)
- Fix `CollectionPage` site name from `DASES` → `BigChalkBox`
- Add `author` with named Person schema for E-E-A-T

#### [MODIFY] [blog/[slug]/page.js](file:///Users/konalsmac/Local-Desktop/PRODUCTION-LEVEL-DASES/src/app/blog/%5Bslug%5D/page.js)
- Add `Person` author schema (even a generic team member name)
- Verify `.hero-answer-text` CSS class exists in BlogArticle component
- Add `ImageObject` schema for hero images

---

### Component 7: Fix Pricing Page Schema

---

#### [MODIFY] [pricing/page.js](file:///Users/konalsmac/Local-Desktop/PRODUCTION-LEVEL-DASES/src/app/pricing/page.js)
- Add missing `price` field to Evaluation Module Offer
- Add `priceValidUntil` date
- Add `AggregateOffer` wrapping the individual offers

---

### Component 8: Fix About Page Schema

---

#### [MODIFY] [about/page.js](file:///Users/konalsmac/Local-Desktop/PRODUCTION-LEVEL-DASES/src/app/about/page.js)
- Add social links to `sameAs`
- Add founding team `Person` schema for E-E-A-T
- Add `numberOfEmployees` and other trust signals

---

## Open Questions

> [!IMPORTANT]
> **What is the actual domain?** The site uses `bigchalkbox.com` in most metadata, but `llms.txt`, `robots.txt`, and `llms-full.txt` still reference `dasesai.com`. Which is the live, primary domain? This affects every fix.

> [!IMPORTANT]
> **Do you have a Twitter/X account, YouTube channel, or Crunchbase profile for BigChalkBox?** These go into `sameAs` and dramatically improve E-E-A-T.

> [!IMPORTANT]
> **Are the Wave 1–6 blog articles in `llms.txt` actually published (i.e. in `articles.js`)?** If not, I should remove them from `llms.txt` to prevent 404 links being given to AI crawlers.

> [!IMPORTANT]
> **Can you confirm the OG image `/logo/og-image.png` exists?** If not, I'll generate one or redirect to the existing logo.

> [!WARNING]
> **The `AggregateRating` with 4.9/47 reviews on the homepage JSON-LD** — Google may not display this in rich results without verifiable individual `Review` schema items. Are these reviews real/collectible? If yes, I can add 5 real ones from your testimonials.

---

## Verification Plan

### Automated Tests
- `npm run build` — verify no build errors after changes
- Google Rich Results Test on: homepage, blog post, pricing, solutions, product pages
- `https://search.google.com/test/rich-results` for each page

### Manual Verification
- Validate `sitemap.xml` at `https://bigchalkbox.com/sitemap.xml` includes all new pages
- Verify `robots.txt` at `https://bigchalkbox.com/robots.txt` shows correct domain
- Check `llms.txt` at `https://bigchalkbox.com/llms.txt` for correct bigchalkbox.com URLs
- Submit updated sitemap in Google Search Console after deploy
- Check Generative AI performance report in Search Console (after a few weeks)
