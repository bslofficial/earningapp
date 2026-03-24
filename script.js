import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, set, get, update, push, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM",
    authDomain: "earning-web-app-d515c.firebaseapp.com",
    projectId: "earning-web-app-d515c",
    storageBucket: "earning-web-app-d515c.firebasestorage.app",
    messagingSenderId: "940476940339",
    appId: "1:940476940339:web:eb81b99117e9294fc86346"
};

const fApp = initializeApp(firebaseConfig);
const auth = getAuth(fApp);
const db = getDatabase(fApp);
const startApp = new StartApp("202682403");

// Global functions for HTML
window.toggleAuth = (isReg) => {
    document.getElementById('login-box').classList.toggle('hidden', isReg);
    document.getElementById('reg-box').classList.toggle('hidden', !isReg);
};

window.changeView = (viewId) => {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + viewId).classList.remove('hidden');
    startApp.showInterstitial();
};

// Login/Reg logic
document.getElementById('btn-login').onclick = () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert("Error: " + e.message));
};

document.getElementById('btn-reg').onclick = () => {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    createUserWithEmailAndPassword(auth, email, pass).then(res => {
        set(ref(db, 'users/' + res.user.uid), { name, email, balance: 0 });
        alert("Success!");
    }).catch(e => alert(e.message));
};

// Task Logic
document.getElementById('btn-daily').onclick = async () => {
    const user = auth.currentUser;
    const snap = await get(ref(db, `users/${user.uid}`));
    update(ref(db, `users/${user.uid}`), { balance: snap.val().balance + 2 });
    startApp.showInterstitial();
    alert("Bonus Added!");
};

document.getElementById('btn-video').onclick = () => {
    startApp.showRewarded({
        onVideoFinished: async () => {
            const user = auth.currentUser;
            const snap = await get(ref(db, `users/${user.uid}`));
            update(ref(db, `users/${user.uid}`), { balance: snap.val().balance + 5 });
            alert("Reward Added!");
        }
    });
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        startApp.loadBanner("start-banner-ad");
        onValue(ref(db, 'users/' + user.uid), (snap) => {
            const d = snap.val();
            if(d) {
                document.getElementById('u-balance').innerText = d.balance;
                document.getElementById('u-name-display').innerText = d.name;
            }
        });
    }
});
