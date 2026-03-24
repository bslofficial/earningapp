import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// আপনার Firebase কনফিগ
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

// লগইন ফাংশন যা বাটনের সাথে কানেক্ট হবে
const handleLogin = () => {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;

    if(!email || !pass) {
        alert("ইমেইল এবং পাসওয়ার্ড দিন!");
        return;
    }

    signInWithEmailAndPassword(auth, email, pass)
        .then(() => {
            console.log("Login Success");
        })
        .catch((error) => {
            alert("লগইন ব্যর্থ: " + error.message);
        });
};

// বাটন ক্লিক ইভেন্ট সেট করা (গুরুত্বপূর্ণ)
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('btn-login');
    if(loginBtn) {
        loginBtn.onclick = handleLogin;
    }
});

// ইউজার লগইন অবস্থায় থাকলে ড্যাশবোর্ড দেখানো
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        
        onValue(ref(db, 'users/' + user.uid), (snap) => {
            const d = snap.val();
            if(d) {
                document.getElementById('u-balance').innerText = d.balance || "0.00";
                document.getElementById('u-name-display').innerText = d.name;
            }
        });
    }
});
