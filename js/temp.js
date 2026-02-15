import { saveScore } from "./firebase.js";

document.getElementById("testBtn").addEventListener("click", () => {
  saveScore("Alvaro", 50, 4);
  saveScore("Alvaro", 35, 3);
  saveScore("Alvaro", 25, 2);
  console.log("Puntuación guardada");
});