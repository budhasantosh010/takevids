# TakeVids provider + storage boundary

Last researched: 2026-09-17
Related: REQ-012, DEC-010

## Product rule

Users never receive a raw provider catalog. TakeVids decides which models are approved for each job and exposes only those models.

```text
TakeVids UI
    ↓
Approved model registry
    ↓
TakeVids server adapter
    ↓
LiteLLM gateway
    ├─ NVIDIA NIM        ← first low-cost test upstream
    ├─ Anthropic direct  ← frontier later
    ├─ OpenAI direct     ← later
    ├─ Google direct     ← later
    └─ OpenRouter        ← long-tail providers later
```

## Why LiteLLM is the boundary

- One OpenAI-style interface across 100+ model/provider integrations.
- Official LiteLLM docs include OpenAI, Anthropic, Vertex AI/Google, NVIDIA NIM and OpenRouter examples.
- Supports centralized proxy authentication, authorization, cost tracking, routing and budgets.
- Keeps provider credentials on the server rather than in TakeVids browser code.
- Lets TakeVids change providers without changing the user workflow.

Official reference: https://docs.litellm.ai/

## What TakeVids owns above LiteLLM

LiteLLM is transport/routing, not product policy. TakeVids owns:

1. `approved/enabled/certified` model state. Catalog presence alone is never enough for product exposure.
2. Which model may reverse engineer a kit.
3. Which model may execute a kit.
4. Exact prompts/skills and quality tests.
5. Whether fallback is allowed.
6. Model version pinning.
7. Media preprocessing and the future agent/sandbox environment.

Do not enable arbitrary cross-model fallback for kit creation. If a model fails, only a separately certified equivalent route may replace it.

## First testing route

The first certification route represented in code is:

```text
internal TakeVids alias: takevids-glm-5-3-flash
       ↓
LiteLLM
       ↓
nvidia_nim/z-ai/glm-5-3-flash
       ↓
NVIDIA hosted API
```

This route is **not user-visible yet**. It must produce an actual TakeVids certification PASS before the product registry may mark it approved/enabled/certified.

NVIDIA's current NIM documentation exposes OpenAI-compatible inference APIs. Its current VLM docs list GLM-5.3-Flash and show image and video requests; video inference for the self-hosted GLM-5.3-Flash NIM requires FFmpeg 8. This makes NVIDIA useful for inexpensive end-to-end testing before frontier-provider spend is introduced.

Official references:
- https://docs.nvidia.com/nim/large-language-models/latest/api-reference.html
- https://docs.nvidia.com/nim/vision-language-models/latest/get-started/advanced/get-started-glm-5-3-flash.html

## Browser security boundary

The frontend may know public metadata such as:

```text
id
name
role
tier
approved/enabled/certified
input modalities
```

Provider API keys, LiteLLM master/virtual keys, raw provider base URLs and billing credentials are server-only.

`src/domain/providerGateway.ts` is the product certification/routing gate. Real server-side proxy requests are implemented by `server/providers/liteLlmClient.ts`; `litellm/config.yaml` maps TakeVids aliases to NVIDIA NIM. Current machine credentials are absent, so no live provider PASS is claimed yet.

## Video storage for the 100–500 user test phase

### Recommended split

```text
Supabase
├─ auth (when needed)
├─ projects/jobs metadata
├─ kit metadata
└─ approved model records

Cloudflare R2
├─ reference videos
├─ uploaded source footage
├─ generated previews
└─ finished videos
```

### Why not put all test videos in Supabase Storage initially?

Supabase Free currently includes 1 GB file storage and 5 GB egress. Pro starts at $25/month and includes 100 GB file storage and 250 GB egress. That is fine later, but the starting paid tier alone exceeds the user's target infrastructure budget of roughly $10–20/month.

Official reference: https://supabase.com/pricing

### Why R2 is attractive for video

Cloudflare R2 Standard currently includes 10 GB-month free, 1 million Class A operations, 10 million Class B operations, and free Internet egress. Standard storage above the free allowance is $0.015/GB-month.

Official reference: https://developers.cloudflare.com/r2/pricing/

Rough storage-only examples using today's published pricing:

```text
100 GB average stored
≈ (100 - 10 free) × $0.015
≈ $1.35/month + operations

500 GB average stored
≈ (500 - 10 free) × $0.015
≈ $7.35/month + operations
```

Actual cost depends on average retained storage, number of uploads/reads and retention policy. Model inference and video processing are likely to dominate storage cost during the test phase.

## Simplest rollout

```text
NOW
local deterministic frontend
+ certification-gated model registry
+ real LiteLLM HTTP client/config
+ NVIDIA certification harness
+ local/Docker agent workspace

NEXT
configure server-only NVIDIA/LiteLLM credentials
+ run live certification
+ enable only actual PASS models

AFTER END-TO-END QUALITY WORKS
frontier model route
+ R2 video storage
+ Supabase metadata/auth

ONLY THEN
more models
+ more kits
+ scaling infrastructure
```

The rule is: prove one model and one full video workflow before adding provider breadth.
