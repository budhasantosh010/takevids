# Build tracker

Legend: DONE · DOING · TODO · BLOCKED

| Priority | Work item | Status | Required evidence | Current evidence | Next action |
|---:|---|---|---|---|---|
| 1 | Instantiate governance + clean Git baseline | DONE | E2 verifier + baseline commit | Verifiers PASS; commit `a108970` | Keep docs current |
| 2 | Scaffold React/TypeScript app | DONE | E3 build/dev server | Build PASS; localhost:2500 HTTP 200 | None |
| 3 | Core two-pane TakeVids workspace | DONE | E4 browser inspection | 1600px + 1024px screenshots inspected | None |
| 4 | Reverse engineer → Video Kit workflow | DONE | E4 interaction inspection | Automated browser flow + reducer tests | Replace mocks with provider adapters later |
| 5 | Reuse kit → new footage → refine → export | DONE | E4 interaction inspection | Automated review/refine/export-ready flow | Add real render/export later |
| 6 | Universal Media bin + drag/drop | DONE | E4 interaction inspection | Mixed-media reducer tests + media screenshot + browser flow | Connect to real render pipeline later |
| 7 | Low-cognitive-load simplification | DONE | E4 visual inspection | Dead global nav removed; models secondary; five-surface IA | Validate with real users later |
| 8 | Responsive polish + validation | DONE | E3 build + E4 browser inspection | 11 tests PASS; lint PASS; build PASS; `npm run test:visual` PASS; zero browser errors; no 1024/820 overflow | Add dedicated mobile product design only if needed |
| 9 | Lovable-simple v0 home + no timeline | DONE | E4 browser inspection | Two entry paths verified; browser asserts no timeline; home/reference/proven-kit screenshots inspected | Keep v0 this simple |
| 10 | Proven reusable kit path | DONE | E4 interaction inspection | Domain test + real browser path: Founder Reel → footage → automatic edit | Replace deterministic kit execution with real pipeline later |
| 11 | Approved-model + provider boundary | DONE | E3 tests/source | Product routing now requires approved + enabled + certified; untested NVIDIA candidates are hidden | Keep certification gate intact |
| 12 | Format-agnostic backend media/job/render spine | DONE | E4 real media + durable job + rendered output | Real FFmpeg tests cover landscape/portrait/square/silent; durable job/retention tests; backend smoke produces and technically validates preview/final MP4 | Keep stable; use as the intelligence-loop substrate |
| 13 | Credential-free agent + Video Kit substrate | DONE | E4 confinement/manifest/instruction tests + kit reuse smoke | Scoped host workspace, Docker policy adapter/image, extensible kit manifest, exact prompt loader, fixture-only kit reuse/render proof | Keep stable; plug real intelligence into these boundaries |
| 14 | Real transcription + NVIDIA/LiteLLM reverse-engineering intelligence | BLOCKED | E4 transcript + model run + real kit files | LiteLLM NVIDIA config/client/certification harness ready; provider env check proves no NVIDIA/LiteLLM credentials; WhisperX/prompts also pending | Add server-side NVIDIA + LiteLLM keys, run certification, then add WhisperX + Santosh's exact prompts/skills |
| 15 | Real Video Kit execution engine | TODO | E4 style-reproducing rendered video | Kit validation/adapter routing proven with fixture-only identity adapter | Implement real adapter after first model-generated Video Kit reveals required structure |
| 16 | Frontier model integration | TODO | E4 real inference + quality comparison | Intentionally deferred | Add only after NVIDIA/cheap end-to-end loop is reliable |
| 17 | Test-user Internet persistence/storage | TODO | E4 uploaded/retrieved real videos | Local runtime implemented; R2 + optional Supabase architecture documented | Add only when multi-user testing starts |
