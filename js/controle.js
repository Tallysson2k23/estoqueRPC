import { auth, db } from "../firebase-config.js";
import { collection, query, orderBy, onSnapshot } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

      const linha = `
        <tr>
          <td>${dados.usuario}</td>
          <td>${dados.equipamento}</td>
          <td>${dados.dataHoraSolicitacao ? dados.dataHoraSolicitacao.toDate().toLocaleString() : ""}</td>
          <td>${dados.status}</td>
        </tr>
      `;

      tabela.innerHTML += linha;

    });

  });

});