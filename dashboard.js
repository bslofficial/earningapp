import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue, update, get, push } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM",
    authDomain: "earning-web-app-d515c.firebaseapp.com",
    projectId: "earning-web-app-d515c",
    storageBucket: "earning-web-app-d515c.firebasestorage.app",
    messagingSenderId: "940476940339",
    appId: "1:940476940339:web:eb81b99117e9294fc86346"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "index.html";
    onValue(ref(db, 'users/' + user.uid), (snap) => {
        const data = snap.val();
        document.getElementById('u-balance').innerText = (data.balance || 0).toFixed(2);
        document.getElementById('u-name-display').innerText = data.name;
    });
});

document.getElementById('btn-daily').onclick = async () => {
    const user = auth.currentUser;
    const snap = await get(ref(db, `users/${user.uid}`));
    update(ref(db, `users/${user.uid}`), { balance: (snap.val().balance || 0) + 2 });
    alert("৳২ বোনাস যোগ হয়েছে!");
};

document.getElementById('btn-withdraw-ui').onclick = () => document.getElementById('withdraw-section').classList.toggle('hidden');

document.getElementById('btn-withdraw-submit').onclick = async () => {
    const user = auth.currentUser;
    const amount = parseInt(document.getElementById('w-amount').value);
    const number = document.getElementById('w-number').value;
    const method = document.getElementById('method').value;

    if (amount < 50) return alert("মিনিমাম ৫০ টাকা!");
    const snap = await get(ref(db, `users/${user.uid}`));
    const balance = snap.val().balance || 0;

    if (balance >= amount) {
        await update(ref(db, `users/${user.uid}`), { balance: balance - amount });
        await push(ref(db, 'withdrawals/'), { uid: user.uid, name: snap.val().name, amount, number, method, status: "Pending" });
        alert("উইথড্র রিকোয়েস্ট সফল!");
    } else { alert("পর্যাপ্ত ব্যালেন্স নেই!"); }
};
