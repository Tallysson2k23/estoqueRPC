import { auth, db } from "../firebase-config.js";

import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const tabela = document.getElementById("tabelaSolicitacoes");

onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const q = query(
    collection(db, "solicitacoes_ferramentas"),
    orderBy("dataHoraSolicitacao", "desc")
  );

  onSnapshot(q, (snapshot) => {

    tabela.innerHTML = "";

    snapshot.forEach((doc) => {

      const dados = doc.data();

      let dataSolicitacao = "";
      let dataDevolucao = "";
      let statusFormatado = "";

      // 📅 DATA SOLICITAÇÃO
      if (dados.dataHoraSolicitacao) {
        dataSolicitacao = dados.dataHoraSolicitacao
          .toDate()
          .toLocaleString();
      }

      // 📅 DATA DEVOLUÇÃO
      if (dados.dataHoraDevolucao) {
        dataDevolucao = dados.dataHoraDevolucao
          .toDate()
          .toLocaleString();
      }

      // 🔥 STATUS NOVO PADRÃO
      switch (dados.status) {
        case "pendente":
          statusFormatado = "🟡 Aguardando aprovação";
          break;

        case "aprovado":
          statusFormatado = "🟢 Em uso";
          break;

        case "recusado":
          statusFormatado = "❌ Recusado";
          break;

        case "devolvido":
          statusFormatado = "🔵 Devolvido";
          break;

        default:
          statusFormatado = dados.status;
      }

      const linha = `
        <tr>
          <td>${dados.usuario}</td>
          <td>${dados.equipamento}</td>
          <td>${dataSolicitacao}</td>
          <td>${dataDevolucao || "-"}</td>
          <td>${statusFormatado}</td>
        </tr>
      `;

      tabela.innerHTML += linha;

    });

  });

});