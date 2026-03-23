import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM",
  authDomain: "earning-web-app-d515c.firebaseapp.com",
  projectId: "earning-web-app-d515c",
  storageBucket: "earning-web-app-d515c.firebasestorage.app",
  messagingSenderId: "940476940339",
  appId: "1:940476940339:web:eb81b99117e9294fc86346"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const startApp = new StartApp("202682403");

// --- UI Toggle ---
const loginBox = document.getElementById('login-box');
const regBox = document.getElementById('reg-box');

document.getElementById('to-reg-btn').onclick = () => {
    loginBox.classList.add('hidden');
    regBox.classList.remove('hidden');
};

document.getElementById('to-login-btn').onclick = () => {
    regBox.classList.add('hidden');
    loginBox.classList.remove('hidden');
};

// --- Register Function ---
document.getElementById('reg-btn').onclick = async () => {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;

    if(!name || !email || pass.length < 6) {
        alert("Please fill all fields. Password must be 6+ chars.");
        return;
    }

    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await set(ref(db, 'users/' + res.user.uid), {
            name: name, email: email, balance: 0, dailyDate: ''
        });
        alert("Account Created! Loading home...");
    } catch (e) {
        alert(e.message);
    }
};

// --- Login Function ---
document.getElementById('login-btn').onclick = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
        alert("Login Failed: " + e.message);
    }
};

// --- Auth State ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        startApp.loadBanner("banner-ad-container");
        
        // Load Balance
        get(ref(db, 'users/' + user.uid)).then((snap) => {
            if(snap.exists()) document.getElementById('u-balance').innerText = snap.val().balance;
        });
    }
});
