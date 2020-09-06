const express = require("express");
const app = express();
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const port = 3000;
const hostname = "localhost";
app.use(express.static("public_html"));
app.use(express.static("Physics"));
app.use("/Sprites", express.static("Sprites"));
app.use(express.json());

let db = new sqlite3.Database('./finalProject.db', (err) => {
    if (err) {
      console.log(err.message);
    }
    console.log('Connected to finalProject db in sqlite');
  });

//check if database exists
db.run('CREATE TABLE IF NOT EXISTS users(user_id INTEGER PRIMARY KEY, name text NOT NULL, password text NOT NULL);', function(err) {
  if(err){
    return console.log(err.message);
  }

});

db.close();

app.get("/", function (req, res) {
});

app.post("/login", function (req, res) {
  let user = req.query.user;
  let pwd = req.query.pwd;
  let db = new sqlite3.Database('./finalProject.db', (err) => {
    if (err) {
      console.log(err.message);
    }
    console.log('Connected to finalProject db in sqlite');
  });
  let sql = `SELECT user_id,
                    name,
                    password
            FROM users
            WHERE name = ?`;
    let status = 200


  // first row only
  db.get(sql, [user], (err, res) => {
    if (err) {
      return console.error(err.message);
    }
    else {
      bcrypt.compare(password, hash, (err, eq) => {
        if (err) {
            return console.error(err.message);
        }
        if(row === undefined){
            console.log("Password does not match the user that was entered.");
            res.status(500).json()
        }
        else if (row.password === pwd) {
            console.log("Passwords match!");
            res.status(200).json()
        }
        else {
            console.log("Password does not match the user that was entered.");
            res.status(500).json()
        }
      });
    }
  });
  db.close();
});

app.post("/add", function (req, res) {
  let username = req.body.username;
  let pwd = req.body.plaintextPassword;
  let db = new sqlite3.Database('./finalProject.db', (err) => {
    if (err) {
      console.log(err.message);
    }
    console.log('Connected to finalProject db in sqlite');
  });
  
  bcrypt.hash(pwd, 8, (err, hash) => {
    if (err) {
      console.error(err);
    }
    db.run('INSERT INTO users(name, pwd) VALUES(?,?)', [username, hash], function(err) {
      if (err) {
        return console.log(err.message);
      }
    });
  });

  db.close();
  res.status(200).send();
});

app.post("/delete", function (req, res) {
  let deletion = req.body.delete;
  let db = new sqlite3.Database('./finalProject.db', (err) => {
    if (err) {
      console.log(err.message);
    }
    console.log('Connected to finalProject db in sqlite');
  });

  db.run(`DELETE FROM users WHERE name=?`, deletion, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Row(s) deleted ${this.changes}`);
  });
  db.close();
});

app.post("/edit", function (req, res) {
  let sql = `UPDATE users
          SET name = ?
          WHERE name = ?`;
  let db = new sqlite3.Database('./finalProject.db', (err) => {
    if (err) {
      console.log(err.message);
    }
    console.log('Connected to finalProject db in sqlite');
  });

  db.run(sql, [toEdit, user], function(err) {
    if (err) {
     return console.error(err.message);
    }
    console.log(`Row(s) updated: ${this.changes}`);

  });
  db.close();
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});