import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, set, get, update, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// আপনার Firebase কনফিগ (স্ক্রিনশট অনুযায়ী)
const firebaseConfig = {
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM",
    authDomain: "earning-web-app-d515c.firebaseapp.com",
    projectId: "earning-web-app-d515c",
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com",
    storageBucket: "earning-web-app-d515c.appspot.com",
    messagingSenderId: "940476940339",
    appId: "1:940476940339:web:eb81b99117e9294fc86346"
};

const fApp = initializeApp(firebaseConfig);
const auth = getAuth(fApp);
const db = getDatabase(fApp);

// UI Elements
const loginBox = document.getElementById('login-box');
const regBox = document.getElementById('reg-box');
const appContent = document.getElementById('app-content');
const authContainer = document.getElementById('auth-container');

// Auth Switchers
document.getElementById('go-to-reg').onclick = () => { loginBox.classList.add('hidden'); regBox.classList.remove('hidden'); };
document.getElementById('go-to-login').onclick = () => { regBox.classList.add('hidden'); loginBox.classList.remove('hidden'); };

// Login Function
document.getElementById('login-btn').onclick = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    if(!email || !pass) return alert("Fill all fields!");
    
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        alert("Success!");
    } catch (e) { alert("Error: " + e.message); }
};

// Register Function
document.getElementById('reg-btn').onclick = async () => {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    
    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await set(ref(db, 'users/' + res.user.uid), { name, email, balance: 0 });
        alert("Account Created!");
    } catch (e) { alert(e.message); }
};

// Logout
document.getElementById('logout-btn').onclick = () => signOut(auth);

// Auth State Monitor
onAuthStateChanged(auth, (user) => {
    if (user) {
        authContainer.classList.add('hidden');
        appContent.classList.remove('hidden');
        onValue(ref(db, 'users/' + user.uid), (snap) => {
            if(snap.exists()) document.getElementById('u-balance').innerText = snap.val().balance.toFixed(2);
        });
    } else {
        authContainer.classList.remove('hidden');
        appContent.classList.add('hidden');
    }
});
