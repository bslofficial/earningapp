import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue, update, remove, get } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", 
    projectId: "earning-web-app-d515c", 
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

window.showAlert = (msg) => {
    document.getElementById('alert-msg').innerText = msg;
    document.getElementById('custom-alert').classList.remove('hidden');
};
window.closeAlert = () => document.getElementById('custom-alert').classList.add('hidden');

// অ্যাডমিন অথেন্টিকেশন এবং নির্দিষ্ট জিমেইল সিকিউরিটি চেক
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // এখানে আপনার নির্দিষ্ট জিমেইলটি সেট করা হয়েছে
        if (user.email === "mddulalhosen0@gmail.com") {
            document.getElementById('admin-login-page').classList.add('hidden');
            document.getElementById('admin-dashboard').classList.remove('hidden');
            loadAdminData();
        } else {
            showAlert("আপনার এই প্যানেলে প্রবেশ করার অনুমতি নেই!");
            await signOut(auth);
        }
    } else {
        document.getElementById('admin-login-page').classList.remove('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
    }
});

// অ্যাডমিন লগইন
document.getElementById('admin-login-btn').onclick = () => {
    const email = document.getElementById('admin-email').value.trim();
    const pass = document.getElementById('admin-pass').value;
    
    signInWithEmailAndPassword(auth, email, pass)
        .catch((error) => {
            let errorMsg = "লগইন ব্যর্থ হয়েছে! সঠিক তথ্য দিন।";
            if (error.code === 'auth/user-not-found') {
                errorMsg = "এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট নেই!";
            } else if (error.code === 'auth/wrong-password') {
                errorMsg = "পাসওয়ার্ড ভুল হয়েছে!";
            } else if (error.code === 'auth/invalid-email') {
                errorMsg = "ইমেইল ফরম্যাট সঠিক নয়!";
            } else if (error.code === 'auth/invalid-credential') {
                errorMsg = "ইমেইল অথবা পাসওয়ার্ড ভুল রয়েছে!";
            }
            showAlert(errorMsg);
        });
};

document.getElementById('admin-logout-btn').onclick = () => signOut(auth);

// ডাটা লোড করা (উইথড্র, ইউজার ও সেটিংস)
function loadAdminData() {
    // ১. উইথড্র রিকোয়েস্ট লোড
    onValue(ref(db, 'withdraw_requests'), (snapshot) => {
        const data = snapshot.val();
        const tbody = document.getElementById('withdraw-list');
        if (data) {
            tbody.innerHTML = Object.entries(data).map(([id, req]) => `
                <tr>
                    <td>${req.name || "ইউজার"}</td>
                    <td>${req.number} (${req.method})</td>
                    <td>${req.method}</td>
                    <td>৳${req.amount}</td>
                    <td><small>${req.time}</small></td>
                    <td>
                        <button class="success-btn" style="padding:5px 10px; font-size:12px;" onclick="approveWithdraw('${id}')">Approve</button>
                        <button class="danger-btn" style="padding:5px 10px; font-size:12px; margin-top:3px;" onclick="rejectWithdraw('${id}', '${req.uid}', ${req.amount})">Reject</button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = `<tr><td colspan="6">কোনো উইথড্র রিকোয়েস্ট নেই</td></tr>`;
        }
    });

    // ২. ইউজার লিস্ট লোড
    onValue(ref(db, 'users'), (snapshot) => {
        const data = snapshot.val();
        const tbody = document.getElementById('users-table-list');
        if (data) {
            tbody.innerHTML = Object.entries(data).map(([uid, u]) => `
                <tr>
                    <td>${u.name || "ইউজার"}</td>
                    <td>${u.email}</td>
                    <td>৳${(u.balance || 0).toFixed(2)}</td>
                    <td>
                        <button style="padding:5px; font-size:11px;" onclick="adjustBalance('${uid}', ${u.balance || 0})">ব্যালেন্স এডিট</button>
                        <button class="danger-btn" style="padding:5px; font-size:11px; margin-top:3px;" onclick="deleteUser('${uid}')">ডিলিট</button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = `<tr><td colspan="4">কোনো ইউজার নেই</td></tr>`;
        }
    });

    // ৩. সেটিংস ইনপুট ফিল্ড লোড
    get(ref(db, 'settings')).then((snap) => {
        if(snap.exists()) {
            const s = snap.val();
            if(s.adLink) document.getElementById('setting-ad-link').value = s.adLink;
            if(s.dailyBonus) document.getElementById('setting-daily-bonus').value = s.dailyBonus;
            if(s.videoBonus) document.getElementById('setting-video-bonus').value = s.videoBonus;
            if(s.notice) document.getElementById('setting-notice').value = s.notice;
        }
    });
}

// উইথড্র অ্যাপ্রুভ
window.approveWithdraw = async (reqId) => {
    await remove(ref(db, 'withdraw_requests/' + reqId));
    showAlert("উইথড্র রিকোয়েস্ট সফলভাবে অ্যাপ্রুভ করা হয়েছে!");
};

// উইথড্র রিজেক্ট
window.rejectWithdraw = async (reqId, uid, amount) => {
    const userRef = ref(db, 'users/' + uid);
    const snap = await get(userRef);
    if(snap.exists()) {
        const currentBal = snap.val().balance || 0;
        await update(userRef, { balance: currentBal + amount });
    }
    await remove(ref(db, 'withdraw_requests/' + reqId));
    showAlert("রিকোয়েস্ট রিজেক্ট করা হয়েছে এবং টাকা ইউজারের অ্যাকাউন্টে ফেরত দেওয়া হয়েছে!");
};

// ইউজারের ব্যালেন্স পরিবর্তন
window.adjustBalance = async (uid, currentBal) => {
    let newAmount = prompt("নতুন ব্যালেন্স লিখুন:", currentBal);
    if(newAmount !== null && !isNaN(newAmount)) {
        await update(ref(db, 'users/' + uid), { balance: parseFloat(newAmount) });
        showAlert("ব্যালেন্স আপডেট সফল হয়েছে!");
    }
};

// ইউজার ডিলিট
window.deleteUser = async (uid) => {
    if(confirm("আপনি কি নিশ্চিতভাবে এই ইউজারকে ডিলিট করতে চান?")) {
        await remove(ref(db, 'users/' + uid));
        showAlert("ইউজার সফলভাবে ডিলিট করা হয়েছে!");
    }
};

// সেটিংস সেভ
window.saveSettings = async () => {
    const adLink = document.getElementById('setting-ad-link').value.trim();
    const dailyBonus = parseFloat(document.getElementById('setting-daily-bonus').value) || 2;
    const videoBonus = parseFloat(document.getElementById('setting-video-bonus').value) || 5;

    await update(ref(db, 'settings'), { adLink, dailyBonus, videoBonus });
    showAlert("সেটিংস সফলভাবে আপডেট করা হয়েছে!");
};

// নোটিশ সেভ
window.saveNotice = async () => {
    const notice = document.getElementById('setting-notice').value.trim();
    await update(ref(db, 'settings'), { notice });
    showAlert("নোটিশ সফলভাবে পাবলিশ করা হয়েছে!");
};
