import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, set, get, update, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// Firebase Configuration
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

// ১. ফাংশনগুলোকে গ্লোবাল (window) অবজেক্টে যুক্ত করা যাতে HTML থেকে কাজ করে
window.toggleAuth = (isReg) => {
    document.getElementById('login-box').classList.toggle('hidden', isReg);
    document.getElementById('reg-box').classList.toggle('hidden', !isReg);
};

window.changeView = (viewId) => {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + viewId).classList.remove('hidden');
    // পেজ পরিবর্তনের সময় ইন্টারস্টিশিয়াল বিজ্ঞাপন দেখানো
    try { startApp.showInterstitial(); } catch(e) { console.log("Ad Error"); }
};

// ২. লগইন লজিক
const handleLogin = () => {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;

    if(!email || !pass) return alert("ইমেইল এবং পাসওয়ার্ড দিন!");

    signInWithEmailAndPassword(auth, email, pass)
        .catch(error => alert("লগইন ভুল হয়েছে: " + error.message));
};

// ৩. রেজিস্ট্রেশন লজিক
const handleRegister = () => {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value;

    if(!name || !email || pass.length < 6) return alert("সঠিক তথ্য দিন (পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের)!");

    createUserWithEmailAndPassword(auth, email, pass)
        .then(res => {
            set(ref(db, 'users/' + res.user.uid), { name, email, balance: 0 });
            alert("একাউন্ট তৈরি সফল!");
        })
        .catch(error => alert("ভুল: " + error.message));
};

// ৪. ইভেন্ট লিসেনার সেট করা
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('btn-login');
    const regBtn = document.getElementById('btn-reg');
    const dailyBtn = document.getElementById('btn-daily');
    const videoBtn = document.getElementById('btn-video');

    if(loginBtn) loginBtn.onclick = handleLogin;
    if(regBtn) regBtn.onclick = handleRegister;

    // ডেইলি বোনাস
    if(dailyBtn) dailyBtn.onclick = async () => {
        const user = auth.currentUser;
        if(user) {
            const snap = await get(ref(db, `users/${user.uid}`));
            const currentBalance = snap.val().balance || 0;
            update(ref(db, `users/${user.uid}`), { balance: currentBalance + 2 });
            alert("৳২ বোনাস যোগ করা হয়েছে!");
        }
    };

    // ভিডিও টাস্ক
    if(videoBtn) videoBtn.onclick = () => {
        startApp.showRewarded({
            onVideoFinished: async () => {
                const user = auth.currentUser;
                const snap = await get(ref(db, `users/${user.uid}`));
                update(ref(db, `users/${user.uid}`), { balance: (snap.val().balance || 0) + 5 });
                alert("৳৫ রিওয়ার্ড যোগ হয়েছে!");
            }
        });
    };
});

// ৫. অথেনটিকেশন স্টেট চেক
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        startApp.loadBanner("start-banner-ad");
        
        onValue(ref(db, 'users/' + user.uid), (snap) => {
            const data = snap.val();
            if(data) {
                document.getElementById('u-balance').innerText = (data.balance || 0).toFixed(2);
                document.getElementById('u-name-display').innerText = data.name;
            }
        });
    }
});
