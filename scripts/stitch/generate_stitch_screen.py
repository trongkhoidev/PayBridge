import subprocess
import json
import sys

def run_generate(title, prompt):
    print(f"=== Generating: {title} ===")
    token = subprocess.check_output(['gcloud', 'auth', 'print-access-token']).decode().strip()
    env = {
        'PATH': '/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin',
        'STITCH_ACCESS_TOKEN': token,
        'STITCH_PROJECT_ID': 'gen-lang-client-0269711937',
        'GOOGLE_CLOUD_PROJECT': 'gen-lang-client-0269711937'
    }
    payload = {
        "projectId": "17630592157029980084",
        "prompt": f"{title}\n\n{prompt}",
        "deviceType": "DESKTOP"
    }
    res = subprocess.run(
        ['npx', '-y', '@_davideast/stitch-mcp', 'tool', 'generate_screen_from_text', '-d', json.dumps(payload)],
        capture_output=True, text=True, env=env
    )
    print("STDOUT:", res.stdout[:500])
    if res.stderr:
        print("STDERR:", res.stderr[:500])
    return res.returncode == 0

