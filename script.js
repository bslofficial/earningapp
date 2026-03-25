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

// ট্যাব সিস্টেম
window.changeTab = function(name) {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById('view-' + name);
    if(target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + name);
    if(navBtn) navBtn.classList.add('active');
};

// অথেন্টিকেশন লজিক
onAuthStateChanged(auth, (user) => {
    if(user) {
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        
        onValue(ref(db, 'users/' + user.uid), snap => {
            const data = snap.val();
            if(data) {
                // ডাটা ডিসপ্লে আপডেট
                const balance = (data.balance || 0).toFixed(2);
                document.getElementById('u-balance').innerText = balance;
                document.getElementById('u-name-display').innerText = data.name;

                // প্রোফাইল পেজ আপডেট
                document.getElementById('p-name').innerText = data.name;
                document.getElementById('p-email').innerText = user.email;
                document.getElementById('p-balance').innerText = balance;
            }
        });
    } else {
        document.getElementById('auth-page').classList.remove('hidden');
        document.getElementById('main-page').classList.add('hidden');
    }
});

window.logout = () => signOut(auth);

// লগইন/রেজিস্ট্রেশন টগল ও সাবমিট
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

// টাস্ক ফাংশন (উদাহরণ)
window.runTask = async function(reward) {
    const user = auth.currentUser;
    if(user) {
        const userRef = ref(db, 'users/' + user.uid);
        const snap = await get(userRef);
        const newBal = (snap.val().balance || 0) + reward;
        await update(userRef, { balance: newBal });
        alert(`৳${reward} বোনাস পেয়েছেন!`);
    }
};
