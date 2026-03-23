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

onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // ================================
  // 📤 SOLICITAR (AGORA FUNCIONA NOS CARDS)
  // ================================
  const botoesSolicitar = document.querySelectorAll(".solicitar");

  botoesSolicitar.forEach((botao) => {

    botao.addEventListener("click", async () => {

      const equipamento = botao.dataset.equip;

      try {

        // 🔥 verifica se já está em uso
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

      } catch (error) {
        alert("Erro: " + error.message);
      }

    });

  });


  // ================================
  // 📥 DEVOLVER (AGORA FUNCIONA NOS CARDS)
  // ================================
  const botoesDevolver = document.querySelectorAll(".devolver");

  botoesDevolver.forEach((botao) => {

    botao.addEventListener("click", async () => {

      const equipamento = botao.dataset.equip;

      try {

        const q = query(
          collection(db, "solicitacoes_ferramentas"),
          where("uid", "==", user.uid), // 🔥 só dono
          where("equipamento", "==", equipamento),
          where("status", "==", "em_uso")
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          alert("Você não possui esse equipamento.");
          return;
        }

        for (const docSnap of querySnapshot.docs) {

          await updateDoc(docSnap.ref, {
            status: "devolvido",
            dataHoraDevolucao: serverTimestamp()
          });

        }

        alert("Equipamento devolvido com sucesso!");

      } catch (error) {
        alert("Erro ao devolver: " + error.message);
      }

    });

  });

});