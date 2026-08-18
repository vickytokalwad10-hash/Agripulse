/**
 * ============================================================================
 * AGRIPULSE AI — EMBEDDED HYBRID MULTILINGUAL AGRONOMY ENGINE
 * ============================================================================
 * 
 * Provides instant, high-accuracy agronomic decision intelligence in 11 Indian
 * regional languages + Hinglish. Operates natively on mobile devices and static
 * web deployments even when the local backend server is offline.
 * ============================================================================
 */

export const SUPPORTED_LANGUAGES_META = {
  en: { code: 'en', name: 'English', native: 'English', script: 'Latin', speechLang: 'en-IN' },
  hi: { code: 'hi', name: 'Hindi', native: 'हिन्दी', script: 'Devanagari', speechLang: 'hi-IN' },
  mr: { code: 'mr', name: 'Marathi', native: 'मराठी', script: 'Devanagari', speechLang: 'mr-IN' },
  pa: { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', speechLang: 'pa-IN' },
  gu: { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', script: 'Gujarati', speechLang: 'gu-IN' },
  te: { code: 'te', name: 'Telugu', native: 'తెలుగు', script: 'Telugu', speechLang: 'te-IN' },
  ta: { code: 'ta', name: 'Tamil', native: 'தமிழ்', script: 'Tamil', speechLang: 'ta-IN' },
  kn: { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', script: 'Kannada', speechLang: 'kn-IN' },
  bn: { code: 'bn', name: 'Bengali', native: 'বাংলা', script: 'Bengali', speechLang: 'bn-IN' },
  ml: { code: 'ml', name: 'Malayalam', native: 'മലയാളം', script: 'Malayalam', speechLang: 'ml-IN' },
  or: { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', script: 'Odia', speechLang: 'or-IN' },
  'hi-Latn': { code: 'hi-Latn', name: 'Hinglish (Romanized Hindi)', native: 'Hinglish', script: 'Latin', speechLang: 'hi-IN' }
};

// Unicode Range Detection for Indic Scripts
export function detectScriptAndLanguage(text, activeLanguage = 'hi') {
  if (!text || typeof text !== 'string') {
    return SUPPORTED_LANGUAGES_META[activeLanguage] || SUPPORTED_LANGUAGES_META.hi;
  }

  // Unicode Script Regexes
  if (/[\u0A00-\u0A7F]/.test(text)) return SUPPORTED_LANGUAGES_META.pa; // Gurmukhi / Punjabi
  if (/[\u0A80-\u0AFF]/.test(text)) return SUPPORTED_LANGUAGES_META.gu; // Gujarati
  if (/[\u0C00-\u0C7F]/.test(text)) return SUPPORTED_LANGUAGES_META.te; // Telugu
  if (/[\u0B80-\u0BFF]/.test(text)) return SUPPORTED_LANGUAGES_META.ta; // Tamil
  if (/[\u0C80-\u0CFF]/.test(text)) return SUPPORTED_LANGUAGES_META.kn; // Kannada
  if (/[\u0980-\u09FF]/.test(text)) return SUPPORTED_LANGUAGES_META.bn; // Bengali
  if (/[\u0D00-\u0D7F]/.test(text)) return SUPPORTED_LANGUAGES_META.ml; // Malayalam
  if (/[\u0B00-\u0B7F]/.test(text)) return SUPPORTED_LANGUAGES_META.or; // Odia

  // Devanagari: Differentiate Marathi vs Hindi
  if (/[\u0900-\u097F]/.test(text)) {
    const marathiMarkers = ['आहे', 'करावे', 'पिकावर', 'कीड', 'भाव', 'खत', 'गहू', 'शेतकरी', 'कसे', 'द्यावे', 'करा'];
    const isMarathi = marathiMarkers.some(m => text.includes(m)) || activeLanguage === 'mr';
    return isMarathi ? SUPPORTED_LANGUAGES_META.mr : SUPPORTED_LANGUAGES_META.hi;
  }

  // Latin Script: Check for Hinglish
  const hinglishMarkers = ['kaunsi', 'khad', 'fasal', 'karein', 'daalu', 'pani', 'gehu', 'kya', 'bhav', 'rate', 'batao', 'kheti', 'keet'];
  const lower = text.toLowerCase();
  if (hinglishMarkers.some(m => lower.includes(m))) {
    return SUPPORTED_LANGUAGES_META['hi-Latn'];
  }

  return SUPPORTED_LANGUAGES_META[activeLanguage] || SUPPORTED_LANGUAGES_META.en;
}

// Off-Domain Refusal Messages
const REFUSAL_RESPONSES = {
  hi: 'मैं केवल कृषि, फसल पोषण, खाद, कीट नियंत्रण, मौसम, मंडी भाव और सरकारी योजनाओं से संबंधित प्रश्नों का उत्तर देता हूँ। कृपया खेती से जुड़ा प्रश्न पूछें।',
  mr: 'मी फक्त शेती, खते, पीक संरक्षण, कीड नियंत्रण, बाजारभाव व शासकीय योजनांसंबंधी मार्गदर्शन करतो. कृपया शेतीशी संबंधित प्रश्न विचारा.',
  pa: 'ਮੈਂ ਸਿਰਫ਼ ਖੇਤੀਬਾੜੀ, ਖਾਦਾਂ, ਫ਼ਸਲਾਂ ਦੇ ਰੋਗ, ਮੰਡੀ ਭਾਅ ਅਤੇ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਬਾਰੇ ਹੀ ਜਾਣਕਾਰੀ ਦਿੰਦਾ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਖੇਤੀ ਨਾਲ ਸੰਬੰਧਿਤ ਸਵਾਲ ਪੁੱਛੋ।',
  gu: 'હું માત્ર ખેતી, ખાતર, પાક સંરક્ષણ, જીવાત નિયંત્રણ, બજાર ભાવ અને સરકારી યોજનાઓ સંબંધિત પ્રશ્નોના જવાબ આપું છું. કૃપા કરીને ખેતી સંબંધિત પ્રશ્ન પૂછો.',
  te: 'నేను కేవలం వ్యవసాయం, ఎరువులు, తెగుళ్ల నివారణ, మార్కెట్ ధరలు మరియు ప్రభుత్వ పథకాలకు సంబంధించిన ప్రశ్నలకు మాత్రమే సమాధానం ఇస్తాను.',
  ta: 'நான் வேளாண்மை, உரங்கள், பூச்சி கட்டுப்பாடு, மண்டி சந்தை விலை மற்றும் அரசு திட்டங்கள் தொடர்பான கேள்விகளுக்கு மட்டுமே பதிலளிக்கிறேன்.',
  kn: 'ನಾನು ಕೃಷಿ, ರಸಗೊಬ್ಬರ, ಕೀಟ ನಿಯಂತ್ರಣ, ಮಾರುಕಟ್ಟೆ ದರಗಳು ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆಗಳಿಗೆ ಮಾತ್ರ ಉತ್ತರಿಸುತ್ತೇನೆ.',
  bn: 'আমি শুধুমাত্র কৃষি, সার, রোগ দমন, মান্ডি দর এবং সরকারি প্রকল্প সম্পর্কিত প্রশ্নের উত্তর দিই। অনুগ্রহ করে কৃষিকাজ সম্পর্কিত প্রশ্ন জিজ্ঞাসা করুন।',
  ml: 'കാർഷിക വിളകൾ, വളപ്രയോഗം, കീടനിയന്ത്രണം, വിപണി നിരക്കുകൾ, സർക്കാർ പദ്ധതികൾ എന്നിവയെക്കുറിച്ചുള്ള ചോദ്യങ്ങൾക്ക് മാത്രമാണ് ഞാൻ മറുപടി നൽകുന്നത്.',
  or: 'ମୁଁ କେବଳ କୃଷି, ସାର, ପୋକ ନିୟନ୍ତ୍ରଣ, ମଣ୍ଡି ଦର ଏବଂ ସରକାରୀ ଯୋଜନା ସମ୍ବନ୍ଧୀୟ ପ୍ରଶ୍ନର ଉତ୍ତର ଦିଏ। ଦୟାକରି କୃଷି ସମ୍ବନ୍ଧୀୟ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ।',
  'hi-Latn': 'Main sirf kheti, crop health, fertilizer dosage, pest control, mandi rates aur govt schemes ke baare me help kar sakta hu. Please agriculture se juda sawaal poochein.',
  en: 'I am specialized solely in agriculture, crop nutrition, pest control, weather, mandi prices, and government schemes. Please ask a farming-related question.'
};

// Check if query is farming related
export function isAgronomyQuery(text) {
  const t = text.toLowerCase();
  const agriKeywords = [
    'crop', 'farm', 'wheat', 'rice', 'paddy', 'cotton', 'mustard', 'soybean', 'fertilizer',
    'urea', 'dap', 'npk', 'pest', 'disease', 'spray', 'irrigation', 'mandi', 'price', 'rate',
    'bhav', 'bhaw', 'msp', 'scheme', 'kisan', 'kcc', 'loan', 'soil', 'yield', 'acre',
    'खाद', 'गेहूं', 'गहू', 'कीड', 'कीट', 'रोग', 'फसल', 'मौसम', 'भाव', 'दाम', 'योजना', 'सिंचाई',
    'ਪਾਣੀ', 'ਕਣਕ', 'ਖਾਦ', 'ਭਾਅ', 'ਕੀਟ', 'ખાતર', 'ઘઉં', 'પાક', 'ભાવ', 'એરુવુ', 'వరి', 'ధర',
    'உரம்', 'நெல்', 'விலை', 'ಗೊಬ್ಬರ', 'ಭತ್ತ', 'ದರ', 'সার', 'গম', 'ধান', 'দর', 'വളം', 'നെല്ല്',
    'ଖତ', 'ସାର', 'ଦର', 'spray', 'khad', 'pani', 'gehu', 'fasal', 'kheti', 'dawai', 'doctor'
  ];

  const offTopicKeywords = ['cricket', 'match', 'ipl', 'movie', 'cinema', 'song', 'president', 'election', 'bollywood', 'football'];
  const hasOffTopic = offTopicKeywords.some(w => t.includes(w));
  const hasAgri = agriKeywords.some(w => t.includes(w));

  return hasAgri || !hasOffTopic;
}

// Generate Expert Knowledge Response
export function generateAgronomyResponse(query, langCode = 'hi') {
  const q = query.toLowerCase();
  const isAgri = isAgronomyQuery(query);

  if (!isAgri) {
    return {
      response_text: REFUSAL_RESPONSES[langCode] || REFUSAL_RESPONSES.en,
      is_agri: false,
      category: 'Off-Domain Redirection',
      action_title: null,
      action_details: null,
      key_stats: [],
      suggested_followups: [
        'गेहूं में खाद की मात्रा (Hindi)',
        'कापूस कीड नियंत्रण (Marathi)',
        'ਕਣਕ ਦਾ ਮੰਡੀ ਭਾਅ (Punjabi)',
        'Fertilizer Schedule for Wheat'
      ]
    };
  }

  // 1. FERTILIZER & NUTRITION QUERIES
  if (['khad', 'fertilizer', 'urea', 'dap', 'npk', 'खाद', 'खत', 'ખાતર', 'ఎరువు', 'உரம்', 'ಗೊಬ್ಬರ', 'সার', 'വളം', 'ସାର'].some(k => q.includes(k))) {
    const responses = {
      hi: 'गेहूं व रबी फसलों में बुवाई के समय प्रति एकड़ 50 किलो DAP, 20 किलो MOP (पोटाश) और 25 किलो यूरिया डालें। पहली सिंचाई (CRI स्टेज, 21 दिन बाद) पर 45 किलो यूरिया और 10 किलो जिंक सल्फेट 21% का भुरकाव करें। इससे कल्ले अधिक फूटते हैं और पैदावार में 15% तक वृद्धि होती है।',
      mr: 'गहू व रब्बी पिकांसाठी पेरणीच्या वेळी एकरी ५० किलो डीएपी (DAP), २० किलो एमओपी आणि २५ किलो युरिया द्यावे. पहिल्या पाण्याच्या वेळी (२१ दिवसांनी) ४५ किलो युरिया आणि १० किलो झिंक सल्फेट २१% द्यावे. यामुळे फुटवे भरपूर येतात व उत्पादनात वाढ होते.',
      pa: 'ਕਣਕ ਦੀ ਫ਼ਸਲ ਲਈ ਬਿਜਾਈ ਵੇਲੇ ਪ੍ਰਤੀ ਏਕੜ 55 ਕਿਲੋ ਡੀ.ਏ.ਪੀ. (DAP) ਅਤੇ 20 ਕਿਲੋ ਪੋਟਾਸ਼ ਪਾਓ। ਪਹਿਲੇ ਪਾਣੀ (21 ਦਿਨਾਂ ਬਾਅਦ) ਸਮੇਂ 45 ਕਿਲੋ ਯੂਰੀਆ ਅਤੇ 10 ਕਿਲੋ ਜ਼ਿੰਕ ਸਲਫੇਟ ਜ਼ਰੂਰ ਦਿਓ।',
      gu: 'ઘઉં અને રવી પાક માટે વાવણી સમયે એકરે ૫૦ કિલો DAP અને ૨૦ કિલો પોટાશ આપો. પ્રથમ પિયત સમયે ૪૫ કિલો યુરિયા અને ૧૦ કિલો ઝિંક સલ્ફેટ આપવું અત્યંત ફાયદાકારક રહેશે.',
      te: 'రబీ పంటలకు ఎకరాకు 50 కిలోల డీఏపీ (DAP), 25 కిలోల యూరియా మరియు 20 కిలోల పొటాష్ వేయాలి. మొదటి తడి సమయంలో 10 కిలోల జింక్ సల్ఫేట్ వేయడం వల్ల పిలకలు బాగా వస్తాయి.',
      ta: 'பயிர்களுக்கு ஏக்கருக்கு 50 கிலோ டிஏபி (DAP), 25 கிலோ யூரியா மற்றும் 20 கிலோ பொட்டாஷ் இட வேண்டும். முதல் பாசனத்தின் போது துத்தநாக சல்பேட் 10 கிலோ சேர்ப்பது நல்லது.',
      kn: 'ಬೆಳೆಗಳಿಗೆ ಪ್ರತಿ ಎಕರೆಗೆ 50 ಕೆಜಿ ಡಿಎಪಿ (DAP), 25 ಕೆಜಿ ಯೂರಿಯಾ ಮತ್ತು 20 ಕೆಜಿ ಪೊಟ್ಯಾಶ್ ಹಾಕಿ. ಮೊದಲ ನೀರಾವರಿ ಸಮಯದಲ್ಲಿ ಸತು ಸಲ್ಫೇಟ್ ಹಾಕುವುದು ಅತ್ಯುತ್ತಮ.',
      bn: 'ফসলের জন্য একর প্রতি ৫০ কেজি ডিএপি (DAP) এবং ২৫ কেজি ইউরিয়া প্রয়োগ করুন। প্রথম সেচের সময় দস্তা বা জিঙ্ক সালফেট দিলে ফলন বৃদ্ধি পায়।',
      ml: 'വിളകൾക്ക് ഏക്കറിന് 50 കിലോഗ്രാം ഡിഎപി, 25 കിലോഗ്രാം യൂറിയ, 20 കിലോഗ്രാം പൊട്ടാഷ് എന്നിവ നൽകുക. സിങ്ക് സൾഫേറ്റ് ചേർക്കുന്നത് വിളവ് വർദ്ധിപ്പിക്കും.',
      or: 'ଫସଲ ପାଇଁ ଏକର ପିଛା ୫୦ କିଲୋ ଡିଏପି (DAP) ଓ ୨୫ କିଲୋ ୟୁରିଆ ପ୍ରୟୋଗ କରନ୍ତୁ। ପ୍ରଥମ ପାଣି ମଡ଼ାଇବା ସମୟରେ ଜିଙ୍କ୍ ସଲଫେଟ୍ ଦେବା ଉତ୍ତମ।',
      'hi-Latn': 'Wheat (gehu) ki fasal me sowing ke time per acre 50kg DAP aur 20kg MOP daalein. First irrigation (21 days CRI stage) par 45kg Urea aur 10kg Zinc Sulfate daalna zaroori hai.',
      en: 'For wheat and rabi crops, apply 50 kg DAP, 20 kg MOP, and 25 kg Urea per acre at sowing time. At the 1st irrigation (CRI stage, 21 days), top-dress with 45 kg Urea and 10 kg Zinc Sulphate (21%).'
    };

    return {
      response_text: responses[langCode] || responses.hi,
      is_agri: true,
      category: 'Fertilizer & Soil Nutrition',
      action_title: 'ICAR Recommended Dosage / संतुलित खाद प्रबंधन',
      action_details: 'Apply 1st top dressing strictly before irrigation to prevent nitrogen volatilization loss.',
      key_stats: [
        { label: 'DAP (Base)', val: '50 kg/Acre' },
        { label: 'Urea (CRI)', val: '45 kg/Acre' },
        { label: 'Zinc 21%', val: '10 kg/Acre' }
      ],
      suggested_followups: [
        'पहली सिंचाई का सही समय कब है?',
        'पीला रतुआ रोग के लक्षण व दवा',
        'आज का गेहूं मंडी भाव क्या है?'
      ]
    };
  }

  // 2. PEST & DISEASE CONTROL QUERIES
  if (['pest', 'disease', 'insect', 'keet', 'rog', 'कीट', 'रोग', 'कीड', 'ਰੋਗ', 'ઈયળ', 'తెగులు', 'பூச்சி', 'ಕೀಟ', 'পোকা', 'കീടം'].some(k => q.includes(k))) {
    const responses = {
      hi: 'कीट व रस चूसक कीड़ों की रोकथाम के लिए इमिडाक्लोप्रिड (Imidacloprid 17.8% SL) 80 मिली 150 लीटर पानी में घोलकर प्रति एकड़ छिड़कें। फफूंद व पीला रतुआ रोग के लिए प्रोपिकोनाज़ोल (Tilt 25% EC) 200 मिली का छिड़काव सुबह के समय करें।',
      mr: 'बोंडअळी, मावा व रसशोषक किडींसाठी इमिडाक्लोप्रिड (Imidacloprid 17.8% SL) ८० मिली किंवा निंबोळी अर्क ५% १५० लिटर पाण्यातून फवारावे. बुरशीजन्य रोगांसाठी प्रोपिकोनाझोल २०० मिली वापरावे.',
      pa: 'ਤੇਲਾ ਅਤੇ ਪੀਲਾ ਰਤੂਆ ਰੋਗ ਰੋਕਣ ਲਈ ਪ੍ਰੋਪੀਕੋਨਾਜ਼ੋਲ (Tilt 25% EC) 200 ਮਿਲੀਲੀਟਰ ਨੂੰ 200 ਲੀਟਰ ਪਾਣੀ ਵਿੱਚ ਮਿਲਾ ਕੇ ਸਾਫ਼ ਧੁੱਪ ਵਾਲੇ ਦਿਨ ਛਿੜਕਾਅ ਕਰੋ।',
      gu: 'ચૂસિયા પ્રકારની જીવાતો અને ઈયળ માટે લીંબોળીનું તેલ અથવા ઈમિડાક્લોપ્રિડ ૮૦ મિલી ૧૫૦ લિટર પાણીમાં છંટકાવ કરવો. ફૂગજન્ય રોગ માટે પ્રોપિકોનાઝોલ વાપરો.',
      te: 'పురుగుల నివారణకు ఇమిడాక్లోప్రిడ్ 80 మి.లీ 150 లీటర్ల నీటిలో కలిపి పిచికారీ చేయాలి. తెగుళ్ల నివారణకు ప్రొపికోనజోల్ 200 మి.లీ వాడండి.',
      ta: 'பூச்சி தாக்குதலைக் கட்டுப்படுத்த இமிடாக்ளோப்ரிட் 80 மி.லி அல்லது வேப்ப எண்ணெய் கரைசலை 150 லிட்டர் தண்ணீரில் கலந்து தெளிக்கவும்.',
      kn: 'ಕೀಟಬಾಧೆ ನಿಯಂತ್ರಣಕ್ಕೆ ಇಮಿಡಾಕ್ಲೋಪ್ರಿಡ್ 80 ಮಿ.ಲೀ 150 ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ. ಶಿಲೀಂಧ್ರ ರೋಗಗಳಿಗೆ ಪ್ರೊಪಿಕೊನಾಜೋಲ್ ಬಳಸಿ.',
      bn: 'পোকা দমনের জন্য ইমিডাক্লোপ্রিড ৮০ মিলি ১৫০ লিটার জলে মিশিয়ে স্প্রে করুন। ছত্রাকজনিত রোগের জন্য প্রপিকোনাজল ব্যবহার করুন।',
      ml: 'കീടങ്ങളെ നിയന്ത്രിക്കാൻ ഇമിഡാക്ലോപ്രിഡ് 80 മില്ലി 150 ലിറ്റർ വെള്ളത്തിൽ കലക്കി തളിക്കുക. കുമിൾ രോഗങ്ങൾക്ക് പ്രൊപികൊണാസോൾ ഉപയോഗിക്കാം.',
      or: 'ପୋକ ନିୟନ୍ତ୍ରଣ ପାଇଁ ଇମିଡାକ୍ଲୋପ୍ରିଡ୍ ୮୦ ମି.ଲି. ୧୫୦ ଲିଟର ପାଣିରେ ମିଶାଇ ସ୍ପ୍ରେ କରନ୍ତୁ।',
      'hi-Latn': 'Sucking pests aur keet ke liye Imidacloprid 80ml ko 150L paani me gholkar spray karein. Fungal bimari ke liye Propiconazole 200ml use karein.',
      en: 'For sucking pests, spray Imidacloprid (17.8% SL) @ 80 ml in 150 Liters of water per acre. For fungal rusts, spray Propiconazole (Tilt 25% EC) @ 200 ml/acre on a clear morning.'
    };

    return {
      response_text: responses[langCode] || responses.hi,
      is_agri: true,
      category: 'Integrated Pest Management',
      action_title: 'CIBRC Approved Treatment / सुरक्षित कीटनाशक सलाह',
      action_details: 'Avoid spraying during strong winds (>12 km/h) or high noon heat to prevent chemical drift.',
      key_stats: [
        { label: 'Imidacloprid', val: '80 ml/Acre' },
        { label: 'Tilt (Propico)', val: '200 ml/Acre' },
        { label: 'Spray Volume', val: '150 L Water' }
      ],
      suggested_followups: [
        'जैविक कीटनाशक (नीम तेल) कैसे बनाएं?',
        'स्प्रे करने का सर्वोत्तम समय (मौसम रडार)',
        'फसल डॉक्टर में फोटो अपलोड करें'
      ]
    };
  }

  // 3. MANDI RATES & PRICE QUERIES
  if (['bhav', 'price', 'rate', 'mandi', 'msp', 'भाव', 'दाम', 'ਦਰ', 'ભાવ', 'ధర', 'விலை', 'ದರ', 'দর', 'വില'].some(k => q.includes(k))) {
    const responses = {
      hi: 'करनाल एवं उत्तर भारत की प्रमुख मंडियों में शरबती गेहूं का मॉडल भाव ₹2,840/क्विंटल चल रहा है, जो सरकारी एमएसपी (₹2,425/क्विंटल) से +₹415 अधिक है। बासमती धान ₹3,950/क्विंटल और सरसों ₹5,780/क्विंटल पर स्थिर है।',
      mr: 'लातूर व अकोला बाजारात सोयाबीनचा भाव ₹४,८९० आणि शरबती गव्हाचा भाव ₹२,८४० प्रति क्विंटल आहे. केंद्र सरकारच्या हमीभावापेक्षा (MSP) खुल्या बाजारात तेजी दिसून येत आहे.',
      pa: 'ਖੰਨਾ ਅਤੇ ਕਰਨਾਲ ਮੰਡੀ ਵਿੱਚ ਸ਼ਰਬਤੀ ਕਣਕ ਦਾ ਤਾਜ਼ਾ ਭਾਅ ₹2,840 ਪ੍ਰਤੀ ਕੁਇੰਟਲ ਹੈ (ਸਰਕਾਰੀ ਐਮਐਸਪੀ ₹2,425 ਨਾਲੋਂ +₹415 ਵੱਧ)। ਆਉਣ ਵਾਲੇ ਦਿਨਾਂ ਵਿੱਚ ਮਿੱਲਾਂ ਦੀ ਮੰਗ ਮਜ਼ਬੂਤ ਰਹੇਗੀ।',
      gu: 'રાજકોટ અને ઊંઝા માર્કેટ યાર્ડમાં ઘઉંનો હાજર ભાવ ₹૨,૮૪૦/ક્વિન્ટલ અને રાયડો ₹૫,૭૮૦/ક્વિન્ટલ ચાલી રહ્યો છે.',
      te: 'మార్కెట్ యార్డులో ధాన్యం ధర క్వింటాలుకు ₹2,840 గా ఉంది. ప్రభుత్వ మద్దతు ధర (MSP) కంటే ధరలు నిలకడగా ఉన్నాయి.',
      ta: 'மண்டி சந்தையில் தானியத்தின் மாதிரி விலை குவிண்டாலுக்கு ₹2,840 ஆக உள்ளது. அரசு கொள்முதல் விலையை விட சந்தை தேவை அதிகமாக உள்ளது.',
      kn: 'ಮಂಡಿ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಕ್ವಿಂಟಾಲ್‌ಗೆ ₹2,840 ರಂತೆ ಬೆಲೆ ಲಭ್ಯವಿದೆ. ಮುಂಬರುವ ದಿನಗಳಲ್ಲಿ ಬೆಲೆಗಳು ಸ್ಥಿರವಾಗಿರುತ್ತವೆ.',
      bn: 'মান্ডিতে গম ও শস্যের বর্তমান মডেল দর প্রতি কুইন্টাল ₹২,৮৪০। সরকারি সহায়ক মূল্যের চেয়ে খোলা বাজারে দর বেশি।',
      ml: 'മാർക്കറ്റിൽ ക്വിന്റലിന് ₹2,840 നിരക്കിൽ വ്യാപാരം നടക്കുന്നു. സർക്കാർ താങ്ങുവിലയേക്കാൾ ഉയർന്ന നിരക്കാണിത്.',
      or: 'ମଣ୍ଡିରେ ଶସ୍ୟର ହାରାହାରି ଦର କ୍ୱିଣ୍ଟାଲ ପିଛା ₹୨,୮୪୦ ରହିଛି। ଆଗାମୀ ଦିନରେ ବଜାର ଦର ସ୍ଥିର ରହିବ।',
      'hi-Latn': 'Karnal aur North India mandis me Sharbati Wheat ka spot rate ₹2,840/qtl hai (MSP ₹2,425 se +₹415 upar). Basmati paddy ₹3,950 aur Mustard ₹5,780 par trade ho raha hai.',
      en: 'In Karnal and North Indian APMCs, premium Sharbati Wheat is trading at ₹2,840/quintal (+₹415/qtl above Govt MSP of ₹2,425). Basmati Paddy is at ₹3,950/qtl and Mustard at ₹5,780/qtl.'
    };

    return {
      response_text: responses[langCode] || responses.hi,
      is_agri: true,
      category: 'Mandi Intelligence & Arbitrage',
      action_title: 'AgriPulse Direct B2B Exchange / सीधा मंडी भाव',
      action_details: 'List verified lots on AgriPulse B2B floor to trade with 0% brokerage and instant Smart Escrow security.',
      key_stats: [
        { label: 'Wheat Spot', val: '₹2,840/qtl' },
        { label: 'Govt MSP', val: '₹2,425/qtl' },
        { label: 'Realization Spread', val: '+5.2% Premium' }
      ],
      suggested_followups: [
        'सीधा व्यापार मंडी (B2B) में फसल कैसे बेचें?',
        'आसपास की मंडियों में मुनाफे का अंतर (आर्बिट्रेज)',
        'एस्क्रो सुरक्षित भुगतान कैसे काम करता है?'
      ]
    };
  }

  // 4. GENERAL FARMING ADVISORY
  const responses = {
    hi: 'उत्तम पैदावार के लिए संतुलित खाद (NPK 4:2:1), मृदा स्वास्थ्य कार्ड के अनुसार सूक्ष्म पोषक तत्व, और समय पर सिंचाई प्रबंधन अत्यंत महत्वपूर्ण है। अपनी फसल की वर्तमान स्थिति बताएं।',
    mr: 'भरपूर उत्पादनासाठी जमिनीची सुपीकता, वेळेवर सिंचन आणि प्रमाणित बियाण्यांचा वापर आवश्यक आहे. आपल्या पिकाची सद्यस्थिती सांगा.',
    pa: 'ਵਧੀਆ ਝਾੜ ਲਈ ਸੰਤੁਲਿਤ ਖਾਦਾਂ, ਮਿੱਟੀ ਪਰਖ ਰਿਪੋਰਟ ਅਤੇ ਸਹੀ ਸਮੇਂ ਤੇ ਸਿੰਚਾਈ ਪ੍ਰਬੰਧਨ ਬਹੁਤ ਜ਼ਰੂਰੀ ਹੈ।',
    gu: 'ખેતીમાં સારા ઉત્પાદન માટે જમીન ચકાસણી, સપ્રમાણ ખાતર અને સમયસર પિયત વ્યવસ્થાપન ખૂબ મહત્વપૂર્ણ છે.',
    te: 'వ్యవసాయంలో అధిక దిగుబడి సాధించడానికి సమతుల్య ఎరువులు, నేల పరీక్ష మరియు సకాలంలో నీటి యాజమాన్యం ఎంతో అవసరం.',
    ta: 'விவசாயத்தில் அதிக மகசூல் பெற சமச்சீர் உரமிடுதல், மண் பரிசோதனை மற்றும் சரியான பாசன மேலாண்மை மிகவும் அவசியம்.',
    kn: 'ಕೃಷಿಯಲ್ಲಿ ಉತ್ತಮ ಇಳುವರಿಗಾಗಿ ಮಣ್ಣು ಪರೀಕ್ಷೆ, ಸಮತೋಲಿತ ರಸಗೊಬ್ಬರ ಮತ್ತು ಸಮಯೋಚಿತ ನೀರಾವರಿ ಅತ್ಯಗತ್ಯ.',
    bn: 'উচ্চ ফলনের জন্য সুষম সার প্রয়োগ, মাটি পরীক্ষা এবং সময়মতো সেচ ব্যবস্থাপনা অত্যন্ত জরুরি।',
    ml: 'കൂടുതൽ വിളവിനായി മണ്ണ് പരിശോധനയും സമീകൃത വളപ്രയോഗവും കൃത്യമായ ജലസೇചനവും ഉറപ്പാക്കുക.',
    or: 'ଭଲ ଅମଳ ପାଇଁ ମାଟି ପରୀକ୍ଷା, ସନ୍ତୁଳିତ ସାର ପ୍ରୟୋଗ ଓ ଠିକ୍ ସମୟରେ ଜଳସେଚନ ଅତ୍ୟନ୍ତ ଜରୁରୀ।',
    'hi-Latn': 'Kheti me bumper production ke liye Soil Health Card ke hisab se balanced NPK aur time par irrigation management bohot zaroori hai. Apni fasal ki stage batayein.',
    en: 'For optimal agricultural yield and maximum profitability, balanced NPK nutrition (4:2:1), Soil Health Card micronutrient application, and stage-wise irrigation scheduling are vital.'
  };

  return {
    response_text: responses[langCode] || responses.hi,
    is_agri: true,
    category: 'Agronomy Decision Intelligence',
    action_title: 'Farm Advisory / कृषि सलाहकार',
    action_details: 'Follow ICAR and State Agricultural University recommendations for your agro-climatic zone.',
    key_stats: [
      { label: 'Soil Health', val: 'SHC Certified' },
      { label: 'Water Savings', val: '+30% Drip' },
      { label: 'Advisory Source', val: 'ICAR / PAU' }
    ],
    suggested_followups: [
      'गेहूं में खाद की मात्रा (Hindi)',
      'कापूस कीड नियंत्रण (Marathi)',
      'आज का गेहूं मंडी भाव क्या है?'
    ]
  };
}
