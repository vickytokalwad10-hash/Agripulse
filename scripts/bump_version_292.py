import re

# package.json
with open('frontend/package.json', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('"version": "2.9.1"', '"version": "2.9.2"')
with open('frontend/package.json', 'w', encoding='utf-8') as f:
    f.write(content)
print('package.json updated to 2.9.2')

# build.gradle
with open('frontend/android/app/build.gradle', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('versionCode 291', 'versionCode 292')
content = content.replace('versionName "2.9.1"', 'versionName "2.9.2"')
with open('frontend/android/app/build.gradle', 'w', encoding='utf-8') as f:
    f.write(content)
print('build.gradle updated to 2.9.2')
