import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM",
    authDomain: "earning-web-app-d515c.firebaseapp.com",
    projectId: "earning-web-app-d515c",
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com",
    storageBucket: "earning-web-app-d515c.firebasestorage.app",
    messagingSenderId: "940476940339",
    appId: "1:940476940339:web:eb81b99117e9294fc86346"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// লগইন থাকলে ড্যাশবোর্ডে পাঠিয়ে দাও
onAuthStateChanged(auth, (user) => { if (user) window.location.href = "dashboard.html"; });

// HTML এর জন্য ফাংশন এক্সপোজ করা
window.toggleAuth = (isReg) => {
    document.getElementById('login-box').classList.toggle('hidden', isReg);
    document.getElementById('reg-box').classList.toggle('hidden', !isReg);
};

// লগইন বাটন ইভেন্ট
document.getElementById('btn-login').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    if(email && pass) {
        signInWithEmailAndPassword(auth, email, pass).catch(e => alert("ভুল ইমেইল বা পাসওয়ার্ড!"));
    } else { alert("সব তথ্য দিন!"); }
});

// রেজিস্ট্রেশন বাটন ইভেন্ট
document.getElementById('btn-reg').addEventListener('click', () => {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    if(name && email && pass.length >= 6) {
        createUserWithEmailAndPassword(auth, email, pass).then(res => {
            const referCode = res.user.uid.substring(0, 6).toUpperCase();
            set(ref(db, 'users/' + res.user.uid), { name, email, balance: 0, referCode: referCode });
        }).catch(e => alert(e.message));
    } else { alert("সঠিক তথ্য দিন (পাসওয়ার্ড কমপক্ষে ৬ সংখ্যা)!"); }
});
