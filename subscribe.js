document.addEventListener('DOMContentLoaded', async () => {
  // инициализируем firebase - вся эта срань получатеся при регистрации
  firebase.initializeApp({
    apiKey: "AIzaSyDPLKBx-z83Yzp6Ne--LAJnVJRFWLYvoJE",
    authDomain: "test-4cd1b.firebaseapp.com",
    projectId: "test-4cd1b",
    storageBucket: "test-4cd1b.appspot.com",
    messagingSenderId: "287017887222",
    appId: "1:287017887222:web:c4d60a972d3af0183c93d7",
    measurementId: "G-9RQHKRMHKM"
  });

  // браузер поддерживает уведомления
  // вообще, эту проверку должна делать библиотека Firebase, но она этого не делает, как я понял
  if ('Notification' in window) {
    const messaging = firebase.messaging();

    // пользователь уже разрешил получение уведомлений
    // подписываем на уведомления автоматически если ещё не подписали
    if (Notification.permission === 'granted') {
      await subscribe(messaging);
    }

    // по клику, запрашиваем у пользователя разрешение на уведомления
    // и подписываем его
    document.getElementById('subscribe').addEventListener('click', async () => {
      await subscribe(messaging);
    });
  }
});

const subscribe = async (messaging) => {
  try {
    // запрашиваем разрешение на получение уведомлений
    await messaging.requestPermission()

    try {
      const token = await messaging.getToken();

      if (token) {
        displayCURLCommand(token);
        sendTokenToServer(token);
      } else {
        console.warn('Не удалось получить токен.');
      }
    } catch (e) {
      console.warn('При получении токена произошла ошибка.', e);
    }
  } catch (e) {
    console.warn('Не удалось получить разрешение на показ уведомлений.', e);
  }
}

// отправка ID на сервер
const sendTokenToServer = (token) => {
  if (!isTokenSentToServer(token)) {
    console.log('Отправка токена на сервер...');

    setTokenSentToServer(token);
  } else {
    console.log('Токен уже отправлен на сервер.');
  }
}

// используем localStorage для отметки того,
// что пользователь уже подписался на уведомления
const isTokenSentToServer = (token) => {
  return window.localStorage.getItem('FirebaseMessagingToken') == token;
}

const setTokenSentToServer = (token) => {
  window.localStorage.setItem('FirebaseMessagingToken', token ? token : '');
}

const displayCURLCommand = (token) => {
  //пихаем команду на страницу
  const cmd = `Скопируй это и вставь в терминал, чтобы отправлять себе сообщения:<br/><br/>curl -X POST --header "Authorization: key=AAAAQtOZZfY:APA91bEEjB_70HoSgC_dJ2qsaKiZhea9a5L5Lb1qMNDotrOh8VTdPMf20YDHJEXQjbXch8drYuzNM5mWiX7cbaiSRdQ5Z4y-Bg29y6tEB4Aj1xBvBpBIckA015NXr36UAR00Rj7ynqLW" \<br/>
  --Header "Content-Type: application/json" \<br/>
  https://fcm.googleapis.com/fcm/send \<br/>
  -d "{\"to\":\"${token}\",\"notification\":{\"body\":\"Превед медвед!\"}"`

  document.getElementById('curl-cmd').innerHTML = cmd;
}
