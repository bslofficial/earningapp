import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue, update, get, push, query, orderByChild, limitToLast, equalTo } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", 
    projectId: "earning-web-app-d515c", 
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" 
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Adsterra Direct Link
const AD_LINK = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

onAuthStateChanged(auth, (user) => {
    if (!user) { window.location.href = "index.html"; return; }
    onValue(ref(db, 'users/' + user.uid), snap => {
        const data = snap.val();
        if(data) {
            document.getElementById('u-balance').innerText = (data.balance || 0).toFixed(2);
            document.getElementById('u-name-display').innerText = data.name;
            document.getElementById('my-refer-code').innerText = data.referCode || "N/A";
        }
    });
});

// Task Logic with Ad
async function runTask(reward) {
    window.open(AD_LINK, '_blank');
    setTimeout(async () => {
        const user = auth.currentUser;
        const snap = await get(ref(db, `users/${user.uid}`));
        const currentBal = snap.val().balance || 0;
        await update(ref(db, `users/${user.uid}`), { balance: currentBal + reward });
        alert(`অভিনন্দন! ৳${reward} আপনার ব্যালেন্সে যোগ হয়েছে।`);
    }, 2000); 
}

document.getElementById('btn-daily').onclick = () => runTask(2);
document.getElementById('btn-spin').onclick = () => runTask(3);
document.getElementById('btn-video').onclick = () => runTask(5);

// Navigation Logic
window.changeTab = (name) => {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + name).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById('nav-' + name).classList.add('active');
    
    if(name === 'leader') loadLeaderboard();
    if(name === 'history') loadHistory();
};

function loadHistory() {
    const q = query(ref(db, 'withdrawals'), orderByChild('uid'), equalTo(auth.currentUser.uid));
    onValue(q, (snap) => {
        const hData = document.getElementById('history-data');
        hData.innerHTML = snap.exists() ? "" : "<p style='text-align:center;'>কোনো পেমেন্ট রেকর্ড নেই।</p>";
        snap.forEach(child => {
            const d = child.val();
            hData.innerHTML += `
                <div class="history-item">
                    <div><strong>৳${d.amount}</strong><p>${d.method} (${d.num})</p></div>
                    <span class="status-${d.status.toLowerCase()}">${d.status}</span>
                </div>`;
        });
    });
}

function loadLeaderboard() {
    const q = query(ref(db, 'users'), orderByChild('balance'), limitToLast(10));
    onValue(q, (snap) => {
        const list = document.getElementById('lb-data');
        list.innerHTML = "";
        let users = [];
        snap.forEach(c => users.push(c.val()));
        users.reverse().forEach((u, i) => {
            list.innerHTML += `<tr><td>${i+1}. ${u.name}</td><td>৳${u.balance.toFixed(2)}</td></tr>`;
        });
    });
}

document.getElementById('btn-withdraw-ui').onclick = () => document.getElementById('withdraw-section').classList.toggle('hidden');

document.getElementById('btn-withdraw-submit').onclick = async () => {
    const amount = parseInt(document.getElementById('w-amount').value);
    const num = document.getElementById('w-number').value;
    const method = document.getElementById('method').value;
    const user = auth.currentUser;
    const snap = await get(ref(db, `users/${user.uid}`));
    
    if(amount >= 50 && (snap.val().balance || 0) >= amount) {
        await update(ref(db, `users/${user.uid}`), { balance: snap.val().balance - amount });
        await push(ref(db, 'withdrawals'), { uid: user.uid, name: snap.val().name, amount, num, method, status: "Pending" });
        alert("উইথড্র রিকোয়েস্ট সফল হয়েছে!");
        document.getElementById('withdraw-section').classList.add('hidden');
    } else { alert("আপনার পর্যাপ্ত ব্যালেন্স নেই বা ভুল পরিমাণ দিয়েছেন!"); }
};
