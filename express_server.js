const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const cookieParser = require("cookie-parser");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

const iterateUsers = (userId) => {
  for (const ids in users) {
    if (ids === userId) {
      return users[userId];
    }
  }
};

const getUserByEmail = (email) => {
  const userIds = Object.keys(users);
  for (const singleUser of userIds) {
    if (email === users[singleUser].email) {
      return users[singleUser];
    }
  }
  return null;
};

const urlsForUser = (id) => {
  const urls = Object.keys(urlDatabase);
  let userURLS = {};
  for (const shortCode of urls) {
    if (urlDatabase[shortCode].userID === id) {
      userURLS[shortCode] = urlDatabase[shortCode];
    }
  }
  console.log(userURLS);
  return userURLS;
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.cookies["userId"]),
    user: iterateUsers(req.cookies["userId"]),
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (Object.keys(req.cookies).length === 0) {
    res.redirect("/login");
    return;
  }
  let { longURL } = req.body;
  if (!longURL.includes("http://") && !longURL.includes("https://")) {
    longURL = "http://" + longURL;
  }
  const id = generateRandomString();
  urlDatabase[id] = {
    longURL: longURL,
    userID: req.cookies["userId"],
  };
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: iterateUsers(req.cookies["userId"]),
  };
  if (Object.keys(req.cookies).length === 0) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let userURLS = urlsForUser(req.cookies["userId"]);
  for (let idCode of Object.keys(userURLS)) {
    if (req.params.id === idCode) {
      const templateVars = {
        id: req.params.id,
        longURL: urlDatabase[req.params.id].longURL,
        user: iterateUsers(req.cookies["userId"]),
      };
      res.render("urls_show", templateVars);
      return;
    }
  }
  const templateVars = {
    id: req.params.id,
    user: iterateUsers(req.cookies["userId"]),
  };
  res
    .status(400)
    .send(`Status Code 403: The URL ID: ${req.params.id} does not exist.`);

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
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

app.post("/urls/:id/delete", (req, res) => {
  if (Object.keys(req.cookies).length === 0) {
    res
      .status(403)
      .send(`Status Code 403: You need to be logged in to delete the URL`);
    return;
  }
  const { id } = req.params;
  let userURLS = urlsForUser(req.cookies["userId"]);

  if (userURLS[id].userID === req.cookies["userId"]) {
    delete urlDatabase[id];
    res.redirect("/urls");
    return;
  } else {
    res.status(403).send(
        `Status Code 403: You are not the owner of this URL and do not have permission to delete.`
      );
  }
});

app.post("/urls/:id", (req, res) => {
  if (Object.keys(req.cookies).length === 0) {
    res
      .status(403)
      .send(`Status Code 403: You need to be logged in to edit the URL`);
    return;
  }
  const { id } = req.params;
  let userURLS = urlsForUser(req.cookies["userId"]);

  if (userURLS[id].userID === req.cookies["userId"]) {
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

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (user) {
    if (user.password === password) {
      res.cookie("userId", user.id);
      res.redirect("/urls");
      return;
    }
  }
  res.status(403).send("Status Code 403: Invalid Email or Password");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: iterateUsers(req.cookies["userId"]),
  };
  if (Object.keys(req.cookies).length !== 0) {
    res.redirect("/urls");
    return;
  }
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const randomId = generateRandomString();
  const { email, password } = req.body;
  if (email === "" || password === "") {
    res.status(400).send("Status Code 400: Email or Password is empty");
    return;
  }
  if (getUserByEmail(email) === null) {
    users[randomId] = {
      id: randomId,
      email: email,
      password: password,
    };
    res.cookie("userId", randomId);
  } else {
    res.status(400).send("Status Code 400: Email already taken.");
  }
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: iterateUsers(req.cookies["userId"]),
  };
  if (Object.keys(req.cookies).length !== 0) {
    res.redirect("/urls");
    return;
  }
  res.render("login", templateVars);
});
