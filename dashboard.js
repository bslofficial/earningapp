import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue, update, get } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", 
    projectId: "earning-web-app-d515c", 
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" 
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const AD_LINK = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

// ১. বিজ্ঞাপন ফাংশন (Global করা হয়েছে যাতে HTML থেকে কল করা যায়)
window.runTask = async function(reward) {
    alert("বিজ্ঞাপন ওপেন হচ্ছে। ১০ সেকেন্ড দেখুন।");
    window.open(AD_LINK, '_blank');
    
    setTimeout(async () => {
        const user = auth.currentUser;
        if(user) {
            const snap = await get(ref(db, 'users/' + user.uid));
            const currentBal = snap.val().balance || 0;
            await update(ref(db, 'users/' + user.uid), { balance: currentBal + reward });
            alert(`৳${reward} আপনার ব্যালেন্সে যোগ হয়েছে!`);
        }
    }, 10000); // ১০ সেকেন্ড পর ব্যালেন্স যোগ হবে
};

// ২. ট্যাব পরিবর্তন
window.changeTab = (name) => {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + name).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if(document.getElementById('nav-' + name)) document.getElementById('nav-' + name).classList.add('active');
};

// ৩. উইথড্র টগল (Dashboard এ বাটনটি আইডি দিয়ে ধরা হয়েছে)
document.addEventListener('DOMContentLoaded', () => {
    const wdBtn = document.getElementById('btn-withdraw-ui');
    if(wdBtn) {
        wdBtn.onclick = () => document.getElementById('withdraw-section').classList.toggle('hidden');
    }
});

// ব্যালেন্স আপডেট লাইভ
onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "index.html";
    onValue(ref(db, 'users/' + user.uid), snap => {
        const data = snap.val();
        if(data) {
            document.getElementById('u-balance').innerText = (data.balance || 0).toFixed(2);
            document.getElementById('u-name-display').innerText = data.name;
        }
    });
});

window.logout = () => signOut(auth).then(() => window.location.href="index.html");
