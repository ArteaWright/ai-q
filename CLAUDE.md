# AI Readiness Assessor App - Project Plan

**TL;DR**: Build a Next.js questionnaire app that assesses business AI readiness through 5 sections (15 questions total). Users authenticate, complete the assessment, submit to AI API for AI-generated recommendations with section-level readiness (low/medium/high) and overall percentage, save results to database, and download recommendations as PDF.

## Architecture Overview
- Frontend: Next.js with React + TypeScript, CSS Modules
- Backend: Next.js API routes for authentication, assessment submission, AI API calls, database operations
- Database: Store user accounts, completed assessments, scores, and AI-generated recommendations
- AI Integration: Call AI API with assessment JSON + context, receive recommendations
- PDF Export: Generate and download PDF of recommendations
- Authentication: User login/signup required before starting assessment

## Questionnaire Structure
**5 Sections, 3 questions each (15 questions):**
1. **Data Readiness** (40% weight) – 3 questions
2. **Infrastructure and Integration** (15% weight) – 3 questions
3. **Human Capital and AI Literacy** (15% weight) – 3 questions
4. **Leadership Readiness** (15% weight) – 3 questions
5. **Security Assessment** (15% weight) – 3 questions

## Implementation Phases

### Phase 1: Core Assessment Structure ✅ COMPLETED
1. Create questionnaire JSON file with all 15 questions, placeholder multiple-choice options
2. Define TypeScript types: Question, Section, Assessment, AssessmentResponse, ScoreResult
3. Create utility functions for score calculation (section totals, readiness categorization: low/medium/high)

### Phase 2.1: Authentication ✅ COMPLETED
4. Create authentication pages and route protection:
   - `src/app/auth/signup/page.tsx` and `src/app/auth/login/page.tsx`
   - Use Supabase Auth helpers or client to sign up and sign in with email/password
   - Add session-aware redirect logic so unauthenticated visitors are sent to login before questionnaire access

### Phase 2.2: Front-End UI ✅ COMPLETED
5. Build the questionnaire experience:
   - `src/app/page.tsx` serves as the authenticated welcome page with assessment preview cards and a Start button
   - `src/app/questionnaire/page.tsx` renders the assessment flow
   - Load `src/lib/questionnaire.json` and manage responses in component state
   - Support `multipleChoice` selection and optional `text` entry for future question types
6. Create reusable UI components:
   - `src/components/QuestionCard.tsx` for question rendering and response capture
   - `src/components/ProgressBar.tsx` for progress tracking across questions/sections
   - `src/components/QuestionnaireForm.tsx` for the questionnaire form, section navigation, and submission
7. Implement response state and navigation:
   - Track user answers by section/question
   - Allow users to move between question groups or complete the entire form
8. Add form validation and UI feedback:
   - Ensure every question has a selected response before submission
   - Display inline errors until the form is complete
9. Style guide: individual CSS modules per component following shared dark-theme conventions (deferred — not blocking)

### Phase 3: Frontend - Results & Export ✅ COMPLETED
9. Results page (`src/app/results/page.tsx` + `src/components/ResultsView.tsx`):
   - Auth-protected server wrapper + client component
   - Scores passed via `sessionStorage` from questionnaire on submit
   - Each section displayed with score, readiness level badge (Low/Medium/High), and progress bar
   - Overall readiness percentage with colour-coded display
   - "Generating recommendations…" spinner while API call is in flight
   - Recommendations rendered from Claude API response
   - PDF download via `jspdf` (lazy-loaded)
10. PDF generation: `jspdf` installed, download triggered client-side from results page

### Phase 4: Backend - API Routes & AI Integration ✅ COMPLETED
11. API routes created:
    - POST `/api/assessment/submit` — verifies auth, calls Claude API, returns recommendations (DB insert stubbed for Phase 5)
12. AI integration (`src/lib/ai-client.ts`):
    - Uses `@anthropic-ai/sdk` with `claude-opus-4-6`
    - Sends section scores + overall readiness; requests key findings, action items, 6-month roadmap, and resource recommendations
    - `ANTHROPIC_API_KEY` configured in `.env.local`
13. Database schema: stubbed TODO comments in submit route for Phase 5

### Phase 5: Data Persistence ✅ COMPLETED
14. Supabase PostgreSQL used — no additional ORM needed (`@supabase/supabase-js` client)
15. Session management handled by Supabase Auth (server-side via `@supabase/ssr`)
16. `assessments` table created in Supabase with columns: `id`, `user_id`, `overall_score`, `overall_readiness_level`, `section_scores` (jsonb), `recommendations`, `completed_at`, `created_at`
    - Row Level Security enabled: users can only insert and read their own rows
    - POST `/api/assessment/submit` saves assessment after Claude generates recommendations; gracefully continues if DB insert fails

### Phase 6: Integration & Polish ✅ COMPLETED
17. Mobile button stacking fixed — `.actions` stacks vertically at ≤480px on questionnaire and results pages
18. Submit route updated to upsert (one row per user; retakes overwrite via `onConflict: 'user_id'`)
19. `GET /api/assessment/me` route — fetches the authenticated user's single assessment row from Supabase
20. `RetakeModal` — warns user that retaking overwrites previous results; prompts PDF download before proceeding; has X / "Go back" / "Retake anyway" actions
21. `AssessmentSidebar` — desktop sticky sidebar + mobile slide-in drawer (triggered by fixed "History" pill button):
    - Shows overall score, readiness level, section badges (Low/Medium/High), and completed date
    - "Download recommendation" button navigates to results page using cached Supabase data (no Claude re-call)
    - "Retake assessment" button triggers RetakeModal
    - Recommendations text removed from sidebar — available only via the results page PDF
22. `HomeClient` — client wrapper on home page that wires sidebar + modal together; home page fetches assessment server-side on load and passes it down
23. `ResultsView` updated — detects `fromHistory` flag in sessionStorage and uses `cachedRecommendations` instead of calling Claude API again

### Phase 7: Design ⏳ PENDING
- Define new color scheme and update global theme ✅
- Improve typography, spacing, and visual hierarchy ✅
- Add branding (logo/mark), gradient accents, and card depth ✅
- Standardize design tokens (font-size, spacing, sizing, border-radius) and sweep all CSS modules ✅
- Subtle animations and transitions throughout

## Key Files to Create/Modify
- `src/lib/questionnaire.json` — Question data ✅
- `src/lib/types.ts` — TypeScript interfaces ✅
- `src/lib/scoring.ts` — Score calculation and categorization logic ✅
- `src/lib/ai-client.ts` — Claude API integration (`@anthropic-ai/sdk`, `claude-opus-4-6`) ✅
- `src/app/page.tsx` — Authenticated welcome page ✅
- `src/app/auth/login/page.tsx` — Login page ✅
- `src/app/auth/signup/page.tsx` — Signup page ✅
- `src/app/questionnaire/page.tsx` — Assessment form ✅
- `src/app/results/page.tsx` — Results page (auth-protected server wrapper) ✅
- `src/app/api/assessment/submit/route.ts` — Submit endpoint, calls Claude API ✅
- `src/components/QuestionnaireForm.tsx` — Questionnaire form and section navigation ✅
- `src/components/QuestionCard.tsx` — Question renderer ✅
- `src/components/ProgressBar.tsx` — Progress indicator ✅
- `src/components/ResultsView.tsx` — Results + recommendations + PDF download ✅
- `src/app/api/assessment/me/route.ts` — Fetch authenticated user's assessment ✅
- `src/components/AssessmentSidebar.tsx` — Desktop sidebar + mobile drawer with score summary and actions ✅
- `src/components/RetakeModal.tsx` — Overwrite warning modal with PDF download prompt ✅
- `src/components/HomeClient.tsx` — Client wrapper wiring sidebar and modal on home page ✅
- `src/db/schema.ts` — Not needed (Supabase managed, table created via SQL Editor)
- `src/db/client.ts` — Not needed (using existing `src/utils/supabase/` client helpers)

## Score Calculation Logic
1. For each section: sum user responses (if multiple choice, map option index to score 1-5; if text, AI API scores 1-5)
2. Section readiness: (section_score / max_section_score) × 100 → categorize as Low (<40%), Medium (40-70%), High (>70%)
3. Overall readiness: Σ(section_percentage × section_weight)
4. Pass to AI API: { sections: [...], userResponses: {...}, overallReadiness: X% }

## Scoring Logic (Multiple Choice)
Score mapping per question (0-4 scale):
- 4 = 10% (full allocation)
- 3 = 7.5% (−2.5%)
- 2 = 5% (−5%)
- 1 = 2.5% (−7.5%)
- 0 = 0% (−10%)

Per-section calculation:
- Data Readiness (40% weight, 3 questions): Max 30% (10% × 3 questions)
  - Contribution to overall = (section_raw_score / 30) × 40%
- Other sections (15% weight each, 3 questions): Max 30% each
  - Contribution to overall = (section_raw_score / 30) × 15%

Overall readiness = sum of all section contributions

## Scoring Thresholds
- **Low**: < 40%
- **Medium**: 40-70%
- **High**: > 70%

## AI API Context
Build a prompt like:
"Analyze this business AI readiness assessment. Scores out of 100 for each section are: [section scores]. Overall readiness: X%. Provide (1) Key findings for each low/medium section, (2) Immediate action items (3) 6-month roadmap, (4) Resource recommendations."

## Database Schema (Example)
- **users**: id, email, passwordHash, createdAt
- **assessments**: id, userId, completedAt, overallScore, sectionScores (JSON)
- **recommendations**: id, assessmentId, aiGeneratedText, createdAt

## Confirmed Specifications
1. **AI API**: Claude API
2. **Database**: Supabase (PostgreSQL managed)
3. **Authentication**: Supabase Auth (email/password)
4. **Multiple choice scoring**: 0-4 scale per question (4=10%, 3=7.5%, 2=5%, 1=2.5%, 0=0%)
5. **PDF styling**: Minimal (plain text, section headers, scores, recommendations)

## Dependencies
- `@supabase/ssr` + `@supabase/supabase-js` — Supabase auth and client ✅
- `@anthropic-ai/sdk` — Claude API client ✅
- `jspdf` — PDF generation and download ✅
- `zod` — request validation ⏳ Phase 5/6
- `typescript` — already installed ✅

## Current Status
- Phase 1: ✅ Completed (questionnaire.json, types.ts, scoring.ts)
- Phase 2.1: ✅ Completed (Supabase Auth login/signup + route protection)
- Phase 2.2: ✅ Completed (Welcome page, questionnaire UI, form validation, section navigation)
- Phase 3: ✅ Completed (Results page, section scores, readiness levels, Claude recommendations, PDF download)
- Phase 4: ✅ Completed (POST /api/assessment/submit, Claude API integration with claude-opus-4-6)
- Phase 5: ✅ Completed (assessments table created in Supabase with RLS; POST /api/assessment/submit saves overall score, readiness level, section scores, recommendations, and completed_at per user)
- Phase 6: ✅ Completed (Mobile button fix, upsert on retake, assessment sidebar with drawer, RetakeModal, cached history view)
- Phase 7: ⏳ In Progress (Design — color scheme ✅, typography ✅, branding ✅, token sweep ✅, animations pending)

Last updated: April 24, 2026
