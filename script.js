import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, set, get, update, push, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM",
  authDomain: "earning-web-app-d515c.firebaseapp.com",
  projectId: "earning-web-app-d515c",
  storageBucket: "earning-web-app-d515c.firebasestorage.app",
  messagingSenderId: "940476940339",
  appId: "1:940476940339:web:eb81b99117e9294fc86346",
  measurementId: "G-74LH2RTK1B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Initialize Start.io Ads
const startApp = new StartApp("202682403");

// --- Helper Functions ---
window.toggleAuth = (isReg) => {
    document.getElementById('login-box').classList.toggle('hidden', isReg);
    document.getElementById('reg-box').classList.toggle('hidden', !isReg);
};

// Register
window.register = async () => {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;

    if(!name || !email || pass.length < 6) return alert("Fill all & Password min 6 chars!");

    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await set(ref(db, 'users/' + res.user.uid), {
            name: name, email: email, balance: 0, dailyDate: ''
        });
        alert("Registration Successful!");
    } catch (e) { alert("Error: " + e.message); }
};

// Login
window.login = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    try { await signInWithEmailAndPassword(auth, email, pass); } 
    catch (e) { alert("Login Failed: Check Email/Password"); }
};

// Navigation
window.changeView = (id, el) => {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + id).classList.remove('hidden');
    
    if(el) {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        el.classList.add('active');
        startApp.showInterstitial(); // Show Interstitial Ad on page change
    }
};

// Daily Bonus
window.dailyCheck = async () => {
    const user = auth.currentUser;
    const today = new Date().toDateString();
    const snap = await get(ref(db, `users/${user.uid}`));
    const data = snap.val();

    if(data.dailyDate === today) return alert("Already claimed! Come back tomorrow.");

    startApp.showInterstitial(); // Ad before reward
    await update(ref(db, `users/${user.uid}`), {
        balance: data.balance + 2,
        dailyDate: today
    });
    alert("৳2 Bonus Claimed!");
};

// Video Task
window.completeTask = (amt) => {
    startApp.showRewarded({
        onVideoFinished: async () => {
            const user = auth.currentUser;
            const snap = await get(ref(db, `users/${user.uid}`));
            await update(ref(db, `users/${user.uid}`), { balance: snap.val().balance + amt });
            alert("Reward added: ৳" + amt);
        }
    });
};

// Withdraw Request
window.requestWithdraw = async () => {
    const amt = parseFloat(document.getElementById('w-amount').value);
    const num = document.getElementById('w-number').value;
    const user = auth.currentUser;

    if(amt < 50) return alert("Minimum withdrawal is ৳50!");
    if(!num) return alert("Enter payment number!");

    const snap = await get(ref(db, `users/${user.uid}`));
    if(snap.val().balance < amt) return alert("Insufficient Balance!");

    const reqRef = push(ref(db, 'withdrawals'));
    await set(reqRef, { uid: user.uid, email: user.email, amt, num, status: 'pending' });
    await update(ref(db, `users/${user.uid}`), { balance: snap.val().balance - amt });
    
    alert("Withdraw Request Submitted!");
};

// Logout
window.logoutUser = () => signOut(auth).then(() => location.reload());

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        
        // Load Banner Ad
        startApp.loadBanner("banner-ad-container");

        // Realtime Data Sync
        onValue(ref(db, 'users/' + user.uid), (snapshot) => {
            const data = snapshot.val();
            if(data) {
                document.getElementById('u-balance').innerText = data.balance.toFixed(2);
                document.getElementById('u-name').innerText = data.name;
                document.getElementById('u-email').innerText = data.email;
            }
        });
    } else {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('app-content').classList.add('hidden');
    }
});
