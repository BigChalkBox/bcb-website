import json
import re

with open('docs/partner-api-openapi.json', 'r') as f:
    openapi = json.load(f)

endpoints_in_openapi = set()
for path, methods in openapi.get('paths', {}).items():
    for method in methods.keys():
        if method.lower() in ['get', 'post', 'put', 'patch', 'delete']:
            endpoints_in_openapi.add(f"{method.upper()} {path}")

with open('docs/partner-api-reference.md', 'r') as f:
    reference_md = f.read()

missing = []
for ep in endpoints_in_openapi:
    # Look for the endpoint path in the markdown (method might be in badge, but path should be in title or somewhere)
    method, path = ep.split(' ', 1)
    # The markdown might format it as ## `GET` `/v1.3/...` or similar. Let's just check if the path exists.
    if path not in reference_md:
        missing.append(ep)

print(f"Total OpenAPI endpoints: {len(endpoints_in_openapi)}")
if missing:
    print("Missing endpoints in partner-api-reference.md:")
    for m in missing:
        print(f" - {m}")
else:
    print("All endpoint paths found in partner-api-reference.md!")

