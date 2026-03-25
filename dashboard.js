import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue, get, update, push } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// Firebase Config (আপনারটা বসাবেন)
const firebaseConfig = { 
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", 
    projectId: "earning-web-app-d515c", 
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" 
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// বাটনগুলো কাজ না করার কারণ হলো DOM লোড হওয়ার আগে ইভেন্ট লিসেনার সেট করা। 
// তাই window.onload বা সরাসরি স্ক্রিপ্টে নিচের মতো করে লিখুন:

document.addEventListener("DOMContentLoaded", () => {
    
    // উইথড্র প্যানেল টগল
    const btnWithdrawUi = document.getElementById('btn-withdraw-ui');
    if(btnWithdrawUi) {
        btnWithdrawUi.onclick = () => {
            document.getElementById('withdraw-section').classList.toggle('hidden');
        };
    }

    // হোম স্ক্রিনের হিস্ট্রি ও টিম বাটন
    document.getElementById('btn-history-home').onclick = () => changeTab('history');
    document.getElementById('btn-team-home').onclick = () => changeTab('team');

    // টাস্ক বাটনগুলো
    document.getElementById('btn-daily').onclick = () => alert("ডেইলি বোনাস টাস্ক শুরু হচ্ছে...");
    document.getElementById('btn-spin').onclick = () => alert("স্পিন পেজে নিয়ে যাওয়া হচ্ছে...");
    document.getElementById('btn-video').onclick = () => alert("ভিডিও লোড হচ্ছে...");

    // উইথড্র সাবমিট
    document.getElementById('btn-withdraw-submit').onclick = async () => {
        const amt = parseInt(document.getElementById('w-amount').value);
        const num = document.getElementById('w-number').value;
        const method = document.getElementById('w-method').value;
        
        if (amt >= 50 && num.length > 10) {
            alert(`আপনার ৳${amt} ${method} পেমেন্ট রিকোয়েস্ট সফল হয়েছে!`);
            // এখানে Firebase Push লজিক যোগ হবে
        } else {
            alert("সঠিক তথ্য দিন (মিনিমাম ৫০ টাকা)");
        }
    };
});

// ট্যাব পরিবর্তন ফাংশন
window.changeTab = (name) => {
    document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + name).classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById('nav-' + (name === 'history' || name === 'team' ? 'home' : name)).classList.add('active');
};

window.logout = () => signOut(auth).then(() => window.location.href="index.html");
