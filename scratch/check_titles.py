import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('projects.html', 'r', encoding='utf-8') as f:
    html = f.read()

matches = list(re.finditer(r'<h2 class="project-card-title">([^<]+)</h2>', html))
print(f"Found {len(matches)} projects:\n")

for i, m in enumerate(matches):
    title = m.group(1).strip()
    start = m.start()
    end = matches[i+1].start() if i+1 < len(matches) else len(html)
    chunk = html[start:end]
    has_demo = 'btn-project-demo' in chunk
    has_pill = 'demo-video-pill' in chunk
    
    href = ""
    href_m = re.search(r'href="([^"]*\.mp4)"', chunk)
    if href_m:
        href = href_m.group(1)
        
    print(f"[{i+1}] {title}")
    print(f"     Demo Link: {href if href else 'None'} | Has Pill: {has_pill}\n")
