import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", 
    projectId: "earning-web-app-d515c", 
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" 
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

onValue(ref(db, 'withdrawals'), (snap) => {
    const list = document.getElementById('admin-list');
    list.innerHTML = "";
    snap.forEach(child => {
        const d = child.val();
        if(d.status === "Pending") {
            list.innerHTML += `
                <tr>
                    <td>${d.name}</td>
                    <td>${d.num} (${d.method})</td>
                    <td>৳${d.amount}</td>
                    <td>
                        <button onclick="markPaid('${child.key}')" style="background:green; color:white; border:none; padding:5px; border-radius:5px; cursor:pointer;">Paid</button>
                    </td>
                </tr>`;
        }
    });
});

window.markPaid = (id) => {
    update(ref(db, 'withdrawals/' + id), { status: "Paid" })
    .then(() => alert("পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!"));
};
