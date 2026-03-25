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

// ট্যাব পরিবর্তন ও লিডারবোর্ড লোড
window.changeTab = function(name) {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + name).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if(document.getElementById('nav-' + name)) document.getElementById('nav-' + name).classList.add('active');

    if(name === 'leader') loadLeaderboard();
};

// লিডারবোর্ড লোড করা
function loadLeaderboard() {
    const userQuery = query(ref(db, 'users'), orderByChild('balance'), limitToLast(10));
    onValue(userQuery, snap => {
        let html = '';
        let users = [];
        snap.forEach(child => { users.push(child.val()); });
        users.reverse().forEach((u, i) => {
            html += `<div class="lb-item"><span>${i+1}. ${u.name}</span><span class="lb-balance">৳${u.balance.toFixed(2)}</span></div>`;
        });
        document.getElementById('lb-list').innerHTML = html;
    });
}

// উইথড্র সাবমিট
window.submitWithdraw = async function() {
    const amount = parseFloat(document.getElementById('w-amount').value);
    const number = document.getElementById('w-number').value;
    const method = document.getElementById('method').value;
    const user = auth.currentUser;

    if(amount < 50) return alert("সর্বনিম্ন ৫০ টাকা উত্তোলন করা যাবে।");
    if(!number) return alert("নাম্বার দিন।");

    const userRef = ref(db, 'users/' + user.uid);
    const snap = await get(userRef);
    const currentBal = snap.val().balance || 0;

    if(currentBal < amount) return alert("আপনার ব্যালেন্স পর্যাপ্ত নয়।");

    // ব্যালেন্স কাটা এবং রিকোয়েস্ট সেভ
    await update(userRef, { balance: currentBal - amount });
    const requestRef = ref(db, 'withdraw_requests');
    await push(requestRef, {
        uid: user.uid,
        name: snap.val().name,
        amount: amount,
        number: number,
        method: method,
        status: "Pending",
        date: new Date().toLocaleString()
    });
    alert("আপনার রিকোয়েস্ট সফল হয়েছে। ২৪ ঘণ্টার মধ্যে পেমেন্ট পাবেন।");
};

// বাকি অথেন্টিকেশন ও রানটাস্ক আগের কোড মতোই থাকবে...
// (লগআউট, লগইন/রেজিস্ট্রেশন টগল এবং runTask ফাংশন আগের ফাইল থেকে কপি করে নিচে রাখুন)
