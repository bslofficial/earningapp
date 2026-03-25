import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue, update, get, set } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// ১. Firebase কনফিগারেশন
const firebaseConfig = { 
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", 
    projectId: "earning-web-app-d515c", 
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const AD_LINK = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

// ২. টাস্ক এবং বিজ্ঞাপন ফাংশন
window.runTask = async function(reward) {
    alert("বিজ্ঞাপন ওপেন হচ্ছে। ১০ সেকেন্ড দেখুন এবং ফিরে আসুন।");
    const adWin = window.open(AD_LINK, '_blank');
    if(!adWin) return alert("দয়া করে পপ-আপ এলাউ (Allow) করুন!");

    setTimeout(async () => {
        const user = auth.currentUser;
        if(user) {
            const userRef = ref(db, 'users/' + user.uid);
            const snap = await get(userRef);
            const newBal = (snap.val().balance || 0) + reward;
            await update(userRef, { balance: newBal });
            alert(`অভিনন্দন! আপনার ব্যালেন্সে ৳${reward} যোগ হয়েছে।`);
        }
    }, 10000);
};

// ৩. স্পিন লজিক (Spin Logic)
let isSpinning = false;
window.startSpin = function() {
    if (isSpinning) return;
    
    isSpinning = true;
    const wheel = document.getElementById('wheel');
    const randomDeg = Math.floor(Math.random() * 360) + 3600; // ১০ বার ঘুরবে
    
    wheel.style.transform = `rotate(${randomDeg}deg)`;
    
    setTimeout(async () => {
        isSpinning = false;
        const actualDeg = randomDeg % 360;
        let reward = 0;
        
        // ডিগ্রি অনুযায়ী পুরস্কার (আপনার ডিজাইন অনুযায়ী)
        if (actualDeg >= 0 && actualDeg < 60) reward = 3;
        else if (actualDeg >= 60 && actualDeg < 120) reward = 0;
        else if (actualDeg >= 120 && actualDeg < 180) reward = 10;
        else if (actualDeg >= 180 && actualDeg < 240) reward = 2;
        else if (actualDeg >= 240 && actualDeg < 300) reward = 5;
        else reward = 1;

        const user = auth.currentUser;
        if (user) {
            const userRef = ref(db, 'users/' + user.uid);
            const snap = await get(userRef);
            const newBal = (snap.val().balance || 0) + reward;
            await update(userRef, { balance: newBal });
            alert(`স্পিন শেষ! আপনি ৳${reward} জিতেছেন।`);
        }
    }, 4000);
};

// ৪. ট্যাব পরিবর্তন ফাংশন
window.changeTab = function(name) {
    // সব পেজ হাইড করা
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    
    // নির্দিষ্ট পেজ দেখানো
    const target = document.getElementById('view-' + name);
    if(target) target.classList.remove('hidden');

    // নেভিগেশন হাইলাইট
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + name);
    if(navBtn) navBtn.classList.add('active');
};

// ৫. লগইন/রেজিস্ট্রেশন টগল
let isRegisterMode = false;
window.toggleAuth = () => {
    isRegisterMode = !isRegisterMode;
    document.getElementById('login-inputs').classList.toggle('hidden', isRegisterMode);
    document.getElementById('reg-inputs').classList.toggle('hidden', !isRegisterMode);
    document.getElementById('auth-title').innerText = isRegisterMode ? "নতুন একাউন্ট" : "লগইন করুন";
    document.getElementById('auth-btn').innerText = isRegisterMode ? "Register" : "Login";
};

// ৬. অথেনটিকেশন লজিক
document.getElementById('auth-btn').onclick = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    
    if(isRegisterMode) {
        const name = document.getElementById('name').value;
        if(!name || !email || pass.length < 6) return alert("সঠিক তথ্য দিন!");
        createUserWithEmailAndPassword(auth, email, pass).then(res => {
            set(ref(db, 'users/' + res.user.uid), { name, email, balance: 0 });
        }).catch(e => alert("ভুল হয়েছে: " + e.message));
    } else {
        if(!email || !pass) return alert("সব ঘর পূরণ করুন!");
        signInWithEmailAndPassword(auth, email, pass).catch(e => alert("ইমেইল বা পাসওয়ার্ড ভুল!"));
    }
};

// ৭. অটো-লগইন এবং লাইভ ডাটা আপডেট
onAuthStateChanged(auth, (user) => {
    const authPage = document.getElementById('auth-page');
    const mainPage = document.getElementById('main-page');
    
    if(user) {
        authPage.classList.add('hidden');
        mainPage.classList.remove('hidden');
        
        onValue(ref(db, 'users/' + user.uid), snap => {
            const data = snap.val();
            if(data) {
                document.getElementById('u-balance').innerText = (data.balance || 0).toFixed(2);
                document.getElementById('u-name-display').innerText = data.name;
            }
        });
    } else {
        authPage.classList.remove('hidden');
        mainPage.classList.add('hidden');
    }
});

// ৮. উইথড্র এবং লগআউট
window.logout = () => signOut(auth).then(() => window.location.reload());

document.addEventListener('DOMContentLoaded', () => {
    const wdBtn = document.getElementById('btn-withdraw-ui');
    if(wdBtn) {
        wdBtn.onclick = () => document.getElementById('withdraw-section').classList.toggle('hidden');
    }
});
