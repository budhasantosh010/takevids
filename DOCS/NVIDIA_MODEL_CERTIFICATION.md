# NVIDIA model certification — September 2026

Last research refresh: 2026-09-17

Purpose: identify the small set of NVIDIA-hosted models worth certifying for TakeVids. Catalog presence is **not** certification. A model becomes user-visible only after the relevant TakeVids tests pass through LiteLLM.

## Hosted certification shortlist

| Priority | NVIDIA model ID | Role for TakeVids | Context | NVIDIA-hosted inputs | Hosted status | Certification |
|---:|---|---|---:|---|---|---|
| 1 | `z-ai/glm-5-3-flash` | Primary multimodal reverse-engineering candidate | ~1M | text, image | Free endpoint | CREDENTIAL_REQUIRED |
| 2 | `moonshotai/kimi-k3` | Frontier multimodal/agentic comparison | 1M | text, image | Free endpoint | CREDENTIAL_REQUIRED |
| 3 | `z-ai/glm-5-3` | Frontier text/agentic kit-generation comparison | 1M | text | Free endpoint | CREDENTIAL_REQUIRED |
| 4 | `deepseek-ai/deepseek-v4-flash-0731` | Fast long-context execution/coding comparison | 1M | text | Free endpoint; deprecation warning observed | CREDENTIAL_REQUIRED |
| 5 | `nvidia/nemotron-3-ultra-550b-a55b` | NVIDIA frontier text control | 1M | text | Free endpoint | CREDENTIAL_REQUIRED |
| 6 | `meta/muse-glimmer-30b` | Smaller multimodal control | 131K | text, image | Free endpoint | CREDENTIAL_REQUIRED |
| 7 | `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` | Native-video transport/control | 262K | text, image, audio, video | Free endpoint | CREDENTIAL_REQUIRED |

## Important modality distinction

`GLM-5.3-Flash` is the most interesting new model for TakeVids. NVIDIA's current hosted Build page advertises text+image input, while NVIDIA's model-specific self-hosted VLM NIM documentation also describes video inference with FFmpeg 8. Therefore TakeVids does **not** assume the hosted free endpoint accepts video; the certification harness attempts it separately and records the real result.

`Nemotron-3-Nano-Omni-30B-A3B-Reasoning` explicitly advertises video/audio/image/text on the NVIDIA hosted endpoint and is the native-video control even though it is not the newest frontier-quality model.

## NVIDIA NIM models researched but excluded from hosted certification

- `Qwen3.8-Flash-Next`: current NVIDIA VLM NIM support exists through the vLLM Model-Free NIM with 262,144 context, but it is not currently listed as a normal Build.NVIDIA hosted free endpoint. Test it only when TakeVids deploys its own NIM endpoint.
- `Qwen3.8-27B`: supported by NVIDIA VLM NIM for self-hosting; not in this hosted endpoint pass.
- `DeepSeek-V4-Pro-0813`: NVIDIA currently reports the free endpoint as deprecated, so it is not a durable TakeVids test dependency.

## LiteLLM routing

TakeVids uses private aliases in `litellm/config.yaml`. Example:

```text
nvidia-glm-5.3-flash
  -> nvidia_nim/z-ai/glm-5-3-flash
  -> https://integrate.api.nvidia.com/v1
```

The browser never receives `NVIDIA_API_KEY`. LiteLLM receives it server-side as `NVIDIA_NIM_API_KEY`.

## Certification states

```text
PASS                 actual request through TakeVids LiteLLM proxy succeeded
FAIL                 actual request reached the proxy/provider and failed
UNSUPPORTED          NVIDIA catalog does not advertise that modality/capability
CREDENTIAL_REQUIRED  proxy/key was not configured, so no provider claim is made
PROXY_UNAVAILABLE    credentials may exist but the local LiteLLM proxy was not reachable
```

Run:

```text
npm run provider:env
npm run verify:nvidia
```

Machine-readable results are written to `.takevids-runtime/nvidia-certification.json` and are gitignored.

## Current machine result — 2026-09-17

`npm run provider:env` reported `false` for `NVIDIA_API_KEY`, `NVIDIA_NIM_API_BASE`, `LITELLM_MASTER_KEY`, `LITELLM_BASE_URL`, and `LITELLM_API_KEY`. `npm run certify:nvidia` therefore completed without making provider calls and recorded `CREDENTIAL_REQUIRED` for every supported probe. Catalog-declared unsupported modalities remain `UNSUPPORTED`.

No NVIDIA model is currently TakeVids-certified or user-visible. The first live certification can run without code changes after server-side credentials are configured and the LiteLLM proxy is started.
