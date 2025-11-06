// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyABcmqnl4rtl9Tj-6zPzRB5V2U5e_8bd_o",
    authDomain: "daily-cb08f.firebaseapp.com",
    projectId: "daily-cb08f",
    storageBucket: "daily-cb08f.firebasestorage.app",
    messagingSenderId: "199033278537",
    appId: "1:199033278537:web:f80252e768cfcff70eef98",
    measurementId: "G-HDVEH71NKE"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Calendar base
let Page = 0;
let unsubscribe = null;

const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
];

const numbArray = Array.from(document.querySelectorAll('.DateNumber'));
const divsArray = Array.from(document.querySelectorAll('main div'));
const prev = document.querySelector('.prev');
const next = document.querySelector('.Next');

// Buttons
prev.addEventListener('click', () => { Page--; updateCalendar(Page); });
next.addEventListener('click', () => { Page++; updateCalendar(Page); });

// Save color
async function saveColor(year, month, day, color) {
    const docId = `${year}-${month+1}`;
    const docRef = doc(db, "calendar", docId);
    await setDoc(docRef, { [day]: color }, { merge: true });
}

// Realtime listener
function listenMonthColors(year, month) {
    const docId = `${year}-${month+1}`;
    const docRef = doc(db, "calendar", docId);

    if (unsubscribe) unsubscribe(); // стоп слушателя прошлого месяца

    unsubscribe = onSnapshot(docRef, (docSnap) => {
        const data = docSnap.exists() ? docSnap.data() : {};

        numbArray.forEach((el, i) => {
            const day = i + 1;
            const color = data[day] || "";
            el.parentElement.style.backgroundColor = color;
        });
    });
}

// Click actions
divsArray.forEach(div => {
    let clickCount = 0;
    div.addEventListener('click', async () => {
        clickCount++;
        let color = "";

        switch (clickCount) {
            case 1: color = "#FF0000"; break;
            case 2: color = "#26FF00"; break;
            case 3: color = "#FFD900"; break;
            case 4: color = ""; clickCount = 0; break;
        }

        div.style.backgroundColor = color;

        const day = parseInt(div.querySelector(".DateNumber").textContent);
        const date = new Date();

        let year = date.getFullYear();
        let month = date.getMonth() + Page;

        while (month < 0) { month += 12; year--; }
        while (month > 11) { month -= 12; year++; }

        await saveColor(year, month, day, color);
    });
});

// Utility
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

// Update calendar
function updateCalendar(pageOffset) {
    const date = new Date();
    let year = date.getFullYear();
    let monthIndex = date.getMonth() + pageOffset;

    while (monthIndex < 0) { monthIndex += 12; year--; }
    while (monthIndex > 11) { monthIndex -= 12; year++; }

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

    listenMonthColors(year, monthIndex);
}

// Start
updateCalendar(0);
