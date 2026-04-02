---
description: Daily feature push to keep GitHub contribution graph green
---

# Daily Push Workflow for AI-Career

## Rules
1. Add ONE meaningful feature per day
2. Commit with a descriptive message
3. **ALWAYS ask USER for permission before pushing**
4. Stage, commit, then wait for approval to push

## Steps
1. Check the feature backlog below and pick the next uncompleted feature
2. Implement the feature
3. Test it works (run dev server, verify in browser)
4. Stage and commit:
   ```
   git add -A
   git commit -m "feat: <description>"
   ```
5. **ASK USER**: "Ready to push today's feature: <description>. Shall I push?"
6. Only after approval:
   ```
   git push origin main
   ```
7. Mark the feature as done in this file

## Feature Backlog (one per day)

- [x] Day 1 (Mar 25) — Initial build: Auth, Resume, Jobs, Analytics
- [ ] Day 2 (Mar 26) — Toast notification system for all user actions
- [ ] Day 3 (Mar 27) — Job entry detail modal with full view + notes field
- [ ] Day 4 (Mar 28) — Resume history page (view all past analyses)
- [ ] Day 5 (Mar 29) — Export jobs data as CSV
- [ ] Day 6 (Mar 30) — Interview countdown timer on job cards
- [ ] Day 7 (Mar 31) — Keyboard shortcuts (Ctrl+K search, Ctrl+N new job)
- [ ] Day 8 (Apr 1) — Salary tracker field + analytics chart
- [ ] Day 9 (Apr 2) — Drag-and-drop kanban board view for jobs
- [ ] Day 10 (Apr 3) — Email template generator for follow-ups
- [ ] Day 11 (Apr 4) — Company research panel (auto-fetch info)
- [ ] Day 12 (Apr 5) — Weekly email digest summary component
- [ ] Day 13 (Apr 6) — Resume template selector (multiple layouts)
- [ ] Day 14 (Apr 7) — Goal setting page (weekly/monthly targets)
- [ ] Day 15 (Apr 8) — AI cover letter generator
- [ ] Day 16 (Apr 9) — Dark/light mode improvements + accent color picker
- [ ] Day 17 (Apr 10) — Mobile PWA support (manifest + service worker)
- [ ] Day 18 (Apr 11) — Bulk job import from CSV
- [ ] Day 19 (Apr 12) — Job comparison tool (compare 2 roles)
- [ ] Day 20 (Apr 13) — Skills heatmap visualization
- [ ] Day 21 (Apr 14) — Network tracker (contacts per company)
- [ ] Day 22 (Apr 15) — Application deadline reminders
- [ ] Day 23 (Apr 16) — Achievement badges system
- [ ] Day 24 (Apr 17) — Resume keyword density analyzer
- [ ] Day 25 (Apr 18) — Dashboard onboarding tour
- [ ] Day 26 (Apr 19) — Saved job description templates
- [ ] Day 27 (Apr 20) — Multi-language resume support
- [ ] Day 28 (Apr 21) — Performance optimizations + lazy loading
- [ ] Day 29 (Apr 22) — Accessibility improvements (ARIA, focus management)
- [ ] Day 30 (Apr 23) — README with screenshots, demo GIF, setup guide
