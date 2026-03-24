import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", 
    projectId: "earning-web-app-d515c",
    databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

onValue(ref(db, 'withdrawals/'), (snap) => {
    const list = document.getElementById('admin-list');
    list.innerHTML = "";
    snap.forEach(child => {
        const val = child.val();
        list.innerHTML += `<tr>
            <td>${val.name}</td>
            <td>${val.number} (${val.method})</td>
            <td>৳${val.amount}</td>
            <td>
                <button onclick="confirmPay('${child.key}')">Paid</button>
                <button onclick="deleteReq('${child.key}')">X</button>
            </td>
        </tr>`;
    });
});

window.confirmPay = (id) => update(ref(db, 'withdrawals/' + id), { status: "Success" });
window.deleteReq = (id) => remove(ref(db, 'withdrawals/' + id));
