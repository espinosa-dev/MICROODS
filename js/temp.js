import { saveScore } from "./firebase.js";

document.getElementById("testBtn").addEventListener("click", () => {
  saveScore("Alvaro", 50, 4);
  saveScore("Alvaro", 35, 3);
  saveScore("Alvaro", 25, 2);
  saveScore("Campayo", 6, 1);
  saveScore("JAVI", 8, 2);
  saveScore("JAVI", 8, 2);
  saveScore("JAVI", 10, 2);
  saveScore("tf", 4, 1);
  saveScore("tf", 4, 1);
  saveScore("Niranjan", 3, 4);
  console.log("Puntuación guardada");
});