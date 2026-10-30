'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  GripVertical,
  CheckCircle,
  AlertCircle,
  Quote,
} from 'lucide-react';
import { getAdminService } from '@/lib/admin/service-factory';
import { DemoAdminService } from '@/lib/admin/demo-admin-service';
import type { ThoughtRecord } from '@/lib/admin/admin-service';
import { useLanguage } from '@/contexts/language-context';

const THOUGHTS_I18N: Record<string, Record<string, string>> = {
  en: {
    pageTitle: 'Thoughts & Quotes',
    pageSubtitle: 'Curate short author notes, stationery reflections, and memorable pull quotes.',
    demoNotice: 'Demo Mode: Thoughts are stored in browser demo storage and visible only in this browser.',
    newThought: 'New Thought',
    editThought: 'Edit Thought',
    content: 'Thought or Quote Content',
    contentPlaceholder: 'Enter a reflection or memorable sentence...',
    attribution: 'Attribution (Optional)',
    attributionPlaceholder: 'e.g. Ann · From The Quiet Hours',
    status: 'Status',
    published: 'Published',
    draft: 'Draft',
    order: 'Order',
    actions: 'Actions',
    save: 'Save Thought',
    cancel: 'Cancel',
    moveUp: 'Move Up',
    moveDown: 'Move Down',
    publish: 'Publish',
    unpublish: 'Unpublish',
    delete: 'Delete',
    deleteModalTitle: 'Delete Thought',
    deletePrompt: 'To confirm permanent deletion, type DELETE below:',
    confirmDelete: 'Confirm Delete',
    noThoughts: 'No thoughts found. Click "New Thought" to create one.',
    savedSuccess: 'Thought saved successfully.',
    deleteSuccess: 'Thought deleted successfully.',
    reorderSuccess: 'Thoughts reordered successfully.',
  },
  es: {
    pageTitle: 'Pensamientos y Citas',
    pageSubtitle: 'Organice notas breves de autor, reflexiones y citas memorables.',
    demoNotice: 'Modo demostración: Las notas se guardan en el almacenamiento local de este navegador.',
    newThought: 'Nuevo Pensamiento',
    editThought: 'Editar Pensamiento',
    content: 'Contenido de la cita o nota',
    contentPlaceholder: 'Escriba una reflexión...',
    attribution: 'Atribución (Opcional)',
    attributionPlaceholder: 'p. ej. Ann · De Las Horas Silenciosas',
    status: 'Estado',
    published: 'Publicado',
    draft: 'Borrador',
    order: 'Orden',
    actions: 'Acciones',
    save: 'Guardar',
    cancel: 'Cancelar',
    moveUp: 'Subir',
    moveDown: 'Bajar',
    publish: 'Publicar',
    unpublish: 'Despublicar',
    delete: 'Eliminar',
    deleteModalTitle: 'Eliminar Pensamiento',
    deletePrompt: 'Para confirmar la eliminación, escriba DELETE a continuación:',
    confirmDelete: 'Confirmar Eliminación',
    noThoughts: 'No se encontraron pensamientos. Haga clic en "Nuevo Pensamiento".',
    savedSuccess: 'Guardado correctamente.',
    deleteSuccess: 'Eliminado correctamente.',
    reorderSuccess: 'Reordenado correctamente.',
  },
  fr: {
    pageTitle: 'Pensées & Citations',
    pageSubtitle: 'Gérez de courtes notes d’auteur, des réflexions et des citations mémorables.',
    demoNotice: 'Mode démo : Les pensées sont enregistrées localement dans ce navigateur.',
    newThought: 'Nouvelle Pensée',
    editThought: 'Modifier la Pensée',
    content: 'Contenu de la pensée ou citation',
    contentPlaceholder: 'Saisissez une réflexion...',
    attribution: 'Attribution (Optionnel)',
    attributionPlaceholder: 'ex. Ann · Des Heures Calmes',
    status: 'Statut',
    published: 'Publié',
    draft: 'Brouillon',
    order: 'Ordre',
    actions: 'Actions',
    save: 'Enregistrer',
    cancel: 'Annuler',
    moveUp: 'Monter',
    moveDown: 'Descendre',
    publish: 'Publier',
    unpublish: 'Dépublier',
    delete: 'Supprimer',
    deleteModalTitle: 'Supprimer la Pensée',
    deletePrompt: 'Pour confirmer la suppression, tapez DELETE ci-dessous :',
    confirmDelete: 'Confirmer la suppression',
    noThoughts: 'Aucune pensée trouvée.',
    savedSuccess: 'Enregistré avec succès.',
    deleteSuccess: 'Supprimé avec succès.',
    reorderSuccess: 'Réordonné avec succès.',
  },
  de: {
    pageTitle: 'Gedanken & Zitate',
    pageSubtitle: 'Kurze Autorenhinweise, Reflexionen und Zitate verwalten.',
    demoNotice: 'Demo-Modus: Gedanken werden im lokalen Speicher dieses Browsers gesichert.',
    newThought: 'Neuer Gedanke',
    editThought: 'Gedanke bearbeiten',
    content: 'Inhalt des Zitats oder Gedankens',
    contentPlaceholder: 'Reflexion eingeben...',
    attribution: 'Zuordnung (Optional)',
    attributionPlaceholder: 'z. B. Ann · Aus The Quiet Hours',
    status: 'Status',
    published: 'Veröffentlicht',
    draft: 'Entwurf',
    order: 'Reihenfolge',
    actions: 'Aktionen',
    save: 'Speichern',
    cancel: 'Abbrechen',
    moveUp: 'Nach oben',
    moveDown: 'Nach unten',
    publish: 'Veröffentlichen',
    unpublish: 'Zurückziehen',
    delete: 'Löschen',
    deleteModalTitle: 'Gedanke löschen',
    deletePrompt: 'Geben Sie DELETE ein, um das Löschen zu bestätigen:',
    confirmDelete: 'Löschen bestätigen',
    noThoughts: 'Keine Gedanken vorhanden.',
    savedSuccess: 'Erfolgreich gespeichert.',
    deleteSuccess: 'Erfolgreich gelöscht.',
    reorderSuccess: 'Reihenfolge aktualisiert.',
  },
  'pt-BR': {
    pageTitle: 'Pensamentos & Citações',
    pageSubtitle: 'Organize pequenas notas do autor e citações memoráveis.',
    demoNotice: 'Modo de demonstração: Os pensamentos são salvos apenas neste navegador.',
    newThought: 'Novo Pensamento',
    editThought: 'Editar Pensamento',
    content: 'Conteúdo do Pensamento',
    contentPlaceholder: 'Digite uma reflexão...',
    attribution: 'Atribuição (Opcional)',
    attributionPlaceholder: 'ex: Ann · Das Horas Silenciosas',
    status: 'Status',
    published: 'Publicado',
    draft: 'Rascunho',
    order: 'Ordem',
    actions: 'Ações',
    save: 'Salvar',
    cancel: 'Cancelar',
    moveUp: 'Mover para Cima',
    moveDown: 'Mover para Baixo',
    publish: 'Publicar',
    unpublish: 'Despublicar',
    delete: 'Excluir',
    deleteModalTitle: 'Excluir Pensamento',
    deletePrompt: 'Para confirmar a exclusão, digite DELETE abaixo:',
    confirmDelete: 'Confirmar Exclusão',
    noThoughts: 'Nenhum pensamento encontrado.',
    savedSuccess: 'Salvo com sucesso.',
    deleteSuccess: 'Excluído com sucesso.',
    reorderSuccess: 'Reordenado com sucesso.',
  },
  it: {
    pageTitle: 'Pensieri & Citazioni',
    pageSubtitle: 'Cura brevi note dell’autore, riflessioni e citazioni.',
    demoNotice: 'Modalità Demo: I pensieri sono salvati solo in questo browser.',
    newThought: 'Nuovo Pensiero',
    editThought: 'Modifica Pensiero',
    content: 'Contenuto del pensiero o citazione',
    contentPlaceholder: 'Inserisci una riflessione...',
    attribution: 'Attribuzione (Opzionale)',
    attributionPlaceholder: 'es. Ann · Da The Quiet Hours',
    status: 'Stato',
    published: 'Pubblicato',
    draft: 'Bozza',
    order: 'Ordine',
    actions: 'Azioni',
    save: 'Salva',
    cancel: 'Annulla',
    moveUp: 'Sposta Su',
    moveDown: 'Sposta Giù',
    publish: 'Pubblica',
    unpublish: 'Ritira',
    delete: 'Elimina',
    deleteModalTitle: 'Elimina Pensiero',
    deletePrompt: 'Digita DELETE per confermare l’eliminazione:',
    confirmDelete: 'Conferma Eliminazione',
    noThoughts: 'Nessun pensiero trovato.',
    savedSuccess: 'Salvato con successo.',
    deleteSuccess: 'Eliminato con successo.',
    reorderSuccess: 'Riordinato con successo.',
  },
  hi: {
    pageTitle: 'विचार और उद्धरण',
    pageSubtitle: 'लेखक के संक्षिप्त विचार और उद्धरण व्यवस्थित करें।',
    demoNotice: 'डेमो मोड: विचार केवल इसी ब्राउज़र में सहेजे जाते हैं।',
    newThought: 'नया विचार',
    editThought: 'विचार संपादित करें',
    content: 'विचार या उद्धरण सामग्री',
    contentPlaceholder: 'एक विचार लिखें...',
    attribution: 'स्रोत / श्रेय (वैकल्पिक)',
    attributionPlaceholder: 'उदा. एन · द क्वाइट आवर्स',
    status: 'स्थिति',
    published: 'प्रकाशित',
    draft: 'प्रारूप',
    order: 'क्रम',
    actions: 'क्रियाएँ',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    moveUp: 'ऊपर ले जाएं',
    moveDown: 'नीचे ले जाएं',
    publish: 'प्रकाशित करें',
    unpublish: 'अप्रकाशित करें',
    delete: 'हटाएं',
    deleteModalTitle: 'विचार हटाएं',
    deletePrompt: 'पुष्टि करने के लिए नीचे DELETE लिखें:',
    confirmDelete: 'हटाने की पुष्टि करें',
    noThoughts: 'कोई विचार नहीं मिला।',
    savedSuccess: 'सफलतापूर्वक सहेजा गया।',
    deleteSuccess: 'सफलतापूर्वक हटाया गया।',
    reorderSuccess: 'क्रम सफलतापूर्वक बदला गया।',
  },
  ml: {
    pageTitle: 'ചിന്തകളും ഉദ്ധരണികളും',
    pageSubtitle: 'ലേഖികയുടെ കുറിപ്പുകളും മനോഹര ഉദ്ധരണികളും ക്രമീകരിക്കുക.',
    demoNotice: 'ഡെമോ മോഡ്: മാറ്റങ്ങൾ ഈ ബ്രൗസറിൽ മാത്രമേ ലഭ്യമാകൂ.',
    newThought: 'പുതിയ ചിന്ത',
    editThought: 'ചിന്ത തിരുത്തുക',
    content: 'ചിന്ത അല്ലെങ്കിൽ ഉദ്ധരണി ഉള്ളടക്കം',
    contentPlaceholder: 'ഒരു ചിന്ത ഇവിടെ നൽകുക...',
    attribution: 'ഉറവിടം (നിർബന്ധമില്ല)',
    attributionPlaceholder: 'ഉദാ: ആൻ · ദ ക്വയറ്റ് അവേഴ്സ്',
    status: 'നില',
    published: 'പ്രസിദ്ധീകരിച്ചത്',
    draft: 'കരട്',
    order: 'ക്രമം',
    actions: 'നടപടികൾ',
    save: 'സൂക്ഷിക്കുക',
    cancel: 'റദ്ദാക്കുക',
    moveUp: 'മുകളിലേക്ക്',
    moveDown: 'താഴേക്ക്',
    publish: 'പ്രസിദ്ധീകരിക്കുക',
    unpublish: 'പിൻവലിക്കുക',
    delete: 'നീക്കം ചെയ്യുക',
    deleteModalTitle: 'ചിന്ത നീക്കം ചെയ്യുക',
    deletePrompt: 'ഉറപ്പാക്കാൻ താഴെ DELETE എന്ന് ടൈപ്പ് ചെയ്യുക:',
    confirmDelete: 'നീക്കം ചെയ്യൽ സ്ഥിരീകരിക്കുക',
    noThoughts: 'ചിന്തകൾ ലഭ്യമല്ല.',
    savedSuccess: 'വിജയകരമായി സൂക്ഷിച്ചു.',
    deleteSuccess: 'വിജയകരമായി നീക്കം ചെയ്തു.',
    reorderSuccess: 'ക്രമം വിജയകരമായി പുതുക്കി.',
  },
  ta: {
    pageTitle: 'சிந்தனைகளும் மேற்கோள்களும்',
    pageSubtitle: 'எழுத்தாளர் குறிப்புகள் மற்றும் மேற்கோள்களை நிர்வகிக்கவும்.',
    demoNotice: 'டெமோ பயன்முறை: மாற்றங்கள் இந்த உலாவியில் மட்டுமே சேமிக்கப்படும்.',
    newThought: 'புதிய சிந்தனை',
    editThought: 'சிந்தனையைத் திருத்து',
    content: 'சிந்தனை அல்லது மேற்கோள் உள்ளடக்கம்',
    contentPlaceholder: 'ஒரு சிந்தனையை உள்ளிடவும்...',
    attribution: 'மூலம் (விருப்பத்திற்குரியது)',
    attributionPlaceholder: 'எ.கா. ஆன் · தி குவைட் ஹவர்ஸ்',
    status: 'நிலை',
    published: 'வெளியிடப்பட்டது',
    draft: 'வரைவு',
    order: 'வரிசை',
    actions: 'செயல்கள்',
    save: 'சேமி',
    cancel: 'ரத்து செய்',
    moveUp: 'மேலே நகர்த்து',
    moveDown: 'கீழே நகர்த்து',
    publish: 'வெளியிடு',
    unpublish: 'வெளியீட்டை நீக்கு',
    delete: 'நீக்கு',
    deleteModalTitle: 'சிந்தனையை நீக்கு',
    deletePrompt: 'உறுதிப்படுத்த கீழே DELETE என தட்டச்சு செய்யவும்:',
    confirmDelete: 'நீக்குதலை உறுதிப்படுத்து',
    noThoughts: 'சிந்தனைகள் எதுவும் இல்லை.',
    savedSuccess: 'வெற்றிகரமாகச் சேமிக்கப்பட்டது.',
    deleteSuccess: 'வெற்றிகரமாக நீக்கப்பட்டது.',
    reorderSuccess: 'வரிசை வெற்றிகரமாக மாற்றப்பட்டது.',
  },
  ar: {
    pageTitle: 'خواطر واقتباسات',
    pageSubtitle: 'تنظيم ملاحظات الكاتب القصيرة واقتباساته المميزة.',
    demoNotice: 'الوضع التجريبي: تُحفظ التغييرات في هذا المتصفح فقط.',
    newThought: 'خاطرة جديدة',
    editThought: 'تعديل الخاطرة',
    content: 'نص الخاطرة أو الاقتباس',
    contentPlaceholder: 'أدخل تأملاً أو عبارة...',
    attribution: 'المصدر (اختياري)',
    attributionPlaceholder: 'مثال: آن · من الساعات الهادئة',
    status: 'الحالة',
    published: 'منشور',
    draft: 'مسودة',
    order: 'الترتيب',
    actions: 'الإجراءات',
    save: 'حفظ',
    cancel: 'إلغاء',
    moveUp: 'تحريك لأعلى',
    moveDown: 'تحريك لأسفل',
    publish: 'نشر',
    unpublish: 'إلغاء النشر',
    delete: 'حذف',
    deleteModalTitle: 'حذف الخاطرة',
    deletePrompt: 'لتأكيد الحذف، اكتب DELETE أدناه:',
    confirmDelete: 'تأكيد الحذف',
    noThoughts: 'لا توجد خواطر مسجلة.',
    savedSuccess: 'تم الحفظ بنجاح.',
    deleteSuccess: 'تم الحذف بنجاح.',
    reorderSuccess: 'تم تغيير الترتيب بنجاح.',
  },
  'zh-Hans': {
    pageTitle: '思想与语录',
    pageSubtitle: '整理简短作者随笔、文具便笺及精美语录。',
    demoNotice: '演示模式：数据仅保存在当前浏览器的演示存储中。',
    newThought: '新建随笔',
    editThought: '编辑随笔',
    content: '随笔或引言内容',
    contentPlaceholder: '请输入一段感悟...',
    attribution: '署名/出处（可选）',
    attributionPlaceholder: '例如：Ann · 选自《寂静时光》',
    status: '状态',
    published: '已发布',
    draft: '草稿',
    order: '顺序',
    actions: '操作',
    save: '保存',
    cancel: '取消',
    moveUp: '上移',
    moveDown: '下移',
    publish: '发布',
    unpublish: '撤回',
    delete: '删除',
    deleteModalTitle: '删除随笔',
    deletePrompt: '请输入 DELETE 确认删除：',
    confirmDelete: '确认删除',
    noThoughts: '暂无随笔内容。',
    savedSuccess: '保存成功。',
    deleteSuccess: '删除成功。',
    reorderSuccess: '排序更新成功。',
  },
  ja: {
    pageTitle: '思索と引用',
    pageSubtitle: '短い著者の所感や文具のメモ、心に残る引用を管理します。',
    demoNotice: 'デモモード：変更はこのブラウザでのみ保持されます。',
    newThought: '新しい思索',
    editThought: '思索を編集',
    content: '思索または引用の内容',
    contentPlaceholder: '心に残る言葉を入力...',
    attribution: '出典・帰属（任意）',
    attributionPlaceholder: '例: Ann · 『The Quiet Hours』より',
    status: '状態',
    published: '公開中',
    draft: '下書き',
    order: '順序',
    actions: '操作',
    save: '保存',
    cancel: 'キャンセル',
    moveUp: '上へ移動',
    moveDown: '下へ移動',
    publish: '公開する',
    unpublish: '非公開にする',
    delete: '削除',
    deleteModalTitle: '思索の削除',
    deletePrompt: '削除を確認するには、以下に DELETE と入力してください:',
    confirmDelete: '削除を確認',
    noThoughts: '思索が見つかりません。',
    savedSuccess: '正常に保存されました。',
    deleteSuccess: '正常に削除されました。',
    reorderSuccess: '順序が更新されました。',
  },
  ko: {
    pageTitle: '생각과 인용구',
    pageSubtitle: '작가의 짧은 메모, 서간 단상 및 인상적인 인용구를 관리합니다.',
    demoNotice: '데모 모드: 변경사항은 이 브라우저의 로컬 저장소에만 저장됩니다.',
    newThought: '새 생각',
    editThought: '생각 수정',
    content: '생각 또는 인용구 내용',
    contentPlaceholder: '단상이나 기억에 남는 문장을 입력하세요...',
    attribution: '출처/귀속 (선택)',
    attributionPlaceholder: '예: 앤 · 『The Quiet Hours』에서',
    status: '상태',
    published: '공개됨',
    draft: '초안',
    order: '순서',
    actions: '작업',
    save: '저장',
    cancel: '취소',
    moveUp: '위로 이동',
    moveDown: '아래로 이동',
    publish: '공개',
    unpublish: '비공개',
    delete: '삭제',
    deleteModalTitle: '생각 삭제',
    deletePrompt: '삭제를 확인하려면 아래에 DELETE를 입력하세요:',
    confirmDelete: '삭제 확인',
    noThoughts: '등록된 생각이 없습니다.',
    savedSuccess: '성공적으로 저장되었습니다.',
    deleteSuccess: '성공적으로 삭제되었습니다.',
    reorderSuccess: '순서가 변경되었습니다.',
  },
  ru: {
    pageTitle: 'Мысли и цитаты',
    pageSubtitle: 'Короткие авторские заметки, размышления и цитаты.',
    demoNotice: 'Демо-режим: изменения сохраняются только в этом браузере.',
    newThought: 'Новая мысль',
    editThought: 'Редактировать мысль',
    content: 'Текст мысли или цитаты',
    contentPlaceholder: 'Введите размышление или цитату...',
    attribution: 'Авторство/источник (необязательно)',
    attributionPlaceholder: 'напр. Энн · Из «The Quiet Hours»',
    status: 'Статус',
    published: 'Опубликовано',
    draft: 'Черновик',
    order: 'Порядок',
    actions: 'Действия',
    save: 'Сохранить',
    cancel: 'Отмена',
    moveUp: 'Вверх',
    moveDown: 'Вниз',
    publish: 'Опубликовать',
    unpublish: 'Снять с публикации',
    delete: 'Удалить',
    deleteModalTitle: 'Удалить мысль',
    deletePrompt: 'Для подтверждения введите DELETE ниже:',
    confirmDelete: 'Подтвердить удаление',
    noThoughts: 'Мысли не найдены.',
    savedSuccess: 'Успешно сохранено.',
    deleteSuccess: 'Успешно удалено.',
    reorderSuccess: 'Порядок обновлен.',
  },
};

export default function AdminThoughtsPage() {
  const { language } = useLanguage();
  const t = THOUGHTS_I18N[language] || THOUGHTS_I18N.en;

  const [thoughts, setThoughts] = useState<ThoughtRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingThought, setEditingThought] = useState<ThoughtRecord | null>(null);

  // Form State
  const [content, setContent] = useState('');
  const [attribution, setAttribution] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [thoughtToDelete, setThoughtToDelete] = useState<ThoughtRecord | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Drag and Drop State
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const loadThoughts = useCallback(() => {
    if (typeof window === 'undefined') return;
    const service = getAdminService();
    if (service instanceof DemoAdminService) {
      const items = service.listThoughtsSync({ status: 'all' });
      setThoughts(items);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadThoughts();
    const handleStorageUpdate = () => loadThoughts();
    window.addEventListener('ann_thoughts_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('ann_thoughts_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [loadThoughts]);

  const handleOpenNew = () => {
    setEditingThought(null);
    setContent('');
    setAttribution('');
    setStatus('published');
    setErrorMsg('');
    setSuccessMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (thought: ThoughtRecord) => {
    setEditingThought(thought);
    setContent(thought.content);
    setAttribution(thought.attribution || '');
    setStatus(thought.status);
    setErrorMsg('');
    setSuccessMsg('');
    setModalOpen(true);
  };

  const handleSaveThought = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!content.trim()) {
      setErrorMsg(t.contentPlaceholder);
      return;
    }

    const service = getAdminService();
    if (service instanceof DemoAdminService) {
      const res = service.saveThoughtSync({
        thought: {
          id: editingThought?.id,
          content: content.trim(),
          attribution: attribution.trim() || undefined,
          status,
        },
        actorEmail: 'editor@annsbookstore.demo',
      });

      if (!res.success) {
        setErrorMsg(res.error);
        return;
      }

      setModalOpen(false);
      setSuccessMsg(t.savedSuccess);
      loadThoughts();
    }
  };

  const handleTogglePublish = (thought: ThoughtRecord) => {
    const service = getAdminService();
    if (service instanceof DemoAdminService) {
      const nextStatus = thought.status === 'published' ? 'draft' : 'published';
      service.saveThoughtSync({
        thought: {
          id: thought.id,
          content: thought.content,
          attribution: thought.attribution,
          status: nextStatus,
        },
        actorEmail: 'editor@annsbookstore.demo',
      });
      loadThoughts();
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= thoughts.length) return;

    const newOrder = [...thoughts];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    const orderedIds = newOrder.map((t) => t.id);
    const service = getAdminService();
    if (service instanceof DemoAdminService) {
      service.reorderThoughtsSync({
        orderedIds,
        actorEmail: 'editor@annsbookstore.demo',
      });
      loadThoughts();
    }
  };

  // Drag & drop handlers
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const currentIndex = thoughts.findIndex((t) => t.id === draggedId);
    const targetIndex = thoughts.findIndex((t) => t.id === targetId);
    if (currentIndex === -1 || targetIndex === -1) return;

    const newOrder = [...thoughts];
    const [moved] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, moved);

    setDraggedId(null);
    const orderedIds = newOrder.map((t) => t.id);
    const service = getAdminService();
    if (service instanceof DemoAdminService) {
      service.reorderThoughtsSync({
        orderedIds,
        actorEmail: 'editor@annsbookstore.demo',
      });
      loadThoughts();
    }
  };

  // Delete confirmation
  const handleOpenDelete = (thought: ThoughtRecord) => {
    setThoughtToDelete(thought);
    setDeleteConfirmText('');
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!thoughtToDelete) return;
    const service = getAdminService();
    if (service instanceof DemoAdminService) {
      const res = service.deleteThoughtSync({
        id: thoughtToDelete.id,
        confirmation: deleteConfirmText,
        actorEmail: 'editor@annsbookstore.demo',
      });
      if (!res.success) {
        setErrorMsg(res.error);
        return;
      }
      setDeleteModalOpen(false);
      setThoughtToDelete(null);
      setDeleteConfirmText('');
      setSuccessMsg(t.deleteSuccess);
      loadThoughts();
    }
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

        <button
          type="button"
          data-testid="btn-add-thought"
          onClick={handleOpenNew}
          style={{
            minHeight: '44px',
            padding: '10px 20px',
            background: 'var(--wine)',
            color: '#fff',
            border: '0',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Plus size={18} />
          <span>{t.newThought}</span>
        </button>
      </div>

      {/* Demo Notice Banner */}
      <div
        style={{
          background: '#fdf6b2',
          border: '1px solid #fce96a',
          color: '#723b10',
          padding: '12px 16px',
          borderRadius: '6px',
          fontSize: '13px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <AlertCircle size={16} />
        <span>{t.demoNotice}</span>
      </div>

      {successMsg && (
        <div
          style={{
            background: '#def7ec',
            border: '1px solid #bcf0da',
            color: '#03543f',
            padding: '10px 14px',
            borderRadius: '4px',
            fontSize: '14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* List / Table of Thoughts */}
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
              <th style={{ padding: '12px 16px', width: '48px' }}></th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t.content}</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t.attribution}</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>{t.status}</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center', width: '130px' }}>{t.order}</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right', width: '180px' }}>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>
                  Loading thoughts...
                </td>
              </tr>
            ) : thoughts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>
                  {t.noThoughts}
                </td>
              </tr>
            ) : (
              thoughts.map((thought, idx) => (
                <tr
                  key={thought.id}
                  data-testid={`thought-row-${thought.id}`}
                  draggable
                  onDragStart={() => handleDragStart(thought.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(thought.id)}
                  style={{
                    borderBottom: '1px solid var(--line)',
                    background: draggedId === thought.id ? '#f3f4f6' : 'transparent',
                    cursor: 'grab',
                  }}
                >
                  <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>
                    <GripVertical size={18} style={{ cursor: 'grab' }} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Quote size={16} style={{ color: 'var(--wine)', flexShrink: 0, marginTop: '3px' }} />
                      <span
                        data-testid={`thought-content-${thought.id}`}
                        style={{ color: 'var(--ink)', fontStyle: 'italic', lineHeight: 1.5 }}
                      >
                        &ldquo;{thought.content}&rdquo;
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: '13px' }}>
                    {thought.attribution || '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      data-testid={`thought-status-${thought.id}`}
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: thought.status === 'published' ? '#ecfdf5' : '#f3f4f6',
                        color: thought.status === 'published' ? '#065f46' : '#4b5563',
                      }}
                    >
                      {thought.status === 'published' ? t.published : t.draft}
                    </span>
                  </td>
                  {/* Keyboard Reorder Buttons */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <button
                        type="button"
                        data-testid={`btn-move-up-${thought.id}`}
                        aria-label={`${t.moveUp} ${thought.content.slice(0, 20)}`}
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        style={{
                          minHeight: '44px',
                          minWidth: '44px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--paper)',
                          border: '1px solid var(--line)',
                          borderRadius: '4px',
                          cursor: idx === 0 ? 'not-allowed' : 'pointer',
                          opacity: idx === 0 ? 0.3 : 1,
                        }}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        data-testid={`btn-move-down-${thought.id}`}
                        aria-label={`${t.moveDown} ${thought.content.slice(0, 20)}`}
                        disabled={idx === thoughts.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        style={{
                          minHeight: '44px',
                          minWidth: '44px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--paper)',
                          border: '1px solid var(--line)',
                          borderRadius: '4px',
                          cursor: idx === thoughts.length - 1 ? 'not-allowed' : 'pointer',
                          opacity: idx === thoughts.length - 1 ? 0.3 : 1,
                        }}
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  </td>
                  {/* Actions */}
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        data-testid={`btn-toggle-publish-${thought.id}`}
                        onClick={() => handleTogglePublish(thought)}
                        title={thought.status === 'published' ? t.unpublish : t.publish}
                        style={{
                          minHeight: '44px',
                          minWidth: '44px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--paper)',
                          border: '1px solid var(--line)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        {thought.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        type="button"
                        data-testid={`btn-edit-thought-${thought.id}`}
                        onClick={() => handleOpenEdit(thought)}
                        title={t.editThought}
                        style={{
                          minHeight: '44px',
                          minWidth: '44px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--paper)',
                          border: '1px solid var(--line)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        data-testid={`btn-delete-thought-${thought.id}`}
                        onClick={() => handleOpenDelete(thought)}
                        title={t.delete}
                        style={{
                          minHeight: '44px',
                          minWidth: '44px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#fee2e2',
                          color: '#b91c1c',
                          border: '1px solid #fecaca',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div
          data-testid="modal-thought-form"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '0 0 16px' }}>
              {editingThought ? t.editThought : t.newThought}
            </h2>

            {errorMsg && (
              <div
                style={{
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  marginBottom: '14px',
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveThought} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
                  {t.content} *
                </label>
                <textarea
                  data-testid="input-thought-content"
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t.contentPlaceholder}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--line)',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
                  {t.attribution}
                </label>
                <input
                  type="text"
                  data-testid="input-thought-attribution"
                  value={attribution}
                  onChange={(e) => setAttribution(e.target.value)}
                  placeholder={t.attributionPlaceholder}
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

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
                  {t.status}
                </label>
                <select
                  data-testid="select-thought-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--line)',
                    fontSize: '14px',
                    background: 'var(--paper)',
                  }}
                >
                  <option value="published">{t.published}</option>
                  <option value="draft">{t.draft}</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  data-testid="btn-cancel-thought"
                  onClick={() => setModalOpen(false)}
                  style={{
                    minHeight: '44px',
                    padding: '8px 18px',
                    borderRadius: '4px',
                    border: '1px solid var(--line)',
                    background: 'var(--paper)',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  data-testid="btn-save-thought"
                  style={{
                    minHeight: '44px',
                    padding: '8px 22px',
                    borderRadius: '4px',
                    border: '0',
                    background: 'var(--wine)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (TYPE TO CONFIRM) */}
      {deleteModalOpen && thoughtToDelete && (
        <div
          data-testid="modal-delete-confirm"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '8px',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#991b1b', margin: '0 0 12px' }}>
              {t.deleteModalTitle}
            </h2>

            <p style={{ fontSize: '14px', color: 'var(--ink)', marginBottom: '14px', fontStyle: 'italic' }}>
              &ldquo;{thoughtToDelete.content.length > 80 ? thoughtToDelete.content.slice(0, 80) + '...' : thoughtToDelete.content}&rdquo;
            </p>

            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px' }}>
              {t.deletePrompt}
            </p>

            <input
              type="text"
              data-testid="input-delete-confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid var(--line)',
                fontSize: '14px',
                marginBottom: '16px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                data-testid="btn-cancel-delete"
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  minHeight: '44px',
                  padding: '8px 18px',
                  borderRadius: '4px',
                  border: '1px solid var(--line)',
                  background: 'var(--paper)',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                data-testid="btn-confirm-delete"
                disabled={
                  !deleteConfirmText.trim() ||
                  (deleteConfirmText.trim().toUpperCase() !== 'DELETE' &&
                    !thoughtToDelete.content.trim().toLowerCase().startsWith(deleteConfirmText.trim().toLowerCase()))
                }
                onClick={handleConfirmDelete}
                style={{
                  minHeight: '44px',
                  padding: '8px 22px',
                  borderRadius: '4px',
                  border: '0',
                  background: '#dc2626',
                  color: '#fff',
                  fontWeight: 600,
                  cursor:
                    deleteConfirmText.trim() &&
                    (deleteConfirmText.trim().toUpperCase() === 'DELETE' ||
                      thoughtToDelete.content.trim().toLowerCase().startsWith(deleteConfirmText.trim().toLowerCase()))
                      ? 'pointer'
                      : 'not-allowed',
                  opacity:
                    deleteConfirmText.trim() &&
                    (deleteConfirmText.trim().toUpperCase() === 'DELETE' ||
                      thoughtToDelete.content.trim().toLowerCase().startsWith(deleteConfirmText.trim().toLowerCase()))
                      ? 1
                      : 0.4,
                  fontSize: '14px',
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
