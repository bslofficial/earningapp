const rewards = [1,2,5,0,10];

window.spin = async ()=>{
    const reward = rewards[Math.floor(Math.random()*rewards.length)];

    const user = auth.currentUser;
    const snap = await get(ref(db,'users/'+user.uid));

    await update(ref(db,'users/'+user.uid), {
        balance: snap.val().balance + reward
    });

    alert("You won ৳" + reward);
};
