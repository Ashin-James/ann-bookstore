'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  History,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Image as ImageIcon,
  Link as LinkIcon,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import {
  JournalPostRecord,
  getAdminJournalPosts,
  saveAdminJournalPost,
  deleteAdminJournalPost,
  restoreAdminJournalRevision,
  calculateReadingTime,
} from '@/data/journal';
import { books } from '@/data/books';
import { useLanguage } from '@/contexts/language-context';

const JOURNAL_I18N: Record<string, Record<string, string>> = {
  en: {
    pageTitle: 'Journal & Editorial',
    pageSubtitle: 'Draft essays, schedule dispatches, and manage literary reflections.',
    demoNote: 'Demo Mode: Journal entries are saved in browser demo storage and visible only in this browser.',
    newPost: 'New Journal Entry',
    searchPlaceholder: 'Search titles, categories, or excerpts...',
    allStatus: 'All Statuses',
    published: 'Published',
    scheduled: 'Scheduled',
    draft: 'Draft',
    status: 'Status',
    title: 'Title',
    category: 'Category',
    readTime: 'Read Time',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    revisions: 'Revisions',
    restore: 'Restore',
    preview: 'Live Storefront Preview',
    editorView: 'Editor Mode',
    savePost: 'Save Entry',
    saving: 'Saving...',
    deleteConfirmTitle: 'Confirm Deletion',
    deletePrompt: 'Type the exact title below to confirm deletion:',
    cancel: 'Cancel',
    confirmDelete: 'Permanently Delete',
    relatedBook: 'Related Catalogue Book',
    selectBook: 'Select a book (optional)',
    coverImage: 'Cover Image URL',
    coverImageAlt: 'Cover Image Alt Text (Required if image provided)',
    seoTitle: 'SEO Title',
    seoDescription: 'SEO Meta Description',
    publishDate: 'Publish Date & Time',
    insertImage: 'Insert Image',
    imageUrl: 'Image URL',
    imageAlt: 'Image Alt Text (Required)',
    insert: 'Insert',
  },
  es: {
    pageTitle: 'Diario y Editorial',
    pageSubtitle: 'Redacta ensayos, programa publicaciones y gestiona reflexiones literarias.',
    demoNote: 'Modo demo: Las entradas se guardan localmente y solo son visibles en este navegador.',
    newPost: 'Nueva Entrada',
    searchPlaceholder: 'Buscar títulos, categorías o extractos...',
    allStatus: 'Todos los estados',
    published: 'Publicado',
    scheduled: 'Programado',
    draft: 'Borrador',
    status: 'Estado',
    title: 'Título',
    category: 'Categoría',
    readTime: 'Tiempo de lectura',
    actions: 'Acciones',
    edit: 'Editar',
    delete: 'Eliminar',
    revisions: 'Revisiones',
    restore: 'Restaurar',
    preview: 'Vista previa',
    editorView: 'Modo Editor',
    savePost: 'Guardar Entrada',
    saving: 'Guardando...',
    deleteConfirmTitle: 'Confirmar Eliminación',
    deletePrompt: 'Escribe el título exacto abajo para confirmar:',
    cancel: 'Cancelar',
    confirmDelete: 'Eliminar permanentemente',
    relatedBook: 'Libro relacionado',
    selectBook: 'Seleccionar libro (opcional)',
    coverImage: 'URL de portada',
    coverImageAlt: 'Texto alternativo de portada (Requerido)',
    seoTitle: 'Título SEO',
    seoDescription: 'Descripción SEO',
    publishDate: 'Fecha y hora de publicación',
    insertImage: 'Insertar Imagen',
    imageUrl: 'URL de imagen',
    imageAlt: 'Texto alternativo (Requerido)',
    insert: 'Insertar',
  },
  fr: {
    pageTitle: 'Journal & Éditorial',
    pageSubtitle: 'Rédigez des essais, planifiez des dépêches et gérez vos réflexions littéraires.',
    demoNote: 'Mode démo: Les articles sont enregistrés localement dans ce navigateur.',
    newPost: 'Nouvel Article',
    searchPlaceholder: 'Rechercher des titres, catégories...',
    allStatus: 'Tous les statuts',
    published: 'Publié',
    scheduled: 'Planifié',
    draft: 'Brouillon',
    status: 'Statut',
    title: 'Titre',
    category: 'Catégorie',
    readTime: 'Temps de lecture',
    actions: 'Actions',
    edit: 'Modifier',
    delete: 'Supprimer',
    revisions: 'Révisions',
    restore: 'Restaurer',
    preview: 'Aperçu en direct',
    editorView: 'Mode Éditeur',
    savePost: 'Enregistrer',
    saving: 'Enregistrement...',
    deleteConfirmTitle: 'Confirmer la suppression',
    deletePrompt: 'Tapez le titre exact ci-dessous pour confirmer:',
    cancel: 'Annuler',
    confirmDelete: 'Supprimer définitivement',
    relatedBook: 'Livre associé',
    selectBook: 'Sélectionner un livre (optionnel)',
    coverImage: 'URL de couverture',
    coverImageAlt: 'Texte alternatif couverture (Requis)',
    seoTitle: 'Titre SEO',
    seoDescription: 'Description SEO',
    publishDate: 'Date et heure de publication',
    insertImage: 'Insérer une image',
    imageUrl: 'URL image',
    imageAlt: 'Texte alternatif (Requis)',
    insert: 'Insérer',
  },
  de: {
    pageTitle: 'Journal & Leitartikel',
    pageSubtitle: 'Essays verfassen, Beiträge planen und literarische Reflexionen verwalten.',
    demoNote: 'Demo-Modus: Einträge werden lokal in diesem Browser gespeichert.',
    newPost: 'Neuer Eintrag',
    searchPlaceholder: 'Titel oder Kategorien suchen...',
    allStatus: 'Alle Status',
    published: 'Veröffentlicht',
    scheduled: 'Geplant',
    draft: 'Entwurf',
    status: 'Status',
    title: 'Titel',
    category: 'Kategorie',
    readTime: 'Lesezeit',
    actions: 'Aktionen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    revisions: 'Versionen',
    restore: 'Wiederherstellen',
    preview: 'Live-Vorschau',
    editorView: 'Editor-Modus',
    savePost: 'Eintrag speichern',
    saving: 'Speichern...',
    deleteConfirmTitle: 'Löschen bestätigen',
    deletePrompt: 'Geben Sie den genauen Titel ein:',
    cancel: 'Abbrechen',
    confirmDelete: 'Endgültig löschen',
    relatedBook: 'Zugehöriges Buch',
    selectBook: 'Buch auswählen (optional)',
    coverImage: 'Titelbild-URL',
    coverImageAlt: 'Titelbild-Alt-Text (Erforderlich)',
    seoTitle: 'SEO-Titel',
    seoDescription: 'SEO-Beschreibung',
    publishDate: 'Veröffentlichungsdatum',
    insertImage: 'Bild einfügen',
    imageUrl: 'Bild-URL',
    imageAlt: 'Alt-Text (Erforderlich)',
    insert: 'Einfügen',
  },
  'pt-BR': {
    pageTitle: 'Jornal & Editorial',
    pageSubtitle: 'Escreva ensaios, agende publicações e gerencie reflexões literárias.',
    demoNote: 'Modo demonstração: Os artigos são salvos neste navegador.',
    newPost: 'Novo Artigo',
    searchPlaceholder: 'Pesquisar títulos, categorias...',
    allStatus: 'Todos os status',
    published: 'Publicado',
    scheduled: 'Agendado',
    draft: 'Rascunho',
    status: 'Status',
    title: 'Título',
    category: 'Categoria',
    readTime: 'Tempo de leitura',
    actions: 'Ações',
    edit: 'Editar',
    delete: 'Excluir',
    revisions: 'Revisões',
    restore: 'Restaurar',
    preview: 'Prévia em tempo real',
    editorView: 'Modo Editor',
    savePost: 'Salvar Artigo',
    saving: 'Salvando...',
    deleteConfirmTitle: 'Confirmar Exclusão',
    deletePrompt: 'Digite o título exato para confirmar:',
    cancel: 'Cancelar',
    confirmDelete: 'Excluir definitivamente',
    relatedBook: 'Livro relacionado',
    selectBook: 'Selecionar livro (opcional)',
    coverImage: 'URL da capa',
    coverImageAlt: 'Texto alt da capa (Obrigatório)',
    seoTitle: 'Título SEO',
    seoDescription: 'Descrição SEO',
    publishDate: 'Data de publicação',
    insertImage: 'Inserir Imagem',
    imageUrl: 'URL da imagem',
    imageAlt: 'Texto alternativo (Obrigatório)',
    insert: 'Inserir',
  },
  it: {
    pageTitle: 'Giornale & Editoriale',
    pageSubtitle: 'Scrivi saggi, programma uscite e gestisci riflessioni letterarie.',
    demoNote: 'Modalità demo: Gli articoli sono memorizzati in questo browser.',
    newPost: 'Nuovo Articolo',
    searchPlaceholder: 'Cerca per titolo, categoria...',
    allStatus: 'Tutti gli stati',
    published: 'Pubblicato',
    scheduled: 'Programmato',
    draft: 'Bozza',
    status: 'Stato',
    title: 'Titolo',
    category: 'Categoria',
    readTime: 'Tempo di lettura',
    actions: 'Azioni',
    edit: 'Modifica',
    delete: 'Elimina',
    revisions: 'Revisioni',
    restore: 'Ripristina',
    preview: 'Anteprima dal vivo',
    editorView: 'Modalità Editor',
    savePost: 'Salva Articolo',
    saving: 'Salvataggio...',
    deleteConfirmTitle: 'Conferma eliminazione',
    deletePrompt: 'Digita il titolo esatto per confermare:',
    cancel: 'Annulla',
    confirmDelete: 'Elimina definitivamente',
    relatedBook: 'Libro correlato',
    selectBook: 'Seleziona libro (opzionale)',
    coverImage: 'URL copertina',
    coverImageAlt: 'Testo alt copertina (Obbligatorio)',
    seoTitle: 'Titolo SEO',
    seoDescription: 'Descrizione SEO',
    publishDate: 'Data di pubblicazione',
    insertImage: 'Inserisci immagine',
    imageUrl: 'URL immagine',
    imageAlt: 'Testo alternativo (Obbligatorio)',
    insert: 'Inserisci',
  },
  hi: {
    pageTitle: 'पत्रिका और संपादकीय',
    pageSubtitle: 'निबंध लिखें, पोस्ट शेड्यूल करें और साहित्यिक विचार प्रबंधित करें।',
    demoNote: 'डेमो मोड: जर्नल प्रविष्टियां केवल इसी ब्राउज़र में संग्रहीत हैं।',
    newPost: 'नई जर्नल प्रविष्टि',
    searchPlaceholder: 'शीर्षक या श्रेणी खोजें...',
    allStatus: 'सभी स्थितियाँ',
    published: 'प्रकाशित',
    scheduled: 'निर्धारित',
    draft: 'प्रारूप',
    status: 'स्थिति',
    title: 'शीर्षक',
    category: 'श्रेणी',
    readTime: 'पढ़ने का समय',
    actions: 'कार्रवाई',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    revisions: 'संशोधन',
    restore: 'पुनर्स्थापित करें',
    preview: 'लाइव पूर्वावलोकन',
    editorView: 'संपादक मोड',
    savePost: 'प्रविष्टि सहेजें',
    saving: 'सहेजा जा रहा है...',
    deleteConfirmTitle: 'हटाने की पुष्टि करें',
    deletePrompt: 'पुष्टि करने के लिए सटीक शीर्षक दर्ज करें:',
    cancel: 'रद्द करें',
    confirmDelete: 'स्थायी रूप से हटाएं',
    relatedBook: 'संबंधित पुस्तक',
    selectBook: 'पुस्तक चुनें (वैकल्पिक)',
    coverImage: 'कवर छवि URL',
    coverImageAlt: 'कवर ऑल्ट टेक्स्ट (अनिवार्य)',
    seoTitle: 'SEO शीर्षक',
    seoDescription: 'SEO विवरण',
    publishDate: 'प्रकाशन तिथि',
    insertImage: 'छवि डालें',
    imageUrl: 'छवि URL',
    imageAlt: 'ऑल्ट टेक्स्ट (अनिवार्य)',
    insert: 'डालें',
  },
  ml: {
    pageTitle: 'ജേണൽ & എഡിറ്റോറിയൽ',
    pageSubtitle: 'സാഹിത്യ ലേഖനങ്ങളും ചിന്തകളും തയ്യാറാക്കുക.',
    demoNote: 'ഡെമോ മോഡ്: ലേഖനങ്ങൾ ഈ ബ്രൗസറിൽ മാത്രമേ ലഭ്യമാകൂ.',
    newPost: 'പുതിയ ലേഖനം',
    searchPlaceholder: 'തലക്കെട്ടുകൾ തിരയുക...',
    allStatus: 'എല്ലാ നിലകളും',
    published: 'പ്രസിദ്ധീകരിച്ചത്',
    scheduled: 'ഷെഡ്യൂൾ ചെയ്തത്',
    draft: 'കരട്',
    status: 'നില',
    title: 'തലക്കെട്ട്',
    category: 'വിഭാഗം',
    readTime: 'വായനാ സമയം',
    actions: 'നടപടികൾ',
    edit: 'തിരുത്തുക',
    delete: 'നീക്കം ചെയ്യുക',
    revisions: 'പതിപ്പുകൾ',
    restore: 'പുനഃസ്ഥാപിക്കുക',
    preview: 'തത്സമയ പ്രിവ്യൂ',
    editorView: 'എഡിറ്റർ മോഡ്',
    savePost: 'സൂക്ഷിക്കുക',
    saving: 'സൂക്ഷിക്കുന്നു...',
    deleteConfirmTitle: 'സ്ഥിരീകരിക്കുക',
    deletePrompt: 'ശരിയായ തലക്കെട്ട് നൽകുക:',
    cancel: 'റദ്ദാക്കുക',
    confirmDelete: 'നീക്കം ചെയ്യുക',
    relatedBook: 'ബന്ധപ്പെട്ട പുസ്തകം',
    selectBook: 'പുസ്തകം തിരഞ്ഞെടുക്കുക',
    coverImage: 'കവർ ചിത്രം URL',
    coverImageAlt: 'കവർ ആൾട്ട് ടെക്സ്റ്റ് (നിർബന്ധം)',
    seoTitle: 'എസ്.ഇ.ഒ തലക്കെട്ട്',
    seoDescription: 'എസ്.ഇ.ഒ വിവരണം',
    publishDate: 'പ്രസിദ്ധീകരണ തീയതി',
    insertImage: 'ചിത്രം ചേർക്കുക',
    imageUrl: 'ചിത്രം URL',
    imageAlt: 'ആൾട്ട് ടെക്സ്റ്റ് (നിർബന്ധം)',
    insert: 'ചേർക്കുക',
  },
  ta: {
    pageTitle: 'பத்திரிகை & தலையங்கம்',
    pageSubtitle: 'கட்டுரைகள் எழுதி இலக்கியப் பதிவுகளை நிர்வகிக்கவும்.',
    demoNote: 'டெமோ பயன்முறை: பதிவுகள் இந்த உலாவியில் மட்டுமே சேமிக்கப்படும்.',
    newPost: 'புதிய பதிவு',
    searchPlaceholder: 'தலைப்புகள் அல்லது வகைகளைத் தேடவும்...',
    allStatus: 'அனைத்து நிலைகள்',
    published: 'வெளியிடப்பட்டது',
    scheduled: 'திட்டமிடப்பட்டது',
    draft: 'வரைவு',
    status: 'நிலை',
    title: 'தலைப்பு',
    category: 'வகை',
    readTime: 'வாசிக்கும் நேரம்',
    actions: 'செயல்கள்',
    edit: 'திருத்து',
    delete: 'நீக்கு',
    revisions: 'மறுபார்வைகள்',
    restore: 'மீட்டமை',
    preview: 'நேரலை முன்னோட்டம்',
    editorView: 'எடிட்டர் பயன்முறை',
    savePost: 'பதிவைச் சேமி',
    saving: 'சேமிக்கிறது...',
    deleteConfirmTitle: 'நீக்குதலை உறுதிப்படுத்தவும்',
    deletePrompt: 'உறுதிப்படுத்த சரியான தலைப்பை உள்ளிடவும்:',
    cancel: 'ரத்துசெய்',
    confirmDelete: 'நிரந்தரமாக நீக்கு',
    relatedBook: 'தொடர்புடைய புத்தகம்',
    selectBook: 'புத்தகத்தைத் தேர்வுசெய் (விருப்பமானது)',
    coverImage: 'அட்டைப் படம் URL',
    coverImageAlt: 'ஆல்ட் உரை (கட்டாயமானது)',
    seoTitle: 'SEO தலைப்பு',
    seoDescription: 'SEO விளக்கம்',
    publishDate: 'வெளியீட்டுத் தேதி',
    insertImage: 'படம் செருகு',
    imageUrl: 'படம் URL',
    imageAlt: 'ஆல்ட் உரை (கட்டாயமானது)',
    insert: 'செருகு',
  },
  ar: {
    pageTitle: 'المجلة والتحرير',
    pageSubtitle: 'كتابة المقالات وجدولة النشرات وإدارة التأملات الأدبية.',
    demoNote: 'الوضع التجريبي: المقالات محفوظة في متصفحك هذا فقط.',
    newPost: 'مقال جديد',
    searchPlaceholder: 'البحث في العناوين أو التصنيفات...',
    allStatus: 'جميع الحالات',
    published: 'منشور',
    scheduled: 'مجدول',
    draft: 'مسودة',
    status: 'الحالة',
    title: 'العنوان',
    category: 'التصنيف',
    readTime: 'وقت القراءة',
    actions: 'إجراءات',
    edit: 'تعديل',
    delete: 'حذف',
    revisions: 'المراجعات',
    restore: 'استعادة',
    preview: 'معاينة حية',
    editorView: 'وضع المحرر',
    savePost: 'حفظ المقال',
    saving: 'جاري الحفظ...',
    deleteConfirmTitle: 'تأكيد الحذف',
    deletePrompt: 'اكتب العنوان تمامًا للتأكيد:',
    cancel: 'إلغاء',
    confirmDelete: 'حذف نهائي',
    relatedBook: 'الكتاب المرتبط',
    selectBook: 'اختر كتابًا (اختياري)',
    coverImage: 'رابط صورة الغلاف',
    coverImageAlt: 'النص البديل للغلاف (مطلوب)',
    seoTitle: 'عنوان SEO',
    seoDescription: 'وصف SEO',
    publishDate: 'تاريخ النشر',
    insertImage: 'إدراج صورة',
    imageUrl: 'رابط الصورة',
    imageAlt: 'النص البديل للصورة (مطلوب)',
    insert: 'إدراج',
  },
  'zh-Hans': {
    pageTitle: '期刊与专栏',
    pageSubtitle: '撰写随笔、安排出版并管理文学反思。',
    demoNote: '演示模式：文章保存在本地浏览器存储中，仅在此浏览器可见。',
    newPost: '新建文章',
    searchPlaceholder: '搜索标题或分类...',
    allStatus: '所有状态',
    published: '已发布',
    scheduled: '已预定',
    draft: '草稿',
    status: '状态',
    title: '标题',
    category: '分类',
    readTime: '阅读时间',
    actions: '操作',
    edit: '编辑',
    delete: '删除',
    revisions: '修订历史',
    restore: '恢复',
    preview: '实时预览',
    editorView: '编辑模式',
    savePost: '保存文章',
    saving: '正在保存...',
    deleteConfirmTitle: '确认删除',
    deletePrompt: '输入完整标题以确认删除：',
    cancel: '取消',
    confirmDelete: '永久删除',
    relatedBook: '关联图书',
    selectBook: '选择图书（可选）',
    coverImage: '封面图片 URL',
    coverImageAlt: '封面替代文本（必填）',
    seoTitle: 'SEO 标题',
    seoDescription: 'SEO 描述',
    publishDate: '发布时间',
    insertImage: '插入图片',
    imageUrl: '图片 URL',
    imageAlt: '图片替代文本（必填）',
    insert: '插入',
  },
  ja: {
    pageTitle: 'ジャーナル＆エディトリアル',
    pageSubtitle: 'エッセイの執筆、公開予約、文学的な思索の管理。',
    demoNote: 'デモモード：記事はブラウザ内にのみ保存され、このブラウザでのみ閲覧可能です。',
    newPost: '新規記事作成',
    searchPlaceholder: 'タイトルやカテゴリーを検索...',
    allStatus: 'すべてのステータス',
    published: '公開中',
    scheduled: '公開予定',
    draft: '下書き',
    status: 'ステータス',
    title: 'タイトル',
    category: 'カテゴリー',
    readTime: '読了時間',
    actions: '操作',
    edit: '編集',
    delete: '削除',
    revisions: 'リビジョン履歴',
    restore: '復元',
    preview: 'ライブプレビュー',
    editorView: 'エディターモード',
    savePost: '記事を保存',
    saving: '保存中...',
    deleteConfirmTitle: '削除の確認',
    deletePrompt: '確認のため正確なタイトルを入力してください:',
    cancel: 'キャンセル',
    confirmDelete: '完全に削除',
    relatedBook: '関連書籍',
    selectBook: '書籍を選択（任意）',
    coverImage: 'カバー画像 URL',
    coverImageAlt: 'カバー画像の代替テキスト（必須）',
    seoTitle: 'SEO タイトル',
    seoDescription: 'SEO メタ説明',
    publishDate: '公開日時',
    insertImage: '画像を挿入',
    imageUrl: '画像 URL',
    imageAlt: '画像の代替テキスト（必須）',
    insert: '挿入',
  },
  ko: {
    pageTitle: '저널 및 에디토리얼',
    pageSubtitle: '에세이 작성, 발행 예약 및 문학적 사유 관리.',
    demoNote: '데모 모드: 글은 브라우저 로컬 저장소에 저장되며 이 브라우저에서만 보입니다.',
    newPost: '새 글 작성',
    searchPlaceholder: '제목 또는 카테고리 검색...',
    allStatus: '모든 상태',
    published: '발행됨',
    scheduled: '예약됨',
    draft: '임시저장',
    status: '상태',
    title: '제목',
    category: '카테고리',
    readTime: '읽기 시간',
    actions: '작업',
    edit: '수정',
    delete: '삭제',
    revisions: '수정 이력',
    restore: '복원',
    preview: '실시간 미리보기',
    editorView: '에디터 모드',
    savePost: '글 저장',
    saving: '저장 중...',
    deleteConfirmTitle: '삭제 확인',
    deletePrompt: '삭제를 확인하려면 정확한 제목을 입력하세요:',
    cancel: '취소',
    confirmDelete: '영구 삭제',
    relatedBook: '관련 도서',
    selectBook: '도서 선택 (선택 사항)',
    coverImage: '표지 이미지 URL',
    coverImageAlt: '표지 대체 텍스트 (필수)',
    seoTitle: 'SEO 제목',
    seoDescription: 'SEO 설명',
    publishDate: '발행 일시',
    insertImage: '이미지 삽입',
    imageUrl: '이미지 URL',
    imageAlt: '대체 텍스트 (필수)',
    insert: '삽입',
  },
  ru: {
    pageTitle: 'Журнал и редакция',
    pageSubtitle: 'Создание эссе, планирование публикаций и литературные заметки.',
    demoNote: 'Демо-режим: Статьи сохраняются локально в этом браузере.',
    newPost: 'Новая статья',
    searchPlaceholder: 'Поиск по заголовкам или категориям...',
    allStatus: 'Все статусы',
    published: 'Опубликовано',
    scheduled: 'Запланировано',
    draft: 'Черновик',
    status: 'Статус',
    title: 'Заголовок',
    category: 'Категория',
    readTime: 'Время чтения',
    actions: 'Действия',
    edit: 'Редактировать',
    delete: 'Удалить',
    revisions: 'История версий',
    restore: 'Восстановить',
    preview: 'Предпросмотр',
    editorView: 'Редактор',
    savePost: 'Сохранить',
    saving: 'Сохранение...',
    deleteConfirmTitle: 'Подтверждение удаления',
    deletePrompt: 'Введите точный заголовок для подтверждения:',
    cancel: 'Отмена',
    confirmDelete: 'Удалить навсегда',
    relatedBook: 'Связанная книга',
    selectBook: 'Выберите книгу (необязательно)',
    coverImage: 'URL обложки',
    coverImageAlt: 'Alt-текст обложки (Обязательно)',
    seoTitle: 'SEO заголовок',
    seoDescription: 'SEO описание',
    publishDate: 'Дата публикации',
    insertImage: 'Вставить изображение',
    imageUrl: 'URL изображения',
    imageAlt: 'Alt-текст изображения (Обязательно)',
    insert: 'Вставить',
  },
};

export default function AdminJournalPage() {
  const { language } = useLanguage();
  const t = useMemo(() => JOURNAL_I18N[language] || JOURNAL_I18N.en, [language]);

  const [posts, setPosts] = useState<JournalPostRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [searchQuery, setSearchQuery] = useState('');

  // Mode: 'list' | 'editor'
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [isPreview, setIsPreview] = useState(false);

  // Form State
  const [postId, setPostId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Reflections');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverImageAlt, setCoverImageAlt] = useState('');
  const [relatedBookSlug, setRelatedBookSlug] = useState('');
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'published'>('draft');
  const [publishDate, setPublishDate] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [revisions, setRevisions] = useState<JournalPostRecord['revisions']>([]);

  // Dialogs & Feedback
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [modalImageAlt, setModalImageAlt] = useState('');
  const [modalImageError, setModalImageError] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<JournalPostRecord | null>(null);
  const [typedTitleConfirmation, setTypedTitleConfirmation] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'journal-editor-link',
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'journal-editor-image',
        },
      }),
    ],
    content: '<p>Begin drafting your essay or quiet thoughts here...</p>',
    immediatelyRender: false,
  });

  const loadPosts = useCallback(() => {
    const list = getAdminJournalPosts({
      status: statusFilter,
      search: searchQuery,
    });
    setPosts(list);
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadPosts();
    const handleUpdate = () => loadPosts();
    window.addEventListener('ann_journal_updated', handleUpdate);
    return () => window.removeEventListener('ann_journal_updated', handleUpdate);
  }, [loadPosts]);

  // Reading time live computation
  const currentHtml = editor ? editor.getHTML() : '';
  const liveReadingTime = useMemo(() => calculateReadingTime(currentHtml), [currentHtml]);

  const handleOpenNew = () => {
    setPostId(undefined);
    setTitle('');
    setSubtitle('');
    setCategory('Reflections');
    setExcerpt('');
    setCoverImage('');
    setCoverImageAlt('');
    setRelatedBookSlug('');
    setStatus('draft');
    setPublishDate('');
    setSeoTitle('');
    setSeoDescription('');
    setRevisions([]);
    setErrorMsg('');
    setSuccessMsg('');
    setIsPreview(false);
    if (editor) {
      editor.commands.setContent('<p></p>');
    }
    setViewMode('editor');
  };

  const handleOpenEdit = (post: JournalPostRecord) => {
    setPostId(post.id);
    setTitle(post.title);
    setSubtitle(post.subtitle || '');
    setCategory(post.category || 'Reflections');
    setExcerpt(post.excerpt || '');
    setCoverImage(post.coverImage || '');
    setCoverImageAlt(post.coverImageAlt || '');
    setRelatedBookSlug(post.relatedBookSlug || '');
    setStatus(post.status);
    setPublishDate(post.publishDate ? post.publishDate.substring(0, 16) : '');
    setSeoTitle(post.seoTitle || '');
    setSeoDescription(post.seoDescription || '');
    setRevisions(post.revisions || []);
    setErrorMsg('');
    setSuccessMsg('');
    setIsPreview(false);
    if (editor) {
      editor.commands.setContent(post.contentHtml || '<p></p>');
    }
    setViewMode('editor');
  };

  const handleInsertImage = () => {
    setModalImageError('');
    if (!modalImageUrl.trim()) {
      setModalImageError('Image URL is required.');
      return;
    }
    if (!modalImageAlt.trim()) {
      setModalImageError('Image Alt Text is strictly required before inserting.');
      return;
    }
    if (editor) {
      editor.chain().focus().setImage({ src: modalImageUrl.trim(), alt: modalImageAlt.trim() }).run();
    }
    setImageModalOpen(false);
    setModalImageUrl('');
    setModalImageAlt('');
  };

  const handleSave = () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!editor) return;

    if (!title.trim() || title.trim().length < 3) {
      setErrorMsg('Title must be at least 3 characters.');
      return;
    }

    if (coverImage.trim() && !coverImageAlt.trim()) {
      setErrorMsg('Cover image alt text is required when a cover image URL is supplied.');
      return;
    }

    const htmlContent = editor.getHTML();
    if (!htmlContent.trim() || htmlContent === '<p></p>') {
      setErrorMsg('Article content cannot be empty.');
      return;
    }

    setIsSaving(true);
    const relatedBook = books.find((b) => b.slug === relatedBookSlug);

    const res = saveAdminJournalPost({
      id: postId,
      title: title.trim(),
      subtitle: subtitle.trim(),
      category: category.trim(),
      excerpt: excerpt.trim(),
      contentHtml: htmlContent,
      coverImage: coverImage.trim() || undefined,
      coverImageAlt: coverImageAlt.trim() || undefined,
      relatedBookSlug: relatedBookSlug || undefined,
      relatedBookTitle: relatedBook?.title || undefined,
      status,
      publishDate: publishDate ? new Date(publishDate).toISOString() : undefined,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
    });

    setIsSaving(false);
    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }

    setPostId(res.post.id);
    setRevisions(res.post.revisions);
    setSuccessMsg('Journal entry saved successfully!');
    loadPosts();
  };

  const handleRestoreRevision = (revisionNumber: number) => {
    if (!postId) return;
    setErrorMsg('');
    const res = restoreAdminJournalRevision(postId, revisionNumber);
    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }
    setTitle(res.post.title);
    setSubtitle(res.post.subtitle);
    setCategory(res.post.category);
    setCoverImage(res.post.coverImage || '');
    setCoverImageAlt(res.post.coverImageAlt || '');
    setRevisions(res.post.revisions);
    if (editor) {
      editor.commands.setContent(res.post.contentHtml);
    }
    setSuccessMsg(`Restored Revision #${revisionNumber} successfully!`);
    loadPosts();
  };

  const handleDeletePost = () => {
    if (!postToDelete) return;
    const res = deleteAdminJournalPost(postToDelete.id, typedTitleConfirmation);
    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }
    setDeleteModalOpen(false);
    setPostToDelete(null);
    setTypedTitleConfirmation('');
    loadPosts();
  };

  return (
    <div className="admin-page-container" style={{ padding: '24px 32px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '28px',
              color: 'var(--ink)',
              margin: '0 0 6px',
            }}
          >
            {t.pageTitle}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
            {t.pageSubtitle}
          </p>
        </div>

        {viewMode === 'list' ? (
          <button
            type="button"
            data-testid="btn-create-post"
            disabled={!mounted}
            onClick={handleOpenNew}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--wine)',
              color: '#fff',
              border: '0',
              padding: '10px 18px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            <Plus size={16} aria-hidden="true" />
            <span>{t.newPost}</span>
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              data-testid="btn-back-to-list"
              onClick={() => {
                setViewMode('list');
                loadPosts();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--white)',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                padding: '8px 14px',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Back to List</span>
            </button>

            <button
              type="button"
              data-testid="btn-toggle-preview"
              onClick={() => setIsPreview(!isPreview)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: isPreview ? 'var(--ink)' : 'var(--white)',
                border: '1px solid var(--line)',
                color: isPreview ? '#fff' : 'var(--ink)',
                padding: '8px 14px',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              {isPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              <span>{isPreview ? t.editorView : t.preview}</span>
            </button>

            <button
              type="button"
              data-testid="btn-save-post"
              disabled={isSaving}
              onClick={handleSave}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--wine)',
                color: '#fff',
                border: '0',
                padding: '10px 20px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              <CheckCircle size={16} aria-hidden="true" />
              <span>{isSaving ? t.saving : t.savePost}</span>
            </button>
          </div>
        )}
      </div>

      {/* Demo Notice Banner */}
      <div
        data-testid="journal-demo-notice"
        style={{
          background: 'rgba(126, 51, 70, 0.06)',
          border: '1px solid rgba(126, 51, 70, 0.2)',
          borderRadius: '4px',
          padding: '10px 14px',
          fontSize: '13px',
          color: 'var(--ink)',
          marginBottom: '20px',
        }}
      >
        {t.demoNote}
      </div>

      {/* Global Alerts */}
      {errorMsg && (
        <div
          role="alert"
          data-testid="admin-journal-error"
          style={{
            background: 'rgba(185, 28, 28, 0.08)',
            border: '1px solid #b91c1c',
            color: '#b91c1c',
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
          }}
        >
          <AlertCircle size={18} aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          data-testid="admin-journal-success"
          style={{
            background: '#ecfdf5',
            border: '1px solid #059669',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
          }}
        >
          <CheckCircle size={18} aria-hidden="true" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* VIEW: LIST */}
      {viewMode === 'list' && (
        <div>
          {/* Filter & Search Bar */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
              <Search
                size={16}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted)',
                }}
              />
              <input
                type="text"
                data-testid="input-journal-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  paddingLeft: '38px',
                  paddingRight: '14px',
                  borderRadius: '4px',
                  border: '1px solid var(--line)',
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} style={{ color: 'var(--muted)' }} />
              <select
                data-testid="select-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  minHeight: '44px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--line)',
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  fontSize: '14px',
                }}
              >
                <option value="all">{t.allStatus}</option>
                <option value="published">{t.published}</option>
                <option value="scheduled">{t.scheduled}</option>
                <option value="draft">{t.draft}</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: '6px',
              overflow: 'hidden',
              background: 'var(--white)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t.title}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t.status}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t.category}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t.readTime}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t.revisions}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>
                      No journal entries found.
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr
                      key={post.id}
                      data-testid={`journal-row-${post.slug}`}
                      style={{ borderBottom: '1px solid var(--line)' }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <strong>{post.title}</strong>
                        {post.subtitle && (
                          <span style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                            {post.subtitle}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          data-testid={`post-status-${post.status}`}
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            background:
                              post.status === 'published'
                                ? '#ecfdf5'
                                : post.status === 'scheduled'
                                ? '#fef3c7'
                                : '#f3f4f6',
                            color:
                              post.status === 'published'
                                ? '#065f46'
                                : post.status === 'scheduled'
                                ? '#92400e'
                                : '#4b5563',
                          }}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>{post.category}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>{post.readTime}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>
                        {post.revisions?.length || 1}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            data-testid={`btn-edit-${post.slug}`}
                            onClick={() => handleOpenEdit(post)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: '1px solid var(--line)',
                              background: 'transparent',
                              cursor: 'pointer',
                              minHeight: '44px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '13px',
                            }}
                          >
                            <Edit3 size={14} />
                            <span>{t.edit}</span>
                          </button>
                          <button
                            type="button"
                            data-testid={`btn-delete-${post.slug}`}
                            onClick={() => {
                              setPostToDelete(post);
                              setTypedTitleConfirmation('');
                              setDeleteModalOpen(true);
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: '1px solid rgba(185, 28, 28, 0.3)',
                              color: '#b91c1c',
                              background: 'transparent',
                              cursor: 'pointer',
                              minHeight: '44px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '13px',
                            }}
                          >
                            <Trash2 size={14} />
                            <span>{t.delete}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: EDITOR & PREVIEW */}
      {viewMode === 'editor' && (
        <div>
          {isPreview ? (
            /* Live Storefront Preview (matching public journal styles) */
            <div
              data-testid="journal-live-preview"
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '48px 32px',
                maxWidth: '800px',
                margin: '0 auto',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  color: 'var(--muted)',
                  marginBottom: '16px',
                }}
              >
                <span
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                    color: 'var(--wine)',
                  }}
                >
                  {category}
                </span>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} /> {publishDate ? new Date(publishDate).toLocaleDateString() : 'Draft date'}
                </span>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> {liveReadingTime}
                </span>
              </div>

              <h1
                data-testid="preview-title"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '44px',
                  lineHeight: 1.15,
                  margin: '0 0 16px',
                  color: 'var(--ink)',
                }}
              >
                {title || 'Untitled Essay'}
              </h1>

              {subtitle && (
                <p
                  style={{
                    fontSize: '18px',
                    fontStyle: 'italic',
                    color: 'var(--muted)',
                    margin: '0 0 32px',
                    borderBottom: '1px solid var(--line)',
                    paddingBottom: '20px',
                  }}
                >
                  {subtitle}
                </p>
              )}

              {coverImage && (
                <div style={{ margin: '24px 0' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt={coverImageAlt || title}
                    style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  {coverImageAlt && (
                    <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginTop: '4px' }}>
                      {coverImageAlt}
                    </span>
                  )}
                </div>
              )}

              <div
                data-testid="preview-content"
                className="journal-preview-body"
                style={{ fontSize: '18px', lineHeight: 1.85, color: 'var(--ink)' }}
                dangerouslySetInnerHTML={{ __html: currentHtml }}
              />

              {relatedBookSlug && (
                <div
                  style={{
                    marginTop: '40px',
                    padding: '24px',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    background: 'var(--white)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <BookOpen size={24} style={{ color: 'var(--wine)' }} />
                  <div>
                    <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                      Related Book Catalogue Entry
                    </span>
                    <strong style={{ display: 'block', fontSize: '16px' }}>
                      {books.find((b) => b.slug === relatedBookSlug)?.title || relatedBookSlug}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Main Form + TipTap Rich Text Editor */
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              {/* Left Column: Editor & Main Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label htmlFor="post-title" style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                    {t.title} *
                  </label>
                  <input
                    id="post-title"
                    data-testid="input-post-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter essay title"
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid var(--line)',
                      fontSize: '16px',
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="post-subtitle" style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                    Subtitle / Excerpt Summary
                  </label>
                  <input
                    id="post-subtitle"
                    data-testid="input-post-subtitle"
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Brief poetic subtitle..."
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid var(--line)',
                      fontSize: '14px',
                    }}
                  />
                </div>

                {/* TipTap Rich Editor Panel */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                    Essay Content * (Rich Text)
                  </label>

                  {/* Toolbar */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                      padding: '8px',
                      background: 'var(--paper)',
                      border: '1px solid var(--line)',
                      borderBottom: '0',
                      borderRadius: '4px 4px 0 0',
                    }}
                  >
                    <button
                      type="button"
                      data-testid="editor-bold"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      style={{
                        padding: '6px 10px',
                        background: editor?.isActive('bold') ? 'var(--line)' : 'transparent',
                        border: '0',
                        cursor: 'pointer',
                        borderRadius: '3px',
                      }}
                      title="Bold"
                    >
                      <Bold size={16} />
                    </button>
                    <button
                      type="button"
                      data-testid="editor-italic"
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      style={{
                        padding: '6px 10px',
                        background: editor?.isActive('italic') ? 'var(--line)' : 'transparent',
                        border: '0',
                        cursor: 'pointer',
                        borderRadius: '3px',
                      }}
                      title="Italic"
                    >
                      <Italic size={16} />
                    </button>
                    <button
                      type="button"
                      data-testid="editor-h1"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                      style={{
                        padding: '6px 10px',
                        background: editor?.isActive('heading', { level: 1 }) ? 'var(--line)' : 'transparent',
                        border: '0',
                        cursor: 'pointer',
                        borderRadius: '3px',
                      }}
                      title="Heading 1"
                    >
                      <Heading1 size={16} />
                    </button>
                    <button
                      type="button"
                      data-testid="editor-h2"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                      style={{
                        padding: '6px 10px',
                        background: editor?.isActive('heading', { level: 2 }) ? 'var(--line)' : 'transparent',
                        border: '0',
                        cursor: 'pointer',
                        borderRadius: '3px',
                      }}
                      title="Heading 2"
                    >
                      <Heading2 size={16} />
                    </button>
                    <button
                      type="button"
                      data-testid="editor-h3"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                      style={{
                        padding: '6px 10px',
                        background: editor?.isActive('heading', { level: 3 }) ? 'var(--line)' : 'transparent',
                        border: '0',
                        cursor: 'pointer',
                        borderRadius: '3px',
                      }}
                      title="Heading 3"
                    >
                      <Heading3 size={16} />
                    </button>
                    <button
                      type="button"
                      data-testid="editor-bullet-list"
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      style={{
                        padding: '6px 10px',
                        background: editor?.isActive('bulletList') ? 'var(--line)' : 'transparent',
                        border: '0',
                        cursor: 'pointer',
                        borderRadius: '3px',
                      }}
                      title="Bullet List"
                    >
                      <List size={16} />
                    </button>
                    <button
                      type="button"
                      data-testid="editor-ordered-list"
                      onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                      style={{
                        padding: '6px 10px',
                        background: editor?.isActive('orderedList') ? 'var(--line)' : 'transparent',
                        border: '0',
                        cursor: 'pointer',
                        borderRadius: '3px',
                      }}
                      title="Numbered List"
                    >
                      <ListOrdered size={16} />
                    </button>
                    <button
                      type="button"
                      data-testid="editor-quote"
                      onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                      style={{
                        padding: '6px 10px',
                        background: editor?.isActive('blockquote') ? 'var(--line)' : 'transparent',
                        border: '0',
                        cursor: 'pointer',
                        borderRadius: '3px',
                      }}
                      title="Blockquote"
                    >
                      <Quote size={16} />
                    </button>
                    <button
                      type="button"
                      data-testid="editor-link"
                      onClick={() => {
                        const previousUrl = editor?.getAttributes('link').href;
                        const url = window.prompt('Enter Link URL:', previousUrl);
                        if (url === null) return;
                        if (url === '') {
                          editor?.chain().focus().extendMarkRange('link').unsetLink().run();
                          return;
                        }
                        editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                      }}
                      style={{
                        padding: '6px 10px',
                        background: editor?.isActive('link') ? 'var(--line)' : 'transparent',
                        border: '0',
                        cursor: 'pointer',
                        borderRadius: '3px',
                      }}
                      title="Add Link"
                    >
                      <LinkIcon size={16} />
                    </button>
                    <button
                      type="button"
                      data-testid="editor-btn-image"
                      onClick={() => {
                        setModalImageUrl('');
                        setModalImageAlt('');
                        setModalImageError('');
                        setImageModalOpen(true);
                      }}
                      style={{
                        padding: '6px 10px',
                        background: 'transparent',
                        border: '0',
                        cursor: 'pointer',
                        borderRadius: '3px',
                        color: 'var(--wine)',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Insert Image (Alt Required)"
                    >
                      <ImageIcon size={16} />
                      <span style={{ fontSize: '13px' }}>Image</span>
                    </button>
                  </div>

                  {/* TipTap Editor Surface */}
                  <div
                    data-testid="tiptap-editor-surface"
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: '0 0 4px 4px',
                      padding: '16px',
                      minHeight: '260px',
                      background: 'var(--white)',
                    }}
                  >
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>

              {/* Right Column: Metadata, Revisions & Publishing */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Status & Publication Box */}
                <div
                  style={{
                    padding: '20px',
                    background: 'var(--white)',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                  }}
                >
                  <h3 style={{ margin: '0 0 14px', fontSize: '16px' }}>Publishing Settings</h3>

                  <div style={{ marginBottom: '14px' }}>
                    <label htmlFor="post-status" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                      Status
                    </label>
                    <select
                      id="post-status"
                      data-testid="select-post-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'draft' | 'scheduled' | 'published')}
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid var(--line)',
                      }}
                    >
                      <option value="draft">Draft (Hidden from public /journal)</option>
                      <option value="scheduled">Scheduled (Visible upon publish date)</option>
                      <option value="published">Published (Live now)</option>
                    </select>
                  </div>

                  {status === 'scheduled' && (
                    <div style={{ marginBottom: '14px' }}>
                      <label htmlFor="post-publish-date" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                        {t.publishDate}
                      </label>
                      <input
                        id="post-publish-date"
                        data-testid="input-publish-date"
                        type="datetime-local"
                        value={publishDate}
                        onChange={(e) => setPublishDate(e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: '44px',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          border: '1px solid var(--line)',
                        }}
                      />
                    </div>
                  )}

                  <div style={{ marginBottom: '14px' }}>
                    <label htmlFor="post-category" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                      {t.category}
                    </label>
                    <input
                      id="post-category"
                      data-testid="input-post-category"
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Reflections, Epistolary"
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid var(--line)',
                      }}
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block' }}>
                      Auto Reading Time: <strong>{liveReadingTime}</strong>
                    </span>
                  </div>
                </div>

                {/* Cover Image & Catalogue Book */}
                <div
                  style={{
                    padding: '20px',
                    background: 'var(--white)',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                  }}
                >
                  <h3 style={{ margin: '0 0 14px', fontSize: '16px' }}>Media & Connections</h3>

                  <div style={{ marginBottom: '12px' }}>
                    <label htmlFor="post-cover-image" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                      {t.coverImage}
                    </label>
                    <input
                      id="post-cover-image"
                      data-testid="input-cover-image"
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid var(--line)',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label htmlFor="post-cover-alt" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                      {t.coverImageAlt}
                    </label>
                    <input
                      id="post-cover-alt"
                      data-testid="input-cover-alt"
                      type="text"
                      value={coverImageAlt}
                      onChange={(e) => setCoverImageAlt(e.target.value)}
                      placeholder="Descriptive alt text for accessibility"
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid var(--line)',
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="post-related-book" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                      {t.relatedBook}
                    </label>
                    <select
                      id="post-related-book"
                      data-testid="select-related-book"
                      value={relatedBookSlug}
                      onChange={(e) => setRelatedBookSlug(e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid var(--line)',
                      }}
                    >
                      <option value="">{t.selectBook}</option>
                      {books.map((b) => (
                        <option key={b.slug} value={b.slug}>
                          {b.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SEO Meta */}
                <div
                  style={{
                    padding: '20px',
                    background: 'var(--white)',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                  }}
                >
                  <h3 style={{ margin: '0 0 14px', fontSize: '16px' }}>SEO Metadata</h3>
                  <div style={{ marginBottom: '12px' }}>
                    <label htmlFor="post-seo-title" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                      {t.seoTitle}
                    </label>
                    <input
                      id="post-seo-title"
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Custom browser page title"
                      style={{ width: '100%', minHeight: '44px', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--line)' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="post-seo-desc" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                      {t.seoDescription}
                    </label>
                    <textarea
                      id="post-seo-desc"
                      rows={3}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Meta search engine description"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--line)' }}
                    />
                  </div>
                </div>

                {/* Revisions History (Last 10 Revisions) */}
                <div
                  data-testid="revisions-history-panel"
                  style={{
                    padding: '20px',
                    background: 'var(--white)',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <History size={18} style={{ color: 'var(--wine)' }} />
                    <h3 style={{ margin: 0, fontSize: '16px' }}>{t.revisions} (Last 10)</h3>
                  </div>

                  {revisions.length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                      No prior revisions saved yet.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {revisions.map((rev) => (
                        <div
                          key={rev.id}
                          data-testid={`revision-item-${rev.revisionNumber}`}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: 'var(--paper)',
                            borderRadius: '4px',
                            fontSize: '13px',
                          }}
                        >
                          <div>
                            <strong>Rev #{rev.revisionNumber}</strong>
                            <span style={{ display: 'block', color: 'var(--muted)', fontSize: '11px' }}>
                              {new Date(rev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <button
                            type="button"
                            data-testid={`btn-restore-rev-${rev.revisionNumber}`}
                            onClick={() => handleRestoreRevision(rev.revisionNumber)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 10px',
                              background: 'var(--white)',
                              border: '1px solid var(--line)',
                              borderRadius: '3px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              minHeight: '44px',
                            }}
                          >
                            <RotateCcw size={12} />
                            <span>{t.restore}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Insert Image (Alt Text Required) */}
      {imageModalOpen && (
        <div
          data-testid="modal-insert-image"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: '18px' }}>{t.insertImage}</h3>

            {modalImageError && (
              <p
                role="alert"
                data-testid="modal-image-error"
                style={{
                  background: 'rgba(185, 28, 28, 0.08)',
                  color: '#b91c1c',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  marginBottom: '12px',
                }}
              >
                {modalImageError}
              </p>
            )}

            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="modal-image-url" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                {t.imageUrl} *
              </label>
              <input
                id="modal-image-url"
                data-testid="input-modal-image-url"
                type="text"
                value={modalImageUrl}
                onChange={(e) => setModalImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                style={{ width: '100%', minHeight: '44px', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--line)' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="modal-image-alt" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                {t.imageAlt} *
              </label>
              <input
                id="modal-image-alt"
                data-testid="input-modal-image-alt"
                type="text"
                value={modalImageAlt}
                onChange={(e) => setModalImageAlt(e.target.value)}
                placeholder="Describe image content for accessibility"
                style={{ width: '100%', minHeight: '44px', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--line)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                style={{
                  padding: '8px 14px',
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                data-testid="btn-confirm-insert-image"
                onClick={handleInsertImage}
                style={{
                  padding: '8px 16px',
                  background: 'var(--wine)',
                  color: '#fff',
                  border: '0',
                  borderRadius: '4px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                {t.insert}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation (Type Title) */}
      {deleteModalOpen && postToDelete && (
        <div
          data-testid="modal-delete-confirm"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              padding: '28px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: '18px', color: '#b91c1c' }}>
              {t.deleteConfirmTitle}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--ink)', marginBottom: '14px', lineHeight: 1.5 }}>
              This will permanently delete the post <strong>&ldquo;{postToDelete.title}&rdquo;</strong> and all its revision history.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '8px' }}>
              {t.deletePrompt}
            </p>
            <input
              type="text"
              data-testid="input-delete-title-confirm"
              value={typedTitleConfirmation}
              onChange={(e) => setTypedTitleConfirmation(e.target.value)}
              placeholder={postToDelete.title}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid var(--line)',
                marginBottom: '20px',
                fontSize: '14px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setPostToDelete(null);
                  setTypedTitleConfirmation('');
                }}
                style={{
                  padding: '8px 14px',
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                data-testid="btn-confirm-delete"
                disabled={typedTitleConfirmation.trim() !== postToDelete.title.trim()}
                onClick={handleDeletePost}
                style={{
                  padding: '8px 18px',
                  background:
                    typedTitleConfirmation.trim() === postToDelete.title.trim()
                      ? '#b91c1c'
                      : 'rgba(185, 28, 28, 0.4)',
                  color: '#fff',
                  border: '0',
                  borderRadius: '4px',
                  fontWeight: 600,
                  cursor:
                    typedTitleConfirmation.trim() === postToDelete.title.trim()
                      ? 'pointer'
                      : 'not-allowed',
                  minHeight: '44px',
                }}
              >
                {t.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
