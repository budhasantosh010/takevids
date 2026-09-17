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
| 11 | Approved-model + provider boundary | DONE | E3 tests/source | Only approved+enabled model exposed; LiteLLM route contract; NVIDIA NIM first upstream; disabled Anthropic hidden | Wire one server-side LiteLLM endpoint next |
| 12 | Real isolated reverse-engineering + render vertical slice | TODO | E4 actual kit files + rendered video | Not started | Reference → local/Docker workspace → NVIDIA test model → kit → new footage → rendered MP4 |
| 13 | Frontier model integration | TODO | E4 real inference + quality comparison | Intentionally deferred | Add only after cheap end-to-end pipeline is reliable |
| 14 | Test-user persistence/storage | TODO | E4 uploaded/retrieved real videos | Architecture documented: R2 objects + optional Supabase metadata/auth | Add only when multi-user testing starts |
