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

// 🔥 ADMINS
const ADMINS = [
  "almoxarifadoredecom@gmail.com",
  "tallysson@redecom.net.br",
  "admin@gmail.com"
];

// 🔥 DATA HOJE
function hojeFormatado() {
  return new Date().toISOString().split("T")[0];
}

filtroData.value = hojeFormatado();

// 🔐 AUTH
onAuthStateChanged(auth, (user) => {
  usuarioLogado = user;
  carregarSolicitacoes(filtroData.value);
});

// ================================
// 🔄 CARREGAR SOLICITAÇÕES
// ================================
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

    // 🔥 FILTRO POR DATA
    if (dataSolicStr !== dataSelecionada && dataDevStr !== dataSelecionada) {
      return;
    }

    let status = "";
    if (dados.status === "em_uso") status = "🟢 Em uso";
    if (dados.status === "devolvido") status = "🔵 Devolvido";

    const tr = document.createElement("tr");

    // ================================
    // 🔥 OBSERVAÇÃO
    // ================================
    let campoObservacao = "";

    if (ADMINS.includes(usuarioLogado?.email)) {

      campoObservacao = `
        <textarea 
          class="obsInput"
          data-id="${id}"
          placeholder="Adicionar observação"
        >${dados.observacao || ""}</textarea>
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

  // ================================
  // 💾 SALVAR OBSERVAÇÃO
  // ================================
  document.querySelectorAll(".obsInput").forEach(textarea => {

    // 🔥 ajusta altura ao carregar
    autoResize(textarea);

    textarea.addEventListener("change", async () => {

      const id = textarea.dataset.id;
      const texto = textarea.value;

      await updateDoc(doc(db, "solicitacoes_ferramentas", id), {
        observacao: texto
      });

    });

  });

}

// ================================
// 📅 TROCAR DATA
// ================================
filtroData.addEventListener("change", () => {
  carregarSolicitacoes(filtroData.value);
});

// ================================
// 🔥 AUTO RESIZE TEXTAREA
// ================================
function autoResize(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
}

// 🔥 DIGITANDO → EXPANDE
document.addEventListener("input", function(e) {
  if (e.target.classList.contains("obsInput")) {
    autoResize(e.target);
  }
});