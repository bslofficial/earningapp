// --- Register ---
document.getElementById('reg-btn').onclick = async () => {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    if(pass.length < 6) return alert("Password must be 6 chars!");
    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await set(ref(db, 'users/' + res.user.uid), { name, email, balance: 0, dailyDate: '' });
        alert("Registered Successfully!");
    } catch (e) { alert(e.message); }
};
