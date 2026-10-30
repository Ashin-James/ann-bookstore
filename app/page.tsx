'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown, ArrowRight, ArrowUpRight, Mail, CheckCircle2, Lock, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { books } from '@/data/books';
import { journalArticles } from '@/data/journal';
import { BookGrid, Cover } from '@/components/book-card';
import { useLanguage } from '@/contexts/language-context';
import { SITE_CONFIG } from '@/src/config/site.config';
import Container from '@/components/container';
import Section from '@/components/section';
import Reveal, { RevealItem } from '@/components/reveal';
import { heroVariants, motionTokens } from '@/lib/motion';

const marqueeItems = [
  { roman: 'I', title: 'MONSOON', num: '01' },
  { roman: 'II', title: 'THE RETURN', num: '02' },
  { roman: 'III', title: 'THE SILENCE', num: '03' },
  { roman: 'IV', title: 'MEMORY', num: '04' },
  { roman: 'V', title: 'BELONGING', num: '05' },
  { roman: 'VI', title: 'WHAT WE KEEP', num: '06' },
];

const NEWSLETTER_I18N: Record<string, Record<string, string>> = {
  en: {
    badge: "THE COLLECTOR'S DISPATCH",
    heading: 'Letters from the Coastal Studio.',
    subheading: 'Occasional letters on literature, unhurried reflections, and new edition announcements sent quietly once a month.',
    perk1: '✦ SENT ONCE A MONTH',
    perk2: '✦ ARCHIVAL PRINT NEWS',
    perk3: '✦ STRICTLY NO SPAM',
    emailLabel: 'Your email address',
    placeholder: 'reader@example.com',
    joinBtn: 'Join Atelier',
    submitting: 'Joining...',
    trustNote: 'Double opt-in verification required.',
    privacy: 'Privacy Policy',
    successHeading: 'Check your inbox to confirm your subscription (Double Opt-In)',
    successBody: 'A confirmation link has been sent. Once confirmed, you will receive occasional letters on writing and new editions.',
    demoNotice: 'Demo Mode: Stored in browser demo storage, visible only in this browser.',
    confirmLink: 'Confirm Subscription Link (Demo Mode)',
    invalidEmail: 'Please enter a valid email address.',
  },
  es: {
    badge: 'EL DESPACHO DEL COLECCIONISTA',
    heading: 'Cartas desde el Estudio Costero.',
    subheading: 'Cartas sobre literatura, reflexiones y nuevas ediciones enviadas una vez al mes.',
    perk1: '✦ ENVIADO UNA VEZ AL MES',
    perk2: '✦ NOTICIAS DE EDICIONES',
    perk3: '✦ ESTRICTAMENTE SIN SPAM',
    emailLabel: 'Su correo electrónico',
    placeholder: 'lector@ejemplo.com',
    joinBtn: 'Unirse al Atelier',
    submitting: 'Uniéndose...',
    trustNote: 'Verificación de doble consentimiento requerida.',
    privacy: 'Política de privacidad',
    successHeading: 'Revise su bandeja de entrada para confirmar (Doble Opt-In)',
    successBody: 'Se ha enviado un enlace de confirmación. Una vez confirmado, recibirá cartas ocasionales.',
    demoNotice: 'Modo demostración: Guardado solo en este navegador.',
    confirmLink: 'Enlace de confirmación (Modo Demo)',
    invalidEmail: 'Por favor, ingrese un correo válido.',
  },
  fr: {
    badge: 'LA DÉPÊCHE DU COLLECTIONNEUR',
    heading: 'Lettres de l’Atelier Côtier.',
    subheading: 'Lettres littéraires, réflexions et annonces d’éditions envoyées paisiblement.',
    perk1: '✦ ENVOYÉ UNE FOIS PAR MOIS',
    perk2: '✦ NOUVELLES DES TIRAGES',
    perk3: '✦ STRICTEMENT SANS SPAM',
    emailLabel: 'Votre adresse e-mail',
    placeholder: 'lecteur@exemple.com',
    joinBtn: 'Rejoindre l’Atelier',
    submitting: 'Inscription...',
    trustNote: 'Double confirmation requise.',
    privacy: 'Politique de confidentialité',
    successHeading: 'Vérifiez votre boîte pour confirmer (Double Opt-In)',
    successBody: 'Un lien de confirmation a été envoyé. Une fois confirmé, vous recevrez nos lettres.',
    demoNotice: 'Mode démo : Enregistré uniquement dans ce navigateur.',
    confirmLink: 'Lien de confirmation (Mode Démo)',
    invalidEmail: 'Veuillez saisir une adresse valide.',
  },
  de: {
    badge: 'DIE SAMMLER-DEPESCHE',
    heading: 'Briefe aus dem Küstenatelier.',
    subheading: 'Gelegentliche Briefe über Literatur, Reflexionen und Neuerscheinungen.',
    perk1: '✦ EINMAL MONATLICH',
    perk2: '✦ ARCHIVDRUCK-NEWS',
    perk3: '✦ STRIKT KEIN SPAM',
    emailLabel: 'Ihre E-Mail-Adresse',
    placeholder: 'leser@beispiel.de',
    joinBtn: 'Atelier beitreten',
    submitting: 'Wird eingetragen...',
    trustNote: 'Double-Opt-In-Bestätigung erforderlich.',
    privacy: 'Datenschutzrichtlinie',
    successHeading: 'Bestätigen Sie Ihr Abonnement im Postfach (Double-Opt-In)',
    successBody: 'Ein Bestätigungslink wurde gesendet.',
    demoNotice: 'Demo-Modus: Nur in diesem Browser gespeichert.',
    confirmLink: 'Bestätigungslink (Demo-Modus)',
    invalidEmail: 'Bitte eine gültige E-Mail eingeben.',
  },
  'pt-BR': {
    badge: 'O DESPACHO DO COLECIONADOR',
    heading: 'Cartas do Estúdio Costeiro.',
    subheading: 'Cartas ocasionais sobre literatura, reflexões serenas e lançamentos.',
    perk1: '✦ ENVIADO UMA VEZ POR MÊS',
    perk2: '✦ NOVIDADES DE EDICÕES',
    perk3: '✦ RIGOROSAMENTE SEM SPAM',
    emailLabel: 'Seu endereço de e-mail',
    placeholder: 'leitor@exemplo.com',
    joinBtn: 'Entrar no Atelier',
    submitting: 'Inscrevendo...',
    trustNote: 'Confirmação dupla (Double Opt-in) obrigatória.',
    privacy: 'Política de Privacidade',
    successHeading: 'Verifique seu e-mail para confirmar (Double Opt-In)',
    successBody: 'Um link de confirmação foi enviado.',
    demoNotice: 'Modo de demonstração: Salvo apenas neste navegador.',
    confirmLink: 'Link de confirmação (Modo Demo)',
    invalidEmail: 'Por favor, insira um e-mail válido.',
  },
  it: {
    badge: 'IL DISPACCIO DEL COLLEZIONISTA',
    heading: 'Lettere dallo Studio Costiero.',
    subheading: 'Lettere di letteratura, riflessioni e annunci di nuove edizioni.',
    perk1: '✦ INVIATO UNA VOLTA AL MESE',
    perk2: '✦ NOTIZIE SULLE EDIZIONI',
    perk3: '✦ NESSUN SPAM',
    emailLabel: 'Il tuo indirizzo email',
    placeholder: 'lettore@esempio.it',
    joinBtn: 'Unisciti all’Atelier',
    submitting: 'Iscrizione...',
    trustNote: 'Richiesta verifica double opt-in.',
    privacy: 'Informativa sulla privacy',
    successHeading: 'Controlla la tua casella per confermare (Double Opt-In)',
    successBody: 'Un link di conferma è stato inviato.',
    demoNotice: 'Modalità Demo: Salvato solo in questo browser.',
    confirmLink: 'Link di conferma (Modalità Demo)',
    invalidEmail: 'Inserisci un indirizzo email valido.',
  },
  hi: {
    badge: 'कलेक्टर का संदेश',
    heading: 'तटीय स्टूडियो से पत्र।',
    subheading: 'साहित्य, शांत विचार और नए संस्करणों पर मासिक पत्र।',
    perk1: '✦ महीने में एक बार',
    perk2: '✦ संग्रहणीय मुद्रण समाचार',
    perk3: '✦ कोई स्पैम नहीं',
    emailLabel: 'आपका ईमेल पता',
    placeholder: 'reader@example.com',
    joinBtn: 'एटेलियर से जुड़ें',
    submitting: 'जुड़ रहे हैं...',
    trustNote: 'डबल ऑप्ट-इन सत्यापन आवश्यक।',
    privacy: 'गोपनीयता नीति',
    successHeading: 'पुष्टि करने के लिए अपना इनबॉक्स जांचें (डबल ऑप्ट-इन)',
    successBody: 'एक पुष्टिकरण लिंक भेजा गया है।',
    demoNotice: 'डेमो मोड: केवल इसी ब्राउज़र में सहेजा गया।',
    confirmLink: 'पुष्टिकरण लिंक (डेमो मोड)',
    invalidEmail: 'कृपया मान्य ईमेल पता दर्ज करें।',
  },
  ml: {
    badge: 'കളക്ടറുടെ സന്ദേശം',
    heading: 'തീരദേശ സ്റ്റുഡിയോയിൽ നിന്നുള്ള കത്തുകൾ.',
    subheading: 'സാഹിത്യത്തെയും പുതിയ പുസ്തകങ്ങളെയും കുറിച്ചുള്ള മാസക്കുറിപ്പുകൾ.',
    perk1: '✦ മാസത്തിലൊരിക്കൽ',
    perk2: '✦ എഡിഷൻ വിവരങ്ങൾ',
    perk3: '✦ സ്പാം ഇല്ല',
    emailLabel: 'നിങ്ങളുടെ ഇമെയിൽ വിലാസം',
    placeholder: 'reader@example.com',
    joinBtn: 'അറ്റലിയറിൽ ചേരുക',
    submitting: 'ചേരുന്നു...',
    trustNote: 'ഡബിൾ ഒപ്റ്റ്-ഇൻ സ്ഥിരീകരണം ആവശ്യമാണ്.',
    privacy: 'സ്വകാര്യതാ നയം',
    successHeading: 'സ്ഥിരീകരിക്കാൻ നിങ്ങളുടെ ഇൻബോക്സ് പരിശോധിക്കുക (ഡബിൾ ഒപ്റ്റ്-ഇൻ)',
    successBody: 'ഒരു സ്ഥിരീകരണ ലിങ്ക് അയച്ചിട്ടുണ്ട്.',
    demoNotice: 'ഡെമോ മോഡ്: ഈ ബ്രൗസറിൽ മാത്രം സൂക്ഷിക്കുന്നു.',
    confirmLink: 'സ്ഥിരീകരണ ലിങ്ക് (ഡെമോ മോഡ്)',
    invalidEmail: 'സാധുവായ ഇമെയിൽ നൽകുക.',
  },
  ta: {
    badge: 'கலெக்டர் செய்தி',
    heading: 'கடற்கரை ஸ்டுடியோவிலிருந்து கடிதங்கள்.',
    subheading: 'இலக்கியம் மற்றும் புதிய பதிப்புகள் குறித்த மாதாந்திர கடிதங்கள்.',
    perk1: '✦ மாதத்திற்கு ஒரு முறை',
    perk2: '✦ பதிப்பு செய்திகள்',
    perk3: '✦ ஸ்பேம் இல்லை',
    emailLabel: 'உங்கள் மின்னஞ்சல் முகவரி',
    placeholder: 'reader@example.com',
    joinBtn: 'அட்லியரில் இணையுங்கள்',
    submitting: 'இணைகிறது...',
    trustNote: 'இரட்டை ஒப்புதல் சரிபார்ப்பு தேவை.',
    privacy: 'தனியுரிமைக் கொள்கை',
    successHeading: 'உறுதிப்படுத்த உங்கள் இன்பாக்ஸைப் பார்க்கவும் (Double Opt-In)',
    successBody: 'உறுதிப்படுத்தல் இணைப்பு அனுப்பப்பட்டது.',
    demoNotice: 'டெமோ பயன்முறை: இந்த உலாவியில் மட்டுமே சேமிக்கப்படும்.',
    confirmLink: 'உறுதிப்படுத்தல் இணைப்பு (டெமோ)',
    invalidEmail: 'சரியான மின்னஞ்சலை உள்ளிடவும்.',
  },
  ar: {
    badge: 'رسائل المقتني',
    heading: 'رسائل من الاستوديو الساحلي.',
    subheading: 'رسائل شهرية حول الأدب والتأملات الهادئة والإصدارات الجديدة.',
    perk1: '✦ ترسل مرة شهرياً',
    perk2: '✦ أخبار الطبعات الخاصة',
    perk3: '✦ بلا إعلانات مزعجة',
    emailLabel: 'عنوان بريدك الإلكتروني',
    placeholder: 'reader@example.com',
    joinBtn: 'الانضمام للأتيليه',
    submitting: 'جاري الاشتراك...',
    trustNote: 'يلزم تأكيد الاشتراك الثنائي (Double Opt-in).',
    privacy: 'سياسة الخصوصية',
    successHeading: 'تحقق من بريدك لتأكيد الاشتراك (Double Opt-In)',
    successBody: 'تم إرسال رابط التأكيد.',
    demoNotice: 'الوضع التجريبي: يُحفظ في هذا المتصفح فقط.',
    confirmLink: 'رابط التأكيد (الوضع التجريبي)',
    invalidEmail: 'يرجى إدخال بريد إلكتروني صالح.',
  },
  'zh-Hans': {
    badge: '收藏家通信',
    heading: '来自海滨工作室的信札。',
    subheading: '关于文学的静心随笔与限定版发布的月度信函。',
    perk1: '✦ 每月安静发送一次',
    perk2: '✦ 典藏印本动态',
    perk3: '✦ 绝无垃圾邮件',
    emailLabel: '您的电子邮箱',
    placeholder: 'reader@example.com',
    joinBtn: '加入工坊',
    submitting: '正在加入...',
    trustNote: '需双重验证确认订阅。',
    privacy: '隐私政策',
    successHeading: '请查收邮件以确认订阅（双重确认）',
    successBody: '确认链接已发送，确认后您将收到月度信札。',
    demoNotice: '演示模式：仅保存在当前浏览器的演示存储中。',
    confirmLink: '确认订阅链接（演示模式）',
    invalidEmail: '请输入有效的电子邮箱。',
  },
  ja: {
    badge: 'コレクターズ・ディスパッチ',
    heading: '海辺のアトリエからの手紙。',
    subheading: '文学への思索や新しい版のお知らせを月に一度静かにお届けします。',
    perk1: '✦ 月に一度のお届け',
    perk2: '✦ 特装版・限定版の情報',
    perk3: '✦ 迷惑メールなし',
    emailLabel: 'メールアドレス',
    placeholder: 'reader@example.com',
    joinBtn: 'アトリエに参加',
    submitting: '登録中...',
    trustNote: 'ダブルオプトイン確認が必要です。',
    privacy: 'プライバシーポリシー',
    successHeading: 'メールを確認して登録を完了してください（Double Opt-In）',
    successBody: '確認用リンクを送信しました。',
    demoNotice: 'デモモード：このブラウザでのみ保持されます。',
    confirmLink: '登録確認リンク（デモモード）',
    invalidEmail: '有効なメールアドレスを入力してください。',
  },
  ko: {
    badge: '컬렉터의 서간',
    heading: '해변 아틀리에에서 보내는 편지.',
    subheading: '문학과 잔잔한 사유, 한정판 출간 소식을 한 달에 한 번 전합니다.',
    perk1: '✦ 한 달에 한 번 발송',
    perk2: '✦ 소장판 발행 소식',
    perk3: '✦ 스팸 없음',
    emailLabel: '이메일 주소',
    placeholder: 'reader@example.com',
    joinBtn: '아틀리에 참여',
    submitting: '참여 중...',
    trustNote: '이중 확인(Double Opt-In)이 필요합니다.',
    privacy: '개인정보처리방침',
    successHeading: '구독 확인을 위해 편지함을 확인하세요 (Double Opt-In)',
    successBody: '확인 링크가 전송되었습니다.',
    demoNotice: '데모 모드: 이 브라우저의 로컬 저장소에만 저장됩니다.',
    confirmLink: '구독 확인 링크 (데모 모드)',
    invalidEmail: '유효한 이메일 주소를 입력해 주세요.',
  },
  ru: {
    badge: 'ВЕСТНИК КОЛЛЕКЦИОНЕРА',
    heading: 'Письма из прибрежной студии.',
    subheading: 'Литературные размышления и анонсы коллекционных изданий раз в месяц.',
    perk1: '✦ РАЗ В МЕСЯЦ',
    perk2: '✦ НОВОСТИ ИЗДАНИЙ',
    perk3: '✦ БЕЗ СПАМА',
    emailLabel: 'Ваш адрес эл. почты',
    placeholder: 'reader@example.com',
    joinBtn: 'Присоединиться к ателье',
    submitting: 'Подключение...',
    trustNote: 'Требуется двойное подтверждение (Double Opt-In).',
    privacy: 'Политика конфиденциальности',
    successHeading: 'Проверьте почту для подтверждения (Double Opt-In)',
    successBody: 'Ссылка для подтверждения отправлена.',
    demoNotice: 'Демо-режим: данные сохранены только в этом браузере.',
    confirmLink: 'Ссылка подтверждения (Демо)',
    invalidEmail: 'Введите корректный адрес эл. почты.',
  },
};

export default function Home() {
  const featured = books[0];
  const { language, t } = useLanguage();
  const nlT = NEWSLETTER_I18N[language] || NEWSLETTER_I18N.en;
  const latestArticles = journalArticles.slice(0, 2);
  const [subscribed, setSubscribed] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [confirmUrl, setConfirmUrl] = useState<string | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterError('');

    const emailTrimmed = newsletterEmail.trim();
    if (!emailTrimmed || !emailTrimmed.includes('@') || !emailTrimmed.includes('.')) {
      setNewsletterError(nlT.invalidEmail);
      return;
    }

    setNewsletterLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'subscribe',
          email: emailTrimmed,
          source: 'home footer',
        }),
      });
      const data = await res.json();
      setNewsletterLoading(false);

      if (!res.ok || !data.success) {
        setNewsletterError(data.error || 'Failed to subscribe. Please try again.');
        return;
      }

      setSubscribed(true);
      if (data.confirmUrl) {
        setConfirmUrl(data.confirmUrl);
      }
    } catch {
      setNewsletterLoading(false);
      setNewsletterError('An unexpected error occurred. Please try again.');
    }
  };

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'Novel' | 'Essays' | 'E-book'>('all');
  const [activeThought, setActiveThought] = useState<{ content: string; attribution?: string } | null>(null);

  useEffect(() => {
    function syncThought() {
      if (typeof window === 'undefined') return;
      try {
        const raw = window.localStorage.getItem('ann_admin_v1_store');
        if (raw) {
          const store = JSON.parse(raw);
          if (Array.isArray(store.thoughts)) {
            const published = store.thoughts
              .filter((t: { status: string; order: number }) => t.status === 'published')
              .sort((a: { order: number }, b: { order: number }) => a.order - b.order);
            if (published.length > 0) {
              setActiveThought({ content: published[0].content, attribution: published[0].attribution });
              return;
            }
          }
        }
      } catch {
        // Fall back to default static note
      }
      setActiveThought(null);
    }

    syncThought();
    window.addEventListener('ann_thoughts_updated', syncThought);
    window.addEventListener('storage', syncThought);
    return () => {
      window.removeEventListener('ann_thoughts_updated', syncThought);
      window.removeEventListener('storage', syncThought);
    };
  }, []);

  const filteredBooks = selectedFilter === 'all'
    ? books
    : books.filter((b) => b.category.toLowerCase().includes(selectedFilter.toLowerCase()));

  return (
    <>
      {/* 1. Hero Section — The Collector's Edition Centerpiece */}
      <Section className="hero-section">
        <Container className="hero">
          <motion.div
            className="hero-copy"
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            custom={0}
          >
            <div className="hero-kicker">
              <span className="archival-badge">
                <span className="tiny-dot" aria-hidden="true" />
                ARCHIVAL FIRST IMPRESSION // VOL. 01
              </span>
            </div>

            <h1>
              Some stories<br />
              stay <em>with us.</em>
            </h1>

            <p className="hero-description">
              A family, one long rainy season, and the small choices that quietly change everything.
              An intimate exploration of memory, loss, and the courage to return.
            </p>

            <div className="hero-actions">
              <Link className="button button-dark" href={`/books/${featured.slug}`}>
                {t('discoverBook')} <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link className="text-link" href={`/books/${featured.slug}/chapter-one`}>
                {t('readChapterOne')} <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>

            <div className="hero-note">
              <span className="note-line" aria-hidden="true" />
              Composed unhurriedly on acid-free paper from the rain-swept southern coast.
            </div>
          </motion.div>

          {/* 3D Physical Tome Centerpiece */}
          <motion.div
            className="hero-art"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.duration.relaxed, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="art-sun" aria-hidden="true" />
            <div className="hero-pedestal-shadow" aria-hidden="true" />

            <div className="art-label">
              <span>[ THE QUIET HOURS ]</span>
              <span>NO. 01 // FIRST EDITION</span>
            </div>

            <div className="hero-book-wrap">
              <Cover book={featured} />
            </div>

            <div className="hero-provenance" aria-hidden="true">
              <span>HARDCOVER IN NATURAL CLOTH</span>
              <span className="provenance-sep">✦</span>
              <span>384 PAGES</span>
              <span className="provenance-sep">✦</span>
              <span>SMYTH-SEWN BINDING</span>
            </div>

            <div className="hero-art-caption">
              <span>EDITION 01 / 04</span>
              <span>KERALA ATELIER</span>
            </div>
          </motion.div>

          <a className="scroll-cue" href="#shelf">
            <ArrowDown size={14} aria-hidden="true" /> {t('scrollDiscover')}
          </a>
        </Container>
      </Section>

      {/* 2. Marquee Band — The Archival Woven Linen Ribbon */}
      <div className="marquee-band" role="region" aria-label="Key themes and taxonomy">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div className="marquee-item" key={copy} aria-hidden={copy === 1 ? 'true' : undefined}>
              {marqueeItems.map((item, i) => (
                <span key={`${copy}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                  <i aria-hidden="true">✦</i>
                  <span>{item.roman}. {item.title}</span>
                  <span className="marquee-num">[{item.num}]</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 3. The Shelf — The Salon Specimen Table */}
      <Section id="shelf" className="shelf-section">
        <Container>
          <Reveal variant="fadeUp">
            <div className="section-heading">
              <div>
                <span className="eyebrow">[ 2026 CATALOGUE // EDITIONS 01 — 04 ]</span>
                <h2>{t('curatedShelfTitle')}</h2>
              </div>
              <Link className="text-link" href="/books">
                {t('exploreAll')} <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>

            {/* Filter Pill Switcher */}
            <div className="shelf-controls">
              <div className="shelf-filters" role="tablist" aria-label="Filter volumes by category">
                <button
                  type="button"
                  className={`shelf-filter-btn ${selectedFilter === 'all' ? 'is-active' : ''}`}
                  onClick={() => setSelectedFilter('all')}
                  role="tab"
                  aria-selected={selectedFilter === 'all'}
                >
                  All Volumes (4)
                </button>
                <button
                  type="button"
                  className={`shelf-filter-btn ${selectedFilter === 'Novel' ? 'is-active' : ''}`}
                  onClick={() => setSelectedFilter('Novel')}
                  role="tab"
                  aria-selected={selectedFilter === 'Novel'}
                >
                  Novels (2)
                </button>
                <button
                  type="button"
                  className={`shelf-filter-btn ${selectedFilter === 'Essays' ? 'is-active' : ''}`}
                  onClick={() => setSelectedFilter('Essays')}
                  role="tab"
                  aria-selected={selectedFilter === 'Essays'}
                >
                  Essays (1)
                </button>
                <button
                  type="button"
                  className={`shelf-filter-btn ${selectedFilter === 'E-book' ? 'is-active' : ''}`}
                  onClick={() => setSelectedFilter('E-book')}
                  role="tab"
                  aria-selected={selectedFilter === 'E-book'}
                >
                  Digital Folios (1)
                </button>
              </div>

              <span className="eyebrow" style={{ fontSize: '14px' }}>
                ARCHIVAL LINEN & DECKLE EDITIONS
              </span>
            </div>
          </Reveal>

          <Reveal variant="fadeUp" delay={0.15}>
            <BookGrid items={filteredBooks} />
          </Reveal>
        </Container>
      </Section>

      {/* 4. Author Section — The Atelier Chamber (High-Contrast Dramatic Break) */}
      <Section className="author-outer-section">
        <Container>
          <Reveal variant="scaleUp">
            <div className="author-section">
              {/* Studio Window Art with Passe-Partout & Brass Corner Tabs */}
              <div className="author-art">
                <div className="author-monogram" aria-hidden="true">
                  A.
                </div>
                <div className="author-photo-matting">
                  <div className="brass-tab brass-tl" aria-hidden="true" />
                  <div className="brass-tab brass-tr" aria-hidden="true" />
                  <div className="brass-tab brass-bl" aria-hidden="true" />
                  <div className="brass-tab brass-br" aria-hidden="true" />
                  <Image
                    src="/images/author-studio.jpg"
                    alt="Ann's coastal writing desk overlooking the rain-swept southern coast"
                    width={800}
                    height={600}
                    className="author-studio-img"
                    priority
                  />
                </div>
                <div className="author-photo-note">
                  <span>ANN&apos;S DESK // KERALA COAST</span>
                  <span>EST. MMXXIV</span>
                </div>
              </div>

              {/* Atelier Reflection & Hand-Pressed Note */}
              <div className="author-copy">
                <span className="eyebrow">[ ATELIER REFLECTIONS // THE AUTHOR ]</span>
                <h2>
                  Every story begins<br />
                  with <em>something small.</em>
                </h2>
                <p>
                  Sometimes it is a sound from another room when the household is asleep.
                  Sometimes it is the smell of rain on a familiar veranda.
                  Ann writes about the quiet, unhurried moments that irrevocably alter who we become.
                </p>

                <div className="stationery-note" data-testid="homepage-author-note">
                  <p>
                    &ldquo;{activeThought?.content || "Words, like rainfall, find their own level if given enough quiet. Composed unhurriedly on acid-free archival paper."}&rdquo;
                  </p>
                </div>

                <div className="author-signature-wrap">
                  <Link className="text-link" style={{ color: '#FAF7F2' }} href="/about">
                    {t('getToknowAnn')} <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                  <span className="author-signature-gold">Ann.</span>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* 5. Quote Section — The Architectural Sanctuary */}
      <Section className="quote-section">
        <Container>
          <Reveal variant="fadeUpSlow">
            <span className="eyebrow">[ A THOUGHT TO KEEP ]</span>
            <blockquote data-testid="homepage-quote-note">
              &ldquo;{activeThought?.content || "Somewhere between the rain and the remembering, we find our way home."}&rdquo;
            </blockquote>

            {/* Blind-Embossed Wax Seal Emblem */}
            <div className="wax-seal-wrapper">
              <svg
                className="wax-seal-emblem"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="50" cy="50" r="46" fill="#722638" />
                <circle cx="50" cy="50" r="42" stroke="#C29B62" strokeWidth="1.5" strokeDasharray="2 2" />
                <circle cx="50" cy="50" r="38" stroke="#C29B62" strokeWidth="1" />
                <text
                  x="50"
                  y="58"
                  textAnchor="middle"
                  fontFamily="var(--font-serif), Georgia, serif"
                  fontSize="24"
                  fontStyle="italic"
                  fontWeight="600"
                  fill="#FFFDF9"
                >
                  A.
                </text>
                <text
                  x="50"
                  y="72"
                  textAnchor="middle"
                  fontFamily="var(--font-sans), monospace"
                  fontSize="6.5"
                  letterSpacing="2"
                  fill="#E0C89F"
                >
                  MMXXIV
                </text>
              </svg>

              <span className="quote-caption" data-testid="homepage-quote-attribution">
                {activeThought?.attribution || "ANN · FROM THE QUIET HOURS · FIRST EDITION"}
              </span>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* 6. Editorial Journal Preview — The Broadsheet Literary Gazette */}
      <Section style={{ borderTop: '1px solid var(--line)', background: 'var(--paper)' }}>
        <Container>
          <Reveal variant="fadeUp">
            <div className="section-heading">
              <div>
                <span className="eyebrow">[ THE LITERARY GAZETTE // ISSUE NO. 14 ]</span>
                <h2>Notes from the <em>Journal.</em></h2>
              </div>
              <Link className="text-link" href="/journal">
                Read all reflections <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>

          <Reveal variant="fadeUp" delay={0.12} stagger staggerDelay={0.15} className="journal-grid">
            {latestArticles.map((art, idx) => (
              <RevealItem key={art.id}>
                <article className="journal-card">
                  <div>
                    <div className="journal-card-meta">
                      <span className="journal-card-category">
                        FOLIO 0{idx + 1} · {art.category}
                      </span>
                      <span className="journal-read-time">
                        <Clock size={13} aria-hidden="true" /> {art.readTime}
                      </span>
                    </div>
                    <h3>
                      <Link href={`/journal/${art.slug}`}>
                        {art.title}
                      </Link>
                    </h3>
                    <p className="journal-card-excerpt">
                      {art.excerpt}
                    </p>
                  </div>

                  <Link
                    href={`/journal/${art.slug}`}
                    className="text-link"
                    style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.06em' }}
                  >
                    READ ESSAY <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </article>
              </RevealItem>
            ))}
          </Reveal>
        </Container>
      </Section>

      {/* 7. Newsletter Section — The Deckle-Edged Correspondence */}
      <Section id="journal" className="newsletter-outer-section">
        <Container className="newsletter-section">
          <Reveal variant="fadeUp">
            <div className="newsletter-stationery-card">
              {/* Postal Cancellation Stamp */}
              <div className="postal-cancellation" aria-hidden="true">
                KERALA ATELIER · POSTAGE PAID · NO. 88
              </div>

              <div className="newsletter-copy">
                <span className="eyebrow newsletter-badge">
                  <span aria-hidden="true">✍</span> {nlT.badge}
                </span>
                <h2>
                  Letters from the <em>Coastal Studio.</em>
                </h2>
                <p>
                  {nlT.subheading}
                </p>
                <div className="newsletter-perks" aria-hidden="true">
                  <span>{nlT.perk1}</span>
                  <span>{nlT.perk2}</span>
                  <span>{nlT.perk3}</span>
                </div>
              </div>

              <div className="newsletter-interactive">
                {subscribed ? (
                  <div className="newsletter-success-box" data-testid="newsletter-success-box">
                    <div className="success-header">
                      <CheckCircle2 size={22} className="success-icon" aria-hidden="true" />
                      <strong>{nlT.successHeading}</strong>
                    </div>
                    <p>
                      {nlT.successBody}
                    </p>
                    {confirmUrl && (
                      <div
                        data-testid="box-demo-confirmation"
                        style={{
                          marginTop: '14px',
                          padding: '12px 16px',
                          background: '#fdf6b2',
                          border: '1px solid #fce96a',
                          borderRadius: '6px',
                          fontSize: '13px',
                        }}
                      >
                        <p style={{ margin: '0 0 6px', color: '#723b10', fontWeight: 600 }}>
                          {nlT.demoNotice}
                        </p>
                        <Link
                          href={confirmUrl}
                          data-testid="link-demo-confirm-subscription"
                          style={{ color: 'var(--wine)', fontWeight: 600, textDecoration: 'underline' }}
                        >
                          {nlT.confirmLink} →
                        </Link>
                      </div>
                    )}
                    <small style={{ display: 'block', marginTop: '12px' }}>
                      {SITE_CONFIG.complianceMailingAddress} · {SITE_CONFIG.unsubscribeNotice} ·{' '}
                      <Link href="/privacy" style={{ textDecoration: 'underline' }}>
                        {nlT.privacy}
                      </Link>
                    </small>
                  </div>
                ) : (
                  <form
                    className="newsletter-form"
                    data-testid="newsletter-form"
                    onSubmit={handleNewsletterSubmit}
                  >
                    <label htmlFor="newsletter-email">{nlT.emailLabel}</label>
                    {newsletterError && (
                      <p
                        data-testid="newsletter-error"
                        style={{
                          color: '#b91c1c',
                          background: '#fee2e2',
                          border: '1px solid #fecaca',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          fontSize: '13px',
                          margin: '4px 0 10px',
                        }}
                      >
                        {newsletterError}
                      </p>
                    )}
                    <div className="newsletter-input-group">
                      <Mail size={18} className="input-prefix-icon" aria-hidden="true" />
                      <input
                        id="newsletter-email"
                        data-testid="input-newsletter-email"
                        type="email"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        required
                        placeholder={nlT.placeholder}
                      />
                      <button
                        type="submit"
                        data-testid="btn-newsletter-submit"
                        className="newsletter-submit-btn"
                        aria-label="Submit email for newsletter"
                        disabled={newsletterLoading}
                        style={{ minWidth: '44px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <span>{newsletterLoading ? nlT.submitting : nlT.joinBtn}</span>
                        <ArrowRight size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="newsletter-trust-note">
                      <Lock size={13} aria-hidden="true" />
                      <small>
                        {nlT.trustNote} {SITE_CONFIG.unsubscribeNotice} ·{' '}
                        <Link href="/privacy" style={{ textDecoration: 'underline' }}>
                          {nlT.privacy}
                        </Link>
                      </small>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
