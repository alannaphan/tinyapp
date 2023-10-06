//tiny app server file by Alanna Phan
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'cake',
  keys: ['flan'],
}));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const { getUserByEmail, iterateUsers, generateRandomString, urlsForUser} = require("./helpers"); //helper functions

const users = { // database where the user objects are stored
};

const urlDatabase = { //database where the URL objects are stored
};

app.get("/", (req, res) => { //root page, redirects to index page "urls"
  res.redirect("/urls");
});

app.get("/urls", (req, res) => { // GET /urls
  const templateVars = {
    urls: urlsForUser(req.session.userId, urlDatabase), //retrieves the urls created by logged in user
    user: iterateUsers(req.session.userId, users), //retrieves user info
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => { // POST /urls
  if (Object.keys(req.session).length === 0) {    //checks if anyone is logged in, otherwise redirects to login page
    res.redirect("/login");
    return;
  }
  let { longURL } = req.body;
  if (!longURL.includes("http://") && !longURL.includes("https://")) { // checks to see if long URL submitted includes https, adds it to string if not
    longURL = "http://" + longURL;
  }
  const id = generateRandomString();      //generates new random ID
  urlDatabase[id] = {                     //assigns new website to url database
    longURL: longURL,
    userID: req.session.userId,
  };
  res.redirect(`/urls/${id}`);            //redirects to page for newly made url
});

app.get("/urls/new", (req, res) => {      //GET for /urls/new  - page to create new URLS
  const templateVars = {
    user: iterateUsers(req.session.userId, users),    //checks for user login info (allows for header bar to display who is logged in)
  };
  if (Object.keys(req.session).length === 0) {     //if no one is logged in, redirects you to login page because you cannot make a new url
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {            //GET for /urls/:id   -the page for the urls that you create
  let userURLS = urlsForUser(req.session.userId, urlDatabase);   //retrieves urls created by logged in user
  for (let idCode of Object.keys(userURLS)) {       //loops through to see if ID paramater in URL matches urls database
    if (req.params.id === idCode) {                   //if equal, then page will render, otherwise will return 400 code
      const templateVars = {
        id: req.params.id,
        longURL: urlDatabase[req.params.id].longURL,
        user: iterateUsers(req.session.userId, users),
      };
      res.render("urls_show", templateVars);
      return;
    }
  }
  const templateVars = {
    id: req.params.id,
    user: iterateUsers(req.session.userId, users),
  };
  res
    .status(400)
    .send(`Status Code 403: The URL ID: ${req.params.id} does not exist.`);

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {       //GET /u/:id  - this directs you to the actual site of the long URL
  for (let idCode in urlDatabase) {
    if (req.params.id === idCode) {
      const { longURL } = urlDatabase[req.params.id];
      res.redirect(longURL);
      return;
    }
  }
  res
    .status(403)
    .send(`Status Code 400: The URL code "${req.params.id}" does not exist.`);
});

app.post("/urls/:id/delete", (req, res) => {      //POST /urls/:id/delete   -- this deletes your URL
  if (Object.keys(req.session).length === 0) {
    res
      .status(403)
      .send(`Status Code 403: You need to be logged in to delete the URL`);
    return;
  }
  const { id } = req.params;
  let userURLS = urlsForUser(req.session.userId, urlDatabase);

  if (userURLS[id].userID === req.session.userId) {
    delete urlDatabase[id];
    res.redirect("/urls");
    return;
  } else {
    res.status(403).send(
      `Status Code 403: You are not the owner of this URL and do not have permission to delete.`
    );
  }
});

app.post("/urls/:id", (req, res) => {           // POST /urls/:id  -- allows you to edit long url
  if (Object.keys(req.session).length === 0) {
    res
      .status(403)
      .send(`Status Code 403: You need to be logged in to edit the URL`);
    return;
  }
  const { id } = req.params;
  let userURLS = urlsForUser(req.session.userId, urlDatabase);

  if (userURLS[id].userID === req.session.userId) {
    const { id } = req.params;
    let { longURL } = req.body;
    if (!longURL.includes("http://") && !longURL.includes("https://")) {
      longURL = "http://" + longURL;
    }
    urlDatabase[id].longURL = longURL;
    res.redirect("/urls");
    return;
  } else {
    res.status(403).send(
      `Status Code 403: You are not the owner of this URL and do not have permission to edit.`
    );
  }
});

app.post("/login", (req, res) => {     // POST /login -- checks if login information is correct using bcrypt
  const { email, password } = req.body;
  let user = getUserByEmail(email, users);
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      req.session.userId = user.id;
      res.redirect("/urls");
      return;
    }
  }
  res.status(403).send("Status Code 403: Invalid Email or Password");
});

app.post("/logout", (req, res) => {    //POST /logout
  req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {  //GET /register   -fetches registration page, redirects if already logged in
  const templateVars = {
    user: iterateUsers(req.session.userId, users),
  };
  if (Object.keys(req.session).length !== 0) {
    res.redirect("/urls");
    return;
  }
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {   //POST /register  -creates a new account unless email already in database
  const randomId = generateRandomString();
  const { email, password } = req.body;
  if (email === "" || password === "") {
    res.status(400).send("Status Code 400: Email or Password is empty");
    return;
  }
  if (getUserByEmail(email, users) === null) {
    users[randomId] = {
      id: randomId,
      email: email,
      password: bcrypt.hashSync(password, 10),
    };
    req.session.userId = randomId;
  } else {
    res.status(400).send("Status Code 400: Email already taken.");
  }
  res.redirect("/urls");
});

app.get("/login", (req, res) => {   //GET /login  --fetches login page but redirects if already logged in
  const templateVars = {
    user: iterateUsers(req.session.userId, users),
  };
  if (Object.keys(req.session).length !== 0) {
    res.redirect("/urls");
    return;
  }
  res.render("login", templateVars);
});

