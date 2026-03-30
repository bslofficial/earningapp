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

// কাস্টম অ্যালার্ট
window.showAlert = (msg) => {
    document.getElementById('alert-msg').innerText = msg;
    document.getElementById('custom-alert').classList.remove('hidden');
};
window.closeAlert = () => document.getElementById('custom-alert').classList.add('hidden');

// ইউজার স্টেট চেক
onAuthStateChanged(auth, user => {
    if(user) {
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        onValue(ref(db, 'users/' + user.uid), snap => {
            const d = snap.val();
            if(d) {
                document.getElementById('u-balance').innerText = (d.balance || 0).toFixed(2);
                document.getElementById('u-name-display').innerText = d.name;
                // পুরাতন ইউজারের কোড না থাকলে নতুন কোড তৈরি করে আপডেট করবে
                if(!d.referCode) {
                    const newCode = "EA" + Math.floor(1000 + Math.random()*9000);
                    update(ref(db, 'users/' + user.uid), { referCode: newCode });
                }
                document.getElementById('u-refer-code').innerText = d.referCode || "...";
            }
        });
    } else {
        document.getElementById('auth-page').classList.remove('hidden');
        document.getElementById('main-page').classList.add('hidden');
    }
});

// রেজিস্ট্রেশন ও রেফার
document.getElementById('auth-btn').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    const isReg = !document.getElementById('reg-inputs').classList.contains('hidden');

    if(!isReg) {
        signInWithEmailAndPassword(auth, email, pass).catch(() => showAlert("লগইন ভুল!"));
    } else {
        const name = document.getElementById('name').value.trim();
        const rBy = document.getElementById('refer-by').value.trim().toUpperCase();
        const myCode = "EA" + Math.floor(1000 + Math.random()*9000);
        
        createUserWithEmailAndPassword(auth, email, pass).then(async (res) => {
            let bonus = 0;
            if(rBy) {
                const uSnap = await get(ref(db, 'users'));
                uSnap.forEach(c => {
                    if(c.val().referCode === rBy) {
                        update(ref(db, 'users/' + c.key), { balance: (c.val().balance || 0) + 5 });
                        bonus = 2;
                    }
                });
            }
            await set(ref(db, 'users/' + res.user.uid), { name, email, balance: bonus, referCode: myCode });
            showAlert("রেজিস্ট্রেশন সফল!");
        }).catch(() => showAlert("ভুল হয়েছে!"));
    }
};

// বাটন ফাংশনসমূহ (Window Object এ রাখা হয়েছে যাতে HTML থেকে কাজ করে)
window.dailyBonus = async () => {
    const uRef = ref(db, 'users/' + auth.currentUser.uid);
    const s = await get(uRef);
    const lastDate = s.val().lastBonusDate;
    const today = new Date().toDateString();

    if(lastDate === today) return showAlert("আজকের বোনাস নিয়েছেন!");
    await update(uRef, { balance: (s.val().balance || 0) + 2, lastBonusDate: today });
    showAlert("৳২ ডেইলি বোনাস পেয়েছেন!");
};

window.runVideoTask = () => {
    window.open("https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb", "_blank");
    showAlert("১০ সেকেন্ড পর বোনাস যোগ হবে...");
    setTimeout(async () => {
        const uRef = ref(db, 'users/' + auth.currentUser.uid);
        const s = await get(uRef);
        await update(uRef, { balance: (s.val().balance || 0) + 5 });
        showAlert("৳৫ বোনাস যোগ হয়েছে!");
    }, 10000);
};

window.startSpin = () => {
    const wheel = document.getElementById('wheel');
    const deg = Math.floor(Math.random() * 360) + 1440;
    wheel.style.transform = `rotate(${deg}deg)`;
    setTimeout(async () => {
        const reward = [1, 2, 0, 5, 1, 3][Math.floor(Math.random()*6)];
        const uRef = ref(db, 'users/' + auth.currentUser.uid);
        const s = await get(uRef);
        await update(uRef, { balance: (s.val().balance || 0) + reward });
        showAlert(`আপনি ৳${reward} জিতেছেন!`);
    }, 3500);
};

window.submitWithdraw = async () => {
    const amount = parseFloat(document.getElementById('w-amount').value);
    const num = document.getElementById('w-number').value.trim();
    if(amount < 500) return showAlert("মিনিমাম ৫০০ টাকা!");
    const s = await get(ref(db, 'users/' + auth.currentUser.uid));
    if(s.val().balance < amount) return showAlert("ব্যালেন্স নেই!");
    
    await update(ref(db, 'users/' + auth.currentUser.uid), { balance: s.val().balance - amount });
    await push(ref(db, 'withdraw_requests'), { uid: auth.currentUser.uid, amount, number: num, method: document.getElementById('method').value, time: new Date().toLocaleString() });
    showAlert("রিকোয়েস্ট পাঠানো হয়েছে!");
};

// নেভিগেশন ও অন্যান্য
window.changeTab = (n) => {
    if(n === 'leaderboard') {
        const lb = document.getElementById('leaderboard-list');
        onValue(ref(db, 'users'), s => {
            let arr = Object.values(s.val()).sort((a,b) => b.balance - a.balance).slice(0,100);
            lb.innerHTML = arr.map((u,i) => `<div class="lb-item"><span>${i+1}. ${u.name}</span><span>৳${u.balance.toFixed(2)}</span></div>`).join('');
        });
    }
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + n).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById('nav-' + (n === 'leaderboard'||n === 'profile'?n:'home')).classList.add('active');
};

window.copyRefer = () => {
    navigator.clipboard.writeText(document.getElementById('u-refer-code').innerText).then(() => showAlert("কোড কপি হয়েছে!"));
};
window.toggleAuth = () => {
    document.getElementById('reg-inputs').classList.toggle('hidden');
    document.getElementById('auth-title').innerText = document.getElementById('reg-inputs').classList.contains('hidden') ? "লগইন করুন" : "রেজিস্ট্রেশন করুন";
};
window.logout = () => signOut(auth).then(() => location.reload());
