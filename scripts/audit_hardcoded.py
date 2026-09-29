import re

files = {
    'frontend/src/pages/ArbitragePage.jsx': [
        ('Freight Cost Rate:', r'>Freight Cost Rate:<'),
        ('Net Realization Matrix', r'>[\s\n]*Net Realization Matrix'),
        ('Destination Mandi column', r'<th[^>]*>Destination Mandi'),
        ('Net Gain column', r'<th[^>]*>Net Gain'),
        ('Origin badge', r'>[\s\n]*Origin[\s\n]*<'),
        ('3-way cross-verification', r'>[\s\n]*3-way cross'),
        ('NDSAP Open Government', r'>[\s\n]*NDSAP Open Government'),
        ('Wheat button raw', r'>\s*wheat\s*<'),
        ('Paddy button raw', r'>\s*paddy\s*<'),
    ],
    'frontend/src/pages/SimulatorPage.jsx': [
        ('Input Variables raw', r'>[\s\n]*Input Variables'),
        ('Scenario Presets raw', r'>[\s\n]*Scenario Presets:'),
        ('Stress (-15%) raw', r'>[\s\n]*Stress \(-15%\)'),
        ('Gross Revenue raw', r'>[\s\n]*Gross Revenue'),
        ('Input Expenses raw', r'>[\s\n]*Input Expenses'),
        ('Net Profit raw', r'>[\s\n]*Net Profit'),
        ('Return on Capital raw', r'>[\s\n]*Return on Capital'),
        ('Projected Margin raw', r'>[\s\n]*Projected Margin Scenarios'),
        ('Live Dynamic Math raw', r'>[\s\n]*Live Dynamic Math'),
        ('2026 Rabi Model raw', r'>[\s\n]*2026 Rabi Model'),
        ('Optimized raw', r'>[\s\n]*Optimized'),
        ('Scenario A Stress raw', r'>[\s\n]*Scenario A \(Stress\)'),
    ],
    'frontend/src/pages/LoginPage.jsx': [
        ('Platform tagline raw', r'>[\s\n]*Supabase Authenticated Agricultural'),
        ('Supabase Password tab raw', r'>[\s\n]*Supabase Password[\s\n]*<'),
        ('Magic OTP tab raw', r'>[\s\n]*Magic OTP / PIN[\s\n]*<'),
        ('Register tab raw', r'>[\s\n]*Register New Account[\s\n]*<'),
        ('Supabase User Email raw', r'>[\s\n]*Supabase User Email[\s\n]*<'),
        ('Sign In as Farmer raw', r'>[\s\n]*Sign In as Farmer[\s\n]*<'),
        ('Farmer Demo label raw', r'>[\s\n]*Farmer Demo[\s\n]*<'),
        ('Sandbox credentials raw', r'>[\s\n]*Instant 1-Click Sandbox'),
    ],
}

all_ok = True
for filepath, checks in files.items():
    with open(filepath, encoding='utf-8') as f:
        content = f.read()
    print(f'--- {filepath} ---')
    for label, pattern in checks:
        match = re.search(pattern, content)
        if match:
            ctx = content[max(0, match.start()-10):match.end()+30].replace('\n', ' ')
            print(f'  HARDCODED FOUND: {label} => [{ctx[:70]}]')
            all_ok = False
        else:
            print(f'  OK (not hardcoded): {label}')
    print()

if all_ok:
    print('ALL CHECKS PASSED - no hardcoded strings found in JSX files!')
else:
    print('Some hardcoded strings still present - see above.')
