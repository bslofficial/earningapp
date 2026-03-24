import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, set, get, update, push, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// Your Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM",
    authDomain: "earning-web-app-d515c.firebaseapp.com",
    projectId: "earning-web-app-d515c",
    storageBucket: "earning-web-app-d515c.firebasestorage.app",
    messagingSenderId: "940476940339",
    appId: "1:940476940339:web:eb81b99117e9294fc86346",
    measurementId: "G-74LH2RTK1B"
};

const fApp = initializeApp(firebaseConfig);
const auth = getAuth(fApp);
const db = getDatabase(fApp);

// Ads Initialization
const startApp = new StartApp("202682403");

const app = {
    toggleAuth: (isReg) => {
        document.getElementById('login-box').classList.toggle('hidden', isReg);
        document.getElementById('reg-box').classList.toggle('hidden', !isReg);
    },

    register: async () => {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-pass').value;
        if(!name || !email || pass.length < 6) return alert("Fill all fields correctly!");

        try {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await set(ref(db, 'users/' + res.user.uid), {
                name: name, email: email, balance: 0, dailyDate: ''
            });
            alert("Account Created!");
        } catch (e) { alert(e.message); }
    },

    login: async () => {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (e) { alert("Invalid login!"); }
    },

    changeView: (viewId, el) => {
        document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
        document.getElementById('view-' + viewId).classList.remove('hidden');
        if(el) {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
        }
        startApp.showInterstitial(); // এড শো করবে
    },

    dailyCheck: async () => {
        const user = auth.currentUser;
        const today = new Date().toDateString();
        const snapshot = await get(ref(db, `users/${user.uid}`));
        const data = snapshot.val();

        if(data.dailyDate === today) {
            alert("Already collected today!");
        } else {
            startApp.showInterstitial(); // এড শো করবে
            await update(ref(db, `users/${user.uid}`), {
                balance: data.balance + 2,
                dailyDate: today
            });
            alert("Success! ৳2 added.");
        }
    },

    completeTask: async (amount) => {
        // রিওয়ার্ডেড ভিডিও এড
        startApp.showRewarded({
            onVideoFinished: async () => {
                const user = auth.currentUser;
                const snapshot = await get(ref(db, `users/${user.uid}`));
                await update(ref(db, `users/${user.uid}`), {
                    balance: snapshot.val().balance + amount
                });
                alert("Task Reward ৳" + amount + " added!");
            }
        });
    },

    requestWithdraw: async () => {
        const amount = document.getElementById('w-amount').value;
        const method = document.getElementById('w-method').value;
        const number = document.getElementById('w-number').value;
        const user = auth.currentUser;

        if(amount < 20) return alert("Minimum withdraw ৳20");
        
        const snapshot = await get(ref(db, `users/${user.uid}`));
        if(snapshot.val().balance < amount) return alert("Insufficient Balance!");

        const newReq = push(ref(db, 'withdrawals'));
        await set(newReq, {
            uid: user.uid, amount, method, number, status: 'pending', email: user.email
        });
        await update(ref(db, `users/${user.uid}`), { balance: snapshot.val().balance - amount });
        alert("Withdraw Request Sent!");
    }
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        
        startApp.loadBanner("start-banner-ad"); // ব্যানার লোড

        onValue(ref(db, 'users/' + user.uid), (snap) => {
            const d = snap.val();
            if(d){
                document.getElementById('u-balance').innerText = d.balance.toFixed(2);
                document.getElementById('u-name').innerText = d.name;
                document.getElementById('u-email').innerText = d.email;
            }
        });
    }
});

window.app = app;
