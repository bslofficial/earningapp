import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = { apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", projectId: "earning-web-app-d515c", databaseURL: "https://earning-web-app-d515c-default-rtdb.firebaseio.com" };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

onValue(ref(db, 'withdrawals/'), snap => {
    const list = document.getElementById('admin-list');
    list.innerHTML = "";
    snap.forEach(child => {
        const val = child.val();
        const id = child.key;
        if(val.status === "Pending") {
            const row = `<tr>
                <td>${val.name}</td>
                <td>${val.num} (${val.method})</td>
                <td>৳${val.amount}</td>
                <td>
                    <button onclick="confirmPay('${id}')">Paid</button>
                    <button onclick="deleteReq('${id}')">X</button>
                </td>
            </tr>`;
            list.innerHTML += row;
        }
    });
});

window.confirmPay = id => update(ref(db, 'withdrawals/' + id), { status: "Paid" });
window.deleteReq = id => remove(ref(db, 'withdrawals/' + id));
