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

// অথেন্টিকেশন ও প্রোফাইল ডাটা লোড
onAuthStateChanged(auth, user => {
    if(user) {
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        onValue(ref(db, 'users/' + user.uid), snap => {
            const d = snap.val();
            if(d) {
                document.getElementById('u-balance').innerText = (d.balance || 0).toFixed(2);
                document.getElementById('u-name-display').innerText = d.name;
                document.getElementById('u-refer-code').innerText = d.referCode || "EA0000";
            }
        });
    } else {
        document.getElementById('auth-page').classList.remove('hidden');
        document.getElementById('main-page').classList.add('hidden');
    }
});

// রেজিস্ট্রেশন ও রেফার কাউন্ট লজিক (EA2121 ফরম্যাট)
document.getElementById('auth-btn').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    const isReg = !document.getElementById('reg-inputs').classList.contains('hidden');

    if(!isReg) {
        signInWithEmailAndPassword(auth, email, pass).catch(() => showAlert("লগইন ভুল!"));
    } else {
        const name = document.getElementById('name').value.trim();
        const rBy = document.getElementById('refer-by').value.trim().toUpperCase(); // পেস্ট করা কোড
        const myCode = "EA" + Math.floor(1000 + Math.random() * 9000);
        
        if(!name || !email || !pass) return showAlert("সব ঘর পূরণ করুন!");

        createUserWithEmailAndPassword(auth, email, pass).then(async (res) => {
            let bonus = 0;
            // রেফার কোড চেক এবং কাউন্ট করা
            if(rBy) {
                const usersRef = ref(db, 'users');
                const snapshot = await get(usersRef);
                let referValid = false;
                
                snapshot.forEach(child => {
                    if(child.val().referCode === rBy) {
                        referValid = true;
                        // রেফারকারী পাবে ৫ টাকা
                        update(ref(db, 'users/' + child.key), { 
                            balance: (child.val().balance || 0) + 5 
                        });
                        bonus = 2; // নতুন ইউজার পাবে ২ টাকা
                    }
                });
                if(!referValid) showAlert("রেফার কোডটি সঠিক নয়!");
            }
            
            await set(ref(db, 'users/' + res.user.uid), { 
                name, email, balance: bonus, referCode: myCode 
            });
            showAlert("সফল! আপনার বোনাস: ৳" + bonus);
        }).catch((err) => showAlert("ব্যর্থ! ইমেইল চেক করুন।"));
    }
};

// রেফার কোড কপি করা
window.copyReferCode = () => {
    const code = document.getElementById('u-refer-code').innerText;
    navigator.clipboard.writeText(code).then(() => showAlert("রেফার কোড কপি হয়েছে: " + code));
};

// ট্যাব নেভিগেশন
window.changeTab = (n) => {
    if(n === 'leaderboard') loadLeaderboard(); // লিডারবোর্ড লোড করা
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + n).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById('nav-' + (n === 'profile' || n === 'leaderboard' ? n : 'home')).classList.add('active');
};

window.toggleAuth = () => {
    document.getElementById('reg-inputs').classList.toggle('hidden');
    document.getElementById('auth-title').innerText = document.getElementById('reg-inputs').classList.contains('hidden') ? "লগইন করুন" : "রেজিস্ট্রেশন করুন";
};
window.logout = () => signOut(auth).then(() => location.reload());
