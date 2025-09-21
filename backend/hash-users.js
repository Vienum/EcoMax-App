const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("./data.db");

db.all(`SELECT id, password FROM users`, [], async (err, rows) => {
  if (err) throw err;

  for (const user of rows) {
    // Nur hashen, wenn Passwort noch nicht gehashed ist
    if (!user.password.startsWith("$2")) {
      const hash = await bcrypt.hash(user.password.trim(), 10);
      db.run(`UPDATE users SET password = ? WHERE id = ?`, [hash, user.id]);
      console.log(`User ${user.id} gehashed`);
    }
  }
  console.log("Fertig!");
});
