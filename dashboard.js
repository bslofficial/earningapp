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

// ১. বিজ্ঞাপন ফাংশন
window.runTask = async function(reward) {
    alert("বিজ্ঞাপন ওপেন হচ্ছে। ১০ সেকেন্ড দেখুন।");
    const adWindow = window.open(AD_LINK, '_blank');
    
    if (!adWindow) {
        alert("Pop-up ব্লক করা! দয়া করে ব্রাউজার সেটিং থেকে Pop-up allow করুন।");
        return;
    }
    
    setTimeout(async () => {
        const user = auth.currentUser;
        if(user) {
            const userRef = ref(db, 'users/' + user.uid);
            const snap = await get(userRef);
            const currentBal = snap.val().balance || 0;
            await update(userRef, { balance: currentBal + reward });
            alert(`৳${reward} আপনার ব্যালেন্সে যোগ হয়েছে!`);
        }
    }, 10000); 
};

// ২. ট্যাব পরিবর্তন
window.changeTab = (name) => {
    const views = document.querySelectorAll('.page-view');
    views.forEach(v => v.classList.add('hidden'));
    
    const targetView = document.getElementById('view-' + name);
    if(targetView) targetView.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const navItem = document.getElementById('nav-' + name);
    if(navItem) navItem.classList.add('active');
};

// ৩. ইভেন্ট লিসেনার এবং উইথড্র টগল
document.addEventListener('DOMContentLoaded', () => {
    const wdBtn = document.getElementById('btn-withdraw-ui');
    if(wdBtn) {
        wdBtn.onclick = () => {
            const section = document.getElementById('withdraw-section');
            if(section) section.classList.toggle('hidden');
        };
    }
});

// ব্যালেন্স আপডেট লাইভ
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
    } else {
        onValue(ref(db, 'users/' + user.uid), snap => {
            const data = snap.val();
            if(data) {
                const balEl = document.getElementById('u-balance');
                const nameEl = document.getElementById('u-name-display');
                if(balEl) balEl.innerText = (data.balance || 0).toFixed(2);
                if(nameEl) nameEl.innerText = data.name;
            }
        });
    }
});

window.logout = () => signOut(auth).then(() => window.location.href="index.html");
