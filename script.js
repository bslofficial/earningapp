import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue, update, get, set, push, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// ফায়ারবেস কনফিগারেশন
const firebaseConfig = { 
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", 
    projectId: "earning-web-app-d515c", 
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const AD_LINK = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

// ১. ট্যাব পরিবর্তন ও লিডারবোর্ড লোড
window.changeTab = (name) => {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById('view-' + name);
    if(target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + name);
    if(navBtn) navBtn.classList.add('active');

    if(name === 'leader') loadLeaderboard();
};

// ২. লিডারবোর্ড ফাংশন
function loadLeaderboard() {
    const q = query(ref(db, 'users'), orderByChild('balance'), limitToLast(10));
    onValue(q, snap => {
        let html = '';
        let users = [];
        snap.forEach(c => {
            let userData = c.val();
            if(userData.balance === undefined) userData.balance = 0; 
            users.push(userData);
        });
        
        users.sort((a, b) => b.balance - a.balance);
        
        users.forEach((u, i) => {
            html += `<div class="lb-item"><span>${i+1}. ${u.name}</span><b>৳${(u.balance || 0).toFixed(2)}</b></div>`;
        });
        document.getElementById('lb-list').innerHTML = html || "কোনো ইউজার নেই";
    });
}

// ৩. উইথড্র সাবমিট
window.submitWithdraw = async function() {
    const amountInput = document.getElementById('w-amount');
    const numberInput = document.getElementById('w-number');
    const methodInput = document.getElementById('method');
    
    const amount = parseFloat(amountInput.value);
    const number = numberInput.value.trim();
    const method = methodInput.value;
    const user = auth.currentUser;

    if(!amount || amount < 50) return alert("সর্বনিম্ন ৫০ টাকা উত্তোলন করা যাবে।");
    if(!number || number.length < 11) return alert("সঠিক মোবাইল নাম্বার দিন।");

    const userRef = ref(db, 'users/' + user.uid);
    const snap = await get(userRef);
    const userData = snap.val();
    const currentBal = userData.balance || 0;

    if(currentBal < amount) return alert("আপনার ব্যালেন্স পর্যাপ্ত নয়!");

    try {
        await update(userRef, { balance: currentBal - amount });
        
        await push(ref(db, 'withdraw_requests'), {
            uid: user.uid,
            name: userData.name,
            amount: amount,
            number: number,
            method: method,
            time: new Date().toLocaleString()
        });

        alert("উইথড্র রিকোয়েস্ট সফল হয়েছে!");
        amountInput.value = "";
        numberInput.value = "";
    } catch (error) {
        alert("সমস্যা হয়েছে: " + error.message);
    }
};

// ৪. বিজ্ঞাপন টাস্ক
window.runTask = (reward) => {
    alert("বিজ্ঞাপন ওপেন হচ্ছে। ১০ সেকেন্ড দেখুন এবং ব্যাক করুন।");
    window.open(AD_LINK, '_blank');
    setTimeout(async () => {
        const user = auth.currentUser;
        if(user) {
            const userRef = ref(db, 'users/' + user.uid);
            const snap = await get(userRef);
            await update(userRef, { balance: (snap.val().balance || 0) + reward });
            alert(`৳${reward} যোগ হয়েছে!`);
        }
    }, 10000);
};

// ৫. আপডেট করা স্পিন লজিক (৬টি ঘর এবং ডাইরেক্ট এড লিংক)
window.startSpin = () => {
    const wheel = document.getElementById('wheel');
    const btn = document.getElementById('spin-btn');
    if(!wheel) return;
    
    btn.disabled = true;
    const randomDegree = Math.floor(Math.random() * 360);
    wheel.style.transition = "transform 3s ease-out";
    wheel.style.transform = `rotate(${1440 + randomDegree}deg)`;
    
    setTimeout(async () => {
        // ৬টি ঘরের জন্য পুরস্কারের তালিকা
        const rewards = [1, 2, 0, 5, 1, 3]; 
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        
        const user = auth.currentUser;
        if(user) {
            const userRef = ref(db, 'users/' + user.uid);
            const snap = await get(userRef);
            await update(userRef, { balance: (snap.val().balance || 0) + reward });
            
            // এলার্টে ক্লিক করলে সরাসরি এ্যাড লিংকে নিয়ে যাবে
            if(confirm(`আপনি জিতেছেন ৳${reward}! বোনাস নিতে ওকে ক্লিক করুন।`)) {
                window.location.href = AD_LINK; 
            }
            
            btn.disabled = false;
        }
    }, 3500);
};

// ৬. অথেন্টিকেশন ও প্রোফাইল ডাটা আপডেট
onAuthStateChanged(auth, (user) => {
    if(user) {
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        
        onValue(ref(db, 'users/' + user.uid), snap => {
            const d = snap.val();
            if(d) {
                const bal = (d.balance || 0).toFixed(2);
                document.getElementById('u-balance').innerText = bal;
                document.getElementById('u-name-display').innerText = d.name;
                
                if(document.getElementById('p-name')) document.getElementById('p-name').innerText = d.name;
                if(document.getElementById('p-email')) document.getElementById('p-email').innerText = user.email;
                if(document.getElementById('p-balance')) document.getElementById('p-balance').innerText = "৳ " + bal;
            }
        });
    } else {
        document.getElementById('auth-page').classList.remove('hidden');
        document.getElementById('main-page').classList.add('hidden');
    }
});

// ৭. লগইন ও রেজিস্ট্রেশন
let isReg = false;
window.toggleAuth = () => {
    isReg = !isReg;
    document.getElementById('reg-inputs').classList.toggle('hidden', !isReg);
    document.getElementById('auth-title').innerText = isReg ? "একাউন্ট তৈরি" : "লগইন";
};

document.getElementById('auth-btn').onclick = () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    
    if(isReg) {
        const name = document.getElementById('name').value.trim();
        if(!name || !email || pass.length < 6) return alert("সঠিক তথ্য দিন!");
        createUserWithEmailAndPassword(auth, email, pass).then(res => {
            set(ref(db, 'users/' + res.user.uid), { 
                name: name, email: email, balance: 0, role: "user" 
            });
        }).catch(e => alert("রেজিস্ট্রেশন ব্যর্থ!"));
    } else {
        signInWithEmailAndPassword(auth, email, pass).catch(e => alert("ভুল ইমেইল বা পাসওয়ার্ড!"));
    }
};

window.logout = () => signOut(auth).then(() => location.reload());
