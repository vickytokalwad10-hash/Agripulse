import os
import json
import re

LOCALES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "src", "locales")
SRC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "src")
LANGUAGES = ["en", "hi", "mr", "pa", "gu", "te", "ta", "kn", "bn", "ml", "or"]

def load_locales():
    locales = {}
    for lang in LANGUAGES:
        path = os.path.join(LOCALES_DIR, lang, "translation.json")
        with open(path, "r", encoding="utf-8") as f:
            locales[lang] = json.load(f)
    return locales

def get_nested(d, key_path):
    parts = key_path.split(".")
    curr = d
    for p in parts:
        if isinstance(curr, dict) and p in curr:
            curr = curr[p]
        else:
            return None
    return curr

def test_key_parity():
    locales = load_locales()
    en = locales["en"]
    
    # Collect all flattened keys from en
    def flatten_keys(d, prefix=""):
        keys = []
        for k, v in d.items():
            full = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                keys.extend(flatten_keys(v, full))
            else:
                keys.append(full)
        return keys

    en_keys = flatten_keys(en)
    print(f"Total Translation Keys in Master English Dictionary: {len(en_keys)}")
    
    missing_report = {}
    for lang in LANGUAGES:
        if lang == "en":
            continue
        missing = []
        for k in en_keys:
            val = get_nested(locales[lang], k)
            if val is None or val == "":
                missing.append(k)
        if missing:
            missing_report[lang] = missing
            print(f"⚠️ {lang} is missing {len(missing)} keys!")
        else:
            print(f"✅ {lang}: 100% Complete ({len(en_keys)}/{len(en_keys)} keys translated)")

    return len(missing_report) == 0

if __name__ == "__main__":
    success = test_key_parity()
    if success:
        print("\n🎉 ALL 11 LANGUAGES HAVE 100% TRANSLATION KEY PARITY!")
    else:
        print("\n❌ SOME LOCALES HAVE MISSING KEYS")
