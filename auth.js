import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const btnLogin = document.getElementById("btnLogin");

btnLogin.addEventListener("click", async () => {

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("Erro: " + error.message);
  }

});

// proteger páginas
onAuthStateChanged(auth, (user) => {
  if (!user && !window.location.pathname.includes("login.html")) {
    window.location.href = "login.html";
  }
});