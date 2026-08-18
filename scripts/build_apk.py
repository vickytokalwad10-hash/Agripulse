import os
import json
import shutil
import subprocess
import sys
from datetime import datetime

DEST_DIR = r"C:\Users\hp\OneDrive\Documents\Scratch"
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")
ANDROID_DIR = os.path.join(FRONTEND_DIR, "android")
APK_SRC = os.path.join(ANDROID_DIR, "app", "build", "outputs", "apk", "debug", "app-debug.apk")
VERSION_JS = os.path.join(FRONTEND_DIR, "src", "config", "version.js")
BUILD_GRADLE = os.path.join(ANDROID_DIR, "app", "build.gradle")

def get_current_version() -> str:
    """Reads current app version from package.json."""
    pkg_path = os.path.join(FRONTEND_DIR, "package.json")
    try:
        with open(pkg_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("version", "2.8.0")
    except Exception:
        return "2.8.0"

def sync_version_across_app(version: str):
    """Synchronizes version across package.json, version.js, and Android build.gradle."""
    # 1. Update version.js
    os.makedirs(os.path.dirname(VERSION_JS), exist_ok=True)
    today = datetime.now().strftime("%Y-%m-%d")
    with open(VERSION_JS, "w", encoding="utf-8") as f:
        f.write(f"export const APP_VERSION = 'v{version}';\n")
        f.write(f"export const APP_VERSION_RAW = '{version}';\n")
        f.write(f"export const BUILD_DATE = '{today}';\n")

    # 2. Update Android build.gradle
    if os.path.exists(BUILD_GRADLE):
        with open(BUILD_GRADLE, "r", encoding="utf-8") as f:
            gradle_content = f.read()
        
        # Parse version parts to create numeric versionCode
        parts = version.split(".")
        code_num = int(parts[0]) * 100 + int(parts[1]) * 10 + int(parts[2]) if len(parts) == 3 else 12
        
        import re
        gradle_content = re.sub(r'versionCode\s+\d+', f'versionCode {code_num}', gradle_content)
        gradle_content = re.sub(r'versionName\s+"[^"]+"', f'versionName "{version}"', gradle_content)
        
        with open(BUILD_GRADLE, "w", encoding="utf-8") as f:
            f.write(gradle_content)

def build_apk():
    version = get_current_version()
    sync_version_across_app(version)
    
    print(f"🌾 ==========================================================")
    print(f"🌾 Building AgriPulse AI Production APK — Version v{version}")
    print(f"🌾 ==========================================================\n")
    
    # 1. Vite Build
    print("1. Compiling frontend assets (Vite)...")
    subprocess.run(["npm.cmd", "run", "build"], cwd=FRONTEND_DIR, check=True)
    
    # 2. Capacitor Sync
    print("2. Syncing web assets to Capacitor Android project...")
    subprocess.run(["npx.cmd", "cap", "sync", "android"], cwd=FRONTEND_DIR, check=True)
    
    # 3. Gradle Assemble
    print("3. Assembling Android APK with Gradle...")
    gradlew = os.path.join(ANDROID_DIR, "gradlew.bat")
    subprocess.run([gradlew, "assembleDebug"], cwd=ANDROID_DIR, check=True)
    
    # 4. Target Files Setup
    os.makedirs(DEST_DIR, exist_ok=True)
    
    dest_standard = os.path.join(DEST_DIR, "AgriPulse_AI.apk")
    dest_versioned = os.path.join(DEST_DIR, f"AgriPulse_AI_v{version}.apk")
    
    # Copy both standard and versioned APKs
    shutil.copyfile(APK_SRC, dest_standard)
    shutil.copyfile(APK_SRC, dest_versioned)
    
    # Also save root copy for repo consistency
    root_copy = os.path.join(PROJECT_ROOT, "AgriPulse_AI.apk")
    root_versioned = os.path.join(PROJECT_ROOT, f"AgriPulse_AI_v{version}.apk")
    shutil.copyfile(APK_SRC, root_copy)
    shutil.copyfile(APK_SRC, root_versioned)
    
    # 5. Write Version & Update Info file in the destination folder
    info_file = os.path.join(DEST_DIR, "AgriPulse_Version_Info.txt")
    build_time = datetime.now().strftime("%Y-%m-%d %I:%M:%S %p")
    size_mb = os.path.getsize(dest_versioned) / (1024 * 1024)
    
    info_content = f"""🌾 AgriPulse AI — Android Build Information
==================================================
Version:        v{version} (Production)
Built On:       {build_time}
File Size:      {size_mb:.2f} MB
Standard APK:   AgriPulse_AI.apk
Versioned APK:  AgriPulse_AI_v{version}.apk

Key Features & Updates in v{version}:
1. Centralized Version Management across App UI, Web, and Native APK
2. Embedded Hybrid On-Device Agronomy Knowledge Engine in Kisan Mitra Copilot
3. 100% Multilingual Coverage across 11 Indian Regional Languages + Hinglish
4. Complete Localization for Voice Copilot (Domain Badges, User Roles, Quick Prompts)
5. Multi-Source Mandi Integration (Spot Mandi + Agmarknet + e-NAM Live Data)
6. Dynamic Hardware & Gesture Back Navigation Engine (@capacitor/app)
7. Production Error Boundary Protection against white screens
==================================================
"""
    with open(info_file, "w", encoding="utf-8") as f:
        f.write(info_content)
    
    print(f"\n🎉 SUCCESS! APKs and Version Info generated:")
    print(f"📁 Versioned APK: {dest_versioned} ({size_mb:.2f} MB)")
    print(f"📁 Standard APK:  {dest_standard}")
    print(f"📄 Version Log:   {info_file}")

if __name__ == "__main__":
    build_apk()
