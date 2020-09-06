const express = require("express");
const app = express();
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");


const port = 3000;
const hostname = "localhost";
app.use(express.static("Physics"));
app.use("/Sprites", express.static("Sprites"));
app.use(express.static("public_html"));
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
  //console.log("table created");
    
});

db.close(); 

app.get("/", function (req, res) {
});

app.get("/get", function (req, res) {
  let user = req.query.user;
  let pwd = req.query.pwd;
  let sql = `SELECT user_id,
                    name, 
                    password
            FROM users
            WHERE name  = ?`;

  // first row only
  db.get(sql, [user], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    else if(row.password === pwd){
      console.log("Passwords match!");
    }
    else{
      console.log("Password does not match the user that was entered.");
    }
  });
  db.close();
});

app.post("/add", function (req, res) {
  let username = req.body.username;
  let pwd = req.body.plaintextPassword;

  db.run('INSERT INTO users(name, password) VALUES(?,?)', [username, pwd], function(err) {
    if (err) {
      return console.log(err.message);
    }
  });
 
  db.close();
  res.status(200);
});

app.post("/delete", function (req, res) {
  let deletion = req.body.delete;
  
  // delete a row based on name
  db.run(`DELETE FROM users WHERE name=?`, deletion, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Row(s) deleted ${this.changes}`);
  });
  db.close();
});

app.post("/edit", function (req, res) {
  let toEdit = req.body.edit; 
  let user = req.body.username;
  let sql = `UPDATE users
          SET name = ?
          WHERE name = ?`;

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