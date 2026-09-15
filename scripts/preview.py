#!/usr/bin/env python3
"""Loopback-only static preview; never serve hidden files or Git metadata."""
import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--port", type=int, default=8099)
    p.add_argument("--prefix", default="/gamvi-icra-2027")
    args = p.parse_args()
    root = Path(__file__).resolve().parents[1]
    prefix = "/" + args.prefix.strip("/") if args.prefix.strip("/") else ""

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=str(root), **kw)

        def do_GET(self):
            path = unquote(urlsplit(self.path).path)
            if path == prefix and prefix:
                self.send_response(302); self.send_header("Location", prefix + "/"); self.end_headers(); return
            if not path.startswith(prefix + "/") or any(x.startswith(".") for x in path.split("/") if x):
                self.send_error(404); return
            self.path = path[len(prefix):]
            super().do_GET()

        def do_HEAD(self):
            self.send_error(405)

    print(f"Preview: http://127.0.0.1:{args.port}{prefix}/", flush=True)
    ThreadingHTTPServer(("127.0.0.1", args.port), Handler).serve_forever()


if __name__ == "__main__":
    main()
