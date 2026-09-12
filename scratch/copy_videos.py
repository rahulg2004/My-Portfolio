import os
import shutil
import time

src_dir = r"e:\CAPCUT\CapCut Drafts"
dest_dir = r"c:\Users\RAHUL\Downloads\Portfolio website\assets\projects"

os.makedirs(dest_dir, exist_ok=True)

mappings = [
    ("thiranex 4.mp4", "thiranex_tic_tac_toe_demo.mp4"),
    ("decodelabs 3.mp4", "decodelabs_multimodal_studio_demo.mp4"),
    ("decodelabs 4.mp4", "decodelabs_code_reviewer_demo.mp4"),
    ("proj 1 data alott.mp4", "data_alcott_registration_assistant_demo.mp4"),
    ("yuva intern 2.mp4", "yuva_intern_registration_assistant_demo.mp4"),
    ("yuva intern 3.mp4", "yuva_intern_topic_recommender_demo.mp4"),
    ("yuva intern 4.mp4", "yuva_intern_model_evaluation_demo.mp4")
]

for src_name, dest_name in mappings:
    src_path = os.path.join(src_dir, src_name)
    dest_path = os.path.join(dest_dir, dest_name)
    
    print(f"Copying {src_name} -> {dest_name}...")
    start_t = time.time()
    
    if not os.path.exists(src_path):
        print(f"  ERROR: Source file does not exist: {src_path}")
        continue
        
    src_size = os.path.getsize(src_path)
    shutil.copy2(src_path, dest_path)
    dest_size = os.path.getsize(dest_path)
    elapsed = time.time() - start_t
    
    if src_size == dest_size:
        print(f"  SUCCESS: {dest_size/(1024*1024):.2f} MB copied in {elapsed:.1f}s")
    else:
        print(f"  MISMATCH: src={src_size} vs dest={dest_size}")

print("\nAll copy operations finished.")
