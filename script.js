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
const startApp = new StartApp("202682403");

// UI Toggle Logic
const toggleAuth = (isReg) => {
    document.getElementById('login-box').classList.toggle('hidden', isReg);
    document.getElementById('reg-box').classList.toggle('hidden', !isReg);
};

document.getElementById('go-to-reg').onclick = () => toggleAuth(true);
document.getElementById('go-to-login').onclick = () => toggleAuth(false);

// Register
document.getElementById('btn-register').onclick = async () => {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    if(!name || !email || pass.length < 6) return alert("Fill correctly! Pass min 6 chars.");

    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await set(ref(db, 'users/' + res.user.uid), {
            name: name, email: email, balance: 0, dailyDate: ''
        });
        alert("Success! Login now.");
        location.reload();
    } catch (e) { alert(e.message); }
};

// Login
document.getElementById('btn-login').onclick = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    try { await signInWithEmailAndPassword(auth, email, pass); } catch (e) { alert("Login Failed!"); }
};

// View Switcher
const changeView = (viewId) => {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + viewId).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    startApp.showInterstitial(); // Show ad on page change
};

document.getElementById('nav-task').onclick = () => changeView('task');
document.getElementById('nav-wallet').onclick = () => changeView('wallet');
document.getElementById('nav-profile').onclick = () => changeView('profile');
document.getElementById('foot-home').onclick = () => changeView('home');
document.getElementById('foot-task').onclick = () => changeView('task');
document.getElementById('foot-wallet').onclick = () => changeView('wallet');
document.getElementById('foot-profile').onclick = () => changeView('profile');

// Daily Bonus
document.getElementById('btn-daily').onclick = async () => {
    const user = auth.currentUser;
    const today = new Date().toDateString();
    const snap = await get(ref(db, `users/${user.uid}`));
    const data = snap.val();

    if(data.dailyDate === today) return alert("Already claimed today!");
    
    startApp.showInterstitial(); // Ad before reward
    await update(ref(db, `users/${user.uid}`), { balance: data.balance + 2, dailyDate: today });
    alert("৳2 Added!");
};

// Video Task
document.getElementById('btn-task-1').onclick = () => {
    startApp.showRewarded({
        onVideoFinished: async () => {
            const user = auth.currentUser;
            const snap = await get(ref(db, `users/${user.uid}`));
            await update(ref(db, `users/${user.uid}`), { balance: snap.val().balance + 5 });
            alert("Reward ৳5 Added!");
        }
    });
};

// Withdraw
document.getElementById('btn-withdraw').onclick = async () => {
    const amt = parseFloat(document.getElementById('w-amount').value);
    const method = document.getElementById('w-method').value;
    const num = document.getElementById('w-number').value;
    const user = auth.currentUser;

    if(amt < 50 || !num) return alert("Min ৳50 and valid number required!");
    const snap = await get(ref(db, `users/${user.uid}`));
    if(snap.val().balance < amt) return alert("Insufficient Balance!");

    const reqRef = push(ref(db, 'withdrawals'));
    await set(reqRef, { uid: user.uid, email: user.email, amt, method, num, status: 'pending' });
    await update(ref(db, `users/${user.uid}`), { balance: snap.val().balance - amt });
    alert("Request Sent!");
};

// Logout
document.getElementById('btn-logout').onclick = () => signOut(auth).then(() => location.reload());

// Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        startApp.loadBanner("banner-ad-home");
        
        onValue(ref(db, 'users/' + user.uid), (s) => {
            const d = s.val();
            if(d) {
                document.getElementById('u-balance').innerText = d.balance.toFixed(2);
                document.getElementById('u-name-display').innerText = d.name;
                document.getElementById('u-email-display').innerText = d.email;
            }
        });
    }
});
