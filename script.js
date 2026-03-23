import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, set, get, update, push, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM",
  authDomain: "earning-web-app-d515c.firebaseapp.com",
  projectId: "earning-web-app-d515c",
  storageBucket: "earning-web-app-d515c.firebasestorage.app",
  messagingSenderId: "940476940339",
  appId: "1:940476940339:web:eb81b99117e9294fc86346",
  measurementId: "G-74LH2RTK1B"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// --- Start.io Integration ---
const startApp = new StartApp("202682403");

function loadAds() {
    startApp.loadBanner("banner-ad-home");
}

function showInterAd() {
    startApp.showInterstitial();
}

// --- App Logic ---
window.toggleAuth = (isReg) => {
    document.getElementById('login-box').classList.toggle('hidden', isReg);
    document.getElementById('reg-box').classList.toggle('hidden', !isReg);
};

window.register = async () => {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    if(pass.length < 6) return alert("Password min 6 chars!");
    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await set(ref(db, 'users/' + res.user.uid), { name, email, balance: 0, dailyDate: '' });
        alert("Success!");
    } catch (e) { alert(e.message); }
};

window.login = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    try { await signInWithEmailAndPassword(auth, email, pass); } catch (e) { alert("Fail!"); }
};

window.changeView = (id, el) => {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + id).classList.remove('hidden');
    if(el) {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        el.classList.add('active');
        showInterAd(); // পেজ চেঞ্জ করলে ইন্টারস্টিশিয়াল অ্যাড দেখাবে
    }
};

window.dailyCheck = async () => {
    const user = auth.currentUser;
    const today = new Date().toDateString();
    const snap = await get(ref(db, `users/${user.uid}`));
    if(snap.val().dailyDate === today) return alert("Tomorrow please!");
    
    startApp.showInterstitial(); // বোনাস নেয়ার আগে অ্যাড
    await update(ref(db, `users/${user.uid}`), { balance: snap.val().balance + 2, dailyDate: today });
    alert("৳2 Bonus Added!");
};

window.completeTask = (amt) => {
    // রিওয়ার্ডেড ভিডিও অ্যাড দেখাবে
    startApp.showRewarded({
        onVideoFinished: async () => {
            const user = auth.currentUser;
            const snap = await get(ref(db, `users/${user.uid}`));
            await update(ref(db, `users/${user.uid}`), { balance: snap.val().balance + amt });
            alert("Reward added: ৳" + amt);
        }
    });
};

window.requestWithdraw = async () => {
    const amt = parseFloat(document.getElementById('w-amount').value);
    const num = document.getElementById('w-number').value;
    const user = auth.currentUser;
    if(amt < 50) return alert("Min 50!");
    const snap = await get(ref(db, `users/${user.uid}`));
    if(snap.val().balance < amt) return alert("Insufficient!");
    
    await set(push(ref(db, 'withdrawals')), { uid: user.uid, amt, num, email: user.email, status: 'pending' });
    await update(ref(db, `users/${user.uid}`), { balance: snap.val().balance - amt });
    alert("Request Sent!");
};

window.logoutUser = () => signOut(auth).then(() => location.reload());

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        loadAds();
        onValue(ref(db, 'users/' + user.uid), (s) => {
            const d = s.val();
            document.getElementById('u-balance').innerText = d.balance.toFixed(2);
            document.getElementById('u-name').innerText = d.name;
            document.getElementById('u-email').innerText = d.email;
        });
    }
});
