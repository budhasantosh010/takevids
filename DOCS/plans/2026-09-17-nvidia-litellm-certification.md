# NVIDIA through LiteLLM certification — 2026-09-17

## Goal

Research the current September 2026 NVIDIA hosted frontier/near-frontier catalog, wire one private LiteLLM gateway over NVIDIA hosted NIM, and certify only models that actually work through TakeVids. Catalog presence is not certification.

## Ordered work

1. Research current NVIDIA hosted/free endpoint candidates and exact model IDs.
2. Keep self-host-only NIM models separate from hosted certification.
3. Configure LiteLLM with private TakeVids aliases and server-only NVIDIA credentials.
4. Add a real TakeVids → LiteLLM HTTP worker.
5. Add text/image/video/tool certification probes based on advertised model capabilities.
6. Record PASS / FAIL / UNSUPPORTED / CREDENTIAL_REQUIRED / PROXY_UNAVAILABLE without guessing.
7. Expose a model to users only after `approved && enabled && certified` is true.
8. Run regression, secret scan, diff review, commit and push when permitted.

## Current blocker

`npm run provider:env` verified that this machine currently has no `NVIDIA_API_KEY`, no LiteLLM proxy/master key, and no configured LiteLLM URL. Therefore real NVIDIA provider calls cannot be certified in this run. The integration must remain fail-closed and all candidates remain hidden.

## First live certification order once credentials exist

1. `z-ai/glm-5-3-flash`
2. `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` (native-video transport control)
3. `moonshotai/kimi-k3`
4. `z-ai/glm-5-3`
5. `nvidia/nemotron-3-ultra-550b-a55b`
6. `meta/muse-glimmer-30b`
7. `deepseek-ai/deepseek-v4-flash-0731` only as a short-lived comparison because the NVIDIA catalog showed a deprecation warning.
