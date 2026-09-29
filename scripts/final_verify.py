import json, os, subprocess

# Verify package.json version
with open('frontend/package.json') as f:
    pkg = json.load(f)
print('package.json version:', pkg['version'])

# Verify version.js
with open('frontend/src/config/version.js') as f:
    ver = f.read()
print('version.js:', ver.strip())

# Verify APK
apk = r'C:\Users\hp\OneDrive\Documents\Scratch\AgriPulse_AI_v2.9.2.apk'
if os.path.exists(apk):
    size = os.path.getsize(apk) / (1024*1024)
    print('APK v2.9.2: EXISTS (%.2f MB)' % size)
else:
    print('APK: NOT FOUND')

# Verify git log
result = subprocess.run(['git', 'log', '--oneline', '-3'], capture_output=True, text=True)
print('Git log (last 3):')
print(result.stdout)

# Count new keys
with open('frontend/src/locales/en/translation.json') as f:
    en = json.load(f)
arb_count = len(en.get('arbitrage', {}))
sim_count = len(en.get('simulator', {}))
login_count = len(en.get('login', {}))
print('EN locale key counts: arbitrage=%d, simulator=%d, login=%d' % (arb_count, sim_count, login_count))
