const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = () => {
  return Math.random().toString(36).slice(7);
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let { longURL } = req.body; 
  if (!(longURL.includes("http://")) && !(longURL.includes("https://"))) {
    longURL = "http://" + longURL;
  }
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  for (let idCode in urlDatabase) {
    if (req.params.id === idCode) {
      const templateVars = {
        id: req.params.id,
        longURL: urlDatabase[req.params.id],
      };
      res.render("urls_show", templateVars);
      return;
    }
    } 
      const templateVars = {
        id: req.params.id,
        longURL: "Error: invalid Id code, website undefined"
      }
    res.render("urls_show", templateVars);
  }
);

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  delete urlDatabase[id];
  res.redirect("/urls");
})

app.post("/urls/:id/update", (req, res) => {
  const { id } = req.params;
  let { longURL } = req.body;
  if (!(longURL.includes("http://")) && !(longURL.includes("https://"))) {
    longURL = "http://" + longURL;
  }
  urlDatabase[id] = longURL;
  res.redirect("/urls");
})