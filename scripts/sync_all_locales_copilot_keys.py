import json
import os

NEW_KEYS = {
    "en": {
        "replyingIn": "Replying in",
        "suggestedQueries": "Suggested Follow-ups",
        "domainBadge": "Agronomy AI • 11 Indian Languages",
        "activeAppLanguage": "Active App Language",
        "youFarmer": "You (Farmer)",
        "switchConfirm": "Switch Language",
        "dismiss": "Dismiss"
    },
    "hi": {
        "replyingIn": "उत्तर भाषा",
        "suggestedQueries": "संबंधित सुझाव",
        "domainBadge": "कृषि विशेषज्ञ AI • 11 भारतीय भाषाएं",
        "activeAppLanguage": "सक्रिय ऐप भाषा",
        "youFarmer": "आप (किसान)",
        "switchConfirm": "भाषा बदलें",
        "dismiss": "हटाएं"
    },
    "mr": {
        "replyingIn": "उत्तर भाषा",
        "suggestedQueries": "संबंधित सुचवण्या",
        "domainBadge": "कृषी तज्ज्ञ AI • ११ भारतीय भाषा",
        "activeAppLanguage": "सक्रिय अ‍ॅप भाषा",
        "youFarmer": "तुम्ही (शेतकरी)",
        "switchConfirm": "भाषा बदला",
        "dismiss": "काढून टाका"
    },
    "pa": {
        "replyingIn": "ਜਵਾਬੀ ਭਾਸ਼ਾ",
        "suggestedQueries": "ਸੰਬੰਧਿਤ ਸੁਝਾਅ",
        "domainBadge": "ਖੇਤੀਬਾੜੀ AI • 11 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ",
        "activeAppLanguage": "ਚਾਲੂ ਐਪ ਭਾਸ਼ਾ",
        "youFarmer": "ਤੁਸੀਂ (ਕਿਸਾਨ)",
        "switchConfirm": "ਭਾਸ਼ਾ ਬਦਲੋ",
        "dismiss": "ਹਟਾਓ"
    },
    "gu": {
        "replyingIn": "જવાબ ભાષા",
        "suggestedQueries": "સંબંધિત સૂચનો",
        "domainBadge": "કૃષિ AI • 11 ભારતીય ભાષાઓ",
        "activeAppLanguage": "સક્રિય એપ ભાષા",
        "youFarmer": "તમે (ખેડૂત)",
        "switchConfirm": "ભાષા બદલો",
        "dismiss": "દૂર કરો"
    },
    "te": {
        "replyingIn": "సమాధానం భాష",
        "suggestedQueries": "సంబంధిత సూచనలు",
        "domainBadge": "వ్యవసాయ AI • 11 భారతీయ భాషలు",
        "activeAppLanguage": "యాక్టివ్ యాప్ భాష",
        "youFarmer": "మీరు (రైతు)",
        "switchConfirm": "భాష మార్చండి",
        "dismiss": "తీసివేయి"
    },
    "ta": {
        "replyingIn": "பதில் மொழி",
        "suggestedQueries": "தொடர்புடைய பரிந்துரைகள்",
        "domainBadge": "வேளாண் AI • 11 இந்திய மொழிகள்",
        "activeAppLanguage": "செயலில் உள்ள செயலி மொழி",
        "youFarmer": "நீங்கள் (விவசாயி)",
        "switchConfirm": "மொழியை மாற்று",
        "dismiss": "நீக்கு"
    },
    "kn": {
        "replyingIn": "ಉತ್ತರಿಸುವ ಭಾಷೆ",
        "suggestedQueries": "ಸಂಬಂಧಿತ ಸಲಹೆಗಳು",
        "domainBadge": "ಕೃಷಿ AI • 11 ಭಾರತೀಯ ಭಾಷೆಗಳು",
        "activeAppLanguage": "ಸಕ್ರಿಯ ಆಪ್ ಭಾಷೆ",
        "youFarmer": "ನೀವು (ರೈತ)",
        "switchConfirm": "ಭಾಷೆ ಬದಲಾಯಿಸಿ",
        "dismiss": "ತೆಗೆದುಹಾಕಿ"
    },
    "bn": {
        "replyingIn": "উত্তরের ভাষা",
        "suggestedQueries": "সম্পর্কিত পরামর্শ",
        "domainBadge": "কৃষি AI • ১১টি ভারতীয় ভাষা",
        "activeAppLanguage": "সক্রিয় অ্যাপ ভাষা",
        "youFarmer": "আপনি (কৃষক)",
        "switchConfirm": "ভাষা পরিবর্তন করুন",
        "dismiss": "সরান"
    },
    "ml": {
        "replyingIn": "മറുപടി ഭാഷ",
        "suggestedQueries": "ബന്ധപ്പെട്ട നിർദ്ദേശങ്ങൾ",
        "domainBadge": "കാർഷിക AI • 11 ഇന്ത്യൻ ഭാഷകൾ",
        "activeAppLanguage": "ആക്റ്റീവ് ആപ്പ് ഭാഷ",
        "youFarmer": "നിങ്ങൾ (കർഷകൻ)",
        "switchConfirm": "ഭാഷ മാറ്റുക",
        "dismiss": "ഒഴിവാക്കുക"
    },
    "or": {
        "replyingIn": "ଉତ୍ତର ଭାଷା",
        "suggestedQueries": "ସମ୍ବନ୍ଧିତ ପରାମର୍ଶ",
        "domainBadge": "କୃଷି AI • ୧୧ ଭାରତୀୟ ଭାଷା",
        "activeAppLanguage": "ସକ୍ରିୟ ଆପ୍ ଭାଷା",
        "youFarmer": "ଆପଣ (କୃଷକ)",
        "switchConfirm": "ଭାଷା ବଦଳାନ୍ତୁ",
        "dismiss": "ହଟାନ୍ତୁ"
    }
}

base_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "locales")

for lang, keys in NEW_KEYS.items():
    file_path = os.path.join(base_dir, lang, "translation.json")
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        if "copilot" not in data:
            data["copilot"] = {}
            
        for k, v in keys.items():
            data["copilot"][k] = v
            
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"✅ Updated copilot keys in {lang}/translation.json")

print("🎉 Copilot translation keys synced across all 11 languages!")
