import { auth, db } from "../firebase-config.js";

import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const btnSolicitar = document.getElementById("btnSolicitar");
const btnDevolver = document.getElementById("btnDevolver");

onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  /* ================================
     SOLICITAR EQUIPAMENTO
  ================================= */

  btnSolicitar.addEventListener("click", async () => {

    const equipamento = document.getElementById("equipamento").value;

    // Verifica se equipamento já está em uso

const q = query(
  collection(db, "solicitacoes_ferramentas"),
  where("equipamento", "==", equipamento),
  where("status", "==", "solicitado")
);

const resultado = await getDocs(q);

if (!resultado.empty) {
  alert("Este equipamento já está em uso.");
  return;
}

    try {

      await addDoc(collection(db, "solicitacoes_ferramentas"), {

        usuario: user.email,
        uid: user.uid,
        equipamento: equipamento,
        dataHoraSolicitacao: serverTimestamp(),
        status: "solicitado",
        dataHoraDevolucao: null

      });

      alert("Equipamento solicitado com sucesso!");

    } catch (error) {

      alert("Erro: " + error.message);

    }

  });

  /* ================================
     DEVOLVER EQUIPAMENTO
  ================================= */

  btnDevolver.addEventListener("click", async () => {

    const equipamento = document.getElementById("equipamento").value;

    try {

      const q = query(
        collection(db, "solicitacoes_ferramentas"),
        where("uid", "==", user.uid),
        where("equipamento", "==", equipamento),
        where("status", "==", "solicitado")
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {

        alert("Nenhuma solicitação ativa encontrada para esse equipamento.");
        return;

      }

      querySnapshot.forEach(async (docSnap) => {

      await updateDoc(docSnap.ref, {
  status: "devolvido",
  dataHoraDevolucao: serverTimestamp()
});

      });

      alert("Equipamento devolvido com sucesso!");

    } catch (error) {

      alert("Erro ao devolver: " + error.message);

    }

  });

});