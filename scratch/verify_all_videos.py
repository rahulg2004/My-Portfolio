import sys
import re
import urllib.request
from html.parser import HTMLParser

sys.stdout.reconfigure(encoding='utf-8')

class TagChecker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.void_tags = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
        self.errors = []

    def handle_starttag(self, tag, attrs):
        if tag not in self.void_tags:
            self.stack.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        if tag in self.void_tags:
            return
        if not self.stack:
            self.errors.append(f"Unexpected end tag </{tag}> at line {self.getpos()[0]}")
            return
        last_tag, pos = self.stack.pop()
        if last_tag != tag:
            self.errors.append(f"Mismatched tag: expected </{last_tag}> (from line {pos[0]}), got </{tag}> at line {self.getpos()[0]}")

with open('projects.html', 'r', encoding='utf-8') as f:
    content = f.read()

checker = TagChecker()
checker.feed(content)
print(f"HTML Parser: Tag errors: {len(checker.errors)}, Unclosed tags: {len(checker.stack)}")
if checker.errors:
    for e in checker.errors[:10]:
        print("  Error:", e)

all_demos = [
    # Previously added (6):
    'calculator_demo.mp4',
    'codsoft_ai_image_captioning_demo.mp4',
    'data_alcott_resume_reviewer_demo.mp4',
    'robtech_ml_problem_framing_demo.mp4',
    'data_alcott_topic_recommender_demo.mp4',
    'data_alcott_recommendation_engine_demo.mp4',
    # Newly added (7):
    'thiranex_tic_tac_toe_demo.mp4',
    'decodelabs_multimodal_studio_demo.mp4',
    'decodelabs_code_reviewer_demo.mp4',
    'data_alcott_registration_assistant_demo.mp4',
    'yuva_intern_registration_assistant_demo.mp4',
    'yuva_intern_topic_recommender_demo.mp4',
    'yuva_intern_model_evaluation_demo.mp4'
]

print(f"\nVerifying all {len(all_demos)} demo video links in projects.html:")
missing = 0
for d in all_demos:
    href = f'assets/projects/{d}'
    if href in content:
        print(f"  [OK] {d}")
    else:
        print(f"  [MISSING] {d}")
        missing += 1

print(f"\nTotal demo videos present: {len(all_demos) - missing} / {len(all_demos)}")

card_count = content.count('class="glass-card project-card-detailed"')
print(f"Total project cards: {card_count}")

# Check HTTP Server
try:
    resp = urllib.request.urlopen('http://localhost:8080/projects.html')
    data = resp.read()
    print(f"HTTP Server Status: {resp.getcode()}, Content Size: {len(data):,} bytes")
except Exception as ex:
    print("HTTP Server Error:", ex)
