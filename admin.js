import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", 
    projectId: "earning-web-app-d515c", 
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.showAlert = (msg) => {
    document.getElementById('alert-msg').innerText = msg;
    document.getElementById('custom-alert').classList.remove('hidden');
};
window.closeAlert = () => document.getElementById('custom-alert').classList.add('hidden');

// অ্যাডমিন অথেন্টিকেশন চেক
onAuthStateChanged(auth, async (user) => {
    if(user) {
        // এখানে আপনার নির্দিষ্ট অ্যাডমিন ইমেইল দিতে পারেন নিরাপত্তার জন্য
        document.getElementById('admin-auth-page').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        loadWithdrawRequests();
        loadAllUsers();
    } else {
        document.getElementById('admin-auth-page').classList.remove('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
    }
});

document.getElementById('admin-login-btn').onclick = () => {
    const email = document.getElementById('admin-email').value.trim();
    const pass = document.getElementById('admin-pass').value;
    signInWithEmailAndPassword(auth, email, pass)
        .catch(() => showAlert("লগইন ব্যর্থ হয়েছে! সঠিক তথ্য দিন।"));
};

// উইথড্র রিকোয়েস্ট লোড করা
async function loadWithdrawRequests() {
    const listDiv = document.getElementById('withdraw-requests-list');
    try {
        const querySnapshot = await getDocs(collection(db, 'withdrawals'));
        let html = '';
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            html += `
                <div style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>মেথড:</strong> ${data.method} <br>
                        <strong>নাম্বার:</strong> ${data.number} <br>
                        <strong>টাকা:</strong> ৳${data.amount} <br>
                        <small style="color: #888;">${data.time}</small>
                    </div>
                    <button onclick="window.deleteRequest('${docSnap.id}')" style="background: #4caf50; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">পেমেন্ট সম্পন্ন</button>
                </div>
            `;
        });
        listDiv.innerHTML = html || "<p style='text-align: center; color: #666;'>কোনো উইথড্র রিকোয়েস্ট নেই</p>";
    } catch (error) {
        listDiv.innerHTML = "<p style='text-align: center; color: red;'>লোড করতে সমস্যা হয়েছে</p>";
    }
}

window.deleteRequest = async (id) => {
    if(confirm("আপনি কি পেমেন্ট সম্পন্ন করেছেন?")) {
        await deleteDoc(doc(db, 'withdrawals', id));
        showAlert("রিকোয়েস্ট সফলভাবে ডিলিট/কমপ্লিট করা হয়েছে!");
        loadWithdrawRequests();
    }
};

// ইউজার লিস্ট লোড করা
async function loadAllUsers() {
    const userDiv = document.getElementById('all-users-list');
    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        let html = '';
        querySnapshot.forEach((docSnap) => {
            const u = docSnap.data();
            html += `
                <div style="border-bottom: 1px solid #eee; padding: 8px 0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${u.name || "ইউজার"}</strong> (${u.email}) <br>
                        <small>ব্যালেন্স: ৳${(u.balance || 0).toFixed(2)} | রেফার কোড: ${u.referCode || 'N/A'}</small>
                    </div>
                </div>
            `;
        });
        userDiv.innerHTML = html || "<p style='text-align: center; color: #666;'>কোনো ইউজার নেই</p>";
    } catch (error) {
        userDiv.innerHTML = "<p style='text-align: center; color: red;'>ইউজার লোড করতে সমস্যা হয়েছে</p>";
    }
}

window.adminLogout = () => signOut(auth).then(() => location.reload());
