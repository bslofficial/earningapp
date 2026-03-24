import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = { apiKey: "AIzaSyDvbee_sFG5mIhFPEPO8ggizDByB0byTAM", projectId: "earning-web-app-d515c" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

document.getElementById('btn-spin').onclick = async () => {
    const user = auth.currentUser;
    if(!user) return;
    const reward = Math.floor(Math.random() * 5) + 1; // 1 to 5 Taka
    const snap = await get(ref(db, `users/${user.uid}`));
    await update(ref(db, `users/${user.uid}`), { balance: (snap.val().balance || 0) + reward });
    alert(`আপনি জিতেছেন ৳${reward}!`);
    window.location.href = "dashboard.html";
};
