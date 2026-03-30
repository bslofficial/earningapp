import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue, update, get, set, push, query, orderByChild, limitToLast, equalTo } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", 
    projectId: "earning-web-app-d515c", 
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const APP_URL = "https://bslofficial.github.io/earningapp/";
const AD_LINK = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

// ১. নেভিগেশন
window.changeTab = (name) => {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + name).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById('nav-' + (['spin', 'withdraw'].includes(name) ? 'home' : name))?.classList.add('active');
    if(name === 'leader') loadLeaderboard();
    if(name === 'withdraw') loadHistory();
};

// ২. শেয়ার ফাংশন (ফিক্সড)
window.shareApp = () => {
    const code = document.getElementById('u-refer-code').innerText;
    if(code === "লোড হচ্ছে..." || code === "কোড নেই") return alert("অপেক্ষা করুন...");
    const text = `BSL Official অ্যাপে কাজ করে আয় করুন! আমার রেফার কোড: ${code}\nলিঙ্ক: ${APP_URL}`;
    if(navigator.share) {
        navigator.share({ title: 'Earn Money', text: text });
    } else {
        navigator.clipboard.writeText(text).then(() => alert("লিঙ্ক কপি হয়েছে!"));
    }
};

// ৩. স্পিন ও টাস্ক
window.startSpin = () => {
    const wheel = document.getElementById('wheel');
    const btn = document.getElementById('spin-btn');
    btn.disabled = true;
    const deg = Math.floor(Math.random() * 360) + 1440;
    wheel.style.transform = `rotate(${deg}deg)`;
    setTimeout(async () => {
        const rewards = [1, 2, 0, 5, 1, 3];
        const reward = rewards[Math.floor(Math.random() * 6)];
        const userRef = ref(db, 'users/' + auth.currentUser.uid);
        const snap = await get(userRef);
        await update(userRef, { balance: (snap.val().balance || 0) + reward });
        if(confirm(`আপনি ৳${reward} জিতেছেন! বোনাস নিতে ওকে করুন।`)) window.location.href = AD_LINK;
        btn.disabled = false;
    }, 3500);
};

window.runTask = (reward) => {
    window.open(AD_LINK, '_blank');
    setTimeout(async () => {
        const userRef = ref(db, 'users/' + auth.currentUser.uid);
        const snap = await get(userRef);
        await update(userRef, { balance: (snap.val().balance || 0) + reward });
        alert(`৳${reward} যোগ হয়েছে!`);
    }, 10000);
};

// ৪. উইথড্র ও হিস্ট্রি (মিন: ৫০০)
window.submitWithdraw = async () => {
    const amount = parseFloat(document.getElementById('w-amount').value);
    const number = document.getElementById('w-number').value.trim();
    const method = document.getElementById('method').value;
    const user = auth.currentUser;
    if(!amount || amount < 500) return alert("সর্বনিম্ন ৫০০ টাকা উইথড্র!");
    const userRef = ref(db, 'users/' + user.uid);
    const snap = await get(userRef);
    if((snap.val().balance || 0) < amount) return alert("ব্যালেন্স নেই!");
    await update(userRef, { balance: snap.val().balance - amount });
    await push(ref(db, 'withdraw_requests'), {
        uid: user.uid, name: snap.val().name, amount, number, method, status: "pending", time: new Date().toLocaleString()
    });
    alert("রিকোয়েস্ট সফল!");
};

function loadHistory() {
    const q = query(ref(db, 'withdraw_requests'), orderByChild('uid'), equalTo(auth.currentUser.uid));
    onValue(q, snap => {
        let h = '';
        snap.forEach(c => {
            const d = c.val();
            h += `<div class="history-item"><span>${d.method}: ৳${d.amount}</span><span class="status-p">পেন্ডিং</span></div>`;
        });
        document.getElementById('history-list').innerHTML = h || "কোনো ডাটা নেই";
    });
}

// ৫. লিডারবোর্ড (সেরা ১০০)
function loadLeaderboard() {
    const q = query(ref(db, 'users'), orderByChild('balance'), limitToLast(100));
    onValue(q, snap => {
        let list = [];
        snap.forEach(c => { if(c.val().balance > 0) list.push(c.val()); });
        list.sort((a,b) => b.balance - a.balance);
        document.getElementById('lb-list').innerHTML = list.map((u,i) => `
            <div class="lb-item"><span>${i+1}. ${u.name}</span><b>৳${u.balance.toFixed(2)}</b></div>
        `).join('');
    });
}

// ৬. অথেন্টিকেশন ও প্রোফাইল
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

let isReg = false;
window.toggleAuth = () => {
    isReg = !isReg;
    document.getElementById('reg-inputs').classList.toggle('hidden', !isReg);
    document.getElementById('auth-title').innerText = isReg ? "একাউন্ট তৈরি" : "লগইন";
};

document.getElementById('auth-btn').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    if(isReg) {
        const name = document.getElementById('name').value.trim();
        const rBy = document.getElementById('refer-by').value.trim();
        const rCode = name.substring(0,3).toUpperCase() + Math.floor(1000 + Math.random()*9000);
        createUserWithEmailAndPassword(auth, email, pass).then(async res => {
            let bonus = 0;
            if(rBy) {
                const uSnap = await get(ref(db, 'users'));
                uSnap.forEach(c => { if(c.val().referCode === rBy) { update(ref(db, 'users/' + c.key), { balance: (c.val().balance || 0) + 5 }); bonus = 2; } });
            }
            set(ref(db, 'users/' + res.user.uid), { name, email, balance: bonus, referCode: rCode, role: "user" });
        }).catch(() => alert("ব্যর্থ!"));
    } else {
        signInWithEmailAndPassword(auth, email, pass).catch(() => alert("ব্যর্থ!"));
    }
};

window.logout = () => signOut(auth).then(() => location.reload());
