import { db } from './firebase.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

onValue(ref(db, 'users'), snap=>{
    document.getElementById('users').innerText = snap.size;
});

onValue(ref(db, 'withdrawals'), snap=>{
    let total = 0;
    snap.forEach(d=>{
        total += parseInt(d.val().amount || 0);
    });
    document.getElementById('withdraw').innerText = total;
});
