import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue, update, get, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", 
    projectId: "earning-web-app-d515c", 
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" 
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const AD_LINK = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "index.html";
    onValue(ref(db, 'users/' + user.uid), snap => {
        const data = snap.val();
        document.getElementById('u-balance').innerText = (data.balance || 0).toFixed(2);
        document.getElementById('u-name-display').innerText = data.name;
        document.getElementById('my-refer-code').innerText = user.uid.substring(0, 6).toUpperCase();
    });
});

// টাস্ক ফাংশন (অ্যাড দেখানো এবং টাকা যোগ)
async function completeTask(reward) {
    window.open(AD_LINK, '_blank'); // অ্যাড লিঙ্ক ওপেন
    setTimeout(async () => {
        const user = auth.currentUser;
        const snap = await get(ref(db, `users/${user.uid}`));
        const newBal = (snap.val().balance || 0) + reward;
        await update(ref(db, `users/${user.uid}`), { balance: newBal });
        alert(`৳${reward} আপনার ব্যালেন্স এ যোগ করা হয়েছে!`);
    }, 2000); // ২ সেকেন্ড পর টাকা যোগ হবে
}

document.getElementById('btn-daily').onclick = () => completeTask(2);
document.getElementById('btn-spin').onclick = () => completeTask(3);
document.getElementById('btn-video').onclick = () => completeTask(5);

// ট্যাব পরিবর্তন
window.changeTab = (tabName) => {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + tabName).classList.remove('hidden');
    if(tabName === 'leader') loadLeaderboard();
};

// লিডারবোর্ড লোড
function loadLeaderboard() {
    const lbRef = query(ref(db, 'users'), orderByChild('balance'), limitToLast(10));
    onValue(lbRef, (snap) => {
        const list = document.getElementById('lb-data');
        list.innerHTML = "";
        let users = [];
        snap.forEach(c => { users.push(c.val()); });
        users.reverse().forEach((u, i) => {
            list.innerHTML += `<tr><td>#${i+1}</td><td>${u.name}</td><td>৳${u.balance.toFixed(2)}</td></tr>`;
        });
    });
}
