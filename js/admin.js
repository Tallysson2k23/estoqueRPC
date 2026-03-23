import { auth, db } from "../firebase-config.js";

import { 
  collection, 
  query,
  where,
  onSnapshot,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const lista = document.getElementById("lista");

// 🔐 COLOQUE SEU EMAIL AQUI
const admins = ["tallysson@redecom.net.br"];

onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // 🔒 BLOQUEIA SE NÃO FOR ADMIN
  if (!admins.includes(user.email)) {
    alert("Acesso negado!");
    window.location.href = "index.html";
    return;
  }

  // 🔥 BUSCAR SOMENTE PENDENTES
  const q = query(
    collection(db, "solicitacoes_ferramentas"),
    where("status", "==", "pendente")
  );

  onSnapshot(q, (snapshot) => {

    lista.innerHTML = "";

    if (snapshot.empty) {
      lista.innerHTML = "<p>Nenhuma solicitação pendente</p>";
      return;
    }

    snapshot.forEach((docSnap) => {

      const dados = docSnap.data();

      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <p><b>${dados.usuario}</b> solicitou <b>${dados.equipamento}</b></p>
        <button class="aprovar" onclick="aprovar('${docSnap.id}')">Aprovar</button>
        <button class="recusar" onclick="recusar('${docSnap.id}')">Recusar</button>
      `;

      lista.appendChild(div);

    });

  });

});


// ✅ APROVAR
window.aprovar = async (id) => {

  const ref = doc(db, "solicitacoes_ferramentas", id);

  await updateDoc(ref, {
    status: "aprovado"
  });

  alert("Aprovado!");
};


// ❌ RECUSAR
window.recusar = async (id) => {

  const ref = doc(db, "solicitacoes_ferramentas", id);

  await updateDoc(ref, {
    status: "recusado"
  });

  alert("Recusado!");
};