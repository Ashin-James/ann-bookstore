export type Language = 'en' | 'es' | 'ml' | 'hi';

export interface Translations {
  _status?: string;
  navBooks: string;
  navAbout: string;
  navJournal: string;
  navCompanion: string;
  searchPlaceholder: string;
  searchTitle: string;
  searchNoResults: string;
  cartTitle: string;
  cartEmpty: string;
  cartEmptySub: string;
  exploreBooks: string;
  subtotal: string;
  shipping: string;
  freeShipping: string;
  freeShippingNotice: string;
  estimatedTax: string;
  checkout: string;
  quickAdd: string;
  addToCart: string;
  addedToCart: string;
  readChapterOne: string;
  discoverBook: string;
  featuredStory: string;
  scrollDiscover: string;
  curatedShelf: string;
  curatedShelfTitle: string;
  exploreAll: string;
  authorNote: string;
  authorTitle: string;
  getToknowAnn: string;
  companionButton: string;
  companionTitle: string;
  companionSubtitle: string;
  companionInputPlaceholder: string;
  companionDisclaimer: string;
  companionAskPrompt: string;
  footerTagline: string;
  footerDemoNote: string;
  wishlist: string;
  readersAlsoLoved: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    navBooks: 'Books',
    navAbout: 'About Ann',
    navJournal: 'Journal',
    navCompanion: 'Reading Companion',
    searchPlaceholder: 'Search books by title, mood, or theme...',
    searchTitle: 'Find your next story',
    searchNoResults: 'No stories found matching that search.',
    cartTitle: 'Your bag',
    cartEmpty: 'Nothing in your bag. Yet.',
    cartEmptySub: 'There is always another story waiting to be found.',
    exploreBooks: 'Explore the bookshelf',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    freeShipping: 'Free',
    freeShippingNotice: 'Complimentary shipping on US orders over $35',
    estimatedTax: 'Estimated tax',
    checkout: 'Proceed to Checkout',
    quickAdd: 'Quick add',
    addToCart: 'Add to bag',
    addedToCart: 'Added to bag',
    readChapterOne: 'Read chapter one',
    discoverBook: 'Discover the book',
    featuredStory: 'THE FEATURED STORY',
    scrollDiscover: 'SCROLL TO DISCOVER',
    curatedShelf: 'A SMALL, THOUGHTFUL LIBRARY',
    curatedShelfTitle: 'Find your next favorite.',
    exploreAll: 'Explore all books',
    authorNote: 'A NOTE FROM THE AUTHOR',
    authorTitle: 'Every story begins with something small.',
    getToknowAnn: 'Get to know Ann',
    companionButton: 'Reading Companion',
    companionTitle: "Ann's Reading Companion",
    companionSubtitle: 'A quiet, in-browser guide to finding your next story.',
    companionInputPlaceholder: 'Ask about moods, themes, or story recommendations...',
    companionDisclaimer: 'Private & runs directly on your device. Never share personal information.',
    companionAskPrompt: 'How can I help you find what to read today?',
    footerTagline: 'Stories for the quiet corners of an ordinary day.',
    footerDemoNote: 'Demo store · Sample US titles and prices · No real payments',
    wishlist: 'Wishlist',
    readersAlsoLoved: 'Readers who enjoyed this also loved',
  },
  es: {
    _status: 'DRAFT: needs native-speaker review',
    navBooks: 'Libros',
    navAbout: 'Sobre Ann',
    navJournal: 'Diario',
    navCompanion: 'Compañero de Lectura',
    searchPlaceholder: 'Buscar libros por título, emoción o tema...',
    searchTitle: 'Encuentra tu próxima historia',
    searchNoResults: 'No se encontraron historias con esa búsqueda.',
    cartTitle: 'Tu bolsa',
    cartEmpty: 'Nada en tu bolsa todavía.',
    cartEmptySub: 'Siempre hay otra historia esperando ser descubierta.',
    exploreBooks: 'Explorar la librería',
    subtotal: 'Subtotal',
    shipping: 'Envío',
    freeShipping: 'Gratis',
    freeShippingNotice: 'Envío gratuito en EE.UU. en pedidos superiores a $35',
    estimatedTax: 'Impuestos estimados',
    checkout: 'Proceder al Pago',
    quickAdd: 'Añadir',
    addToCart: 'Añadir a la bolsa',
    addedToCart: 'Añadido a la bolsa',
    readChapterOne: 'Leer capítulo uno',
    discoverBook: 'Descubrir el libro',
    featuredStory: 'HISTORIA DESTACADA',
    scrollDiscover: 'DESLIZA PARA DESCUBRIR',
    curatedShelf: 'UNA PEQUEÑA Y CUIDADA BIBLIOTECA',
    curatedShelfTitle: 'Encuentra tu próxima historia favorita.',
    exploreAll: 'Explorar todos los libros',
    authorNote: 'UNA NOTA DE LA AUTORA',
    authorTitle: 'Cada historia comienza con algo pequeño.',
    getToknowAnn: 'Conoce a Ann',
    companionButton: 'Compañero de Lectura',
    companionTitle: 'El Compañero de Lectura de Ann',
    companionSubtitle: 'Una guía literaria para encontrar tu próxima lectura.',
    companionInputPlaceholder: 'Pregunta sobre estados de ánimo, temas o recomendaciones...',
    companionDisclaimer: 'Privado y se ejecuta en tu dispositivo.',
    companionAskPrompt: '¿Cómo puedo ayudarte a elegir tu lectura hoy?',
    footerTagline: 'Historias para los rincones tranquilos del día a día.',
    footerDemoNote: 'Tienda de demostración · Precios de muestra en USD',
    wishlist: 'Lista de deseos',
    readersAlsoLoved: 'A los lectores también les gustó',
  },
  ml: {
    _status: 'DRAFT: needs native-speaker review',
    navBooks: 'പുസ്തകങ്ങൾ',
    navAbout: 'ആൻ കുറിച്ച്',
    navJournal: 'വായനാമുറി',
    navCompanion: 'സഹായി',
    searchPlaceholder: 'കഥകളും വിഷയങ്ങളും തിരയുക...',
    searchTitle: 'നിങ്ങളുടെ അടുത്ത പുസ്തകം കണ്ടെത്തുക',
    searchNoResults: 'ഫലങ്ങളൊന്നും ലഭ്യമല്ല.',
    cartTitle: 'നിങ്ങളുടെ വട്ടവട്ടി',
    cartEmpty: 'നിങ്ങളുടെ ബാഗിൽ ഒന്നുമില്ല.',
    cartEmptySub: 'പുതിയൊരു കഥ നിങ്ങളെ കാത്തിരിക്കുന്നു.',
    exploreBooks: 'പുസ്തകങ്ങൾ കാണുക',
    subtotal: 'ആകെ തുക',
    shipping: 'ഡെലിവറി',
    freeShipping: 'സൗജന്യം',
    freeShippingNotice: '$35-ന് മുകളിൽ സൗജന്യ യു.എസ്. ഡെലിവറി',
    estimatedTax: 'നികുതി',
    checkout: 'വാങ്ങുക',
    quickAdd: 'ചേർക്കുക',
    addToCart: 'ബാഗിൽ ചേർക്കുക',
    addedToCart: 'ചേർത്തു',
    readChapterOne: 'ആദ്യ അധ്യായം വായിക്കുക',
    discoverBook: 'പുസ്തകം കാണുക',
    featuredStory: 'പ്രത്യേക കൃതി',
    scrollDiscover: 'കൂടുതൽ അറിയാൻ സ്ക്രോൾ ചെയ്യുക',
    curatedShelf: 'ചെറിയൊരു വായനാ ലോകം',
    curatedShelfTitle: 'നിങ്ങളുടെ പ്രിയപ്പെട്ട കഥ കണ്ടെത്തുക.',
    exploreAll: 'എല്ലാ പുസ്തകങ്ങളും',
    authorNote: 'എഴുത്തുകാരിയുടെ കുറിപ്പ്',
    authorTitle: 'ഓരോ കഥയും ആരംഭിക്കുന്നത് ചെറുതായൊന്നിൽ നിന്നാണ്.',
    getToknowAnn: 'ആൻ നെ അടുത്തറിയുക',
    companionButton: 'വായനാ സഹായി',
    companionTitle: 'ആനിന്റെ വായനാ സഹായി',
    companionSubtitle: 'നിങ്ങൾക്കായി അനുയോജ്യമായ പുസ്തകങ്ങൾ നിർദ്ദേശിക്കുന്നു.',
    companionInputPlaceholder: 'നിങ്ങളുടെ താൽപ്പര്യങ്ങൾ ചോദിക്കൂ...',
    companionDisclaimer: 'നിങ്ങളുടെ ഉപകരണത്തിൽ നേരിട്ട് പ്രവർത്തിക്കുന്നു.',
    companionAskPrompt: 'ഇന്ന് എന്ത് വായിക്കാനാണ് നിങ്ങൾക്ക് ആഗ്രഹം?',
    footerTagline: 'നിശബ്ദ നിമിഷങ്ങൾക്കായുള്ള കഥകൾ.',
    footerDemoNote: 'ഡെമോ സ്റ്റോർ · യഥാർത്ഥ പണമിടപാടുകൾ നടക്കുന്നില്ല',
    wishlist: 'പ്രിയപ്പെട്ടവ',
    readersAlsoLoved: 'ഇഷ്ടപ്പെട്ട മറ്റ് വായനക്കാർ തിരഞ്ഞെടുത്തത്',
  },
  hi: {
    _status: 'DRAFT: needs native-speaker review',
    navBooks: 'किताबें',
    navAbout: 'ऐन के बारे में',
    navJournal: 'जर्नल',
    navCompanion: 'रीडिंग साथी',
    searchPlaceholder: 'किताबें, भाव या विषय खोजें...',
    searchTitle: 'अपनी अगली कहानी खोजें',
    searchNoResults: 'कोई परिणाम नहीं मिला।',
    cartTitle: 'आपकी थैली',
    cartEmpty: 'आपकी थैली खाली है।',
    cartEmptySub: 'हर पन्ने पर एक नई कहानी इंतज़ार कर रही है।',
    exploreBooks: 'अलमारी देखें',
    subtotal: 'उप-योग',
    shipping: 'डिलीवरी',
    freeShipping: 'मुफ़्त',
    freeShippingNotice: '$35 से अधिक पर मुफ़्त डिलीवरी',
    estimatedTax: 'अनुमानित कर',
    checkout: 'खरीदारी पूरी करें',
    quickAdd: 'जोड़ें',
    addToCart: 'थैली में जोड़ें',
    addedToCart: 'जोड़ा गया',
    readChapterOne: 'पहला अध्याय पढ़ें',
    discoverBook: 'किताब देखें',
    featuredStory: 'विशेष पुस्तक',
    scrollDiscover: 'नीचे स्क्रॉल करें',
    curatedShelf: 'एक छोटी, सुंदर लाइब्रेरी',
    curatedShelfTitle: 'अपनी पसंदीदा कहानी चुनें।',
    exploreAll: 'सभी किताबें',
    authorNote: 'लेखिका का संदेश',
    authorTitle: 'हर कहानी एक छोटे से एहसास से शुरू होती है।',
    getToknowAnn: 'ऐन के बारे में जानें',
    companionButton: 'रीडिंग साथी',
    companionTitle: 'ऐन का रीडिंग साथी',
    companionSubtitle: 'आपकी अगली पसंद चुनने में मदद करने वाला आपका साथी।',
    companionInputPlaceholder: 'अपने मूड या पसंद के बारे में पूछें...',
    companionDisclaimer: 'आपके डिवाइस पर सुरक्षित रूप से चलता है।',
    companionAskPrompt: 'आज आप क्या पढ़ना पसंद करेंगे?',
    footerTagline: 'दिन के शांत कोनों के लिए कहानियां।',
    footerDemoNote: 'डेमो स्टोर · नमूना पुस्तकें और कीमतें',
    wishlist: 'पसंदीदा',
    readersAlsoLoved: 'अन्य पाठकों की पसंद',
  },
};
