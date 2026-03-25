import { db } from "../firebase-config.js";

import {
collection,
getDocs,
query,
orderBy,
updateDoc,
doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth } from "../firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const tabela = document.getElementById("tabelaSolicitacoes");
const filtroData = document.getElementById("filtroData");

let usuarioLogado = null;

// 🔥 defina seu admin aqui
const ADMINS = [
  "almoxarifadoredecom@gmail.com",
  "tallysson@redecom.net.br",
  "admin@gmail.com"
];

// data hoje
function hojeFormatado() {
  return new Date().toISOString().split("T")[0];
}

filtroData.value = hojeFormatado();

onAuthStateChanged(auth, (user) => {
  usuarioLogado = user;
  carregarSolicitacoes(filtroData.value);
});

async function carregarSolicitacoes(dataSelecionada) {

  tabela.innerHTML = "";

  const q = query(
    collection(db, "solicitacoes_ferramentas"),
    orderBy("dataHoraSolicitacao", "desc")
  );

  const snapshot = await getDocs(q);

  snapshot.forEach((docSnap) => {

    const dados = docSnap.data();
    const id = docSnap.id;

    let dataSolic = dados.dataHoraSolicitacao?.toDate();
    let dataDev = dados.dataHoraDevolucao?.toDate();

    const dataSolicStr = dataSolic?.toISOString().split("T")[0];
    const dataDevStr = dataDev?.toISOString().split("T")[0];

    if (dataSolicStr !== dataSelecionada && dataDevStr !== dataSelecionada) {
      return;
    }

    let status = "";
    if (dados.status === "em_uso") status = "🟢 Em uso";
    if (dados.status === "devolvido") status = "🔵 Devolvido";

    const tr = document.createElement("tr");

    // 🔥 campo observação
    let campoObservacao = "";

   if (ADMINS.includes(usuarioLogado?.email)){

      campoObservacao = `
        <input type="text" 
          value="${dados.observacao || ""}" 
          data-id="${id}"
          class="obsInput"
          placeholder="Adicionar observação"
        >
      `;

    } else {

      campoObservacao = dados.observacao || "-";

    }

    tr.innerHTML = `
      <td>${dados.usuario}</td>
      <td>${dados.equipamento}</td>
      <td>${dataSolic ? dataSolic.toLocaleString() : "-"}</td>
      <td>${dataDev ? dataDev.toLocaleString() : "-"}</td>
      <td>${status}</td>
      <td>${campoObservacao}</td>
    `;

    tabela.appendChild(tr);

  });

  // 🔥 salvar observação
  document.querySelectorAll(".obsInput").forEach(input => {

    input.addEventListener("change", async () => {

      const id = input.dataset.id;
      const texto = input.value;

      await updateDoc(doc(db, "solicitacoes_ferramentas", id), {
        observacao: texto
      });

    });

  });

}

// troca data
filtroData.addEventListener("change", () => {
  carregarSolicitacoes(filtroData.value);
});