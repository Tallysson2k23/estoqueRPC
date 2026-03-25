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

// 🔥 ADMINS
const ADMINS = [
  "almoxarifadoredecom@gmail.com",
  "tallysson@redecom.net.br",
  "admin@gmail.com"
];

onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  atualizarStatusCards();

  // ================================
  // 📤 SOLICITAR
  // ================================
  const botoesSolicitar = document.querySelectorAll(".solicitar");

  botoesSolicitar.forEach((botao) => {

    botao.addEventListener("click", async () => {

      const equipamento = botao.dataset.equip;

      try {

        const q = query(
          collection(db, "solicitacoes_ferramentas"),
          where("equipamento", "==", equipamento),
          where("status", "==", "em_uso")
        );

        const resultado = await getDocs(q);

        if (!resultado.empty) {
          alert("Este equipamento já está em uso.");
          return;
        }

        await addDoc(collection(db, "solicitacoes_ferramentas"), {

          usuario: user.email,
          uid: user.uid,
          equipamento: equipamento,
          dataHoraSolicitacao: serverTimestamp(),
          status: "em_uso",
          dataHoraDevolucao: null

        });

        alert("Equipamento solicitado com sucesso!");
        atualizarStatusCards();

      } catch (error) {
        alert("Erro: " + error.message);
      }

    });

  });


  // ================================
  // 📥 DEVOLVER
  // ================================
  const botoesDevolver = document.querySelectorAll(".devolver");

  botoesDevolver.forEach((botao) => {

    botao.addEventListener("click", async () => {

      const equipamento = botao.dataset.equip;

      try {

        let q;

        // 🔥 SE FOR ADMIN → PODE DEVOLVER QUALQUER
        if (ADMINS.includes(user.email)) {

          q = query(
            collection(db, "solicitacoes_ferramentas"),
            where("equipamento", "==", equipamento),
            where("status", "==", "em_uso")
          );

        } else {

          // 🔒 USUÁRIO NORMAL
          q = query(
            collection(db, "solicitacoes_ferramentas"),
            where("uid", "==", user.uid),
            where("equipamento", "==", equipamento),
            where("status", "==", "em_uso")
          );

        }

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          alert("Nenhuma solicitação encontrada para devolução.");
          return;
        }

        for (const docSnap of querySnapshot.docs) {

          await updateDoc(docSnap.ref, {
            status: "devolvido",
            dataHoraDevolucao: serverTimestamp()
          });

        }

        alert("Equipamento devolvido com sucesso!");
        atualizarStatusCards();

      } catch (error) {
        alert("Erro ao devolver: " + error.message);
      }

    });

  });

});


// ================================
// 🔄 STATUS DOS CARDS
// ================================
async function atualizarStatusCards() {

  const q = query(
    collection(db, "solicitacoes_ferramentas"),
    where("status", "==", "em_uso")
  );

  const snapshot = await getDocs(q);

  let equipamentosEmUso = {};

  snapshot.forEach(doc => {
    const dados = doc.data();
    equipamentosEmUso[dados.equipamento] = dados.usuario;
  });

  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {

    const nome = card.dataset.equip;
    const statusDiv = card.querySelector(".status");

    if (!statusDiv) return;

    if (equipamentosEmUso[nome]) {

      statusDiv.innerHTML = `🔴 Em uso por ${equipamentosEmUso[nome]}`;
      statusDiv.className = "status em-uso";

    } else {

      statusDiv.innerHTML = `🟢 Disponível`;
      statusDiv.className = "status disponivel";

    }

  });

}