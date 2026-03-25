import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue, update, get, set, push, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", 
    projectId: "earning-web-app-d515c", 
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const AD_LINK = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

// ট্যাব পরিবর্তন ও লিডারবোর্ড লোড
window.changeTab = (name) => {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + name).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById('nav-' + name)?.classList.add('active');
    if(name === 'leader') loadLeaderboard();
};

function loadLeaderboard() {
    const q = query(ref(db, 'users'), orderByChild('balance'), limitToLast(10));
    onValue(q, snap => {
        let html = '';
        let users = [];
        snap.forEach(c => users.push(c.val()));
        users.reverse().forEach((u, i) => {
            html += `<div class="lb-item"><span>${i+1}. ${u.name}</span><b>৳${(u.balance || 0).toFixed(2)}</b></div>`;
        });
        document.getElementById('lb-list').innerHTML = html;
    });
}

// বিজ্ঞাপন টাস্ক
window.runTask = (reward) => {
    alert("বিজ্ঞাপনটি ১০ সেকেন্ড দেখুন।");
    window.open(AD_LINK, '_blank');
    setTimeout(async () => {
        const user = auth.currentUser;
        if(user) {
            const userRef = ref(db, 'users/' + user.uid);
            const snap = await get(userRef);
            await update(userRef, { balance: (snap.val().balance || 0) + reward });
            alert(`৳${reward} যোগ হয়েছে!`);
        }
    }, 10000);
};

// স্পিন লজিক
window.startSpin = () => {
    const wheel = document.getElementById('wheel');
    wheel.style.transform = `rotate(${Math.floor(Math.random() * 360) + 1440}deg)`;
    document.getElementById('spin-btn').disabled = true;
    
    setTimeout(async () => {
        const reward = Math.floor(Math.random() * 5);
        const user = auth.currentUser;
        if(user) {
            const userRef = ref(db, 'users/' + user.uid);
            const snap = await get(userRef);
            await update(userRef, { balance: (snap.val().balance || 0) + reward });
            alert(`আপনি ৳${reward} জিতেছেন!`);
            document.getElementById('spin-btn').disabled = false;
        }
    }, 4000);
};

// অথেন্টিকেশন চেক
onAuthStateChanged(auth, (user) => {
    if(user) {
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        onValue(ref(db, 'users/' + user.uid), snap => {
            const d = snap.val();
            if(d) {
                document.getElementById('u-balance').innerText = d.balance.toFixed(2);
                document.getElementById('u-name-display').innerText = d.name;
                document.getElementById('p-name').innerText = d.name;
                document.getElementById('p-email').innerText = user.email;
                document.getElementById('p-balance').innerText = d.balance.toFixed(2);
            }
        });
    } else {
        document.getElementById('auth-page').classList.remove('hidden');
        document.getElementById('main-page').classList.add('hidden');
    }
});

// লগইন/রেজিস্ট্রেশন
let isReg = false;
window.toggleAuth = () => {
    isReg = !isReg;
    document.getElementById('reg-inputs').classList.toggle('hidden', !isReg);
    document.getElementById('auth-title').innerText = isReg ? "একাউন্ট তৈরি" : "লগইন";
};

document.getElementById('auth-btn').onclick = () => {
    const e = document.getElementById('email').value;
    const p = document.getElementById('pass').value;
    if(isReg) {
        const n = document.getElementById('name').value;
        createUserWithEmailAndPassword(auth, e, p).then(r => set(ref(db, 'users/' + r.user.uid), { name: n, email: e, balance: 0 }));
    } else {
        signInWithEmailAndPassword(auth, e, p).catch(() => alert("ভুল তথ্য!"));
    }
};

window.logout = () => signOut(auth);
