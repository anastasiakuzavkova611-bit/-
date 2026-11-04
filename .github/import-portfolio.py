import json,hashlib,urllib.request,concurrent.futures,time
from pathlib import Path
base="https://a.anastasiakuzavkova61.chatgpt.site/"
items=json.loads(Path(".github/portfolio-assets.json").read_text())
def fetch(item):
    dest=Path("portfolio")/item["path"]
    if dest.exists() and hashlib.sha256(dest.read_bytes()).hexdigest()==item["sha256"]: return
    for attempt in range(4):
        try:
            req=urllib.request.Request(base+item["path"],headers={"User-Agent":"Mozilla/5.0"})
            with urllib.request.urlopen(req,timeout=90) as r: data=r.read()
            assert hashlib.sha256(data).hexdigest()==item["sha256"], "Checksum mismatch: "+item["path"]
            dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data);return
        except Exception:
            if attempt==3: raise
            time.sleep(3)
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: list(pool.map(fetch,items))
print("Verified",len(items),"assets")
