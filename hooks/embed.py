#!/usr/bin/env python
"""
embed.py - the OPTIONAL local semantic embedder for Tier-2 recall. ZERO API cost: it runs a
small model (all-MiniLM-L6-v2, ~80MB) on your CPU. The template works WITHOUT this - recall
just falls back to keyword search. Install once to unlock by-meaning recall:

    uv pip install sentence-transformers          (or: pip install sentence-transformers)

Two modes (called by hooks/recall.ps1 and hooks/index_semantic.ps1; you rarely call it directly):

    python embed.py index   <project_root>     # (re)build the vector index for new chunks
    python embed.py query   <project_root> "<text>"   # print top matches as JSON lines

Data files (under <root>/DOCS/_raw/):
    semantic_chunks.jsonl   one line per indexed chunk: {id, text, source, vec:[...]}
    .semantic_seen          hashes of already-indexed chunks (so indexing is incremental)

Design: append-only, incremental, local. If the model isn't installed, every command prints
nothing and exits 0 - so callers degrade gracefully to keyword-only.
"""
import sys, os, json, hashlib, glob

def _fail_quiet():
    # No model / any import error -> behave as "no semantic layer available".
    sys.exit(0)

try:
    from sentence_transformers import SentenceTransformer
    import numpy as np
except Exception:
    _fail_quiet()

_MODEL = None
def model():
    global _MODEL
    if _MODEL is None:
        _MODEL = SentenceTransformer("all-MiniLM-L6-v2")
    return _MODEL

def chunks_path(root):  return os.path.join(root, "DOCS", "_raw", "semantic_chunks.jsonl")
def seen_path(root):    return os.path.join(root, "DOCS", "_raw", ".semantic_seen")

def _h(text):
    return hashlib.sha1(text.encode("utf-8", "ignore")).hexdigest()[:16]

def _load_seen(root):
    p = seen_path(root)
    if not os.path.exists(p): return set()
    with open(p, "r", encoding="utf-8") as f:
        return set(x.strip() for x in f if x.strip())

def _gather_chunks(root):
    """Collect new text chunks worth indexing: each user message + each decision line."""
    out = []
    # decisions
    dec = os.path.join(root, "DOCS", "_raw", "decisions.jsonl")
    if os.path.exists(dec):
        with open(dec, "r", encoding="utf-8") as f:
            for ln in f:
                ln = ln.strip()
                if not ln or '"_comment"' in ln: continue
                try: o = json.loads(ln)
                except Exception: continue
                if "id" not in o: continue
                txt = f'{o.get("title","")} options {" ".join(o.get("options",[]))} chose {o.get("chosen","")}'
                out.append((txt.strip(), f'decisions:{o.get("id")}'))
    # user messages (split on the header marker)
    msg = os.path.join(root, "DOCS", "_raw", "user_messages.txt")
    if os.path.exists(msg):
        with open(msg, "r", encoding="utf-8") as f:
            blob = f.read()
        block, label = [], "user_messages"
        for line in blob.splitlines():
            if line.startswith("===== ["):
                if block:
                    t = " ".join(block).strip()
                    if len(t) > 12: out.append((t, label))
                block = []
            else:
                block.append(line)
        if block:
            t = " ".join(block).strip()
            if len(t) > 12: out.append((t, label))
    return out

def cmd_index(root):
    seen = _load_seen(root)
    new = [(t, s) for (t, s) in _gather_chunks(root) if _h(t) not in seen]
    if not new:
        return
    vecs = model().encode([t for t, _ in new], normalize_embeddings=True)
    with open(chunks_path(root), "a", encoding="utf-8") as cf, open(seen_path(root), "a", encoding="utf-8") as sf:
        for (text, src), v in zip(new, vecs):
            cf.write(json.dumps({"id": _h(text), "text": text[:500], "source": src,
                                 "vec": [round(float(x), 5) for x in v]}, ensure_ascii=False) + "\n")
            sf.write(_h(text) + "\n")

def cmd_query(root, q, topk=3):
    cp = chunks_path(root)
    if not os.path.exists(cp): return
    rows = []
    with open(cp, "r", encoding="utf-8") as f:
        for ln in f:
            ln = ln.strip()
            if not ln: continue
            try: rows.append(json.loads(ln))
            except Exception: continue
    if not rows: return
    qv = model().encode([q], normalize_embeddings=True)[0]
    mat = np.array([r["vec"] for r in rows], dtype=float)
    sims = mat @ np.array(qv, dtype=float)   # cosine (already normalized)
    order = sims.argsort()[::-1][:topk]
    for i in order:
        print(json.dumps({"score": round(float(sims[i]), 4),
                          "text": rows[i]["text"], "source": rows[i]["source"]}, ensure_ascii=False))

def main():
    if len(sys.argv) < 3: _fail_quiet()
    mode, root = sys.argv[1], sys.argv[2]
    try:
        if mode == "index":   cmd_index(root)
        elif mode == "query" and len(sys.argv) >= 4: cmd_query(root, sys.argv[3])
    except Exception:
        pass
    sys.exit(0)

if __name__ == "__main__":
    main()
