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

// আপনার অ্যাডস্টার ডাইরেক্ট লিংক
const AD_LINK = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

// ১. ট্যাব ম্যানেজমেন্ট ও লিডারবোর্ড লোড
window.changeTab = function(name) {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById('view-' + name);
    if(target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + name);
    if(navBtn) navBtn.classList.add('active');

    // সেরা ১০ জনের লিস্ট লোড করা
    if(name === 'leader') {
        loadLeaderboard();
    }
};

function loadLeaderboard() {
    const userQuery = query(ref(db, 'users'), orderByChild('balance'), limitToLast(10));
    onValue(userQuery, snap => {
        let html = '';
        let users = [];
        snap.forEach(child => { users.push(child.val()); });
        users.reverse().forEach((u, i) => {
            html += `<div class="lb-item"><span class="lb-name">${i+1}. ${u.name}</span><span class="lb-balance">৳${(u.balance || 0).toFixed(2)}</span></div>`;
        });
        document.getElementById('lb-list').innerHTML = html || "কোনো ডাটা নেই";
    });
}

// ২. বিজ্ঞাপন টাস্ক (Adsterra Direct Link)
window.runTask = async function(reward) {
    alert("বিজ্ঞাপন ওপেন হচ্ছে। ১০ সেকেন্ড দেখুন এবং ব্যাক করুন।");
    window.open(AD_LINK, '_blank');
    
    setTimeout(async () => {
        const user = auth.currentUser;
        if(user) {
            const userRef = ref(db, 'users/' + user.uid);
            const snap = await get(userRef);
            const newBal = (snap.val().balance || 0) + reward;
            await update(userRef, { balance: newBal });
            alert(`অভিনন্দন! আপনার ব্যালেন্সে ৳${reward} যোগ হয়েছে।`);
        }
    }, 10000);
};

// ৩. উইথড্র সিস্টেম (বিকাশ/নগদ)
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

    // ব্যালেন্স কাটা এবং রিকোয়েস্ট ডাটাবেসে পাঠানো
    await update(userRef, { balance: currentBal - amount });
    const requestRef = ref(db, 'withdraw_requests');
    await push(requestRef, {
        uid: user.uid,
        name: snap.val().name,
        amount: amount,
        number: number,
        method: method,
        status: "Pending",
        time: new Date().toLocaleString()
    });
    alert("আপনার উইথড্র রিকোয়েস্ট সফল হয়েছে। ২৪ ঘণ্টার মধ্যে পেমেন্ট পাবেন।");
};

// ৪. স্পিন লজিক
let isSpinning = false;
window.startSpin = function() {
    if (isSpinning) return;
    isSpinning = true;
    const wheel = document.getElementById('wheel');
    const randomDeg = Math.floor(Math.random() * 360) + 3600;
    wheel.style.transform = `rotate(${randomDeg}deg)`;
    
    setTimeout(async () => {
        isSpinning = false;
        const actualDeg = randomDeg % 360;
        let reward = 1; 
        if (actualDeg < 60) reward = 3;
        else if (actualDeg < 120) reward = 0;
        else if (actualDeg < 180) reward = 10;
        else if (actualDeg < 240) reward = 2;
        else if (actualDeg < 300) reward = 5;

        const user = auth.currentUser;
        if (user) {
            const userRef = ref(db, 'users/' + user.uid);
            const snap = await get(userRef);
            const newBal = (snap.val().balance || 0) + reward;
            await update(userRef, { balance: newBal });
            alert(`অভিনন্দন! আপনি ৳${reward} জিতেছেন।`);
        }
    }, 4000);
};

// ৫. অথেন্টিকেশন ও প্রোফাইল রিয়েল-টাইম আপডেট
onAuthStateChanged(auth, (user) => {
    if(user) {
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        
        onValue(ref(db, 'users/' + user.uid), snap => {
            const data = snap.val();
            if(data) {
                const bal = (data.balance || 0).toFixed(2);
                document.getElementById('u-balance').innerText = bal;
                document.getElementById('u-name-display').innerText = data.name;
                document.getElementById('p-name').innerText = data.name;
                document.getElementById('p-email').innerText = user.email;
                document.getElementById('p-balance').innerText = bal;
            }
        });
    } else {
        document.getElementById('auth-page').classList.remove('hidden');
        document.getElementById('main-page').classList.add('hidden');
    }
});

window.logout = () => signOut(auth).then(() => window.location.reload());

// ৬. লগইন ও রেজিস্ট্রেশন সিস্টেম
let isReg = false;
window.toggleAuth = () => {
    isReg = !isReg;
    document.getElementById('login-inputs').classList.toggle('hidden', isReg);
    document.getElementById('reg-inputs').classList.toggle('hidden', !isReg);
    document.getElementById('auth-title').innerText = isReg ? "নতুন একাউন্ট" : "লগইন করুন";
    document.getElementById('auth-btn').innerText = isReg ? "Register" : "Login";
};

document.getElementById('auth-btn').onclick = () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    
    if(!email || !pass) return alert("ইমেইল এবং পাসওয়ার্ড দিন!");

    if(isReg) {
        const name = document.getElementById('name').value.trim();
        if(!name) return alert("আপনার নাম লিখুন!");
        createUserWithEmailAndPassword(auth, email, pass).then(res => {
            set(ref(db, 'users/' + res.user.uid), { name, email, balance: 0 });
        }).catch(e => alert("ভুল তথ্য অথবা ইমেইলটি আগে ব্যবহার করা হয়েছে!"));
    } else {
        signInWithEmailAndPassword(auth, email, pass).catch(e => alert("লগইন হয়নি! ইমেইল বা পাসওয়ার্ড ভুল।"));
    }
};
