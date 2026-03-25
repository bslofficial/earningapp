import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue, update, get, set, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", 
    projectId: "earning-web-app-d515c", 
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Adsterra Direct Link (আপনার লিংকটি এখানে ঠিক আছে)
const AD_LINK = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

// ১. লগইন/রেজিস্ট্রেশন লজিক (লগইন না হলে এটি চেক করুন)
let isReg = false;
window.toggleAuth = () => {
    isReg = !isReg;
    document.getElementById('reg-inputs').classList.toggle('hidden', !isReg);
    document.getElementById('auth-title').innerText = isReg ? "একাউন্ট তৈরি করুন" : "লগইন করুন";
    document.getElementById('auth-btn').innerText = isReg ? "Register" : "Login";
};

document.getElementById('auth-btn').onclick = () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    
    if(!email || !pass) return alert("সবগুলো ঘর পূরণ করুন!");

    if(isReg) {
        const name = document.getElementById('name').value.trim();
        if(!name) return alert("নাম লিখুন!");
        createUserWithEmailAndPassword(auth, email, pass)
            .then(res => set(ref(db, 'users/' + res.user.uid), { name, email, balance: 0 }))
            .catch(e => alert("রেজিস্ট্রেশন ব্যর্থ: " + e.message));
    } else {
        signInWithEmailAndPassword(auth, email, pass)
            .catch(e => alert("লগইন ব্যর্থ: ইমেইল বা পাসওয়ার্ড ভুল!"));
    }
};

// ২. অ্যাডস্টার টাস্ক (পদ্ধতি আপডেট করা হয়েছে)
window.runTask = function(reward) {
    alert("বিজ্ঞাপনটি ১০ সেকেন্ড দেখুন। এরপর ব্যাক করলে টাকা যোগ হবে।");
    const adWindow = window.open(AD_LINK, '_blank');
    
    setTimeout(async () => {
        const user = auth.currentUser;
        if(user) {
            const userRef = ref(db, 'users/' + user.uid);
            const snap = await get(userRef);
            const newBal = (snap.val().balance || 0) + reward;
            await update(userRef, { balance: newBal });
            alert(`৳${reward} যোগ হয়েছে!`);
        }
    }, 10000); // ১০ সেকেন্ড ওয়েট
};

// ৩. ট্যাব ও অথেন্টিকেশন চেক
onAuthStateChanged(auth, (user) => {
    if(user) {
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        onValue(ref(db, 'users/' + user.uid), snap => {
            const data = snap.val();
            if(data) {
                document.getElementById('u-balance').innerText = data.balance.toFixed(2);
                document.getElementById('u-name-display').innerText = data.name;
                document.getElementById('p-name').innerText = data.name;
                document.getElementById('p-email').innerText = user.email;
                document.getElementById('p-balance').innerText = data.balance.toFixed(2);
            }
        });
    } else {
        document.getElementById('auth-page').classList.remove('hidden');
        document.getElementById('main-page').classList.add('hidden');
    }
});

window.changeTab = (name) => {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + name).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById('nav-' + name).classList.add('active');
};

window.logout = () => signOut(auth);
