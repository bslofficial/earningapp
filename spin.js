export function spinWheel(){
 const user = auth.currentUser;
 if(!user) return;
 const reward = Math.floor(Math.random()*10)+1; // 1–10 ৳
 get(ref(db,'users/'+user.uid)).then(snap=>{
  const balance = snap.val().balance||0;
  update(ref(db,'users/'+user.uid),{
   balance: balance+reward
  });
  alert("🎉 Lucky Spin Reward: ৳"+reward);
 });
}
window.spinWheel = spinWheel;
