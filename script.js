import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue, update, get, set, push, query, orderByChild, limitToLast, equalTo } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", 
    projectId: "earning-web-app-d515c", 
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const AD_LINK = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

// ১. নেভিগেশন সিস্টেম
window.changeTab = (name) => {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + name).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById('nav-' + (['spin', 'withdraw'].includes(name) ? 'home' : name))?.classList.add('active');
    
    if(name === 'leader') loadLeaderboard();
    if(name === 'withdraw') loadHistory();
};

// ২. রেফারেল ও শেয়ার সিস্টেম
window.shareApp = () => {
    const code = document.getElementById('u-refer-code').innerText;
    const text = `BSL Official অ্যাপে কাজ করে আয় করুন! আমার রেফার কোড: ${code}\nলিঙ্ক: ${window.location.origin}`;
    if(navigator.share) {
        navigator.share({title: 'Earn Money', text: text, url: window.location.href});
    } else {
        navigator.clipboard.writeText(text);
        alert("লিঙ্ক কপি হয়েছে!");
    }
};

// ৩. স্পিন লজিক
window.startSpin = () => {
    const wheel = document.getElementById('wheel');
    const btn = document.getElementById('spin-btn');
    btn.disabled = true;
    const randomDeg = Math.floor(Math.random() * 360) + 1440;
    wheel.style.transform = `rotate(${randomDeg}deg)`;
    
    setTimeout(async () => {
        const rewards = [1, 2, 0, 5, 1, 3];
        const reward = rewards[Math.floor(Math.random() * 6)];
        const user = auth.currentUser;
        if(user) {
            const userRef = ref(db, 'users/' + user.uid);
            const snap = await get(userRef);
            await update(userRef, { balance: (snap.val().balance || 0) + reward });
            if(confirm(`আপনি জিতেছেন ৳${reward}! বোনাস নিতে ওকে করুন।`)) window.location.href = AD_LINK;
        }
        btn.disabled = false;
    }, 3500);
};

// ৪. উইথড্র সিস্টেম (মিন: ৫০০)
window.submitWithdraw = async () => {
    const amount = parseFloat(document.getElementById('w-amount').value);
    const number = document.getElementById('w-number').value.trim();
    const method = document.getElementById('method').value;
    const user = auth.currentUser;

    if(!amount || amount < 500) return alert("দুঃখিত, সর্বনিম্ন ৫০০ টাকা উইথড্র করতে হবে!");
    if(!number || number.length < 11) return alert("সঠিক মোবাইল নাম্বার দিন!");
    
    const userRef = ref(db, 'users/' + user.uid);
    const snap = await get(userRef);
    const bal = snap.val().balance || 0;

    if(bal < amount) return alert("আপনার ব্যালেন্স পর্যাপ্ত নয়!");

    try {
        await update(userRef, { balance: bal - amount });
        await push(ref(db, 'withdraw_requests'), {
            uid: user.uid, name: snap.val().name, amount, number, method, status: "pending", time: new Date().toLocaleString()
        });
        alert("রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!");
        document.getElementById('w-amount').value = "";
        document.getElementById('w-number').value = "";
    } catch(e) { alert("সমস্যা হয়েছে, আবার চেষ্টা করুন।"); }
};

// পেমেন্ট হিস্ট্রি লোড
function loadHistory() {
    const q = query(ref(db, 'withdraw_requests'), orderByChild('uid'), equalTo(auth.currentUser.uid));
    onValue(q, snap => {
        let h = '';
        snap.forEach(c => {
            const d = c.val();
            h += `<div class="history-item"><span>${d.method}: ৳${d.amount}</span><span class="status-p">পেন্ডিং</span></div>`;
        });
        document.getElementById('history-list').innerHTML = h || "কোনো হিস্ট্রি নেই";
    });
}

// ৫. টাস্ক ও লিডারবোর্ড (সেরা ১০০ জন)
window.runTask = (reward) => {
    window.open(AD_LINK, '_blank');
    setTimeout(async () => {
        const userRef = ref(db, 'users/' + auth.currentUser.uid);
        const snap = await get(userRef);
        await update(userRef, { balance: (snap.val().balance || 0) + reward });
        alert(`অভিনন্দন! ৳${reward} যোগ হয়েছে।`);
    }, 10000);
};

function loadLeaderboard() {
    const q = query(ref(db, 'users'), orderByChild('balance'), limitToLast(100));
    onValue(q, snap => {
        let list = [];
        snap.forEach(c => {
            if(c.val().balance > 0) list.push(c.val());
        });
        list.sort((a,b) => b.balance - a.balance);
        document.getElementById('lb-list').innerHTML = list.map((u,i) => `
            <div class="lb-item"><span>${i+1}. ${u.name}</span><b>৳${u.balance.toFixed(2)}</b></div>
        `).join('');
    });
}

// ৬. অথেন্টিকেশন ও রিয়েলটাইম আপডেট
onAuthStateChanged(auth, user => {
    if(user) {
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        onValue(ref(db, 'users/' + user.uid), snap => {
            const d = snap.val();
            if(d) {
                document.getElementById('u-balance').innerText = (d.balance || 0).toFixed(2);
                document.getElementById('u-name-display').innerText = d.name;
                document.getElementById('p-name').innerText = d.name;
                document.getElementById('p-email').innerText = d.email;
                document.getElementById('u-refer-code').innerText = d.referCode || 'N/A';
            }
        });
    } else {
        document.getElementById('auth-page').classList.remove('hidden');
        document.getElementById('main-page').classList.add('hidden');
    }
});

let isReg = false;
window.toggleAuth = () => {
    isReg = !isReg;
    document.getElementById('reg-inputs').classList.toggle('hidden', !isReg);
    document.getElementById('auth-title').innerText = isReg ? "একাউন্ট তৈরি" : "লগইন";
};

document.getElementById('auth-btn').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    if(!email || pass.length < 6) return alert("সঠিক ইমেইল ও পাসওয়ার্ড দিন!");

    if(isReg) {
        const name = document.getElementById('name').value.trim();
        const referBy = document.getElementById('refer-by').value.trim();
        if(!name) return alert("নাম দিন!");
        
        const myReferCode = name.substring(0,3).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

        createUserWithEmailAndPassword(auth, email, pass).then(async (res) => {
            let initialBalance = 0;
            if(referBy) {
                const usersSnap = await get(ref(db, 'users'));
                usersSnap.forEach(child => {
                    if(child.val().referCode === referBy) {
                        update(ref(db, 'users/' + child.key), { balance: (child.val().balance || 0) + 5 });
                        initialBalance = 2; // নতুন ইউজার পাবে ২ টাকা
                    }
                });
            }
            set(ref(db, 'users/' + res.user.uid), { 
                name, email, balance: initialBalance, referCode: myReferCode, role: "user" 
            });
        }).catch(e => alert("রেজিস্ট্রেশন ব্যর্থ!"));
    } else {
        signInWithEmailAndPassword(auth, email, pass).catch(e => alert("লগইন ব্যর্থ!"));
    }
};

window.logout = () => signOut(auth).then(() => location.reload());
