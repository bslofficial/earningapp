import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue, get, update, push, query, orderByChild, equalTo, limitToLast } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = { apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", projectId: "earning-web-app-d515c", databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const AD_LINK = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

onAuthStateChanged(auth, user => {
    if(!user) window.location.href="index.html";
    onValue(ref(db, 'users/'+user.uid), snap => {
        const d = snap.val();
        if(d){
            document.getElementById('u-balance').innerText = d.balance.toFixed(2);
            document.getElementById('u-name-display').innerText = d.name;
            document.getElementById('my-refer-code').innerText = d.referCode;
        }
    });
});

async function doTask(amt){
    window.open(AD_LINK, '_blank');
    setTimeout(async ()=>{
        const snap = await get(ref(db, `users/${auth.currentUser.uid}`));
        update(ref(db, `users/${auth.currentUser.uid}`), { balance: snap.val().balance + amt });
        alert("৳"+amt+" যোগ হয়েছে!");
    }, 2000);
}

document.getElementById('btn-daily').onclick = () => doTask(2);
document.getElementById('btn-spin').onclick = () => doTask(3);
document.getElementById('btn-video').onclick = () => doTask(5);

window.changeTab = name => {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-'+name).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if(document.getElementById('nav-'+name)) document.getElementById('nav-'+name).classList.add('active');
    
    if(name === 'team') loadTeam();
    if(name === 'profile') loadProfile();
    if(name === 'history') loadHistory();
    if(name === 'leader') loadLeader();
};

async function loadTeam(){
    const myCode = (await get(ref(db, `users/${auth.currentUser.uid}`))).val().referCode;
    const q = query(ref(db, 'users'), orderByChild('referredBy'), equalTo(myCode));
    onValue(q, snap => {
        const list = document.getElementById('team-list');
        list.innerHTML = snap.exists() ? "" : "টিমে কেউ নেই।";
        snap.forEach(c => {
            list.innerHTML += `<div class="team-item"><span>${c.val().name}</span><span>৳${c.val().balance.toFixed(2)}</span></div>`;
        });
    });
}

function loadProfile(){
    onValue(ref(db, 'users/'+auth.currentUser.uid), snap => {
        const d = snap.val();
        document.getElementById('profile-info').innerHTML = `<p>নাম: ${d.name}</p><p>ইমেইল: ${d.email}</p><p>কোড: ${d.referCode}</p>`;
    });
}

function loadHistory(){
    const q = query(ref(db, 'withdrawals'), orderByChild('uid'), equalTo(auth.currentUser.uid));
    onValue(q, snap => {
        const h = document.getElementById('history-data');
        h.innerHTML = snap.exists() ? "" : "কোনো হিস্ট্রি নেই।";
        snap.forEach(c => {
            const d = c.val();
            h.innerHTML += `<div class="history-item"><span>৳${d.amount} (${d.method})</span><span class="status-${d.status.toLowerCase()}">${d.status}</span></div>`;
        });
    });
}

function loadLeader(){
    const q = query(ref(db, 'users'), orderByChild('balance'), limitToLast(10));
    onValue(q, snap => {
        const l = document.getElementById('lb-data'); l.innerHTML = "";
        let arr = []; snap.forEach(c => arr.push(c.val()));
        arr.reverse().forEach((u, i) => { l.innerHTML += `<tr><td>${i+1}. ${u.name}</td><td>৳${u.balance.toFixed(2)}</td></tr>`; });
    });
}

document.getElementById('btn-withdraw-ui').onclick = () => document.getElementById('withdraw-section').classList.toggle('hidden');
document.getElementById('btn-withdraw-submit').onclick = async () => {
    const amt = parseInt(document.getElementById('w-amount').value);
    const num = document.getElementById('w-number').value;
    const user = auth.currentUser;
    const snap = await get(ref(db, `users/${user.uid}`));
    if(amt >= 50 && snap.val().balance >= amt){
        await update(ref(db, `users/${user.uid}`), { balance: snap.val().balance - amt });
        await push(ref(db, 'withdrawals'), { uid: user.uid, name: snap.val().name, amount: amt, num: num, method: "Mobile", status: "Pending" });
        alert("সফল!");
    } else { alert("ব্যালেন্স নেই!"); }
};

window.logout = () => signOut(auth).then(()=> window.location.href="index.html");
