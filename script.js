  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
  import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyABcmqnl4rtl9Tj-6zPzRB5V2U5e_8bd_o",
    authDomain: "daily-cb08f.firebaseapp.com",
    projectId: "daily-cb08f",
    storageBucket: "daily-cb08f.firebasestorage.app",
    messagingSenderId: "199033278537",
    appId: "1:199033278537:web:f80252e768cfcff70eef98",
    measurementId: "G-HDVEH71NKE"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
const db = getFirestore(app);  // вот это db нужен для doc(), setDoc(), getDoc()

const now = new Date();
let Page = 0; // смещение по месяцам: 0 = текущий, +1 = следующий, -1 = предыдущий

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const numbArray = Array.from(document.querySelectorAll('.DateNumber'));
const divsArray = Array.from(document.querySelectorAll('main div'));
const prev = document.querySelector('.prev');
const next = document.querySelector('.Next');

// Кнопки смены месяца
prev.addEventListener('click', () => { Page--; updateCalendar(Page); });
next.addEventListener('click', () => { Page++; updateCalendar(Page); });

// Сохранение цвета в Firestore
async function saveColor(year, month, day, color) {
    const docId = `${year}-${month+1}`;
    const docRef = doc(db, "calendar", docId);
    await setDoc(docRef, { [day]: color }, { merge: true });
}

// Загрузка цветов из Firestore
async function loadColors(year, month) {
    const docId = `${year}-${month+1}`;
    const docRef = doc(db, "calendar", docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        numbArray.forEach((el, i) => {
            const day = i + 1;
            if (data[day]) {
                el.parentElement.style.backgroundColor = data[day];
            } else {
                el.parentElement.style.backgroundColor = "";
            }
        });
    } else {
        numbArray.forEach(el => el.parentElement.style.backgroundColor = "");
    }
}

// Инициализация клика по каждой ячейке
divsArray.forEach(div => {
    let clickCount = 0;
    div.addEventListener('click', async function() {
        clickCount++;
        let color = "";
        switch(clickCount) {
            case 1: color = "#FF0000"; break;
            case 2: color = "#26FF00"; break;
            case 3: color = "#FFD900"; break;
            case 4: color = ""; clickCount = 0; break;
        }
        div.style.backgroundColor = color;

        // Определяем дату с учетом Page
        const day = parseInt(div.querySelector(".DateNumber").textContent);
        const date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + Page;
        while(month < 0) { month += 12; year--; }
        while(month > 11) { month -= 12; year++; }

        try {
          await saveColor(year, month, day, color);
          console.log(`Saved color ${color} for ${year}-${month+1}-${day}`);
      } catch(e) {
          console.error("Error saving color:", e);
      }
    });
});

// Функция получения количества дней в месяце
function getDaysInMonth(year, month) {
    return new Date(year, month+1, 0).getDate();
}

// Обновление календаря
async function updateCalendar(pageOffset) {
    const date = new Date();
    let year = date.getFullYear();
    let monthIndex = date.getMonth() + pageOffset;

    // корректируем год и месяц
    while(monthIndex < 0) { monthIndex += 12; year--; }
    while(monthIndex > 11) { monthIndex -= 12; year++; }

    document.querySelector('h1').textContent = months[monthIndex];
    const daysInMonth = getDaysInMonth(year, monthIndex);

    for(let i=0; i<numbArray.length; i++) {
        if(i < daysInMonth) {
            numbArray[i].textContent = i+1;
            numbArray[i].parentElement.style.display = "grid";
        } else {
            numbArray[i].textContent = i-daysInMonth+1;
            numbArray[i].parentElement.style.display = "none"; // скрыть лишние дни
        }
    }

    // Загружаем сохранённые цвета
    await loadColors(year, monthIndex);
}

// Инициализация календаря
updateCalendar(0);
