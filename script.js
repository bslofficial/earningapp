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

// ২. লিডারবোর্ড ফাংশন (৩ জন ইউজারই দেখাবে)
function loadLeaderboard() {
    const q = query(ref(db, 'users'), orderByChild('balance'), limitToLast(10));
    onValue(q, snap => {
        let html = '';
        let users = [];
        snap.forEach(c => {
            let userData = c.val();
            // ব্যালেন্স না থাকলে ০ ধরে নেওয়া হবে যাতে সবাইকে দেখায়
            if(userData.balance === undefined) userData.balance = 0; 
            users.push(userData);
        });
        
        // বড় থেকে ছোট ব্যালেন্স অনুযায়ী সাজানো
        users.sort((a, b) => b.balance - a.balance);
        
        users.forEach((u, i) => {
            html += `<div class="lb-item"><span>${i+1}. ${u.name}</span><b>৳${(u.balance || 0).toFixed(2)}</b></div>`;
        });
        document.getElementById('lb-list').innerHTML = html || "কোনো ইউজার নেই";
    });
}

// ৩. উইথড্র সিস্টেম
window.submitWithdraw = async function() {
    const amount = parseFloat(document.getElementById('w-amount').value);
    const number = document.getElementById('w-number').value;
    const method = document.getElementById('method').value;
    const user = auth.currentUser;

    if(!amount || amount < 50) return alert("সর্বনিম্ন ৫০ টাকা উত্তোলন করা যাবে।");
    if(!number || number.length < 11) return alert("সঠিক মোবাইল নাম্বার দিন।");

    const userRef = ref(db, 'users/' + user.uid);
    const snap = await get(userRef);
    const currentBal = snap.val().balance || 0;

    if(currentBal < amount) return alert("আপনার ব্যালেন্স পর্যাপ্ত নয়!");

    // ব্যালেন্স কাটা এবং রিকোয়েস্ট পাঠানো
    await update(userRef, { balance: currentBal - amount });
    await push(ref(db, 'withdraw_requests'), {
        uid: user.uid,
        name: snap.val().name,
        amount: amount,
        number: number,
        method: method,
        status: "Pending",
        time: new Date().toLocaleString()
    });
    alert("উইথড্র রিকোয়েস্ট সফল হয়েছে!");
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

// ৫. স্পিন লজিক
window.startSpin = () => {
    const wheel = document.getElementById('wheel');
    if(!wheel) return alert("স্পিন হুইল পাওয়া যায়নি!");
    
    wheel.style.transform = `rotate(${Math.floor(Math.random() * 360) + 1440}deg)`;
    document.getElementById('spin-btn').disabled = true;
    
    setTimeout(async () => {
        const reward = Math.floor(Math.random() * 5);
        const user = auth.currentUser;
        if(user) {
            const userRef = ref(db, 'users/' + user.uid);
            const snap = await get(userRef);
            await update(userRef, { balance: (snap.val().balance || 0) + reward });
            alert(`আপনি জিতেছেন ৳${reward}!`);
            document.getElementById('spin-btn').disabled = false;
        }
    }, 4000);
};

// ৬. অথেন্টিকেশন ও প্রোফাইল রিয়েল-টাইম আপডেট
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
                if(document.getElementById('p-balance')) document.getElementById('p-balance').innerText = bal;
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
    document.getElementById('auth-btn').innerText = isReg ? "Register" : "Login";
};

document.getElementById('auth-btn').onclick = () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    
    if(isReg) {
        const name = document.getElementById('name').value.trim();
        if(!name || !email || pass.length < 6) return alert("সঠিক তথ্য দিন!");
        createUserWithEmailAndPassword(auth, email, pass).then(res => {
            set(ref(db, 'users/' + res.user.uid), { 
                name: name, 
                email: email, 
                balance: 0, 
                role: "user"
            });
        }).catch(e => alert(e.message));
    } else {
        signInWithEmailAndPassword(auth, email, pass).catch(e => alert("ভুল ইমেইল বা পাসওয়ার্ড!"));
    }
};

window.logout = () => signOut(auth).then(() => window.location.reload());
