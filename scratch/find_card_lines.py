import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('projects.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

targets = [
    "Intelligent Code Reviewer & Explainer",
    "Multimodal Image Generation Studio",
    "AI Registration Assistant",
    "AI Performance Evaluation & Optimization Strategy",
    "AI Project Topic Recommender - Yuva Intern",
    "AI Registration Assistant (Prototype & Classifier)",
    "Tic Tac Toe Mini Game"
]

for target in targets:
    for i, line in enumerate(lines):
        if target in line and '<h2 class="project-card-title">' in line:
            print(f"Target: {target}")
            print(f"  Title at line {i+1}")
            # print surrounding 50 lines to find demo-video-pill
            for j in range(i, min(i+70, len(lines))):
                if 'demo-video-pill' in lines[j]:
                    print(f"  Found demo-video-pill at line {j+1}")
                    for k in range(j-3, min(j+15, len(lines))):
                        print(f"    {k+1}: {lines[k].rstrip()}")
                    break
            print("-" * 50)
