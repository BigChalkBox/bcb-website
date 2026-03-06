#!/usr/bin/env python3
"""Extract SharePoint cookies from the browser's cookie store."""
import json
import sys
import browser_cookie3

def get_cookies(domain=None):
    """Try to load cookies from Chrome, Firefox, then Safari."""
    cookies_str = ""
    
    for browser_fn, name in [
        (browser_cookie3.chrome, "Chrome"),
        (browser_cookie3.firefox, "Firefox"),
        (browser_cookie3.safari, "Safari"),
    ]:
        try:
            cj = browser_fn()
            pairs = []
            for c in cj:
                if domain and domain not in c.domain:
                    continue
                pairs.append(f"{c.name}={c.value}")
            if pairs:
                cookies_str = "; ".join(pairs)
                return {"success": True, "cookies": cookies_str, "browser": name, "count": len(pairs)}
        except Exception:
            continue
    
    return {"success": False, "error": "Could not load cookies from any browser. Make sure you are signed in to SharePoint in Chrome/Firefox/Safari."}

if __name__ == "__main__":
    domain = sys.argv[1] if len(sys.argv) > 1 else None
    result = get_cookies(domain)
    print(json.dumps(result))
