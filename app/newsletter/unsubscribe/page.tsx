'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, RotateCcw, ArrowRight } from 'lucide-react';
import Container from '@/components/container';
import Section from '@/components/section';
import { useLanguage } from '@/contexts/language-context';

const UNSUBSCRIBE_I18N: Record<string, Record<string, string>> = {
  en: {
    title: 'The Collector’s Dispatch',
    processing: 'Processing your unsubscribe request...',
    unsubscribedTitle: 'You have been unsubscribed',
    unsubscribedBody: 'You will no longer receive monthly dispatches from the coastal atelier.',
    resubscribeNotice: 'Made a mistake? You can resubscribe anytime.',
    resubscribeBtn: 'Resubscribe to Atelier',
    resubscribing: 'Resubscribing...',
    resubscribeSuccess: 'Check your inbox to confirm your subscription (Double Opt-In)',
    demoNotice: 'Demo Mode: Stored in browser demo storage, visible only in this browser.',
    confirmLink: 'Confirm Subscription Link (Demo Mode)',
    returnHome: 'Return to Homepage',
    errorTitle: 'Unsubscribe Link Invalid',
    invalidToken: 'This unsubscribe link is invalid or has expired.',
  },
  es: {
    title: 'El Despacho del Coleccionista',
    processing: 'Procesando su solicitud...',
    unsubscribedTitle: 'Ha sido dado de baja',
    unsubscribedBody: 'Ya no recibirá las comunicaciones mensuales del atelier.',
    resubscribeNotice: '¿Fue un error? Puede volver a suscribirse.',
    resubscribeBtn: 'Volver a suscribirse',
    resubscribing: 'Reactivando...',
    resubscribeSuccess: 'Revise su bandeja para confirmar (Doble Opt-In)',
    demoNotice: 'Modo demostración: Guardado solo en este navegador.',
    confirmLink: 'Enlace de confirmación (Modo Demo)',
    returnHome: 'Volver al Inicio',
    errorTitle: 'Enlace no válido',
    invalidToken: 'Este enlace de baja no es válido o ha caducado.',
  },
  fr: {
    title: 'La Dépêche du Collectionneur',
    processing: 'Traitement de votre désinscription...',
    unsubscribedTitle: 'Vous avez été désabonné',
    unsubscribedBody: 'Vous ne recevrez plus nos lettres mensuelles d’atelier.',
    resubscribeNotice: 'Une erreur ? Vous pouvez vous réabonner à tout moment.',
    resubscribeBtn: 'Se réabonner à l’Atelier',
    resubscribing: 'Réinscription...',
    resubscribeSuccess: 'Vérifiez votre boîte pour confirmer (Double Opt-In)',
    demoNotice: 'Mode démo : Enregistré uniquement dans ce navigateur.',
    confirmLink: 'Lien de confirmation (Mode Démo)',
    returnHome: 'Retour à l’accueil',
    errorTitle: 'Lien invalide',
    invalidToken: 'Ce lien de désabonnement est invalide ou expiré.',
  },
  de: {
    title: 'Die Sammler-Depesche',
    processing: 'Abmeldung wird verarbeitet...',
    unsubscribedTitle: 'Sie wurden abgemeldet',
    unsubscribedBody: 'Sie erhalten künftig keine monatlichen Depeschen mehr.',
    resubscribeNotice: 'Versehentlich abgemeldet? Sie können sich jederzeit erneut anmelden.',
    resubscribeBtn: 'Erneut abonnieren',
    resubscribing: 'Anmeldung läuft...',
    resubscribeSuccess: 'Prüfen Sie Ihr Postfach (Double-Opt-In)',
    demoNotice: 'Demo-Modus: Nur in diesem Browser gespeichert.',
    confirmLink: 'Bestätigungslink (Demo-Modus)',
    returnHome: 'Zur Startseite',
    errorTitle: 'Ungültiger Link',
    invalidToken: 'Dieser Abmeldelink ist ungültig oder abgelaufen.',
  },
  'pt-BR': {
    title: 'O Despacho do Colecionador',
    processing: 'Processando cancelamento...',
    unsubscribedTitle: 'Você cancelou sua inscrição',
    unsubscribedBody: 'Você não receberá mais nossos despachos mensais.',
    resubscribeNotice: 'Foi um engano? Você pode se reinscrever a qualquer momento.',
    resubscribeBtn: 'Inscrever-se novamente',
    resubscribing: 'Reinscrevendo...',
    resubscribeSuccess: 'Verifique seu e-mail para confirmar (Double Opt-In)',
    demoNotice: 'Modo de demonstração: Salvo apenas neste navegador.',
    confirmLink: 'Link de confirmação (Modo Demo)',
    returnHome: 'Voltar ao Início',
    errorTitle: 'Link inválido',
    invalidToken: 'Este link de cancelamento é inválido ou expirou.',
  },
  it: {
    title: 'Il Dispaccio del Collezionista',
    processing: 'Elaborazione della disiscrizione...',
    unsubscribedTitle: 'Sei stato disiscritto',
    unsubscribedBody: 'Non riceverai più i dispacci mensili dell’atelier.',
    resubscribeNotice: 'È stato un errore? Puoi reiscriverti in qualsiasi momento.',
    resubscribeBtn: 'Iscriviti di nuovo',
    resubscribing: 'Iscrizione in corso...',
    resubscribeSuccess: 'Controlla la tua casella per confermare (Double Opt-In)',
    demoNotice: 'Modalità Demo: Salvato solo in questo browser.',
    confirmLink: 'Link di conferma (Modalità Demo)',
    returnHome: 'Torna alla Home',
    errorTitle: 'Link non valido',
    invalidToken: 'Questo link di disiscrizione non è valido o è scaduto.',
  },
  hi: {
    title: 'कलेक्टर का संदेश',
    processing: 'सदस्यता समाप्ति की प्रक्रिया जारी है...',
    unsubscribedTitle: 'आपकी सदस्यता समाप्त हो गई है',
    unsubscribedBody: 'अब आपको मासिक संदेश प्राप्त नहीं होंगे।',
    resubscribeNotice: 'क्या यह गलती से हुआ? आप पुनः सदस्यता ले सकते हैं।',
    resubscribeBtn: 'पुनः सदस्यता लें',
    resubscribing: 'पुनः सदस्यता ली जा रही है...',
    resubscribeSuccess: 'पुष्टि करने के लिए इनबॉक्स देखें (डबल ऑप्ट-इन)',
    demoNotice: 'डेमो मोड: केवल इसी ब्राउज़र में सहेजा गया।',
    confirmLink: 'पुष्टिकरण लिंक (डेमो)',
    returnHome: 'होमपेज पर लौटें',
    errorTitle: 'अमान्य लिंक',
    invalidToken: 'यह सदस्यता समाप्ति लिंक अमान्य या समाप्त हो गया है।',
  },
  ml: {
    title: 'കളക്ടറുടെ സന്ദേശം',
    processing: 'സബ്‌സ്ക്രിപ്ഷൻ ഒഴിവാക്കുന്നു...',
    unsubscribedTitle: 'നിങ്ങൾ സബ്‌സ്ക്രിപ്ഷൻ ഒഴിവാക്കി',
    unsubscribedBody: 'ഇനി മുതൽ അറ്റലിയർ കുറിപ്പുകൾ ലഭിക്കില്ല.',
    resubscribeNotice: 'തെറ്റായി സംഭവിച്ചതാണോ? വീണ്ടും സബ്‌സ്‌ക്രൈബ് ചെയ്യാം.',
    resubscribeBtn: 'വീണ്ടും സബ്‌സ്‌ക്രൈബ് ചെയ്യുക',
    resubscribing: 'നടപ്പിലാക്കുന്നു...',
    resubscribeSuccess: 'സ്ഥിരീകരിക്കാൻ ഇൻബോക്സ് പരിശോധിക്കുക (Double Opt-In)',
    demoNotice: 'ഡെമോ മോഡ്: ഈ ബ്രൗസറിൽ മാത്രം സൂക്ഷിക്കുന്നു.',
    confirmLink: 'സ്ഥിരീകരണ ലിങ്ക് (ഡെമോ)',
    returnHome: 'ഹോംപേജിലേക്ക് മടങ്ങുക',
    errorTitle: 'അസാധുവായ ലിങ്ക്',
    invalidToken: 'ഈ ലിങ്ക് അസാധുവാണ് അല്ലെങ്കിൽ കാലാവധി കഴിഞ്ഞു.',
  },
  ta: {
    title: 'கலெக்டர் செய்தி',
    processing: 'சந்தா ரத்து செய்யப்படுகிறது...',
    unsubscribedTitle: 'நீங்கள் சந்தாவிலிருந்து விலகிவிட்டீர்கள்',
    unsubscribedBody: 'இனி மாதாந்திர கடிதங்கள் வராது.',
    resubscribeNotice: 'தவறுதலாக நிகழ்ந்ததா? மீண்டும் இணையலாம்.',
    resubscribeBtn: 'மீண்டும் சந்தா பெறவும்',
    resubscribing: 'இணைகிறது...',
    resubscribeSuccess: 'உறுதிப்படுத்த இன்பாக்ஸைப் பார்க்கவும் (Double Opt-In)',
    demoNotice: 'டெமோ பயன்முறை: இந்த உலாவியில் மட்டுமே சேமிக்கப்படும்.',
    confirmLink: 'உறுதிப்படுத்தல் இணைப்பு (டெமோ)',
    returnHome: 'முகப்புக்குச் செல்',
    errorTitle: 'தவறான இணைப்பு',
    invalidToken: 'இந்த இணைப்பு தவறானது அல்லது காலாவதியானது.',
  },
  ar: {
    title: 'رسائل المقتني',
    processing: 'جاري معالجة إلغاء الاشتراك...',
    unsubscribedTitle: 'تم إلغاء اشتراكك بنجاح',
    unsubscribedBody: 'لن تتلقى رسائل الاستوديو الشهرية بعد الآن.',
    resubscribeNotice: 'هل حدث خطأ؟ يمكنك إعادة الاشتراك متى شئت.',
    resubscribeBtn: 'إعادة الاشتراك في الأتيليه',
    resubscribing: 'جاري إعادة الاشتراك...',
    resubscribeSuccess: 'تحقق من بريدك لتأكيد الاشتراك (Double Opt-In)',
    demoNotice: 'الوضع التجريبي: يُحفظ في هذا المتصفح فقط.',
    confirmLink: 'رابط التأكيد (الوضع التجريبي)',
    returnHome: 'العودة للرئيسية',
    errorTitle: 'رابط غير صالح',
    invalidToken: 'رابط إلغاء الاشتراك غير صالح أو منتهي الصلاحية.',
  },
  'zh-Hans': {
    title: '收藏家通信',
    processing: '正在处理您的退订请求...',
    unsubscribedTitle: '您已成功退订',
    unsubscribedBody: '您将不再收到海滨工作室的月度信札。',
    resubscribeNotice: '误操作？您可以随时重新订阅。',
    resubscribeBtn: '重新订阅工坊',
    resubscribing: '正在重新订阅...',
    resubscribeSuccess: '请查收邮件以确认订阅（双重确认）',
    demoNotice: '演示模式：仅保存在当前浏览器的演示存储中。',
    confirmLink: '确认订阅链接（演示模式）',
    returnHome: '返回主页',
    errorTitle: '链接无效',
    invalidToken: '此退订链接无效或已过期。',
  },
  ja: {
    title: 'コレクターズ・ディスパッチ',
    processing: '配信停止を処理しています...',
    unsubscribedTitle: '配信停止が完了しました',
    unsubscribedBody: '今後、アトリエからの月度通信は配信されません。',
    resubscribeNotice: '誤って解除された場合は、いつでも再登録いただけます。',
    resubscribeBtn: '再度アトリエに登録する',
    resubscribing: '再登録中...',
    resubscribeSuccess: 'メールを確認して登録を完了してください（Double Opt-In）',
    demoNotice: 'デモモード：このブラウザでのみ保持されます。',
    confirmLink: '登録確認リンク（デモモード）',
    returnHome: 'トップページへ戻る',
    errorTitle: '無効なリンク',
    invalidToken: 'この配信停止リンクは無効か期限切れです。',
  },
  ko: {
    title: '컬렉터의 서간',
    processing: '구독 취소를 처리 중입니다...',
    unsubscribedTitle: '구독이 취소되었습니다',
    unsubscribedBody: '더 이상 해변 아틀리에의 월간 서간을 받지 않습니다.',
    resubscribeNotice: '실수이신가요? 언제든지 다시 구독하실 수 있습니다.',
    resubscribeBtn: '아틀리에 다시 구독하기',
    resubscribing: '다시 구독 중...',
    resubscribeSuccess: '구독 확인을 위해 편지함을 확인하세요 (Double Opt-In)',
    demoNotice: '데모 모드: 이 브라우저의 로컬 저장소에만 저장됩니다.',
    confirmLink: '구독 확인 링크 (데모 모드)',
    returnHome: '홈으로 돌아가기',
    errorTitle: '유효하지 않은 링크',
    invalidToken: '이 구독 취소 링크는 유효하지 않거나 만료되었습니다.',
  },
  ru: {
    title: 'Вестник коллекционера',
    processing: 'Обработка отписки...',
    unsubscribedTitle: 'Вы успешно отписались',
    unsubscribedBody: 'Вы больше не будете получать наши ежемесячные письма.',
    resubscribeNotice: 'Ошибка? Вы всегда можете подписаться снова.',
    resubscribeBtn: 'Подписаться снова',
    resubscribing: 'Подписка...',
    resubscribeSuccess: 'Проверьте почту для подтверждения (Double Opt-In)',
    demoNotice: 'Демо-режим: данные сохранены только в этом браузере.',
    confirmLink: 'Ссылка подтверждения (Демо)',
    returnHome: 'На главную',
    errorTitle: 'Недействительная ссылка',
    invalidToken: 'Эта ссылка недействительна или устарела.',
  },
};

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { language } = useLanguage();
  const t = UNSUBSCRIBE_I18N[language] || UNSUBSCRIBE_I18N.en;

  const [loading, setLoading] = useState(true);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Resubscribe state
  const [resubscribing, setResubscribing] = useState(false);
  const [resubscribeSuccess, setResubscribeSuccess] = useState(false);
  const [newConfirmUrl, setNewConfirmUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setErrorMessage(t.invalidToken);
      return;
    }

    async function processUnsubscribe() {
      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'unsubscribe', token }),
        });
        const data = await res.json();
        setLoading(false);
        if (res.ok && data.success) {
          setUnsubscribed(true);
        } else {
          setErrorMessage(data.error || t.invalidToken);
        }
      } catch {
        setLoading(false);
        setErrorMessage(t.invalidToken);
      }
    }

    processUnsubscribe();
  }, [token, t.invalidToken]);

  const handleResubscribe = async () => {
    if (!token) return;
    setResubscribing(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resubscribe', token }),
      });
      const data = await res.json();
      setResubscribing(false);
      if (res.ok && data.success) {
        setResubscribeSuccess(true);
        if (data.confirmUrl) {
          setNewConfirmUrl(data.confirmUrl);
        }
      } else {
        setErrorMessage(data.error || 'Failed to resubscribe');
      }
    } catch {
      setResubscribing(false);
      setErrorMessage('Failed to resubscribe');
    }
  };

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
              <p style={{ fontSize: '16px' }}>{t.processing}</p>
            </div>
          ) : unsubscribed ? (
            <div data-testid="unsubscribe-success-message">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <CheckCircle2 size={48} style={{ color: '#059669' }} />
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '30px',
                  color: 'var(--ink)',
                  margin: '0 0 10px',
                }}
              >
                {t.unsubscribedTitle}
              </h1>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--ink)', margin: '0 0 24px' }}>
                {t.unsubscribedBody}
              </p>

              {resubscribeSuccess ? (
                <div
                  data-testid="box-resubscribe-success"
                  style={{
                    background: '#def7ec',
                    border: '1px solid #bcf0da',
                    borderRadius: '6px',
                    padding: '16px',
                    marginBottom: '24px',
                    textAlign: 'left',
                  }}
                >
                  <strong style={{ color: '#03543f', display: 'block', marginBottom: '6px' }}>
                    {t.resubscribeSuccess}
                  </strong>
                  {newConfirmUrl && (
                    <div style={{ marginTop: '10px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#723b10' }}>
                        {t.demoNotice}
                      </p>
                      <Link
                        href={newConfirmUrl}
                        data-testid="link-demo-confirm-subscription"
                        style={{ color: 'var(--wine)', fontWeight: 600, textDecoration: 'underline', fontSize: '13px' }}
                      >
                        {t.confirmLink} →
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    background: 'var(--white)',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    padding: '20px',
                    marginBottom: '24px',
                  }}
                >
                  <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 14px' }}>
                    {t.resubscribeNotice}
                  </p>
                  <button
                    type="button"
                    data-testid="btn-resubscribe"
                    onClick={handleResubscribe}
                    disabled={resubscribing}
                    className="button button-dark"
                    style={{
                      minHeight: '44px',
                      padding: '10px 22px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: resubscribing ? 'wait' : 'pointer',
                    }}
                  >
                    <RotateCcw size={16} />
                    <span>{resubscribing ? t.resubscribing : t.resubscribeBtn}</span>
                  </button>
                </div>
              )}

              <div>
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
            </div>
          ) : (
            <div data-testid="unsubscribe-error-message">
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
              <p style={{ fontSize: '15px', color: 'var(--ink)', margin: '0 0 24px' }}>
                {errorMessage}
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

export default function NewsletterUnsubscribePage() {
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
      <UnsubscribeContent />
    </Suspense>
  );
}

