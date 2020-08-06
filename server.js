const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";

app.use(express.static("public_html"));
app.use(express.json());

app.get("/get", function (req, res) {
});

app.post("/add", function (req, res) {
});

app.post("/delete", function (req, res) {
});

app.post("/edit", function (req, res) {
});