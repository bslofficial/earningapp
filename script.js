import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue, update, get, set } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", 
    projectId: "earning-web-app-d515c", 
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" 
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const AD_LINK = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

// ১. বিজ্ঞাপন এবং ইনকাম লজিক
window.runTask = async function(reward) {
    alert("বিজ্ঞাপন ওপেন হচ্ছে। ১০ সেকেন্ড দেখুন।");
    const adWin = window.open(AD_LINK, '_blank');
    if(!adWin) return alert("Pop-up allow করুন!");

    setTimeout(async () => {
        const user = auth.currentUser;
        if(user) {
            const userRef = ref(db, 'users/' + user.uid);
            const snap = await get(userRef);
            const newBal = (snap.val().balance || 0) + reward;
            await update(userRef, { balance: newBal });
            alert(`৳${reward} যোগ হয়েছে!`);
        }
    }, 10000);
};

// ২. লগইন/রেজিস্ট্রেশন টগল
let isRegisterMode = false;
window.toggleAuth = () => {
    isRegisterMode = !isRegisterMode;
    document.getElementById('reg-inputs').classList.toggle('hidden', !isRegisterMode);
    document.getElementById('auth-title').innerText = isRegisterMode ? "নতুন একাউন্ট" : "লগইন করুন";
    document.getElementById('auth-btn').innerText = isRegisterMode ? "Register" : "Login";
};

// ৩. অথেনটিকেশন লজিক
document.getElementById('auth-btn').onclick = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    if(isRegisterMode) {
        const name = document.getElementById('name').value;
        createUserWithEmailAndPassword(auth, email, pass).then(res => {
            set(ref(db, 'users/' + res.user.uid), { name, email, balance: 0 });
        }).catch(e => alert(e.message));
    } else {
        signInWithEmailAndPassword(auth, email, pass).catch(e => alert("ভুল তথ্য!"));
    }
};

// ৪. পেজ কন্ট্রোল এবং লাইভ ডাটা
onAuthStateChanged(auth, (user) => {
    if(user) {
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        onValue(ref(db, 'users/' + user.uid), snap => {
            document.getElementById('u-balance').innerText = snap.val().balance.toFixed(2);
            document.getElementById('u-name-display').innerText = snap.val().name;
        });
    } else {
        document.getElementById('auth-page').classList.remove('hidden');
        document.getElementById('main-page').classList.add('hidden');
    }
});

window.logout = () => signOut(auth);

// ৫. উইথড্র টগল
document.getElementById('btn-withdraw-ui').onclick = () => {
    document.getElementById('withdraw-section').classList.toggle('hidden');
};
