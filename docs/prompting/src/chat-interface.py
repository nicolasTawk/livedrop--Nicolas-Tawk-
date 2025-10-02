#!/usr/bin/env python3
# Tiny CLI client for the ShopLite RAG server
# - REPL mode: run with no args, type questions, /exit to quit
# - One-shot:  python src/chat-interface.py "your question"
# Uses env: SHOPLITE_API (e.g., https://<id>.ngrok-free.dev), SHOPLITE_SESSION, SHOPLITE_DEBUG=1

import os, sys, json, uuid, requests

def get_base_url():
    # precedence: CLI arg --base=<url> | env SHOPLITE_API | interactive prompt
    for i, arg in enumerate(sys.argv[1:]):
        if arg.startswith("--base="):
            return arg.split("=", 1)[1].strip()
    env = os.getenv("SHOPLITE_API")
    if env: return env.strip()
    return input("Enter API base URL (e.g., https://<id>.ngrok-free.dev): ").strip()

BASE = get_base_url().rstrip("/")
SESSION_ID = os.getenv("SHOPLITE_SESSION") or str(uuid.uuid4())
DEBUG = os.getenv("SHOPLITE_DEBUG") == "1"
TIMEOUT = float(os.getenv("SHOPLITE_TIMEOUT", "45"))

def call_api(query: str) -> dict:
    payload = {"query": query, "session_id": SESSION_ID}
    if DEBUG:
        payload["debug"] = True
    r = requests.post(f"{BASE}/chat", json=payload, timeout=TIMEOUT)
    # try to surface server error details nicely
    try:
        r.raise_for_status()
    except requests.HTTPError as e:
        try:
            err = r.json()
        except Exception:
            err = {"text": r.text[:400]}
        raise SystemExit(f"[server {r.status_code}] {e}\nDetails: {err}") from None
    try:
        return r.json()
    except Exception:
        raise SystemExit("[client] Response was not JSON:\n" + r.text[:600])

def print_reply(data: dict) -> None:
    ans = (data.get("answer") or "").strip()
    print("\n=== Reply ===")
    print(ans if ans else "(no answer text)")
    srcs = data.get("sources", [])
    if isinstance(srcs, list):
        print("Sources:", "; ".join(srcs))
    else:
        print("Sources:", srcs or "")
    if "confidence" in data:
        print("Confidence:", data["confidence"])
    if DEBUG and "debug" in data:
        print("\n[debug]", json.dumps(data["debug"], indent=2))

def main():
    # one-shot mode: any non-flag args become the question
    args = [a for a in sys.argv[1:] if not a.startswith("--base=")]
    if args:
        q = " ".join(args).strip()
        if not q:
            raise SystemExit("Provide a question, e.g.:\n  python src/chat-interface.py \"What is the return window?\"")
        data = call_api(q); print_reply(data); return

    # REPL mode
    print(f"(Connected to {BASE})")
    print(f"(session_id={SESSION_ID})  Type /exit to quit.")
    while True:
        try:
            q = input("\nYou: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nBye!"); break
        if not q:
            continue
        if q.lower() in ("/exit", "exit", "quit", ":q"):
            print("Bye!"); break
        try:
            data = call_api(q)
            print_reply(data)
        except Exception as e:
            print("[client] Error:", e)

if __name__ == "__main__":
    main()