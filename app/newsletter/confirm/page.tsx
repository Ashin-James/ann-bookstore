'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Container from '@/components/container';
import Section from '@/components/section';
import { useLanguage } from '@/contexts/language-context';

const CONFIRM_I18N: Record<string, Record<string, string>> = {
  en: {
    title: 'The Collector’s Dispatch',
    verifying: 'Verifying your subscription...',
    successTitle: 'Subscription Confirmed',
    successSubtitle: 'Welcome to The Collector’s Dispatch.',
    successBody: 'Your email has been verified. You will receive occasional letters on writing, quiet reflections, and archival book editions.',
    unsubscribeNotice: 'If you ever wish to leave, you can manage your preferences or unsubscribe at any time.',
    unsubscribeLink: 'Unsubscribe options',
    returnHome: 'Return to Homepage',
    errorTitle: 'Verification Failed',
    invalidToken: 'This confirmation link is invalid or has already been used.',
    tryAgain: 'Please subscribe again from the homepage.',
  },
  es: {
    title: 'El Despacho del Coleccionista',
    verifying: 'Verificando su suscripción...',
    successTitle: 'Suscripción Confirmada',
    successSubtitle: 'Bienvenido al Despacho del Coleccionista.',
    successBody: 'Su correo ha sido verificado. Recibirá cartas sobre escritura y ediciones especiales.',
    unsubscribeNotice: 'Puede cancelar su suscripción en cualquier momento.',
    unsubscribeLink: 'Opciones de cancelación',
    returnHome: 'Volver al Inicio',
    errorTitle: 'Error de verificación',
    invalidToken: 'Este enlace de confirmación no es válido o ya ha sido utilizado.',
    tryAgain: 'Por favor, suscríbase nuevamente desde la página principal.',
  },
  fr: {
    title: 'La Dépêche du Collectionneur',
    verifying: 'Vérification de votre abonnement...',
    successTitle: 'Abonnement Confirmé',
    successSubtitle: 'Bienvenue à La Dépêche du Collectionneur.',
    successBody: 'Votre adresse a été vérifiée. Vous recevrez nos lettres d’atelier et annonces d’éditions.',
    unsubscribeNotice: 'Vous pouvez vous désabonner à tout moment.',
    unsubscribeLink: 'Se désabonner',
    returnHome: 'Retour à l’accueil',
    errorTitle: 'Échec de la vérification',
    invalidToken: 'Ce lien de confirmation est invalide ou a déjà été utilisé.',
    tryAgain: 'Veuillez vous réinscrire depuis la page d’accueil.',
  },
  de: {
    title: 'Die Sammler-Depesche',
    verifying: 'Abonnement wird bestätigt...',
    successTitle: 'Abonnement Bestätigt',
    successSubtitle: 'Willkommen bei der Sammler-Depesche.',
    successBody: 'Ihre E-Mail wurde bestätigt. Sie erhalten künftig unsere monatlichen Atelierbriefe.',
    unsubscribeNotice: 'Sie können sich jederzeit wieder abmelden.',
    unsubscribeLink: 'Abmeldeoptionen',
    returnHome: 'Zur Startseite',
    errorTitle: 'Bestätigung fehlgeschlagen',
    invalidToken: 'Dieser Bestätigungslink ist ungültig oder wurde bereits verwendet.',
    tryAgain: 'Bitte melden Sie sich auf der Startseite erneut an.',
  },
  'pt-BR': {
    title: 'O Despacho do Colecionador',
    verifying: 'Verificando sua inscrição...',
    successTitle: 'Inscrição Confirmada',
    successSubtitle: 'Bem-vindo ao Despacho do Colecionador.',
    successBody: 'Seu e-mail foi verificado com sucesso. Você receberá nossas cartas mensais.',
    unsubscribeNotice: 'Você pode cancelar sua inscrição a qualquer momento.',
    unsubscribeLink: 'Opções de cancelamento',
    returnHome: 'Voltar ao Início',
    errorTitle: 'Falha na verificação',
    invalidToken: 'Este link de confirmação é inválido ou já foi utilizado.',
    tryAgain: 'Por favor, inscreva-se novamente na página inicial.',
  },
  it: {
    title: 'Il Dispaccio del Collezionista',
    verifying: 'Verifica dell’iscrizione in corso...',
    successTitle: 'Iscrizione Confermata',
    successSubtitle: 'Benvenuto nel Dispaccio del Collezionista.',
    successBody: 'Il tuo indirizzo email è stato verificato. Riceverai le nostre lettere periodiche.',
    unsubscribeNotice: 'Puoi annullare l’iscrizione in qualsiasi momento.',
    unsubscribeLink: 'Opzioni di disiscrizione',
    returnHome: 'Torna alla Home',
    errorTitle: 'Verifica non riuscita',
    invalidToken: 'Questo link di conferma non è valido o è già stato utilizzato.',
    tryAgain: 'Iscriviti nuovamente dalla pagina principale.',
  },
  hi: {
    title: 'कलेक्टर का संदेश',
    verifying: 'आपकी सदस्यता का सत्यापन किया जा रहा है...',
    successTitle: 'सदस्यता की पुष्टि हुई',
    successSubtitle: 'कलेक्टर के संदेश में आपका स्वागत है।',
    successBody: 'आपके ईमेल का सत्यापन हो गया है। आपको शांत विचार और संस्करण समाचार प्राप्त होंगे।',
    unsubscribeNotice: 'आप किसी भी समय सदस्यता समाप्त कर सकते हैं।',
    unsubscribeLink: 'सदस्यता समाप्ति विकल्प',
    returnHome: 'होमपेज पर लौटें',
    errorTitle: 'सत्यापन विफल रहा',
    invalidToken: 'यह पुष्टिकरण लिंक अमान्य है या पहले ही उपयोग किया जा चुका है।',
    tryAgain: 'कृपया होमपेज से पुनः सदस्यता लें।',
  },
  ml: {
    title: 'കളക്ടറുടെ സന്ദേശം',
    verifying: 'സബ്‌സ്ക്രിപ്ഷൻ സ്ഥിരീകരിക്കുന്നു...',
    successTitle: 'സബ്‌സ്ക്രിപ്ഷൻ സ്ഥിരീകരിച്ചു',
    successSubtitle: 'കളക്ടറുടെ സന്ദേശത്തിലേക്ക് സ്വാഗതം.',
    successBody: 'നിങ്ങളുടെ ഇമെയിൽ വിജയകരമായി സ്ഥിരീകരിച്ചു. തുടർന്ന് മാസക്കുറിപ്പുകൾ ലഭ്യമാകും.',
    unsubscribeNotice: 'നിങ്ങൾക്ക് എപ്പോൾ വേണമെങ്കിലും സബ്‌സ്ക്രിപ്ഷൻ ഒഴിവാക്കാം.',
    unsubscribeLink: 'ഒഴിവാക്കാനുള്ള വിവരങ്ങൾ',
    returnHome: 'ഹോംപേജിലേക്ക് മടങ്ങുക',
    errorTitle: 'സ്ഥിരീകരണം പരാജയപ്പെട്ടു',
    invalidToken: 'ഈ സ്ഥിരീകരണ ലിങ്ക് അസാധുവാണ് അല്ലെങ്കിൽ ഇതിനകം ഉപയോഗിച്ചതാണ്.',
    tryAgain: 'ദയവായി ഹോംപേജിൽ നിന്ന് വീണ്ടും സബ്‌സ്‌ക്രൈബ് ചെയ്യുക.',
  },
  ta: {
    title: 'கலெக்டர் செய்தி',
    verifying: 'சரிபார்க்கப்படுகிறது...',
    successTitle: 'சந்தா உறுதிப்படுத்தப்பட்டது',
    successSubtitle: 'கலெக்டர் செய்திக்கு நல்வரவு.',
    successBody: 'உங்கள் மின்னஞ்சல் சரிபார்க்கப்பட்டது. இனி மாதாந்திர கடிதங்கள் உங்களுக்கு வரும்.',
    unsubscribeNotice: 'நீங்கள் எப்போது வேண்டுமானாலும் சந்தாவை ரத்து செய்யலாம்.',
    unsubscribeLink: 'விலகுவதற்கான விருப்பங்கள்',
    returnHome: 'முகப்புக்குச் செல்',
    errorTitle: 'சரிபார்ப்பு தோல்வியடைந்தது',
    invalidToken: 'இந்த இணைப்பு தவறானது அல்லது ஏற்கனவே பயன்படுத்தப்பட்டது.',
    tryAgain: 'முகப்புப் பக்கத்திலிருந்து மீண்டும் பதிவு செய்யவும்.',
  },
  ar: {
    title: 'رسائل المقتني',
    verifying: 'جاري تأكيد اشتراكك...',
    successTitle: 'تم تأكيد الاشتراك',
    successSubtitle: 'مرحباً بك في رسائل المقتني.',
    successBody: 'تم التحقق من بريدك الإلكتروني بنجاح. ستصلك رسائلنا الشهرية الهادئة.',
    unsubscribeNotice: 'يمكنك إلغاء الاشتراك في أي وقت.',
    unsubscribeLink: 'خيارات إلغاء الاشتراك',
    returnHome: 'العودة للرئيسية',
    errorTitle: 'فشل التأكيد',
    invalidToken: 'هذا الرابط غير صالح أو تم استخدامه مسبقاً.',
    tryAgain: 'يرجى إعادة الاشتراك من الصفحة الرئيسية.',
  },
  'zh-Hans': {
    title: '收藏家通信',
    verifying: '正在验证您的订阅...',
    successTitle: '订阅已确认',
    successSubtitle: '欢迎订阅收藏家通信。',
    successBody: '您的邮箱已验证成功。您将定期收到关于文学与典藏版的月度信札。',
    unsubscribeNotice: '您可以随时管理或取消订阅。',
    unsubscribeLink: '退订选项',
    returnHome: '返回主页',
    errorTitle: '验证失败',
    invalidToken: '此确认链接无效或已被使用。',
    tryAgain: '请从主页重新订阅。',
  },
  ja: {
    title: 'コレクターズ・ディスパッチ',
    verifying: '登録を確認しています...',
    successTitle: '登録が完了しました',
    successSubtitle: 'コレクターズ・ディスパッチへようこそ。',
    successBody: 'メールアドレスの確認が完了しました。アトリエからの月度通信をお届けします。',
    unsubscribeNotice: '配信停止はいつでも行えます。',
    unsubscribeLink: '配信停止オプション',
    returnHome: 'トップページへ戻る',
    errorTitle: '確認に失敗しました',
    invalidToken: 'この確認リンクは無効か、すでに使用されています。',
    tryAgain: 'トップページから再度ご登録ください。',
  },
  ko: {
    title: '컬렉터의 서간',
    verifying: '구독을 확인하는 중입니다...',
    successTitle: '구독이 확인되었습니다',
    successSubtitle: '컬렉터의 서간에 오신 것을 환영합니다.',
    successBody: '이메일 인증이 완료되었습니다. 조용한 문학과 출간 소식을 전해드리겠습니다.',
    unsubscribeNotice: '언제든지 구독을 취소하실 수 있습니다.',
    unsubscribeLink: '구독 취소 옵션',
    returnHome: '홈으로 돌아가기',
    errorTitle: '인증 실패',
    invalidToken: '이 확인 링크는 유효하지 않거나 이미 사용되었습니다.',
    tryAgain: '홈페이지에서 다시 신청해 주세요.',
  },
  ru: {
    title: 'Вестник коллекционера',
    verifying: 'Подтверждение подписки...',
    successTitle: 'Подписка подтверждена',
    successSubtitle: 'Добро пожаловать в Вестник коллекционера.',
    successBody: 'Ваш адрес подтвержден. Вы будете получать наши тихие ежемесячные письма.',
    unsubscribeNotice: 'Вы можете отписаться в любое время.',
    unsubscribeLink: 'Настройки отписки',
    returnHome: 'На главную',
    errorTitle: 'Ошибка подтверждения',
    invalidToken: 'Эта ссылка недействительна или уже была использована.',
    tryAgain: 'Пожалуйста, оформите подписку заново на главной странице.',
  },
};

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { language } = useLanguage();
  const t = CONFIRM_I18N[language] || CONFIRM_I18N.en;

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [unsubscribeUrl, setUnsubscribeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setErrorMessage(t.invalidToken);
      return;
    }

    async function confirmToken() {
      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'confirm', token }),
        });
        const data = await res.json();
        setLoading(false);
        if (res.ok && data.success) {
          setSuccess(true);
          if (data.unsubscribeUrl) {
            setUnsubscribeUrl(data.unsubscribeUrl);
          }
        } else {
          setErrorMessage(data.error || t.invalidToken);
        }
      } catch {
        setLoading(false);
        setErrorMessage(t.invalidToken);
      }
    }

    confirmToken();
  }, [token, t.invalidToken]);

  return (
    <Section style={{ padding: '80px 0', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <Container style={{ maxWidth: '640px' }}>
        <div
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'inline-flex', marginBottom: '16px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--wine)',
                fontWeight: 600,
              }}
            >
              ✍ {t.title}
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '24px 0', color: 'var(--muted)' }}>
              <p style={{ fontSize: '16px' }}>{t.verifying}</p>
            </div>
          ) : success ? (
            <div data-testid="confirm-success-message">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <CheckCircle2 size={48} style={{ color: '#059669' }} />
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '32px',
                  color: 'var(--ink)',
                  margin: '0 0 10px',
                }}
              >
                {t.successTitle}
              </h1>
              <p style={{ fontSize: '18px', fontStyle: 'italic', color: 'var(--muted)', margin: '0 0 18px' }}>
                {t.successSubtitle}
              </p>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--ink)', margin: '0 0 24px' }}>
                {t.successBody}
              </p>

              {unsubscribeUrl && (
                <div style={{ marginBottom: '24px', fontSize: '13px', color: 'var(--muted)' }}>
                  <span>{t.unsubscribeNotice} </span>
                  <Link
                    href={unsubscribeUrl}
                    data-testid="link-manage-unsubscribe"
                    style={{ color: 'var(--wine)', textDecoration: 'underline', fontWeight: 500 }}
                  >
                    {t.unsubscribeLink}
                  </Link>
                </div>
              )}

              <Link
                href="/"
                data-testid="link-return-home"
                className="button button-dark"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  minHeight: '44px',
                  padding: '10px 24px',
                }}
              >
                <span>{t.returnHome}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div data-testid="confirm-error-message">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <AlertCircle size={48} style={{ color: '#dc2626' }} />
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '28px',
                  color: '#dc2626',
                  margin: '0 0 12px',
                }}
              >
                {t.errorTitle}
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--ink)', margin: '0 0 8px' }}>
                {errorMessage}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 24px' }}>
                {t.tryAgain}
              </p>

              <Link
                href="/"
                data-testid="link-return-home"
                className="button button-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  minHeight: '44px',
                  padding: '10px 24px',
                }}
              >
                <span>{t.returnHome}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

export default function NewsletterConfirmPage() {
  return (
    <Suspense
      fallback={
        <Section style={{ padding: '80px 0', textAlign: 'center' }}>
          <Container>
            <p>Loading...</p>
          </Container>
        </Section>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}

