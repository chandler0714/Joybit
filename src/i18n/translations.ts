export const LANGUAGE_CODES = ['en', 'ja', 'ko', 'fr', 'es', 'ru', 'de'] as const;
export type LanguageCode = (typeof LANGUAGE_CODES)[number];
export type LanguagePreference = LanguageCode | 'auto';
export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English', ja: '日本語', ko: '한국어', fr: 'Français', es: 'Español', ru: 'Русский', de: 'Deutsch',
};

type Seven = readonly [string, string, string, string, string, string, string];
export const translations = {
  settingsTitle: ['Settings', '設定', '설정', 'Paramètres', 'Ajustes', 'Настройки', 'Einstellungen'],
  language: ['Language', '言語', '언어', 'Langue', 'Idioma', 'Язык', 'Sprache'],
  autoLanguage: ['Follow device', '端末の言語に合わせる', '기기 언어 사용', 'Suivre l’appareil', 'Usar idioma del dispositivo', 'Как на устройстве', 'Gerätesprache verwenden'],
  homeTitle: ['Games', 'ゲーム', '게임', 'Jeux', 'Juegos', 'Игры', 'Spiele'],
  emptyCatalog: ['No games available', '現在ゲームはありません', '현재 이용할 수 있는 게임이 없습니다', 'Aucun jeu disponible', 'No hay juegos disponibles', 'Игры пока недоступны', 'Keine Spiele verfügbar'],
  emptyCatalogHint: ['The game library is empty.', 'ゲーム一覧は空です。', '게임 목록이 비어 있습니다.', 'La bibliothèque de jeux est vide.', 'La biblioteca de juegos está vacía.', 'Библиотека игр пуста.', 'Die Spielebibliothek ist leer.'],
  backToHome: ['Back to home', 'ホームに戻る', '홈으로 돌아가기', 'Retour à l’accueil', 'Volver al inicio', 'На главную', 'Zur Startseite'],
  loginToAccount: ['Sign in to manage your account', 'ログインしてアカウントを管理', '로그인하여 계정을 관리하세요', 'Connectez-vous pour gérer votre compte', 'Inicia sesión para gestionar tu cuenta', 'Войдите, чтобы управлять аккаунтом', 'Melde dich an, um dein Konto zu verwalten'],
  profileTitle: ['Account', 'アカウント', '계정', 'Compte', 'Cuenta', 'Аккаунт', 'Konto'],
  menuOpen: ['Open menu', 'メニューを開く', '메뉴 열기', 'Ouvrir le menu', 'Abrir menú', 'Открыть меню', 'Menü öffnen'],
  menuClose: ['Close menu', 'メニューを閉じる', '메뉴 닫기', 'Fermer le menu', 'Cerrar menú', 'Закрыть меню', 'Menü schließen'],
  menuScrim: ['Tap outside to close menu', '外側をタップして閉じる', '바깥쪽을 눌러 메뉴 닫기', 'Touchez à l’extérieur pour fermer', 'Toca fuera para cerrar', 'Нажмите вне меню, чтобы закрыть', 'Außerhalb tippen zum Schließen'],
  guest: ['Guest', 'ゲスト', '게스트', 'Invité', 'Invitado', 'Гость', 'Gast'],
  welcomeJoybit: ['Welcome to Joybit', 'Joybit へようこそ', 'Joybit에 오신 것을 환영해요', 'Bienvenue sur Joybit', 'Te damos la bienvenida a Joybit', 'Добро пожаловать в Joybit', 'Willkommen bei Joybit'],
  signOut: ['Sign out', 'ログアウト', '로그아웃', 'Se déconnecter', 'Cerrar sesión', 'Выйти', 'Abmelden'],
  deleteAccount: ['Delete account', 'アカウントを削除', '계정 삭제', 'Supprimer le compte', 'Eliminar cuenta', 'Удалить аккаунт', 'Konto löschen'],
  loginRegister: ['Sign in / Register', 'ログイン / 登録', '로그인 / 가입', 'Connexion / Inscription', 'Entrar / Registrarse', 'Вход / Регистрация', 'Anmelden / Registrieren'],
  signInJoybit: ['Sign in to Joybit', 'Joybit にログイン', 'Joybit 로그인', 'Se connecter à Joybit', 'Entrar en Joybit', 'Войти в Joybit', 'Bei Joybit anmelden'],
  aboutJoybit: ['About Joybit', 'Joybit について', 'Joybit 정보', 'À propos de Joybit', 'Acerca de Joybit', 'О Joybit', 'Über Joybit'],
  aboutDetail: ['Joybit account and settings.', 'Joybit のアカウントと設定。', 'Joybit 계정 및 설정.', 'Compte et paramètres Joybit.', 'Cuenta y ajustes de Joybit.', 'Аккаунт и настройки Joybit.', 'Joybit-Konto und Einstellungen.'],
  welcomeBack: ['Welcome back', 'おかえりなさい', '다시 오신 것을 환영해요', 'Bon retour', 'Te damos la bienvenida de nuevo', 'С возвращением', 'Willkommen zurück'],
  helloPlayer: ['Hello', 'こんにちは', '안녕하세요', 'Bonjour', 'Hola', 'Здравствуйте', 'Hallo'],
  drawerTagline: ['JOYBIT', 'JOYBIT', 'JOYBIT', 'JOYBIT', 'JOYBIT', 'JOYBIT', 'JOYBIT'],
  homeEyebrow: ['JOYBIT', 'JOYBIT', 'JOYBIT', 'JOYBIT', 'JOYBIT', 'JOYBIT', 'JOYBIT'],
  tryAgain: ['Please try again', 'もう一度お試しください', '다시 시도하세요', 'Veuillez réessayer', 'Inténtalo de nuevo', 'Попробуйте снова', 'Bitte erneut versuchen'],
  signOutFailed: ['Could not sign out', 'ログアウトできません', '로그아웃하지 못했어요', 'Déconnexion impossible', 'No se pudo cerrar sesión', 'Не удалось выйти', 'Abmeldung fehlgeschlagen'],
  confirmDeleteTitle: ['Delete account?', 'アカウントを削除しますか？', '계정을 삭제할까요?', 'Supprimer le compte ?', '¿Eliminar la cuenta?', 'Удалить аккаунт?', 'Konto löschen?'],
  confirmDeleteBody: ['Your account and server data will be permanently deleted.', 'アカウントとサーバー上のデータは完全に削除されます。', '계정과 서버 데이터가 영구적으로 삭제됩니다.', 'Votre compte et vos données serveur seront définitivement supprimés.', 'Tu cuenta y tus datos del servidor se eliminarán de forma permanente.', 'Аккаунт и данные на сервере будут удалены безвозвратно.', 'Dein Konto und die Serverdaten werden dauerhaft gelöscht.'],
  cancel: ['Cancel', 'キャンセル', '취소', 'Annuler', 'Cancelar', 'Отмена', 'Abbrechen'],
  delete: ['Delete', '削除', '삭제', 'Supprimer', 'Eliminar', 'Удалить', 'Löschen'],
  operationFailed: ['Something went wrong. Please try again.', 'エラーが発生しました。もう一度お試しください。', '문제가 발생했어요. 다시 시도하세요.', 'Une erreur est survenue. Réessayez.', 'Algo salió mal. Inténtalo de nuevo.', 'Что-то пошло не так. Попробуйте снова.', 'Ein Fehler ist aufgetreten. Bitte erneut versuchen.'],
  authTitleSignIn: ['Welcome back', 'おかえりなさい', '다시 만나 반가워요', 'Bon retour', 'Te damos la bienvenida', 'С возвращением', 'Willkommen zurück'],
  authTitleSignUp: ['Create account', 'アカウントを作成', '계정 만들기', 'Créer un compte', 'Crear cuenta', 'Создать аккаунт', 'Konto erstellen'],
  authTitleVerify: ['Verify email', 'メールを確認', '이메일 인증', 'Vérifier l’e-mail', 'Verificar correo', 'Подтвердить почту', 'E-Mail bestätigen'],
  authTitleRecover: ['Recover account', 'アカウントを復旧', '계정 복구', 'Récupérer le compte', 'Recuperar cuenta', 'Восстановить аккаунт', 'Konto wiederherstellen'],
  authTitleReset: ['Set a new password', '新しいパスワードを設定', '새 비밀번호 설정', 'Définir un nouveau mot de passe', 'Establecer una nueva contraseña', 'Установить новый пароль', 'Neues Passwort festlegen'],
  authSubtitle: ['Sign in to your Joybit account', 'Joybit アカウントにログイン', 'Joybit 계정에 로그인하세요', 'Connectez-vous à votre compte Joybit', 'Inicia sesión en tu cuenta Joybit', 'Войдите в аккаунт Joybit', 'Melde dich bei deinem Joybit-Konto an'],
  authDeleteSubtitle: ['Verify your account to continue', '続けるには本人確認が必要です', '계속하려면 계정을 확인하세요', 'Vérifiez votre compte pour continuer', 'Verifica tu cuenta para continuar', 'Подтвердите аккаунт, чтобы продолжить', 'Bestätige dein Konto, um fortzufahren'],
  email: ['Email', 'メールアドレス', '이메일', 'E-mail', 'Correo electrónico', 'Эл. почта', 'E-Mail'],
  password: ['Password', 'パスワード', '비밀번호', 'Mot de passe', 'Contraseña', 'Пароль', 'Passwort'],
  newPassword: ['New password', '新しいパスワード', '새 비밀번호', 'Nouveau mot de passe', 'Nueva contraseña', 'Новый пароль', 'Neues Passwort'],
  confirmPassword: ['Confirm password', 'パスワードを確認', '비밀번호 확인', 'Confirmer le mot de passe', 'Confirmar contraseña', 'Подтвердите пароль', 'Passwort bestätigen'],
  currentPassword: ['Current password', '現在のパスワード', '현재 비밀번호', 'Mot de passe actuel', 'Contraseña actual', 'Текущий пароль', 'Aktuelles Passwort'],
  emailCode: ['Email verification code', 'メールの確認コード', '이메일 인증 코드', 'Code de vérification', 'Código de verificación', 'Код из письма', 'E-Mail-Bestätigungscode'],
  verifySignIn: ['Verify and sign in', '確認してログイン', '인증하고 로그인', 'Vérifier et se connecter', 'Verificar e iniciar sesión', 'Подтвердить и войти', 'Bestätigen und anmelden'],
  register: ['Register', '登録', '가입', 'S’inscrire', 'Registrarse', 'Зарегистрироваться', 'Registrieren'],
  signIn: ['Sign in', 'ログイン', '로그인', 'Se connecter', 'Iniciar sesión', 'Войти', 'Anmelden'],
  forgotPassword: ['Forgot password?', 'パスワードを忘れた場合', '비밀번호를 잊으셨나요?', 'Mot de passe oublié ?', '¿Olvidaste tu contraseña?', 'Забыли пароль?', 'Passwort vergessen?'],
  sendRecoveryCode: ['Send recovery code', '復旧コードを送信', '복구 코드 보내기', 'Envoyer le code de récupération', 'Enviar código de recuperación', 'Отправить код восстановления', 'Wiederherstellungscode senden'],
  resetPassword: ['Reset password', 'パスワードを再設定', '비밀번호 재설정', 'Réinitialiser le mot de passe', 'Restablecer contraseña', 'Сбросить пароль', 'Passwort zurücksetzen'],
  noAccount: ['No account? Register', 'アカウントがない方は登録', '계정이 없나요? 가입하기', 'Pas de compte ? Inscrivez-vous', '¿No tienes cuenta? Regístrate', 'Нет аккаунта? Зарегистрируйтесь', 'Noch kein Konto? Registrieren'],
  haveAccount: ['Already have an account? Sign in', 'アカウントをお持ちの方はログイン', '이미 계정이 있나요? 로그인', 'Déjà un compte ? Connectez-vous', '¿Ya tienes cuenta? Inicia sesión', 'Уже есть аккаунт? Войдите', 'Schon ein Konto? Anmelden'],
  resendCode: ['Resend code', 'コードを再送信', '인증 코드 다시 보내기', 'Renvoyer le code', 'Reenviar código', 'Отправить код повторно', 'Code erneut senden'],
  resendCountdown: ['Resend in {seconds}s', '{seconds}秒後に再送信', '{seconds}초 후 다시 보내기', 'Renvoyer dans {seconds} s', 'Reenviar en {seconds} s', 'Повторить через {seconds} с', 'Erneut senden in {seconds} s'],
  changeEmail: ['Change email', 'メールアドレスを変更', '이메일 변경', 'Changer d’e-mail', 'Cambiar correo', 'Изменить почту', 'E-Mail ändern'],
  backToSignIn: ['Back to email sign-in', 'メールログインに戻る', '이메일 로그인으로 돌아가기', 'Retour à la connexion par e-mail', 'Volver al acceso por correo', 'Назад к входу по почте', 'Zurück zur E-Mail-Anmeldung'],
  checkEmailOrLogin: ['Check your email. If you already have an account, return to sign in.', 'メールをご確認ください。登録済みの場合はログインに戻ってください。', '이메일을 확인하세요. 이미 가입했다면 로그인으로 돌아가세요.', 'Vérifiez votre boîte mail. Si vous avez déjà un compte, reconnectez-vous.', 'Revisa tu correo. Si ya tienes cuenta, vuelve a iniciar sesión.', 'Проверьте почту. Если аккаунт уже есть, вернитесь ко входу.', 'Prüfe deine E-Mails. Falls du schon ein Konto hast, melde dich an.'],
  codeResent: ['If a code can be sent, check your email.', 'コードが送信可能な場合はメールをご確認ください。', '코드가 전송되었다면 이메일을 확인하세요.', 'Si un code a pu être envoyé, vérifiez votre boîte mail.', 'Si se pudo enviar un código, revisa tu correo.', 'Если код отправлен, проверьте почту.', 'Falls ein Code gesendet wurde, prüfe deine E-Mails.'],
  recoveryCodeSent: ['If this email can receive a recovery code, check your inbox.', '復旧コードを受け取れる場合はメールをご確認ください。', '복구 코드를 받을 수 있다면 이메일을 확인하세요.', 'Si cette adresse peut recevoir un code, consultez votre boîte mail.', 'Si este correo puede recibir un código, revisa tu bandeja.', 'Если на эту почту можно отправить код, проверьте входящие.', 'Falls diese Adresse einen Code empfangen kann, prüfe dein Postfach.'],
  authInvalidEmail: ['Enter a valid email address.', '有効なメールアドレスを入力してください。', '올바른 이메일 주소를 입력하세요.', 'Saisissez une adresse e-mail valide.', 'Introduce un correo válido.', 'Введите действительный адрес почты.', 'Gib eine gültige E-Mail-Adresse ein.'],
  authPasswordMismatch: ['Passwords do not match.', 'パスワードが一致しません。', '비밀번호가 일치하지 않아요.', 'Les mots de passe ne correspondent pas.', 'Las contraseñas no coinciden.', 'Пароли не совпадают.', 'Die Passwörter stimmen nicht überein.'],
  authInvalidCodeFormat: ['Enter the 6–10 digit email code.', 'メールの6～10桁のコードを入力してください。', '이메일의 6~10자리 코드를 입력하세요.', 'Saisissez le code de 6 à 10 chiffres.', 'Introduce el código de 6 a 10 dígitos.', 'Введите код из 6–10 цифр.', 'Gib den 6- bis 10-stelligen E-Mail-Code ein.'],
  authError: ['Could not complete this action. Please try again.', '操作を完了できません。もう一度お試しください。', '요청을 완료하지 못했어요. 다시 시도하세요.', 'Action impossible. Veuillez réessayer.', 'No se pudo completar. Inténtalo de nuevo.', 'Не удалось выполнить действие. Попробуйте снова.', 'Aktion fehlgeschlagen. Bitte erneut versuchen.'],
  authInvalidCredentials: ['Email or password is incorrect.', 'メールアドレスまたはパスワードが正しくありません。', '이메일 또는 비밀번호가 올바르지 않아요.', 'E-mail ou mot de passe incorrect.', 'Correo o contraseña incorrectos.', 'Неверная почта или пароль.', 'E-Mail oder Passwort ist falsch.'],
  authWeakPassword: ['Choose a stronger password and try again.', 'より強いパスワードを設定して再試行してください。', '더 안전한 비밀번호를 설정하고 다시 시도하세요.', 'Choisissez un mot de passe plus sûr et réessayez.', 'Elige una contraseña más segura e inténtalo de nuevo.', 'Выберите более надёжный пароль и попробуйте снова.', 'Wähle ein stärkeres Passwort und versuche es erneut.'],
  authDeletePasswordRequired: ['Enter your current password to delete your account.', 'アカウントを削除するには現在のパスワードを入力してください。', '계정을 삭제하려면 현재 비밀번호를 입력하세요.', 'Saisissez votre mot de passe actuel pour supprimer le compte.', 'Introduce tu contraseña actual para eliminar la cuenta.', 'Введите текущий пароль для удаления аккаунта.', 'Gib dein aktuelles Passwort ein, um dein Konto zu löschen.'],
  authEmailUnconfirmed: ['Verify your email before signing in.', 'ログイン前にメールを確認してください。', '로그인하기 전에 이메일을 인증하세요.', 'Vérifiez votre e-mail avant de vous connecter.', 'Verifica tu correo antes de iniciar sesión.', 'Подтвердите почту перед входом.', 'Bestätige deine E-Mail vor der Anmeldung.'],
  authRateLimit: ['Too many attempts. Please try again later.', '試行回数が多すぎます。後ほどお試しください。', '요청이 너무 많아요. 잠시 후 다시 시도하세요.', 'Trop de tentatives. Réessayez plus tard.', 'Demasiados intentos. Vuelve a intentarlo más tarde.', 'Слишком много попыток. Попробуйте позже.', 'Zu viele Versuche. Bitte später erneut versuchen.'],
  authInvalidCode: ['The code is invalid or expired. Request a new one.', 'コードが無効か期限切れです。新しいコードを取得してください。', '코드가 잘못되었거나 만료되었어요. 새 코드를 요청하세요.', 'Code invalide ou expiré. Demandez-en un nouveau.', 'El código es inválido o caducó. Solicita uno nuevo.', 'Код неверен или истёк. Запросите новый.', 'Der Code ist ungültig oder abgelaufen. Fordere einen neuen an.'],
  authNetwork: ['Connection unavailable. Please try again.', '接続できません。もう一度お試しください。', '연결할 수 없어요. 다시 시도하세요.', 'Connexion indisponible. Réessayez.', 'Sin conexión. Inténtalo de nuevo.', 'Нет подключения. Попробуйте снова.', 'Keine Verbindung. Bitte erneut versuchen.'],
} satisfies Record<string, Seven>;

export type TranslationKey = keyof typeof translations;
export function resolveLocale(tag: string | null | undefined): LanguageCode {
  const primary = (tag ?? '').split(/[-_]/)[0].toLowerCase();
  return LANGUAGE_CODES.find(code => code === primary) ?? 'en';
}

export function translate(locale: LanguageCode, key: TranslationKey, values: Record<string, string | number> = {}): string {
  const text = translations[key][LANGUAGE_CODES.indexOf(locale)];
  return text.replace(/\{([a-zA-Z]+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`));
}
