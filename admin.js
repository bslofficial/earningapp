import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const ADMIN_EMAIL = "your@email.com";

window.adminLogin = async () => {
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-pass').value;

    const res = await signInWithEmailAndPassword(auth, email, pass);

    if(res.user.email === ADMIN_EMAIL){
        document.getElementById('panel').style.display = 'block';
        loadRequests();
    } else {
        alert("Not Admin!");
    }
};

function loadRequests(){
    onValue(ref(db, 'withdrawals'), snap => {
        const box = document.getElementById('requests');
        box.innerHTML = "";

        snap.forEach(d=>{
            const v = d.val();

            box.innerHTML += `
            <div>
                ${v.email} - ৳${v.amount}
                <button onclick="approve('${d.key}')">Approve</button>
            </div>`;
        });
    });
}

window.approve = (id)=>{
    update(ref(db,'withdrawals/'+id), { status:'paid' });
};
