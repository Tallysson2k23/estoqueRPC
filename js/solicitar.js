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


// ================================
// 🔥 CARREGAR EQUIPAMENTOS
// ================================
async function carregarEquipamentos(user) {

  const select = document.getElementById("equipamento");

  const equipamentosFixos = [
    "Maquina de fusão (amarela)",
    "Maquina de fusão (laranja)",
    "Caixa Azul",
    "OTDR 1 ( Bolsa )",
    "OTDR 2 ( Azul )",
    "OTDR 3 ( Roxo )",
    "Furadeira",
    "Martelete ( Cabo )",
    "Martelete ( Bateria )",
    "Power Meter Pon"
  ];

  select.innerHTML = "";

  // 🔥 CORREÇÃO AQUI
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

  equipamentosFixos.forEach(nome => {

    const option = document.createElement("option");
    option.value = nome;

    if (equipamentosEmUso[nome]) {
      option.textContent = `${nome} (em uso por ${equipamentosEmUso[nome]})`;
      option.disabled = true;
    } else {
      option.textContent = `${nome} (disponível)`;
    }

    select.appendChild(option);

  });

}


// ================================
// 🔐 AUTH
// ================================
onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  carregarEquipamentos(user);


  // ================================
  // 📤 SOLICITAR
  // ================================
  btnSolicitar.addEventListener("click", async () => {

    const equipamento = document.getElementById("equipamento").value;

    try {

      // 🔥 BLOQUEIA SE JÁ ESTIVER EM USO
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

      carregarEquipamentos(user);

    } catch (error) {
      alert("Erro: " + error.message);
    }

  });


  // ================================
  // 📥 DEVOLVER
  // ================================
  btnDevolver.addEventListener("click", async () => {

    const equipamento = document.getElementById("equipamento").value;

    try {

      const q = query(
        collection(db, "solicitacoes_ferramentas"),
        where("uid", "==", user.uid), // 🔥 só o dono
        where("equipamento", "==", equipamento),
        where("status", "==", "em_uso") // 🔥 correto agora
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("Você não possui esse equipamento para devolução.");
        return;
      }

      for (const docSnap of querySnapshot.docs) {

        await updateDoc(docSnap.ref, {
          status: "devolvido",
          dataHoraDevolucao: serverTimestamp()
        });

      }

      alert("Equipamento devolvido com sucesso!");

      carregarEquipamentos(user);

    } catch (error) {
      alert("Erro ao devolver: " + error.message);
    }

  });

});