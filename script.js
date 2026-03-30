import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue, update, get, set, push } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", 
    projectId: "earning-web-app-d515c", 
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const APP_URL = "https://bslofficial.github.io/earningapp/";

// ১. কাস্টম অ্যালার্ট
window.showAlert = (msg) => {
    document.getElementById('alert-msg').innerText = msg;
    document.getElementById('custom-alert').classList.remove('hidden');
};
window.closeAlert = () => document.getElementById('custom-alert').classList.add('hidden');

// ২. লিডারবোর্ড লোড (সেরা ১০০)
const loadLeaderboard = () => {
    const lbList = document.getElementById('leaderboard-list');
    onValue(ref(db, 'users'), (snap) => {
        const data = snap.val();
        if (data) {
            let userArray = Object.values(data).sort((a, b) => (b.balance || 0) - (a.balance || 0));
            let top100 = userArray.slice(0, 100);
            lbList.innerHTML = "";
            top100.forEach((u, i) => {
                lbList.innerHTML += `<div class="lb-item"><span><b>${i+1}.</b> ${u.name}</span><span>৳${(u.balance || 0).toFixed(2)}</span></div>`;
            });
        }
    });
};

// ৩. অথেন্টিকেশন স্টেট
onAuthStateChanged(auth, user => {
    if(user) {
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        onValue(ref(db, 'users/' + user.uid), snap => {
            const d = snap.val();
            if(d) {
                document.getElementById('u-balance').innerText = (d.balance || 0).toFixed(2);
                document.getElementById('u-name-display').innerText = d.name;
                document.getElementById('u-refer-code').innerText = d.referCode || "কোড নেই";
            }
        });
    } else {
        document.getElementById('auth-page').classList.remove('hidden');
        document.getElementById('main-page').classList.add('hidden');
    }
});

// ৪. রেজিস্ট্রেশন ও রেফার
document.getElementById('auth-btn').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    const isReg = !document.getElementById('reg-inputs').classList.contains('hidden');

    if(!isReg) {
        signInWithEmailAndPassword(auth, email, pass).catch(() => showAlert("লগইন ভুল!"));
    } else {
        const name = document.getElementById('name').value.trim();
        const rBy = document.getElementById('refer-by').value.trim();
        const myCode = name.substring(0,3).toUpperCase() + Math.floor(1000 + Math.random()*9000);
        
        createUserWithEmailAndPassword(auth, email, pass).then(async (res) => {
            let bonus = 0;
            if(rBy) {
                const uSnap = await get(ref(db, 'users'));
                uSnap.forEach(c => {
                    if(c.val().referCode === rBy) {
                        update(ref(db, 'users/' + c.key), { balance: (c.val().balance || 0) + 5 });
                        bonus = 2; // নতুন ইউজার পাবে ২ টাকা
                    }
                });
            }
            await set(ref(db, 'users/' + res.user.uid), { name, email, balance: bonus, referCode: myCode });
            showAlert("রেজিস্ট্রেশন সফল!");
        }).catch(() => showAlert("ব্যর্থ হয়েছে!"));
    }
};

// ৫. অন্যান্য ফাংশন
window.startSpin = () => {
    const wheel = document.getElementById('wheel');
    const deg = Math.floor(Math.random() * 360) + 1440;
    wheel.style.transform = `rotate(${deg}deg)`;
    setTimeout(async () => {
        const reward = [1, 2, 0, 5, 1, 3][Math.floor(Math.random()*6)];
        const uRef = ref(db, 'users/' + auth.currentUser.uid);
        const s = await get(uRef);
        await update(uRef, { balance: (s.val().balance || 0) + reward });
        showAlert(`জিতেছেন ৳${reward}!`);
    }, 3500);
};

window.runTask = (reward) => {
    window.open("https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb", "_blank");
    setTimeout(async () => {
        const uRef = ref(db, 'users/' + auth.currentUser.uid);
        const s = await get(uRef);
        await update(uRef, { balance: (s.val().balance || 0) + reward });
        showAlert(`৳${reward} যোগ হয়েছে!`);
    }, 10000);
};

window.changeTab = (n) => {
    if(n === 'leaderboard') loadLeaderboard();
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + n).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById('nav-' + (n === 'spin' || n === 'withdraw' ? 'home' : n)).classList.add('active');
};

window.shareApp = () => {
    const code = document.getElementById('u-refer-code').innerText;
    navigator.clipboard.writeText(`রেফার কোড: ${code}\nলিঙ্ক: ${APP_URL}`).then(() => showAlert("কপি হয়েছে!"));
};
window.toggleAuth = () => {
    document.getElementById('reg-inputs').classList.toggle('hidden');
    document.getElementById('auth-title').innerText = document.getElementById('reg-inputs').classList.contains('hidden') ? "লগইন করুন" : "রেজিস্ট্রেশন করুন";
};
window.logout = () => signOut(auth).then(() => location.reload());
