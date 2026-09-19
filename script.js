import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", 
    projectId: "earning-web-app-d515c", 
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// আপনার ডাইরেক্ট লিঙ্ক
const ADSTERRA_LINK = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

window.showAlert = (msg) => {
    document.getElementById('alert-msg').innerText = msg;
    document.getElementById('custom-alert').classList.remove('hidden');
};
window.closeAlert = () => document.getElementById('custom-alert').classList.add('hidden');

// ইউজার লগইন স্টেট ও ডাটা লোড (Firestore)
onAuthStateChanged(auth, async (user) => {
    if(user) {
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if(userSnap.exists()) {
            const d = userSnap.data();
            document.getElementById('u-balance').innerText = (d.balance || 0).toFixed(2);
            document.getElementById('u-name-display').innerText = d.name || user.email.split('@')[0];
            
            if(!d.referCode) {
                const newCode = "EA" + Math.floor(1000 + Math.random()*9000);
                await updateDoc(userRef, { referCode: newCode });
                document.getElementById('u-refer-code').innerText = newCode;
            } else {
                document.getElementById('u-refer-code').innerText = d.referCode;
            }
        } else {
            // ফায়ারস্টোরে ডাটা না থাকলে অটোমেটিক তৈরি করে নেবে
            const defaultCode = "EA" + Math.floor(1000 + Math.random()*9000);
            await setDoc(userRef, {
                name: user.email.split('@')[0],
                email: user.email,
                balance: 0,
                referCode: defaultCode,
                role: 'user'
            });
            document.getElementById('u-balance').innerText = "0.00";
            document.getElementById('u-name-display').innerText = user.email.split('@')[0];
            document.getElementById('u-refer-code').innerText = defaultCode;
        }
    } else {
        document.getElementById('auth-page').classList.remove('hidden');
        document.getElementById('main-page').classList.add('hidden');
    }
});

// রেজিস্ট্রেশন ও লগইন লজিক (রেফারকারী ১০ টাকা, নতুন ইউজার ৫ টাকা)
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
            let newUserBonus = 0;
            
            if(rBy) {
                const usersQuery = await getDocs(collection(db, 'users'));
                let referrerFound = false;
                
                usersQuery.forEach(async (c) => {
                    if(c.data().referCode === rBy) {
                        referrerFound = true;
                        // যার রেফার কোড ব্যবহার করা হয়েছে, তিনি পাবেন ১০ টাকা
                        await updateDoc(doc(db, 'users', c.id), { 
                            balance: (c.data().balance || 0) + 10 
                        });
                    }
                });
                
                if(referrerFound) {
                    newUserBonus = 5; // নতুন ইউজার পাবে ৫ টাকা
                }
            }
            
            await setDoc(doc(db, 'users', res.user.uid), { 
                name, 
                email, 
                balance: newUserBonus, 
                referCode: myCode, 
                role: 'user' 
            });
            
            showAlert("রেজিস্ট্রেশন সফল! বোনাস: ৳" + newUserBonus);
        } catch (error) {
            showAlert("রেজিস্ট্রেশন ব্যর্থ হয়েছে! সঠিক তথ্য দিন।");
        }
    }
};

// পাসওয়ার্ড ভুলে গেলে রিকভারি ফাংশন
window.forgotPassword = async () => {
    const email = document.getElementById('email').value.trim();
    if(!email) {
        return showAlert("দয়া করে প্রথমে উপরে আপনার ইমেইলটি লিখুন!");
    }

    try {
        await sendPasswordResetEmail(auth, email);
        showAlert("পাসওয়ার্ড রিসেট করার লিংক আপনার ইমেইলে পাঠানো হয়েছে। ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।");
    } catch (error) {
        let msg = "পাসওয়ার্ড রিকভারি ব্যর্থ হয়েছে!";
        if(error.code === 'auth/user-not-found') {
            msg = "এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট রেজিস্ট করা নেই!";
        } else if(error.code === 'auth/invalid-email') {
            msg = "ইমেইল ফরম্যাট সঠিক নয়!";
        }
        showAlert(msg);
    }
};

// টাস্ক ফাংশনসমূহ
window.dailyBonus = async () => {
    window.open(ADSTERRA_LINK, "_blank");
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const s = await getDoc(userRef);
    if(!s.exists()) return;
    
    const lastDate = s.data().lastBonusDate;
    const today = new Date().toDateString();

    if(lastDate === today) return showAlert("আজকের বোনাস নেওয়া শেষ!");
    await updateDoc(userRef, { balance: (s.data().balance || 0) + 2, lastBonusDate: today });
    
    document.getElementById('u-balance').innerText = ((s.data().balance || 0) + 2).toFixed(2);
    showAlert("অভিনন্দন! আপনি ৳২ ডেইলি বোনাস পেয়েছেন।");
};

window.runVideoTask = () => {
    window.open(ADSTERRA_LINK, "_blank");
    showAlert("বিজ্ঞাপনটি দেখুন, ১০ সেকেন্ড পর বোনাস যোগ হবে...");
    setTimeout(async () => {
        if (!auth.currentUser) return;
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const s = await getDoc(userRef);
        if(s.exists()) {
            const newBal = (s.data().balance || 0) + 5;
            await updateDoc(userRef, { balance: newBal });
            document.getElementById('u-balance').innerText = newBal.toFixed(2);
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
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const s = await getDoc(userRef);
        if(s.exists()) {
            const newBal = (s.data().balance || 0) + reward;
            await updateDoc(userRef, { balance: newBal });
            document.getElementById('u-balance').innerText = newBal.toFixed(2);
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
    
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const s = await getDoc(userRef);
    if(!s.exists()) return;
    
    if(s.data().balance < amount) return showAlert("পর্যাপ্ত ব্যালেন্স নেই!");
    
    const newBal = s.data().balance - amount;
    await updateDoc(userRef, { balance: newBal });
    document.getElementById('u-balance').innerText = newBal.toFixed(2);
    
    await addDoc(collection(db, 'withdrawals'), { 
        uid: auth.currentUser.uid, 
        amount, 
        number: num, 
        method: document.getElementById('method').value, 
        time: new Date().toLocaleString() 
    });
    showAlert("উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!");
};

// নেভিগেশন ও লিডারবোর্ড আপডেট
window.changeTab = async (n) => {
    if(n === 'leaderboard') {
        const lb = document.getElementById('leaderboard-list');
        lb.innerHTML = "<p style='text-align:center;'>লোড হচ্ছে...</p>";
        
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            let usersArray = [];
            querySnapshot.forEach((docSnap) => {
                usersArray.push(docSnap.data());
            });

            usersArray.sort((a, b) => (b.balance || 0) - (a.balance || 0));
            let topUsers = usersArray.slice(0, 100);

            let html = '';
            topUsers.forEach((u, index) => {
                html += `<div class="lb-item" style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee;"><span>${index + 1}. ${u.name || "ইউজার"}</span><span>৳${(u.balance||0).toFixed(2)}</span></div>`;
            });

            lb.innerHTML = html || "<p style='text-align:center;'>কোনো ডাটা পাওয়া যায়নি</p>";
        } catch (error) {
            lb.innerHTML = "<p style='text-align:center; color:red;'>লিডারবোর্ড লোড করতে সমস্যা হয়েছে</p>";
        }
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
