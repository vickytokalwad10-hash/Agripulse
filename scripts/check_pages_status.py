import urllib.request
import json

endpoints = ['pages', 'actions/runs', 'deployments']
for endpoint in endpoints:
    url = f'https://api.github.com/repos/vickytokalwad10-hash/Agripulse/{endpoint}'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        data = json.loads(res.read().decode('utf-8'))
        print(f'=== {endpoint} ===')
        if endpoint == 'pages':
            print(f'Status: {data.get("status")}')
            print(f'Source: {data.get("source")}')
            print(f'Build Type: {data.get("build_type")}')
            print(f'HTML URL: {data.get("html_url")}')
        elif endpoint == 'actions/runs':
            runs = data.get('workflow_runs', [])
            print(f'Total workflow runs: {len(runs)}')
            for r in runs[:5]:
                print(f'- Run: {r.get("name")}, status: {r.get("status")}, conclusion: {r.get("conclusion")}, event: {r.get("event")}, html: {r.get("html_url")}')
        elif endpoint == 'deployments':
            print(f'Total deployments: {len(data)}')
            for d in data[:5]:
                print(f'- Deployment id: {d.get("id")}, env: {d.get("environment")}, created: {d.get("created_at")}')
    except urllib.error.HTTPError as e:
        print(f'=== {endpoint} HTTPError {e.code}: {e.read().decode("utf-8")}')
    except Exception as e:
        print(f'=== {endpoint} Error: {e}')
