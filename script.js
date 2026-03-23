import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, set, get, update, push, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM",
    authDomain: "earning-web-app-d515c.firebaseapp.com",
    projectId: "earning-web-app-d515c",
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com",
    storageBucket: "earning-web-app-d515c.appspot.com",
    messagingSenderId: "940476940339",
    appId: "1:940476940339:web:eb81b99117e9294fc86346"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// StartApp Ads Setup
const startApp = new StartApp("202682403");

// Functions
const changeView = (viewId) => {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + viewId).classList.remove('hidden');
    startApp.showInterstitial();
};

// Login Click
document.getElementById('login-btn').onclick = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        alert("Login Success!");
    } catch (e) { alert("Error: " + e.message); }
};

// Register Click
document.getElementById('reg-btn').onclick = async () => {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await set(ref(db, 'users/' + res.user.uid), { name, email, balance: 0, dailyDate: '' });
        alert("Registered!");
    } catch (e) { alert(e.message); }
};

// Daily Bonus
document.getElementById('daily-bonus-btn').onclick = async () => {
    const user = auth.currentUser;
    const today = new Date().toDateString();
    const snap = await get(ref(db, `users/${user.uid}`));
    if(snap.val().dailyDate === today) return alert("Already done!");
    
    startApp.showInterstitial();
    await update(ref(db, `users/${user.uid}`), { balance: snap.val().balance + 2, dailyDate: today });
    alert("৳2 Added!");
};

// Watch Video Ad
document.getElementById('start-video-task').onclick = () => {
    startApp.showRewarded({
        onVideoFinished: async () => {
            const user = auth.currentUser;
            const snap = await get(ref(db, `users/${user.uid}`));
            await update(ref(db, `users/${user.uid}`), { balance: snap.val().balance + 5 });
            alert("৳5 Reward Added!");
        }
    });
};

// Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        startApp.loadBanner("start-banner");
        onValue(ref(db, 'users/' + user.uid), (s) => {
            if(s.exists()) document.getElementById('u-balance').innerText = s.val().balance.toFixed(2);
        });
    } else {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('app-content').classList.add('hidden');
    }
});

// UI Navigation
document.getElementById('switch-to-reg').onclick = () => { document.getElementById('login-box').classList.add('hidden'); document.getElementById('reg-box').classList.remove('hidden'); };
document.getElementById('switch-to-login').onclick = () => { document.getElementById('reg-box').classList.add('hidden'); document.getElementById('login-box').classList.remove('hidden'); };
document.getElementById('btn-home').onclick = () => changeView('home');
document.getElementById('btn-task').onclick = () => changeView('task');
document.getElementById('btn-wallet').onclick = () => changeView('wallet');
document.getElementById('nav-to-task').onclick = () => changeView('task');
document.getElementById('nav-to-wallet').onclick = () => changeView('wallet');
document.getElementById('btn-logout').onclick = () => signOut(auth);
