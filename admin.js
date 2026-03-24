import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const db = getDatabase();
const table = document.getElementById("withdrawals-table");

onValue(ref(db,'withdrawals'),snap=>{
 table.innerHTML="<tr><th>User</th><th>Amount</th><th>Number</th><th>Status</th><th>Action</th></tr>";
 snap.forEach(s=>{
  const data=s.val();
  const row = table.insertRow();
  row.insertCell(0).innerText = data.uid;
  row.insertCell(1).innerText = data.amount;
  row.insertCell(2).innerText = data.number;
  row.insertCell(3).innerText = data.status;
  const btnCell = row.insertCell(4);
  const btn = document.createElement("button");
  btn.innerText="Approve";
  btn.onclick=()=>update(ref(db,'withdrawals/'+s.key),{status:"approved"});
  btnCell.appendChild(btn);
 });
});
