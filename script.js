import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM",
    projectId: "earning-web-app-d515c",
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

onAuthStateChanged(auth, user => { if(user) window.location.href="dashboard.html"; });

window.toggleAuth = isReg => {
    document.getElementById('login-box').classList.toggle('hidden', isReg);
    document.getElementById('reg-box').classList.toggle('hidden', !isReg);
};

document.getElementById('btn-login').onclick = () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    signInWithEmailAndPassword(auth, email, pass).catch(e => alert("ভুল তথ্য!"));
};

document.getElementById('btn-reg').onclick = async () => {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    const refBy = document.getElementById('reg-ref').value.toUpperCase();

    if(name && email && pass.length >= 6) {
        try {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            const myRef = res.user.uid.substring(0, 6).toUpperCase();
            
            // রেফারাল বোনাস চেক
            if(refBy) {
                const usersSnap = await get(ref(db, 'users'));
                usersSnap.forEach(u => {
                    if(u.val().referCode === refBy) {
                        const oldBal = u.val().balance || 0;
                        update(ref(db, `users/${u.key}`), { balance: oldBal + 5 });
                    }
                });
            }

            await set(ref(db, 'users/' + res.user.uid), { name, email, balance: 0, referCode: myRef, referredBy: refBy || "None" });
        } catch(e) { alert(e.message); }
    } else { alert("সঠিক তথ্য দিন!"); }
};
