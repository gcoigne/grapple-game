const express = require("express");
const sqlite3 = require('sqlite3').verbose();
const app = express();

const port = 3000;
const hostname = "localhost";

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
    console.log("table created");
    
  });



app.get("/get", function (req, res) {
  let db = new sqlite3.Database('./finalProject.db', (err) => {
  if (err) {
    console.log(err.message);
  }
  //console.log('Connected to finalProject db in sqlite');
  });
  let id = req.query.id;
  let sql = `SELECT user_id, name FROM users WHERE user_id = ?;`;
 
  db.get(sql, [id], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    return row
    ? console.log(row.user_id, row.name)
      : console.log(`No user found with the id ${id}`);
  });
 
  db.close();
  res.send("in the get route");
});

app.post("/add", function (req, res) {
  let username = req.body.user;
  let pwd = req.body.password; 
  //console.log("name:", name);
  //let name = "Keziah";
  //let password = "123";
  console.log(username);
  console.log(pwd);
  //let data = [name, password];
  //let placeholders = data.map((d) => '(?)').join(',');
  let db = new sqlite3.Database('./finalProject.db', (err) => {
    if (err) {
      console.log(err.message);
    }
    //console.log('Connected to finalProject db in sqlite');
  });
  //let sql = 'INSERT INTO users(name, password) VALUES ' + placeholders;

  db.run('INSERT INTO users(name, password) VALUES(Hello, passworld)', [], function(err) {
    if (err) {
      return console.log(err.message);
    }
    // get the last insert id
    console.log(`A row has been inserted with name ${username}`);
  });
 
  db.close();
  res.send("in the add route");
});

app.post("/delete", function (req, res) {
  let deletion = req.body.delete;
  console.log(deletion);

  let db = new sqlite3.Database('./finalProject.db', (err) => {
    if (err) {
      console.log(err.message);
    }
    //console.log('Connected to finalProject db in sqlite');
  });
  
// delete a row based on name
  db.run(`DELETE FROM users WHERE name=?`, deletion, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Row(s) deleted ${this.changes}`);
  });
  db.close();
  res.send("in the delete route");
});

app.post("/edit", function (req, res) {
  let db = new sqlite3.Database('./finalProject.db', (err) => {
    if (err) {
      console.log(err.message);
    }
    console.log('Connected to finalProject db in sqlite');
  });
  let data = ['Keziah Zapanta', 'Keziah'];
  let sql = `UPDATE users
          SET name = ?
          WHERE name = ?`;

  db.run(sql, data, function(err) {
    if (err) {
     return console.error(err.message);
    }
    console.log(`Row(s) updated: ${this.changes}`);

  });
  db.close();
  res.send("in the edit route");
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});