// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Firebase config
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
const db = getFirestore(app);

let Page = 0;

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const numbArray = Array.from(document.querySelectorAll('.DateNumber'));
const divsArray = Array.from(document.querySelectorAll('main div'));
const prev = document.querySelector('.prev');
const next = document.querySelector('.Next');

// Переключение месяцев
prev.addEventListener('click', () => { Page--; updateCalendar(Page); });
next.addEventListener('click', () => { Page++; updateCalendar(Page); });


// ✅ Сохранение цвета в Firestore
async function saveColor(year, month, day, color) {
    const docId = `${year}-${month+1}`;
    const docRef = doc(db, "calendar", docId);
    await setDoc(docRef, { [day]: color }, { merge: true });
}


// ✅ Реальное время: слушаем документ месяца
let unsub = null;

function listenMonthColors(year, month) {
    if (unsub) unsub(); // выключаем прошлый listener

    const docId = `${year}-${month+1}`;
    const docRef = doc(db, "calendar", docId);

    unsub = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            numbArray.forEach((el, i) => {
                const day = i + 1;
                el.parentElement.style.backgroundColor = data[day] || "";
            });
        } else {
            numbArray.forEach(el => el.parentElement.style.backgroundColor = "");
        }
    });
}


// Клик по ячейкам
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

        // обновим локально мгновенно
        div.style.backgroundColor = color;

        // Определяем дату
        const day = parseInt(div.querySelector(".DateNumber").textContent);
        const date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + Page;

        while (month < 0) { month += 12; year--; }
        while (month > 11) { month -= 12; year++; }

        await saveColor(year, month, day, color);
    });
});


// Получить количество дней в месяце
function getDaysInMonth(year, month) {
    return new Date(year, month+1, 0).getDate();
}


// ✅ Обновление календаря + запускаем listener
function updateCalendar(pageOffset) {
    const date = new Date();
    let year = date.getFullYear();
    let monthIndex = date.getMonth() + pageOffset;

    while(monthIndex < 0) { monthIndex += 12; year--; }
    while(monthIndex > 11) { monthIndex -= 12; year++; }

    document.querySelector('h1').textContent = months[monthIndex];

    const daysInMonth = getDaysInMonth(year, monthIndex);

    for (let i = 0; i < numbArray.length; i++) {
        if (i < daysInMonth) {
            numbArray[i].textContent = i + 1;
            numbArray[i].parentElement.style.display = "grid";
        } else {
            numbArray[i].parentElement.style.display = "none";
        }
    }

    // ✅ запускаем live-обновление Firestore
    listenMonthColors(year, monthIndex);
}


// Запускаем календарь
updateCalendar(0);
