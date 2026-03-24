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

// Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// --- Functions ---

window.toggleAuth = (isReg) => {
    document.getElementById('login-box').classList.toggle('hidden', isReg);
    document.getElementById('reg-box').classList.toggle('hidden', !isReg);
};

window.register = async () => {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    if(!name || !email || pass.length < 6) return alert("Check inputs!");

    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await set(ref(db, 'users/' + res.user.uid), {
            name: name, email: email, balance: 0, dailyDate: ''
        });
        alert("Registration Successful!");
    } catch (e) { alert(e.message); }
};

window.login = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    try { await signInWithEmailAndPassword(auth, email, pass); } 
    catch (e) { alert("Login failed!"); }
};

window.changeView = (viewId, el) => {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + viewId).classList.remove('hidden');
    if(el) {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        el.classList.add('active');
    }
};

window.dailyCheck = async () => {
    const user = auth.currentUser;
    const today = new Date().toDateString();
    const snap = await get(ref(db, `users/${user.uid}`));
    const data = snap.val();

    if(data.dailyDate === today) return alert("Come back tomorrow!");
    await update(ref(db, `users/${user.uid}`), {
        balance: data.balance + 2,
        dailyDate: today
    });
    alert("৳2 Bonus Received!");
};

window.completeTask = async (amt) => {
    const user = auth.currentUser;
    const snap = await get(ref(db, `users/${user.uid}`));
    await update(ref(db, `users/${user.uid}`), { balance: snap.val().balance + amt });
    alert("Reward Added!");
};

window.requestWithdraw = async () => {
    const amount = parseFloat(document.getElementById('w-amount').value);
    const method = document.getElementById('w-method').value;
    const number = document.getElementById('w-number').value;
    const user = auth.currentUser;

    if(amount < 50) return alert("Minimum ৳50!");
    const snap = await get(ref(db, `users/${user.uid}`));
    if(snap.val().balance < amount) return alert("Insufficient balance!");

    const reqRef = push(ref(db, 'withdrawals'));
    await set(reqRef, { uid: user.uid, email: user.email, amount, method, number, status: 'pending' });
    await update(ref(db, `users/${user.uid}`), { balance: snap.val().balance - amount });
    alert("Withdraw request sent!");
};

window.logoutUser = () => signOut(auth).then(() => location.reload());

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        onValue(ref(db, 'users/' + user.uid), (s) => {
            const d = s.val();
            document.getElementById('u-balance').innerText = d.balance.toFixed(2);
            document.getElementById('u-name').innerText = d.name;
            document.getElementById('u-email').innerText = d.email;
        });
    }
});
