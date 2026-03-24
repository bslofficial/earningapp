import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, set, get, update, push, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// Earning App Script
console.log("Site Loaded Successfully!");

// ভবিষ্যতে কোনো বাটন ক্লিক বা এলার্ট দিতে চাইলে এখানে কোড লিখুন

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM",
    authDomain: "earning-web-app-d515c.firebaseapp.com",
    projectId: "earning-web-app-d515c",
    storageBucket: "earning-web-app-d515c.firebasestorage.app",
    messagingSenderId: "940476940339",
    appId: "1:940476940339:web:eb81b99117e9294fc86346",
    measurementId: "G-74LH2RTK1B"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const AD_LINK = "YOUR_OFFICIAL_ADSTERAA_SMARTLINK";
let lastAd = 0;
const COOLDOWN = 30000; // 30 sec

// ELEMENTS
const emailEl = document.getElementById("email");
const passEl = document.getElementById("pass");
const refEl = document.getElementById("ref");
const amountEl = document.getElementById("amount");
const numberEl = document.getElementById("number");
const authDiv = document.getElementById("auth");
const appDiv = document.getElementById("app");
const bal = document.getElementById("bal");
const myref = document.getElementById("myref");

// REGISTER
window.register = async ()=>{
 const email = emailEl.value;
 const pass = passEl.value;
 const refCode = refEl.value;

 const res = await createUserWithEmailAndPassword(auth,email,pass);
 const myRef = res.user.uid.slice(0,6);

 await set(ref(db,'users/'+res.user.uid),{
  email,
  balance:0,
  refCode: myRef,
  referredBy: refCode || null,
  lastBonus:"",
  adsToday:0,
  lastAdTime:0
 });

 // referral bonus
 if(refCode){
  const snap = await get(ref(db,'users'));
  snap.forEach(u=>{
   if(u.val().refCode === refCode){
    update(ref(db,'users/'+u.key),{
     balance:(u.val().balance||0)+10
    });
   }
  });
 }

 alert("✅ Account Created");
};

// LOGIN
window.login = async ()=>{
 await signInWithEmailAndPassword(auth,emailEl.value,passEl.value);
};

// WATCH AD
window.watchAd = async ()=>{
 const user = auth.currentUser;
 if(!user) return;

 const snap = await get(ref(db,'users/'+user.uid));
 const data = snap.val();
 const now = Date.now();
 const today = new Date().toDateString();

 let adsToday = data.adsToday || 0;
 let lastDate = data.lastAdDate || "";

 if(lastDate !== today){ adsToday = 0; }

 if(data.lastAdTime && now - data.lastAdTime < COOLDOWN){
  alert("⏳ Wait 30 sec");
  return;
 }

 if(adsToday >= 20){
  alert("🚫 Daily limit reached");
  return;
 }

 window.open(AD_LINK,"_blank");

 setTimeout(async ()=>{
  await update(ref(db,'users/'+user.uid),{
   balance:(data.balance||0)+1,
   lastAdTime: now,
   adsToday: adsToday+1,
   lastAdDate: today
  });
  alert("✅ ৳1 Added");
 }, 8000);
};

// DAILY BONUS
window.dailyBonus = async ()=>{
 const user = auth.currentUser;
 const snap = await get(ref(db,'users/'+user.uid));
 const data = snap.val();
 const today = new Date().toDateString();

 if(data.lastBonus === today){
  alert("Already claimed");
  return;
 }

 await update(ref(db,'users/'+user.uid),{
  balance:(data.balance||0)+2,
  lastBonus: today
 });
};

// WITHDRAW
window.withdraw = async ()=>{
 const amount = parseInt(amountEl.value);
 if(!amount || amount<100){ alert("Min ৳100"); return; }

 const user = auth.currentUser;
 const snap = await get(ref(db,'users/'+user.uid));
 const balance = snap.val().balance||0;

 if(balance<amount){ alert("Low balance"); return; }

 const newReq = push(ref(db,'withdrawals'));
 await set(newReq,{
  uid:user.uid,
  amount,
  number:numberEl.value,
  status:"pending",
  time:Date.now()
 });

 await update(ref(db,'users/'+user.uid],{
  balance: balance - amount
 });

 alert("✅ Withdraw Request Sent");
};

// AUTH STATE
onAuthStateChanged(auth,user=>{
 if(user){
  authDiv.classList.add("hidden");
  appDiv.classList.remove("hidden");

  onValue(ref(db,'users/'+user.uid),snap=>{
   bal.innerText = snap.val().balance;
   myref.innerText = snap.val().refCode;
  });
 }
});

// LOGOUT
window.logout = ()=> signOut(auth);
