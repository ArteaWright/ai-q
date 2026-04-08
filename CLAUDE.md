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

### Phase 2.1: Authentication
4. Create authentication pages and route protection:
   - `src/app/auth/signup/page.tsx` and `src/app/auth/login/page.tsx`
   - Use Supabase Auth helpers or client to sign up and sign in with email/password
   - Add session-aware redirect logic so unauthenticated visitors are sent to login before questionnaire access

### Phase 2.2: Front-End UI
5. Build the questionnaire experience:
   - `src/app/questionnaire/page.tsx` renders the assessment flow
   - Load `src/lib/questionnaire.json` and manage responses in component state
   - Support `multipleChoice` selection and optional `text` entry for future question types
6. Create reusable UI components:
   - `src/components/QuestionCard.tsx` for question rendering and response capture
   - `src/components/ProgressBar.tsx` for progress tracking across questions/sections
7. Implement response state and navigation:
   - Track user answers by section/question
   - Allow users to move between question groups or complete the entire form
   - Store draft responses in component state (and later persist with Supabase/localStorage)
8. Add form validation and UI feedback:
   - Ensure every question has a selected response before submission
   - Display inline errors or disabled submit button until the form is complete
9. Create global style guide for consistent theming:
   - Define color palette, typography, spacing, and component styles
   - Document in `src/styles/style-guide.md` or `src/lib/styles.ts`
   - Ensure all components follow the guide for consistency

### Phase 3: Frontend - Results & Export
9. Create results page showing:
   - Each section with score and readiness level (low/medium/high)
   - Overall readiness percentage
   - "Generating recommendations..." state while calling AI API
   - Recommendations section (populated from AI API response)
   - PDF download button
10. Add PDF generation library (e.g., react-pdf or similar) and implement download

### Phase 4: Backend - API Routes & AI Integration
11. Create API routes:
    - POST `/api/auth/signup`, `/api/auth/login` — user authentication
    - POST `/api/assessment/submit` — receive responses, calculate scores, call AI API
    - GET `/api/assessment/history` — fetch user's past assessments
    - GET `/api/assessment/:id` — fetch specific assessment result
12. Implement AI API integration:
    - Prepare context prompt with section descriptions
    - Send assessment JSON (with user responses and scores) to AI API
    - Parse and return recommendations
13. Create database schema and models for: Users, Assessments, Recommendations

### Phase 5: Data Persistence
14. Set up database (PostgreSQL/MongoDB/Firebase) and configure ORM/client
15. Implement user session management (JWT or server sessions)
16. Save assessment results and AI-generated recommendations to database after submission

### Phase 6: Integration & Polish
17. Add error handling and validation (empty responses, API failures)
18. Add loading states and user feedback (spinners, toasts)
19. Test complete flow: auth → fill questionnaire → submit → AI recommendations → PDF download → save to DB
20. Styling and responsive design (dark mode already supported)

## Key Files to Create/Modify
- `src/lib/questionnaire.json` — Question data ✅
- `src/lib/types.ts` — TypeScript interfaces ✅
- `src/lib/scoring.ts` — Score calculation and categorization logic ✅
- `src/lib/ai-client.ts` — AI API integration
- `src/app/auth/login/page.tsx` — Login page
- `src/app/auth/signup/page.tsx` — Signup page
- `src/app/questionnaire/page.tsx` — Assessment form
- `src/app/results/page.tsx` — Results and recommendations display
- `src/components/QuestionCard.tsx` — Question renderer
- `src/components/ProgressBar.tsx` — Progress indicator
- `src/components/PDFExport.tsx` — PDF generation component
- `src/app/api/auth/[...auth].ts` — Auth routes (or individual route files)
- `src/app/api/assessment/submit.ts` — Submit assessment, call AI, save to DB
- `src/app/api/assessment/history.ts` — Fetch user assessments
- `src/db/schema.ts` — Database models/schema
- `src/db/client.ts` — Database connection

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

## Dependencies to Add
- `next-auth` or `@supabase/auth-helpers-nextjs` — authentication with Supabase
- `@supabase/supabase-js` — Supabase client (PostgreSQL ORM)
- `@anthropic-ai/sdk` — Claude API client
- `jspdf` + `html2canvas` — PDF generation and download
- `zod` — request validation
- `typescript` — already installed

## Current Status
- Phase 1: ✅ Completed (questionnaire.json, types.ts, scoring.ts created)
- Phase 2.1: ✅ Completed (Authentication pages and route protection implemented)
- Phase 2.2: 🔄 Next (UI components and questionnaire experience)
- Phase 3-6: ⏳ Pending

Last updated: April 8, 2026
