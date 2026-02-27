import { auth, db } from "../firebase-config.js";
import { collection, addDoc, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const btnSolicitar = document.getElementById("btnSolicitar");

onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "login.html";
  }

  btnSolicitar.addEventListener("click", async () => {

    const equipamento = document.getElementById("equipamento").value;

    try {

      await addDoc(collection(db, "solicitacoes_ferramentas"), {
        usuario: user.email,
        uid: user.uid,
        equipamento: equipamento,
        dataHoraSolicitacao: serverTimestamp(),
        status: "solicitado"
      });

      alert("Solicitação enviada com sucesso!");

    } catch (error) {
      alert("Erro: " + error.message);
    }

  });

});