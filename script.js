import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue, update, get, set } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", 
    projectId: "earning-web-app-d515c", 
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const AD_LINK = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

// ১. ট্যাব ফাংশন
window.changeTab = function(name) {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById('view-' + name);
    if(target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + name);
    if(navBtn) navBtn.classList.add('active');
};

// ২. বিজ্ঞাপন টাস্ক
window.runTask = async function(reward) {
    alert("বিজ্ঞাপন ওপেন হচ্ছে। ১০ সেকেন্ড দেখুন।");
    window.open(AD_LINK, '_blank');
    setTimeout(async () => {
        const user = auth.currentUser;
        if(user) {
            const userRef = ref(db, 'users/' + user.uid);
            const snap = await get(userRef);
            const newBal = (snap.val().balance || 0) + reward;
            await update(userRef, { balance: newBal });
            alert(`৳${reward} যোগ হয়েছে!`);
        }
    }, 10000);
};

// ৩. স্পিন লজিক
let isSpinning = false;
window.startSpin = function() {
    if (isSpinning) return;
    isSpinning = true;
    const wheel = document.getElementById('wheel');
    const randomDeg = Math.floor(Math.random() * 360) + 3600;
    wheel.style.transform = `rotate(${randomDeg}deg)`;
    
    setTimeout(async () => {
        isSpinning = false;
        const actualDeg = randomDeg % 360;
        let reward = 1; // ডিফল্ট
        if (actualDeg < 60) reward = 3;
        else if (actualDeg < 120) reward = 0;
        else if (actualDeg < 180) reward = 10;

        const user = auth.currentUser;
        if (user) {
            const userRef = ref(db, 'users/' + user.uid);
            const snap = await get(userRef);
            const newBal = (snap.val().balance || 0) + reward;
            await update(userRef, { balance: newBal });
            alert(`অভিনন্দন! আপনি ৳${reward} জিতেছেন।`);
        }
    }, 4000);
};

// ৪. অথেন্টিকেশন
onAuthStateChanged(auth, (user) => {
    if(user) {
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        onValue(ref(db, 'users/' + user.uid), snap => {
            const data = snap.val();
            document.getElementById('u-balance').innerText = (data.balance || 0).toFixed(2);
            document.getElementById('u-name-display').innerText = data.name;
        });
    } else {
        document.getElementById('auth-page').classList.remove('hidden');
        document.getElementById('main-page').classList.add('hidden');
    }
});

window.logout = () => signOut(auth);

let isReg = false;
window.toggleAuth = () => {
    isReg = !isReg;
    document.getElementById('login-inputs').classList.toggle('hidden', isReg);
    document.getElementById('reg-inputs').classList.toggle('hidden', !isReg);
    document.getElementById('auth-btn').innerText = isReg ? "Register" : "Login";
};

document.getElementById('auth-btn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    if(isReg) {
        const name = document.getElementById('name').value;
        createUserWithEmailAndPassword(auth, email, pass).then(res => {
            set(ref(db, 'users/' + res.user.uid), { name, email, balance: 0 });
        }).catch(e => alert(e.message));
    } else {
        signInWithEmailAndPassword(auth, email, pass).catch(e => alert("ভুল তথ্য!"));
    }
};
