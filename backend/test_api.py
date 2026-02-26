import requests
import time
import json

URL = 'http://127.0.0.1:8000/verify'

tests = [
    {'name': 'Hard Rule - Disallowed Word', 'payload': {'title': 'Police Times'}},
    {'name': 'Hard Rule - Periodicity', 'payload': {'title': 'JAN JAGRAN TIMES DAILY'}},
    {'name': 'Lexical/Phonetic Sim', 'payload': {'title': 'Namascar'}},
    {'name': 'Exact Match', 'payload': {'title': 'JAN JAGRAN TIMES'}},
    {'name': 'Semantic Concept', 'payload': {'title': 'Dawn Dispatch'}},
    {'name': 'Valid Unique Title', 'payload': {'title': 'Blockchain Sentinel India Observer'}}
]

for t in tests:
    print(f"\n--- Testing: {t['name']} ---")
    print(f"Input: {t['payload']['title']}")
    try:
        t0 = time.time()
        resp = requests.post(URL, json=t['payload'])
        elapsed = time.time() - t0
        # The elapsed time print is now part of the new comprehensive print
        # print(f"Response Time: {elapsed:.3f}s")
        if resp.status_code == 200:
            data = resp.json()
            print(f'''
--- Testing: {t['name']} ---
Input: {t['payload']['title']}
Response Time (Client): {elapsed:.3f}s
Response Time (API): {data.get('inference_time_seconds', 0)}s
Approved: {data['approved']}
Confidence: {data.get('confidence_bucket')}
Probability: {data['probability']}%
Primary Reason: {data['reason']}
Stages: {json.dumps(data['stages'], indent=2)}
Top-K Matches: {json.dumps(data.get('top_k_matches', []), indent=2)}
Smart Suggestions: {json.dumps(data.get('suggestions', []), indent=2)}
        ''')
        else:
            print(f"Error: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"Failed to connect to API: {e}")
