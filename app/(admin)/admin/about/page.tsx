'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  History,
  Save,
  Clock,
} from 'lucide-react';
import { getAdminService } from '@/lib/admin/service-factory';
import { DemoAdminService } from '@/lib/admin/demo-admin-service';
import type { AboutRevisionRecord } from '@/lib/admin/admin-service';
import { useLanguage } from '@/contexts/language-context';

const ABOUT_ADMIN_I18N: Record<string, Record<string, string>> = {
  en: {
    pageTitle: 'About Page Editor',
    pageSubtitle: 'Manage official author biography, craft philosophy, and archival atelier notes.',
    demoNotice: 'Demo Mode: Edits are stored in browser demo storage and visible only in this browser.',
    placeholderWarning: 'Facts about Ann must stay as [PLACEHOLDER] unless supplied. Never invent biography, quotes or credentials.',
    title: 'Page Title',
    subtitle: 'Page Subtitle / Epigraph',
    content: 'About Page Body (Rich Text)',
    status: 'Status',
    published: 'Published',
    draft: 'Draft',
    needsLegalReview: 'Needs legal review',
    save: 'Save Changes',
    saving: 'Saving...',
    savedSuccess: 'About page saved successfully.',
    revisions: 'Revision History (Last 10)',
    restore: 'Restore',
    restoredSuccess: 'Revision restored successfully.',
    noRevisions: 'No previous revisions recorded.',
    currentRevision: 'Current Version',
  },
  es: {
    pageTitle: 'Editor de la Página Sobre Mí',
    pageSubtitle: 'Gestione la biografía oficial de la autora, filosofía y notas de taller.',
    demoNotice: 'Modo demostración: Las modificaciones se guardan solo en este navegador.',
    placeholderWarning: 'Los datos sobre Ann deben permanecer como [PLACEHOLDER] a menos que se proporcionen. Nunca invente biografías o citas.',
    title: 'Título de la página',
    subtitle: 'Subtítulo / Epígrafe',
    content: 'Cuerpo de la página (Texto enriquecido)',
    status: 'Estado',
    published: 'Publicado',
    draft: 'Borrador',
    needsLegalReview: 'Requiere revisión legal',
    save: 'Guardar Cambios',
    saving: 'Guardando...',
    savedSuccess: 'Página Sobre Mí guardada con éxito.',
    revisions: 'Historial de Versiones (Últimas 10)',
    restore: 'Restaurar',
    restoredSuccess: 'Versión restaurada con éxito.',
    noRevisions: 'No hay versiones anteriores.',
    currentRevision: 'Versión actual',
  },
  fr: {
    pageTitle: 'Éditeur de la Page À Propos',
    pageSubtitle: 'Gérez la biographie officielle de l’auteure, sa philosophie et ses notes d’atelier.',
    demoNotice: 'Mode démo : Les modifications sont enregistrées uniquement dans ce navigateur.',
    placeholderWarning: 'Les faits concernant Ann doivent rester sous la forme [PLACEHOLDER] sauf mention contraire. N’inventez jamais de faits.',
    title: 'Titre de la page',
    subtitle: 'Sous-titre / Épigraphe',
    content: 'Contenu (Texte enrichi)',
    status: 'Statut',
    published: 'Publié',
    draft: 'Brouillon',
    needsLegalReview: 'Nécessite une révision juridique',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    savedSuccess: 'Page À Propos enregistrée avec succès.',
    revisions: 'Historique des versions (10 dernières)',
    restore: 'Restaurer',
    restoredSuccess: 'Version restaurée avec succès.',
    noRevisions: 'Aucune version précédente.',
    currentRevision: 'Version actuelle',
  },
  de: {
    pageTitle: 'Über-uns-Editor',
    pageSubtitle: 'Verwalten Sie die offizielle Autorenbiografie und Atelierhinweise.',
    demoNotice: 'Demo-Modus: Änderungen werden nur lokal in diesem Browser gespeichert.',
    placeholderWarning: 'Fakten über Ann müssen als [PLACEHOLDER] verbleiben, sofern nicht ausdrücklich angegeben. Niemals erfinden.',
    title: 'Seitentitel',
    subtitle: 'Untertitel / Epigraph',
    content: 'Hauptinhalt (Rich-Text)',
    status: 'Status',
    published: 'Veröffentlicht',
    draft: 'Entwurf',
    needsLegalReview: 'Erfordert rechtliche Prüfung',
    save: 'Änderungen speichern',
    saving: 'Speichern...',
    savedSuccess: 'Seite erfolgreich gespeichert.',
    revisions: 'Versionsverlauf (Letzte 10)',
    restore: 'Wiederherstellen',
    restoredSuccess: 'Version erfolgreich wiederhergestellt.',
    noRevisions: 'Keine früheren Versionen vorhanden.',
    currentRevision: 'Aktuelle Version',
  },
  'pt-BR': {
    pageTitle: 'Editor da Página Sobre',
    pageSubtitle: 'Gerencie a biografia oficial da autora, filosofia e notas do atelier.',
    demoNotice: 'Modo de demonstração: Alterações são salvas apenas neste navegador.',
    placeholderWarning: 'Fatos sobre Ann devem permanecer como [PLACEHOLDER] salvo se fornecidos. Nunca invente dados.',
    title: 'Título da Página',
    subtitle: 'Subtítulo / Epígrafe',
    content: 'Conteúdo (Rich Text)',
    status: 'Status',
    published: 'Publicado',
    draft: 'Rascunho',
    needsLegalReview: 'Requer revisão jurídica',
    save: 'Salvar Alterações',
    saving: 'Salvando...',
    savedSuccess: 'Página salva com sucesso.',
    revisions: 'Histórico de Revisões (Últimas 10)',
    restore: 'Restaurar',
    restoredSuccess: 'Revisão restaurada com sucesso.',
    noRevisions: 'Nenhuma revisão anterior registrada.',
    currentRevision: 'Versão Atual',
  },
  it: {
    pageTitle: 'Editor Pagina Informazioni',
    pageSubtitle: 'Gestisci la biografia ufficiale dell’autrice e la filosofia dell’atelier.',
    demoNotice: 'Modalità Demo: Le modifiche sono salvate solo in questo browser.',
    placeholderWarning: 'I fatti riguardanti Ann devono rimanere [PLACEHOLDER] se non forniti. Non inventare dati.',
    title: 'Titolo della Pagina',
    subtitle: 'Sottotitolo / Epigrafe',
    content: 'Contenuto (Rich Text)',
    status: 'Stato',
    published: 'Pubblicato',
    draft: 'Bozza',
    needsLegalReview: 'Richiede revisione legale',
    save: 'Salva Modifiche',
    saving: 'Salvataggio...',
    savedSuccess: 'Pagina salvata con successo.',
    revisions: 'Cronologia Revisioni (Ultime 10)',
    restore: 'Ripristina',
    restoredSuccess: 'Revisione ripristinata con successo.',
    noRevisions: 'Nessuna revisione precedente.',
    currentRevision: 'Versione Corrente',
  },
  hi: {
    pageTitle: 'परिचय पृष्ठ संपादक',
    pageSubtitle: 'लेखक की जीवनी और दर्शन प्रबंधित करें।',
    demoNotice: 'डेमो मोड: परिवर्तन केवल इसी ब्राउज़र में सहेजे जाते हैं।',
    placeholderWarning: 'एन के बारे में तथ्य [PLACEHOLDER] ही रहने चाहिए जब तक कि वे प्रदान न किए जाएं। जीवनी कभी न गढ़ें।',
    title: 'पृष्ठ शीर्षक',
    subtitle: 'उपशीर्षक / सूक्ति',
    content: 'सामग्री (रिच टेक्स्ट)',
    status: 'स्थिति',
    published: 'प्रकाशित',
    draft: 'प्रारूप',
    needsLegalReview: 'कानूनी समीक्षा आवश्यक',
    save: 'परिवर्तन सहेजें',
    saving: 'सहेज रहा है...',
    savedSuccess: 'पृष्ठ सफलतापूर्वक सहेजा गया।',
    revisions: 'संशोधन इतिहास (अंतिम 10)',
    restore: 'पुनर्स्थापित करें',
    restoredSuccess: 'संशोधन सफलतापूर्वक पुनर्स्थापित किया गया।',
    noRevisions: 'कोई पिछला संशोधन नहीं मिला।',
    currentRevision: 'वर्तमान संस्करण',
  },
  ml: {
    pageTitle: 'എബൗട്ട് പേജ് എഡിറ്റർ',
    pageSubtitle: 'ലേഖികയുടെ ജീവചരിത്രവും ദർശനങ്ങളും ക്രമീകരിക്കുക.',
    demoNotice: 'ഡെമോ മോഡ്: മാറ്റങ്ങൾ ഈ ബ്രൗസറിൽ മാത്രമേ ലഭ്യമാകൂ.',
    placeholderWarning: 'വിവരങ്ങൾ നൽകാത്തിടത്തോളം ആനിനെക്കുറിച്ചുള്ള വിവരങ്ങൾ [PLACEHOLDER] ആയി തുടരണം. യാതൊന്നും കൃത്രിമമായി സൃഷ്ടിക്കരുത്.',
    title: 'പേജ് തലക്കെട്ട്',
    subtitle: 'ഉപതലക്കെട്ട്',
    content: 'ഉള്ളടക്കം (റിച്ച് ടെക്സ്റ്റ്)',
    status: 'നില',
    published: 'പ്രസിദ്ധീകരിച്ചത്',
    draft: 'കരട്',
    needsLegalReview: 'നിയമപരമായ പരിശോധന ആവശ്യമാണ്',
    save: 'മാറ്റങ്ങൾ സൂക്ഷിക്കുക',
    saving: 'സൂക്ഷിക്കുന്നു...',
    savedSuccess: 'വിജയകരമായി സൂക്ഷിച്ചു.',
    revisions: 'പതിപ്പുകൾ (അവസാന 10 എണ്ണം)',
    restore: 'പുനഃസ്ഥാപിക്കുക',
    restoredSuccess: 'പതിപ്പ് വിജയകരമായി പുനഃസ്ഥാപിച്ചു.',
    noRevisions: 'മുൻ പതിപ്പുകൾ ലഭ്യമല്ല.',
    currentRevision: 'നിലവിലെ പതിപ്പ്',
  },
  ta: {
    pageTitle: 'பற்றி பக்கத் தொகுப்பாளர்',
    pageSubtitle: 'எழுத்தாளர் சுயசரிதை மற்றும் பட்டறை குறிப்புகளை நிர்வகிக்கவும்.',
    demoNotice: 'டெமோ பயன்முறை: மாற்றங்கள் இந்த உலாவியில் மட்டுமே சேமிக்கப்படும்.',
    placeholderWarning: 'ஆன் பற்றிய உண்மைகள் வழங்கப்படாவிட்டால் [PLACEHOLDER] ஆகவே இருக்க வேண்டும். எதையும் புனைய வேண்டாம்.',
    title: 'பக்க தலைப்பு',
    subtitle: 'துணை தலைப்பு',
    content: 'உள்ளடக்கம்',
    status: 'நிலை',
    published: 'வெளியிடப்பட்டது',
    draft: 'வரைவு',
    needsLegalReview: 'சட்ட மறுஆய்வு தேவை',
    save: 'மாற்றங்களைச் சேமி',
    saving: 'சேமிக்கிறது...',
    savedSuccess: 'பக்கம் வெற்றிகரமாகச் சேமிக்கப்பட்டது.',
    revisions: 'பதிப்பு வரலாறு (கடைசி 10)',
    restore: 'மீட்டமை',
    restoredSuccess: 'பதிப்பு வெற்றிகரமாக மீட்டமைக்கப்பட்டது.',
    noRevisions: 'முந்தைய பதிப்புகள் எதுவும் இல்லை.',
    currentRevision: 'தற்போதைய பதிப்பு',
  },
  ar: {
    pageTitle: 'محرر صفحة "من نحن"',
    pageSubtitle: 'إدارة السيرة الذاتية الرسمية وفلسفة الكاتبة.',
    demoNotice: 'الوضع التجريبي: تُحفظ التغييرات في هذا المتصفح فقط.',
    placeholderWarning: 'يجب أن تظل الحقائق المتعلقة بـ Ann كـ [PLACEHOLDER] ما لم يتم تزويدها. لا تخترع أية سيرة ذاتية.',
    title: 'عنوان الصفحة',
    subtitle: 'العنوان الفرعي',
    content: 'المحتوى (نص منسق)',
    status: 'الحالة',
    published: 'منشور',
    draft: 'مسودة',
    needsLegalReview: 'يحتاج إلى مراجعة قانونية',
    save: 'حفظ التغييرات',
    saving: 'جاري الحفظ...',
    savedSuccess: 'تم حفظ الصفحة بنجاح.',
    revisions: 'سجل التعديلات (آخر 10)',
    restore: 'استعادة',
    restoredSuccess: 'تمت استعادة التعديل بنجاح.',
    noRevisions: 'لا توجد تعديلات سابقة.',
    currentRevision: 'النسخة الحالية',
  },
  'zh-Hans': {
    pageTitle: '关于页面编辑器',
    pageSubtitle: '管理官方作者传记、创作理念及工作室札记。',
    demoNotice: '演示模式：数据仅保存在当前浏览器的演示存储中。',
    placeholderWarning: '关于 Ann 的真实背景除非明确提供，否则必须保持为 [PLACEHOLDER]，切勿编造履历或引言。',
    title: '页面标题',
    subtitle: '副标题 / 题词',
    content: '正文内容（富文本）',
    status: '状态',
    published: '已发布',
    draft: '草稿',
    needsLegalReview: '需要法律审核',
    save: '保存更改',
    saving: '保存中...',
    savedSuccess: '关于页面保存成功。',
    revisions: '版本历史（最近 10 次）',
    restore: '恢复此版本',
    restoredSuccess: '版本恢复成功。',
    noRevisions: '尚无历史版本记录。',
    currentRevision: '当前版本',
  },
  ja: {
    pageTitle: 'About ページ編集',
    pageSubtitle: '公式な著者略歴、創作の理念、アトリエの記録を管理します。',
    demoNotice: 'デモモード：変更はこのブラウザでのみ保持されます。',
    placeholderWarning: 'Ann に関する事実は提供されない限り [PLACEHOLDER] のまま保持してください。経歴を創作してはなりません。',
    title: 'ページタイトル',
    subtitle: 'サブタイトル / 銘',
    content: '本文（リッチテキスト）',
    status: '状態',
    published: '公開中',
    draft: '下書き',
    needsLegalReview: '法務確認が必要',
    save: '変更を保存',
    saving: '保存中...',
    savedSuccess: 'About ページが正常に保存されました。',
    revisions: '改訂履歴（最新 10 件）',
    restore: '復元',
    restoredSuccess: 'リビジョンが正常に復元されました。',
    noRevisions: '以前の改訂履歴はありません。',
    currentRevision: '現在のバージョン',
  },
  ko: {
    pageTitle: '소개(About) 페이지 편집기',
    pageSubtitle: '공식 작가 약력, 창작 철학 및 아틀리에 기록을 관리합니다.',
    demoNotice: '데모 모드: 변경사항은 이 브라우저의 로컬 저장소에만 저장됩니다.',
    placeholderWarning: 'Ann에 대한 정보는 직접 제공되지 않는 한 [PLACEHOLDER] 상태를 유지해야 합니다. 약력이나 이력을 지어내지 마세요.',
    title: '페이지 제목',
    subtitle: '소제목 / 제사(Epigraph)',
    content: '본문 내용 (서식 지원)',
    status: '상태',
    published: '공개됨',
    draft: '초안',
    needsLegalReview: '법적 검토 필요',
    save: '변경사항 저장',
    saving: '저장 중...',
    savedSuccess: '소개 페이지가 성공적으로 저장되었습니다.',
    revisions: '수정 이력 (최근 10개)',
    restore: '복원',
    restoredSuccess: '수정본이 성공적으로 복원되었습니다.',
    noRevisions: '기록된 이전 버전이 없습니다.',
    currentRevision: '현재 버전',
  },
  ru: {
    pageTitle: 'Редактор страницы «Об авторе»',
    pageSubtitle: 'Управление официальной биографией автора, философией и заметками ателье.',
    demoNotice: 'Демо-режим: изменения сохраняются только в этом браузере.',
    placeholderWarning: 'Факты об Энн должны оставаться [PLACEHOLDER], если они не указаны. Никогда не выдумывайте биографию.',
    title: 'Заголовок страницы',
    subtitle: 'Подзаголовок / Эпиграф',
    content: 'Основной текст (форматированный)',
    status: 'Статус',
    published: 'Опубликовано',
    draft: 'Черновик',
    needsLegalReview: 'Требуется юридическая проверка',
    save: 'Сохранить изменения',
    saving: 'Сохранение...',
    savedSuccess: 'Страница успешно сохранена.',
    revisions: 'История версий (последние 10)',
    restore: 'Восстановить',
    restoredSuccess: 'Версия успешно восстановлена.',
    noRevisions: 'Предыдущих версий не найдено.',
    currentRevision: 'Текущая версия',
  },
};

export default function AdminAboutPage() {
  const { language } = useLanguage();
  const t = ABOUT_ADMIN_I18N[language] || ABOUT_ADMIN_I18N.en;

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [needsLegalReview, setNeedsLegalReview] = useState(false);
  const [revisions, setRevisions] = useState<AboutRevisionRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // TipTap Rich Text Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'about-editor-link' },
      }),
      ImageExtension.configure({
        HTMLAttributes: { class: 'about-editor-image' },
      }),
    ],
    content: '',
  });

  const loadAboutData = useCallback(() => {
    if (typeof window === 'undefined') return;
    const service = getAdminService();
    if (service instanceof DemoAdminService) {
      const page = service.getAboutPageSync();
      setTitle(page.title);
      setSubtitle(page.subtitle || '');
      setStatus(page.status);
      setNeedsLegalReview(page.needsLegalReview);
      setRevisions(page.revisions || []);
      if (editor && !editor.isDestroyed) {
        editor.commands.setContent(page.contentHtml || '');
      }
    }
  }, [editor]);

  useEffect(() => {
    if (editor) {
      loadAboutData();
    }
    const handleUpdate = () => loadAboutData();
    window.addEventListener('ann_about_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('ann_about_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [editor, loadAboutData]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim()) {
      setErrorMsg('Title is required');
      return;
    }

    const contentHtml = editor?.getHTML() || '';
    if (!contentHtml.trim()) {
      setErrorMsg('Content is required');
      return;
    }

    setIsSaving(true);
    const service = getAdminService();
    if (service instanceof DemoAdminService) {
      const res = service.saveAboutPageSync({
        page: {
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          contentHtml,
          status,
          needsLegalReview,
        },
        actorEmail: 'editor@annsbookstore.demo',
      });

      setIsSaving(false);
      if (!res.success) {
        setErrorMsg(res.error);
        return;
      }

      setRevisions(res.page.revisions);
      setSuccessMsg(t.savedSuccess);
    }
  };

  const handleRestoreRevision = (revNum: number) => {
    setErrorMsg('');
    setSuccessMsg('');
    const service = getAdminService();
    if (service instanceof DemoAdminService) {
      const res = service.restoreAboutRevisionSync({
        revisionNumber: revNum,
        actorEmail: 'editor@annsbookstore.demo',
      });
      if (!res.success) {
        setErrorMsg(res.error);
        return;
      }
      setTitle(res.page.title);
      setSubtitle(res.page.subtitle || '');
      setStatus(res.page.status);
      setNeedsLegalReview(res.page.needsLegalReview);
      setRevisions(res.page.revisions);
      if (editor) {
        editor.commands.setContent(res.page.contentHtml);
      }
      setSuccessMsg(`${t.restoredSuccess} (#${revNum})`);
    }
  };

  return (
    <div className="admin-page-container" style={{ padding: '24px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
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

      {/* Required Invariant Warning: Placeholder Guard */}
      <div
        data-testid="banner-placeholder-warning"
        style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: '6px',
          fontSize: '13px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <ShieldAlert size={18} style={{ flexShrink: 0 }} />
        <strong>{t.placeholderWarning}</strong>
      </div>

      {/* Demo Notice */}
      <div
        style={{
          background: '#fdf6b2',
          border: '1px solid #fce96a',
          color: '#723b10',
          padding: '10px 14px',
          borderRadius: '6px',
          fontSize: '13px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <AlertCircle size={16} />
        <span>{t.demoNotice}</span>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div
          style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '10px 14px',
            borderRadius: '4px',
            fontSize: '14px',
            marginBottom: '16px',
          }}
        >
          {errorMsg}
        </div>
      )}
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

      {/* Main Grid: Editor on Left, Settings & Revisions on Right */}
      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
          {/* LEFT: Editor Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="about-title" style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                {t.title} *
              </label>
              <input
                id="about-title"
                data-testid="input-about-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Stories begin with noticing."
                required
                style={{
                  width: '100%',
                  minHeight: '44px',
                  padding: '8px 14px',
                  borderRadius: '4px',
                  border: '1px solid var(--line)',
                  background: 'var(--white)',
                  color: 'var(--ink)',
                  fontSize: '16px',
                }}
              />
            </div>

            <div>
              <label htmlFor="about-subtitle" style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                {t.subtitle}
              </label>
              <input
                id="about-subtitle"
                data-testid="input-about-subtitle"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="“The rain did not begin with thunder; it arrived as a rumor on the veranda wind.”"
                style={{
                  width: '100%',
                  minHeight: '44px',
                  padding: '8px 14px',
                  borderRadius: '4px',
                  border: '1px solid var(--line)',
                  background: 'var(--white)',
                  color: 'var(--ink)',
                  fontSize: '14px',
                  fontStyle: 'italic',
                }}
              />
            </div>

            {/* TipTap Editor Container */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                {t.content} *
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
                  data-testid="editor-bullet"
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
                  data-testid="editor-ordered"
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
                  data-testid="editor-blockquote"
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  style={{
                    padding: '6px 10px',
                    background: editor?.isActive('blockquote') ? 'var(--line)' : 'transparent',
                    border: '0',
                    cursor: 'pointer',
                    borderRadius: '3px',
                  }}
                  title="Quote"
                >
                  <Quote size={16} />
                </button>
              </div>

              {/* Editable Surface */}
              <div
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: '0 0 4px 4px',
                  minHeight: '280px',
                  background: 'var(--white)',
                  padding: '16px',
                  fontSize: '16px',
                  lineHeight: '1.7',
                }}
              >
                <EditorContent editor={editor} data-testid="editor-content" />
              </div>
            </div>
          </div>

          {/* RIGHT: Status, Legal Review, Actions & Revisions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Publishing Box */}
            <div
              style={{
                border: '1px solid var(--line)',
                borderRadius: '6px',
                background: 'var(--white)',
                padding: '20px',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px' }}>
                Publishing Settings
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="about-status" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  {t.status}
                </label>
                <select
                  id="about-status"
                  data-testid="select-about-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--line)',
                    background: 'var(--paper)',
                    fontSize: '14px',
                  }}
                >
                  <option value="published">{t.published}</option>
                  <option value="draft">{t.draft}</option>
                </select>
              </div>

              {/* Needs Legal Review Toggle */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    data-testid="checkbox-needs-legal-review"
                    checked={needsLegalReview}
                    onChange={(e) => setNeedsLegalReview(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--wine)' }}
                  />
                  <span style={{ fontWeight: 500 }}>{t.needsLegalReview}</span>
                </label>
              </div>

              <button
                type="submit"
                data-testid="btn-save-about"
                disabled={isSaving}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  padding: '10px 16px',
                  background: 'var(--wine)',
                  color: '#fff',
                  border: '0',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: isSaving ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Save size={16} />
                <span>{isSaving ? t.saving : t.save}</span>
              </button>
            </div>

            {/* Revisions History Box */}
            <div
              data-testid="about-revisions-list"
              style={{
                border: '1px solid var(--line)',
                borderRadius: '6px',
                background: 'var(--white)',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <History size={16} style={{ color: 'var(--muted)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
                  {t.revisions}
                </h3>
              </div>

              {revisions.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                  {t.noRevisions}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {revisions.map((rev, index) => (
                    <div
                      key={rev.id || index}
                      style={{
                        padding: '10px 12px',
                        border: '1px solid var(--line)',
                        borderRadius: '4px',
                        background: index === 0 ? 'var(--paper)' : 'transparent',
                        fontSize: '13px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <strong>Rev #{rev.revisionNumber}</strong>
                        {index === 0 && (
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: '#ecfdf5',
                              color: '#065f46',
                              fontWeight: 600,
                            }}
                          >
                            {t.currentRevision}
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '6px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {new Date(rev.createdAt).toLocaleString()}
                        </span>
                        <span style={{ display: 'block', marginTop: '2px' }}>By: {rev.createdBy}</span>
                      </div>

                      {index > 0 && (
                        <button
                          type="button"
                          data-testid={`btn-restore-revision-${rev.revisionNumber}`}
                          onClick={() => handleRestoreRevision(rev.revisionNumber)}
                          style={{
                            minHeight: '36px',
                            padding: '4px 10px',
                            background: 'var(--paper)',
                            border: '1px solid var(--line)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <RotateCcw size={12} />
                          <span>{t.restore}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
