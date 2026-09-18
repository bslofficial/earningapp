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

// এডস্টারা ডাইরেক্ট লিঙ্ক
const ADSTERRA_LINK = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

window.showAlert = (msg) => {
    document.getElementById('alert-msg').innerText = msg;
    document.getElementById('custom-alert').classList.remove('hidden');
};
window.closeAlert = () => document.getElementById('custom-alert').classList.add('hidden');

// ইউজার লগইন স্টেট ও ডাটা লোড (সংশোধিত ও উন্নত)
onAuthStateChanged(auth, user => {
    if(user) {
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        
        const userRef = ref(db, 'users/' + user.uid);
        onValue(userRef, snap => {
            const d = snap.val();
            if(d) {
                document.getElementById('u-balance').innerText = (d.balance || 0).toFixed(2);
                document.getElementById('u-name-display').innerText = d.name || "ইউজার";
                
                // যদি রেফার কোড না থাকে, তবে সাথে সাথে জেনারেট করে সেভ করে দিবে
                if(!d.referCode) {
                    const newCode = "EA" + Math.floor(1000 + Math.random()*9000);
                    update(userRef, { referCode: newCode });
                    document.getElementById('u-refer-code').innerText = newCode;
                } else {
                    document.getElementById('u-refer-code').innerText = d.referCode;
                }
            } else {
                // যদি ডাটাবেসে ইউজারের নোড না থাকে তবে ডিফল্ট ডাটা তৈরি করে দিবে
                const defaultCode = "EA" + Math.floor(1000 + Math.random()*9000);
                set(userRef, {
                    name: user.email.split('@')[0],
                    email: user.email,
                    balance: 0,
                    referCode: defaultCode
                });
            }
        });
    } else {
        document.getElementById('auth-page').classList.remove('hidden');
        document.getElementById('main-page').classList.add('hidden');
    }
});

// রেজিস্ট্রেশন লজিক
document.getElementById('auth-btn').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    const isReg = !document.getElementById('reg-inputs').classList.contains('hidden');

    if(!isReg) {
        signInWithEmailAndPassword(auth, email, pass).catch(() => showAlert("লগইন ভুল! ইমেইল ও পাসওয়ার্ড চেক করুন।"));
    } else {
        const name = document.getElementById('name').value.trim();
        const rBy = document.getElementById('refer-by').value.trim().toUpperCase();
        const myCode = "EA" + Math.floor(1000 + Math.random()*9000);
        
        if(!name || !email || !pass) return showAlert("সব ঘর পূরণ করুন!");

        try {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            let bonus = 0;
            if(rBy) {
                const uSnap = await get(ref(db, 'users'));
                uSnap.forEach(c => {
                    if(c.val().referCode === rBy) {
                        update(ref(db, 'users/' + c.key), { balance: (c.val().balance || 0) + 5 });
                        bonus = 2; 
                    }
                });
            }
            await set(ref(db, 'users/' + res.user.uid), { name, email, balance: bonus, referCode: myCode });
            showAlert("রেজিস্ট্রেশন সফল! বোনাস: ৳" + bonus);
        } catch (error) {
            showAlert("রেজিস্ট্রেশন ব্যর্থ হয়েছে! সঠিক তথ্য দিন।");
        }
    }
};

// টাস্ক ফাংশনসমূহ
window.dailyBonus = async () => {
    window.open(ADSTERRA_LINK, "_blank");
    if (!auth.currentUser) return;
    const uRef = ref(db, 'users/' + auth.currentUser.uid);
    const s = await get(uRef);
    if(!s.exists()) return;
    
    const lastDate = s.val().lastBonusDate;
    const today = new Date().toDateString();

    if(lastDate === today) return showAlert("আজকের বোনাস নেওয়া শেষ!");
    await update(uRef, { balance: (s.val().balance || 0) + 2, lastBonusDate: today });
    showAlert("অভিনন্দন! আপনি ৳২ ডেইলি বোনাস পেয়েছেন।");
};

window.runVideoTask = () => {
    window.open(ADSTERRA_LINK, "_blank");
    showAlert("বিজ্ঞাপনটি দেখুন, ১০ সেকেন্ড পর বোনাস যোগ হবে...");
    setTimeout(async () => {
        if (!auth.currentUser) return;
        const uRef = ref(db, 'users/' + auth.currentUser.uid);
        const s = await get(uRef);
        if(s.exists()) {
            await update(uRef, { balance: (s.val().balance || 0) + 5 });
            showAlert("৳৫ বোনাস যোগ হয়েছে!");
        }
    }, 10000);
};

window.startSpin = () => {
    const wheel = document.getElementById('wheel');
    const deg = Math.floor(Math.random() * 360) + 1440;
    wheel.style.transform = `rotate(${deg}deg)`;
    setTimeout(async () => {
        if (!auth.currentUser) return;
        const reward = [1, 2, 0, 5, 1, 3][Math.floor(Math.random()*6)];
        const uRef = ref(db, 'users/' + auth.currentUser.uid);
        const s = await get(uRef);
        if(s.exists()) {
            await update(uRef, { balance: (s.val().balance || 0) + reward });
            showAlert(`অভিনন্দন! জিতেছেন ৳${reward}`);
            if(reward > 0) window.open(ADSTERRA_LINK, "_blank");
        }
    }, 3500);
};

window.submitWithdraw = async () => {
    const amount = parseFloat(document.getElementById('w-amount').value);
    const num = document.getElementById('w-number').value.trim();
    if(isNaN(amount) || amount < 500) return showAlert("মিনিমাম ৫০০ টাকা লাগবে!");
    if(!num) return showAlert("মোবাইল নাম্বার দিন!");
    
    const uRef = ref(db, 'users/' + auth.currentUser.uid);
    const s = await get(uRef);
    if(!s.exists()) return;
    
    if(s.val().balance < amount) return showAlert("পর্যাপ্ত ব্যালেন্স নেই!");
    
    await update(uRef, { balance: s.val().balance - amount });
    await push(ref(db, 'withdraw_requests'), { uid: auth.currentUser.uid, amount, number: num, method: document.getElementById('method').value, time: new Date().toLocaleString() });
    showAlert("উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!");
};

// নেভিগেশন ও লিডারবোর্ড আপডেট
window.changeTab = (n) => {
    if(n === 'leaderboard') {
        const lb = document.getElementById('leaderboard-list');
        onValue(ref(db, 'users'), s => {
            let data = s.val();
            if(data){
                let arr = Object.values(data).sort((a,b) => (b.balance||0) - (a.balance||0)).slice(0,100);
                lb.innerHTML = arr.map((u,i) => `<div class="lb-item" style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee;"><span>${i+1}. ${u.name || "ইউজার"}</span><span>৳${(u.balance||0).toFixed(2)}</span></div>`).join('');
            } else {
                lb.innerHTML = "<p style='text-align:center;'>কোনো ডাটা পাওয়া যায়নি</p>";
            }
        });
    }
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + n).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById('nav-' + (n === 'leaderboard'||n === 'profile'?n:'home')).classList.add('active');
};

window.copyRefer = () => {
    const code = document.getElementById('u-refer-code').innerText;
    if(code && code !== "লোড হচ্ছে...") {
        navigator.clipboard.writeText(code).then(() => showAlert("রেফার কোড কপি হয়েছে!"));
    } else {
        showAlert("কোড এখনো লোড হয়নি!");
    }
};

window.toggleAuth = () => {
    document.getElementById('reg-inputs').classList.toggle('hidden');
    document.getElementById('auth-title').innerText = document.getElementById('reg-inputs').classList.contains('hidden') ? "লগইন করুন" : "রেজিস্ট্রেশন করুন";
};

window.logout = () => signOut(auth).then(() => location.reload());
