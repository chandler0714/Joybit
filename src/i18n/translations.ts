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
  homeTitle: ['Featured games', 'おすすめゲーム', '추천 게임', 'Jeux à découvrir', 'Juegos destacados', 'Рекомендуемые игры', 'Spiele entdecken'],
  favoritesTitle: ['My favorites', 'お気に入り', '내 즐겨찾기', 'Mes favoris', 'Mis favoritos', 'Избранное', 'Meine Favoriten'],
  profileTitle: ['Account', 'アカウント', '계정', 'Compte', 'Cuenta', 'Аккаунт', 'Konto'],
  menuFavorites: ['Favorites', 'お気に入り', '즐겨찾기', 'Favoris', 'Favoritos', 'Избранное', 'Favoriten'],
  menuOpen: ['Open menu', 'メニューを開く', '메뉴 열기', 'Ouvrir le menu', 'Abrir menú', 'Открыть меню', 'Menü öffnen'],
  menuClose: ['Close menu', 'メニューを閉じる', '메뉴 닫기', 'Fermer le menu', 'Cerrar menú', 'Закрыть меню', 'Menü schließen'],
  menuScrim: ['Tap outside to close menu', '外側をタップして閉じる', '바깥쪽을 눌러 메뉴 닫기', 'Touchez à l’extérieur pour fermer', 'Toca fuera para cerrar', 'Нажмите вне меню, чтобы закрыть', 'Außerhalb tippen zum Schließen'],
  backToGames: ['Back to games', 'ゲーム一覧に戻る', '게임 목록으로', 'Retour aux jeux', 'Volver a los juegos', 'Назад к играм', 'Zurück zu den Spielen'],
  favoritesSyncFailed: ['Favorites could not sync. Tap to retry.', 'お気に入りを同期できません。タップして再試行。', '즐겨찾기를 동기화하지 못했어요. 다시 시도하세요.', 'Synchronisation des favoris impossible. Touchez pour réessayer.', 'No se pudieron sincronizar los favoritos. Toca para reintentar.', 'Не удалось синхронизировать избранное. Нажмите для повтора.', 'Favoriten konnten nicht synchronisiert werden. Zum Wiederholen tippen.'],
  favoritesSyncing: ['Syncing favorites…', 'お気に入りを同期中…', '즐겨찾기 동기화 중…', 'Synchronisation des favoris…', 'Sincronizando favoritos…', 'Синхронизация избранного…', 'Favoriten werden synchronisiert…'],
  retryFavorites: ['Retry favorites sync', 'お気に入りの同期を再試行', '즐겨찾기 동기화 다시 시도', 'Réessayer la synchronisation', 'Reintentar sincronización', 'Повторить синхронизацию', 'Favoriten erneut synchronisieren'],
  guest: ['Guest', 'ゲスト', '게스트', 'Invité', 'Invitado', 'Гость', 'Gast'],
  welcomeJoybit: ['Welcome to Joybit', 'Joybit へようこそ', 'Joybit에 오신 것을 환영해요', 'Bienvenue sur Joybit', 'Te damos la bienvenida a Joybit', 'Добро пожаловать в Joybit', 'Willkommen bei Joybit'],
  loginToSync: ['Sign in to sync favorites and play games', 'ログインしてお気に入りを同期し、ゲームで遊ぼう', '로그인하여 즐겨찾기를 동기화하고 게임을 즐기세요', 'Connectez-vous pour synchroniser vos favoris et jouer', 'Inicia sesión para sincronizar favoritos y jugar', 'Войдите, чтобы сохранить избранное и играть', 'Anmelden, um Favoriten zu synchronisieren und zu spielen'],
  signOut: ['Sign out', 'ログアウト', '로그아웃', 'Se déconnecter', 'Cerrar sesión', 'Выйти', 'Abmelden'],
  deleteAccount: ['Delete account', 'アカウントを削除', '계정 삭제', 'Supprimer le compte', 'Eliminar cuenta', 'Удалить аккаунт', 'Konto löschen'],
  loginRegister: ['Sign in / Register', 'ログイン / 登録', '로그인 / 가입', 'Connexion / Inscription', 'Entrar / Registrarse', 'Вход / Регистрация', 'Anmelden / Registrieren'],
  signInJoybit: ['Sign in to Joybit', 'Joybit にログイン', 'Joybit 로그인', 'Se connecter à Joybit', 'Entrar en Joybit', 'Войти в Joybit', 'Bei Joybit anmelden'],
  aboutJoybit: ['About Joybit', 'Joybit について', 'Joybit 정보', 'À propos de Joybit', 'Acerca de Joybit', 'О Joybit', 'Über Joybit'],
  aboutDetail: ['Small games. Big smiles.', '小さなゲーム、大きな笑顔。', '작은 게임, 큰 즐거움.', 'Petits jeux, grands sourires.', 'Juegos pequeños, grandes sonrisas.', 'Маленькие игры, большие улыбки.', 'Kleine Spiele, großes Lächeln.'],
  noFavorites: ['No favorites yet', 'お気に入りはまだありません', '아직 즐겨찾기가 없어요', 'Aucun favori pour le moment', 'Aún no hay favoritos', 'Пока нет избранных игр', 'Noch keine Favoriten'],
  welcomeBack: ['Welcome back', 'おかえりなさい', '다시 오신 것을 환영해요', 'Bon retour', 'Te damos la bienvenida de nuevo', 'С возвращением', 'Willkommen zurück'],
  helloPlayer: ['Hello, player', 'こんにちは、プレイヤー', '안녕하세요, 플레이어님', 'Bonjour, joueur', 'Hola, jugador', 'Привет, игрок', 'Hallo, Spieler'],
  drawerTagline: ['JOYBIT · PLAY A LITTLE, SMILE A LOT', 'JOYBIT · 少し遊んで、たくさん笑おう', 'JOYBIT · 잠깐 놀고, 많이 웃어요', 'JOYBIT · JOUEZ UN PEU, SOURIEZ BEAUCOUP', 'JOYBIT · JUEGA UN POCO, SONRÍE MUCHO', 'JOYBIT · ИГРАЙ НЕМНОГО, УЛЫБАЙСЯ ЧАЩЕ', 'JOYBIT · KURZ SPIELEN, VIEL LÄCHELN'],
  homeEyebrow: ['PICK UP & PLAY', 'すぐに遊ぼう', '바로 시작해요', 'JOUEZ SANS ATTENDRE', 'EMPIEZA A JUGAR', 'ИГРАЙ СРАЗУ', 'EINFACH LOSLEGEN'],
  coverEyebrow: ['JOYBIT · PLAY', 'JOYBIT · プレイ', 'JOYBIT · 플레이', 'JOYBIT · JOUER', 'JOYBIT · JUGAR', 'JOYBIT · ИГРАТЬ', 'JOYBIT · SPIELEN'],
  adSlot: ['Ad space', '広告枠', '광고 영역', 'Espace publicitaire', 'Espacio publicitario', 'Место для рекламы', 'Werbeplatz'],
  adComing: ['More fun is coming', 'もっと楽しいことがまもなく', '더 많은 즐거움이 곧 찾아와요', 'Encore plus de plaisir bientôt', 'Pronto habrá más diversión', 'Скоро будет ещё интереснее', 'Bald gibt es noch mehr Spaß'],
  bottomAd: ['Bottom ad space', '下部の広告枠', '하단 광고 영역', 'Espace publicitaire en bas', 'Espacio publicitario inferior', 'Место для рекламы внизу', 'Werbeplatz unten'],
  openGame: ['Open {game}', '{game} を開く', '{game} 열기', 'Ouvrir {game}', 'Abrir {game}', 'Открыть {game}', '{game} öffnen'],
  coverImage: ['{game} cover', '{game} のカバー', '{game} 표지', 'Image de {game}', 'Portada de {game}', 'Обложка {game}', 'Titelbild von {game}'],
  collectGame: ['Favorite {game}', '{game} をお気に入りに追加', '{game} 즐겨찾기', 'Ajouter {game} aux favoris', 'Añadir {game} a favoritos', 'Добавить {game} в избранное', '{game} zu Favoriten hinzufügen'],
  uncollectGame: ['Remove {game} from favorites', '{game} をお気に入りから削除', '{game} 즐겨찾기 해제', 'Retirer {game} des favoris', 'Quitar {game} de favoritos', 'Убрать {game} из избранного', '{game} aus Favoriten entfernen'],
  playedBy: ['Played by {count}', '{count}人がプレイ', '{count}명 플레이', '{count} joueurs', '{count} jugadores', 'Играли: {count}', '{count} Spieler'],
  gameReaction: ['Reaction Rush', '反応チャレンジ', '반응 속도 도전', 'Défi réflexes', 'Reto de reflejos', 'Проверка реакции', 'Reaktionstest'],
  gameMemory: ['Memory Match', '絵合わせ', '기억력 카드', 'Jeu de mémoire', 'Juego de memoria', 'Найди пару', 'Memory-Spiel'],
  gamePuzzle: ['Number Puzzle', '数字パズル', '숫자 퍼즐', 'Puzzle des chiffres', 'Rompecabezas numérico', 'Числовая головоломка', 'Zahlenpuzzle'],
  signInRequired: ['Sign in to Joybit first', 'Joybit にログインしてください', '먼저 Joybit에 로그인하세요', 'Connectez-vous à Joybit', 'Inicia sesión en Joybit', 'Сначала войдите в Joybit', 'Bitte bei Joybit anmelden'],
  gameUrlMissing: ['This game is not available yet', 'このゲームはまだ利用できません', '아직 이용할 수 없는 게임입니다', 'Ce jeu n’est pas encore disponible', 'Este juego aún no está disponible', 'Игра пока недоступна', 'Dieses Spiel ist noch nicht verfügbar'],
  nativeOnlyIos: ['Hexa Landing is currently available on iOS only', 'Hexa Landing は現在 iOS のみ対応しています', 'Hexa Landing은 현재 iOS에서만 플레이할 수 있어요', 'Hexa Landing est actuellement disponible uniquement sur iOS', 'Hexa Landing solo está disponible en iOS por ahora', 'Hexa Landing пока доступна только на iOS', 'Hexa Landing ist derzeit nur auf iOS verfügbar'],
  backJoybit: ['Back to Joybit', 'Joybit に戻る', 'Joybit으로 돌아가기', 'Retour à Joybit', 'Volver a Joybit', 'Вернуться в Joybit', 'Zurück zu Joybit'],
  nativeNetworkErrorTitle: ['Game unavailable', 'ゲームを開けません', '게임을 열 수 없어요', 'Jeu indisponible', 'Juego no disponible', 'Игра недоступна', 'Spiel nicht verfügbar'],
  nativeNetworkErrorBody: ['Connect to the internet and try again. If your sign-in expired, sign in again.', 'インターネットに接続して再試行してください。ログインの期限が切れた場合は再ログインしてください。', '인터넷에 연결한 뒤 다시 시도하세요. 로그인이 만료되었다면 다시 로그인하세요.', 'Connectez-vous à Internet et réessayez. Si votre session a expiré, reconnectez-vous.', 'Conéctate a internet y vuelve a intentarlo. Si tu sesión caducó, inicia sesión de nuevo.', 'Подключитесь к интернету и попробуйте снова. Если срок сеанса истёк, войдите заново.', 'Verbinde dich mit dem Internet und versuche es erneut. Falls die Anmeldung abgelaufen ist, melde dich erneut an.'],
  favoriteErrorTitle: ['Could not update favorite', 'お気に入りを更新できません', '즐겨찾기를 변경하지 못했어요', 'Favori non mis à jour', 'No se pudo actualizar el favorito', 'Не удалось обновить избранное', 'Favorit konnte nicht aktualisiert werden'],
  tryAgain: ['Please try again', 'もう一度お試しください', '다시 시도하세요', 'Veuillez réessayer', 'Inténtalo de nuevo', 'Попробуйте снова', 'Bitte erneut versuchen'],
  sessionExpired: ['Game session expired', 'ゲームのセッションが切れました', '게임 세션이 만료되었어요', 'Session de jeu expirée', 'La sesión del juego caducó', 'Игровой сеанс истёк', 'Spielsitzung abgelaufen'],
  signInAgain: ['Please sign in again', 'もう一度ログインしてください', '다시 로그인하세요', 'Veuillez vous reconnecter', 'Inicia sesión de nuevo', 'Войдите снова', 'Bitte erneut anmelden'],
  signOutFailed: ['Could not sign out', 'ログアウトできません', '로그아웃하지 못했어요', 'Déconnexion impossible', 'No se pudo cerrar sesión', 'Не удалось выйти', 'Abmeldung fehlgeschlagen'],
  confirmDeleteTitle: ['Delete account?', 'アカウントを削除しますか？', '계정을 삭제할까요?', 'Supprimer le compte ?', '¿Eliminar la cuenta?', 'Удалить аккаунт?', 'Konto löschen?'],
  confirmDeleteBody: ['Your account and server data will be permanently deleted.', 'アカウントとサーバー上のデータは完全に削除されます。', '계정과 서버 데이터가 영구적으로 삭제됩니다.', 'Votre compte et vos données serveur seront définitivement supprimés.', 'Tu cuenta y tus datos del servidor se eliminarán de forma permanente.', 'Аккаунт и данные на сервере будут удалены безвозвратно.', 'Dein Konto und die Serverdaten werden dauerhaft gelöscht.'],
  cancel: ['Cancel', 'キャンセル', '취소', 'Annuler', 'Cancelar', 'Отмена', 'Abbrechen'],
  delete: ['Delete', '削除', '삭제', 'Supprimer', 'Eliminar', 'Удалить', 'Löschen'],
  operationFailed: ['Something went wrong. Please try again.', 'エラーが発生しました。もう一度お試しください。', '문제가 발생했어요. 다시 시도하세요.', 'Une erreur est survenue. Réessayez.', 'Algo salió mal. Inténtalo de nuevo.', 'Что-то пошло не так. Попробуйте снова.', 'Ein Fehler ist aufgetreten. Bitte erneut versuchen.'],
  authTitleSignIn: ['Welcome back', 'おかえりなさい', '다시 만나 반가워요', 'Bon retour', 'Te damos la bienvenida', 'С возвращением', 'Willkommen zurück'],
  authTitleSignUp: ['Create account', 'アカウントを作成', '계정 만들기', 'Créer un compte', 'Crear cuenta', 'Создать аккаунт', 'Konto erstellen'],
  authTitleVerify: ['Verify email', 'メールを確認', '이메일 인증', 'Vérifier l’e-mail', 'Verificar correo', 'Подтвердить почту', 'E-Mail bestätigen'],
  authSubtitle: ['One account for favorites and games', 'ひとつのアカウントでお気に入りもゲームも', '하나의 계정으로 즐겨찾기와 게임을', 'Un compte pour vos favoris et vos jeux', 'Una cuenta para favoritos y juegos', 'Один аккаунт для игр и избранного', 'Ein Konto für Favoriten und Spiele'],
  authDeleteSubtitle: ['Verify your account to continue', '続けるには本人確認が必要です', '계속하려면 계정을 확인하세요', 'Vérifiez votre compte pour continuer', 'Verifica tu cuenta para continuar', 'Подтвердите аккаунт, чтобы продолжить', 'Bestätige dein Konto, um fortzufahren'],
  email: ['Email', 'メールアドレス', '이메일', 'E-mail', 'Correo electrónico', 'Эл. почта', 'E-Mail'],
  password: ['Password', 'パスワード', '비밀번호', 'Mot de passe', 'Contraseña', 'Пароль', 'Passwort'],
  currentPassword: ['Current password', '現在のパスワード', '현재 비밀번호', 'Mot de passe actuel', 'Contraseña actual', 'Текущий пароль', 'Aktuelles Passwort'],
  emailCode: ['Email verification code', 'メールの確認コード', '이메일 인증 코드', 'Code de vérification', 'Código de verificación', 'Код из письма', 'E-Mail-Bestätigungscode'],
  verifySignIn: ['Verify and sign in', '確認してログイン', '인증하고 로그인', 'Vérifier et se connecter', 'Verificar e iniciar sesión', 'Подтвердить и войти', 'Bestätigen und anmelden'],
  register: ['Register', '登録', '가입', 'S’inscrire', 'Registrarse', 'Зарегистрироваться', 'Registrieren'],
  signIn: ['Sign in', 'ログイン', '로그인', 'Se connecter', 'Iniciar sesión', 'Войти', 'Anmelden'],
  noAccount: ['No account? Register', 'アカウントがない方は登録', '계정이 없나요? 가입하기', 'Pas de compte ? Inscrivez-vous', '¿No tienes cuenta? Regístrate', 'Нет аккаунта? Зарегистрируйтесь', 'Noch kein Konto? Registrieren'],
  haveAccount: ['Already have an account? Sign in', 'アカウントをお持ちの方はログイン', '이미 계정이 있나요? 로그인', 'Déjà un compte ? Connectez-vous', '¿Ya tienes cuenta? Inicia sesión', 'Уже есть аккаунт? Войдите', 'Schon ein Konto? Anmelden'],
  resendCode: ['Resend code', 'コードを再送信', '인증 코드 다시 보내기', 'Renvoyer le code', 'Reenviar código', 'Отправить код повторно', 'Code erneut senden'],
  backToSignIn: ['Back to email sign-in', 'メールログインに戻る', '이메일 로그인으로 돌아가기', 'Retour à la connexion par e-mail', 'Volver al acceso por correo', 'Назад к входу по почте', 'Zurück zur E-Mail-Anmeldung'],
  checkEmailOrLogin: ['Check your email. If you already have an account, return to sign in.', 'メールをご確認ください。登録済みの場合はログインに戻ってください。', '이메일을 확인하세요. 이미 가입했다면 로그인으로 돌아가세요.', 'Vérifiez votre boîte mail. Si vous avez déjà un compte, reconnectez-vous.', 'Revisa tu correo. Si ya tienes cuenta, vuelve a iniciar sesión.', 'Проверьте почту. Если аккаунт уже есть, вернитесь ко входу.', 'Prüfe deine E-Mails. Falls du schon ein Konto hast, melde dich an.'],
  codeResent: ['If a code can be sent, check your email.', 'コードが送信可能な場合はメールをご確認ください。', '코드가 전송되었다면 이메일을 확인하세요.', 'Si un code a pu être envoyé, vérifiez votre boîte mail.', 'Si se pudo enviar un código, revisa tu correo.', 'Если код отправлен, проверьте почту.', 'Falls ein Code gesendet wurde, prüfe deine E-Mails.'],
  authError: ['Could not complete this action. Please try again.', '操作を完了できません。もう一度お試しください。', '요청을 완료하지 못했어요. 다시 시도하세요.', 'Action impossible. Veuillez réessayer.', 'No se pudo completar. Inténtalo de nuevo.', 'Не удалось выполнить действие. Попробуйте снова.', 'Aktion fehlgeschlagen. Bitte erneut versuchen.'],
  authInvalidCredentials: ['Email or password is incorrect.', 'メールアドレスまたはパスワードが正しくありません。', '이메일 또는 비밀번호가 올바르지 않아요.', 'E-mail ou mot de passe incorrect.', 'Correo o contraseña incorrectos.', 'Неверная почта или пароль.', 'E-Mail oder Passwort ist falsch.'],
  authEmailUnconfirmed: ['Verify your email before signing in.', 'ログイン前にメールを確認してください。', '로그인하기 전에 이메일을 인증하세요.', 'Vérifiez votre e-mail avant de vous connecter.', 'Verifica tu correo antes de iniciar sesión.', 'Подтвердите почту перед входом.', 'Bestätige deine E-Mail vor der Anmeldung.'],
  authRateLimit: ['Too many attempts. Please try again later.', '試行回数が多すぎます。後ほどお試しください。', '요청이 너무 많아요. 잠시 후 다시 시도하세요.', 'Trop de tentatives. Réessayez plus tard.', 'Demasiados intentos. Vuelve a intentarlo más tarde.', 'Слишком много попыток. Попробуйте позже.', 'Zu viele Versuche. Bitte später erneut versuchen.'],
  authInvalidCode: ['The code is invalid or expired. Request a new one.', 'コードが無効か期限切れです。新しいコードを取得してください。', '코드가 잘못되었거나 만료되었어요. 새 코드를 요청하세요.', 'Code invalide ou expiré. Demandez-en un nouveau.', 'El código es inválido o caducó. Solicita uno nuevo.', 'Код неверен или истёк. Запросите новый.', 'Der Code ist ungültig oder abgelaufen. Fordere einen neuen an.'],
  authNetwork: ['Connection unavailable. Please try again.', '接続できません。もう一度お試しください。', '연결할 수 없어요. 다시 시도하세요.', 'Connexion indisponible. Réessayez.', 'Sin conexión. Inténtalo de nuevo.', 'Нет подключения. Попробуйте снова.', 'Keine Verbindung. Bitte erneut versuchen.'],
  miniGameEyebrow: ['JOYBIT · MINI GAME', 'JOYBIT · ミニゲーム', 'JOYBIT · 미니 게임', 'JOYBIT · MINI-JEU', 'JOYBIT · MINIJUEGO', 'JOYBIT · МИНИ-ИГРА', 'JOYBIT · MINISPIEL'],
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
