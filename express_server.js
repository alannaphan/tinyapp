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
      // console.log (users[userId]);
      return users[userId];
    }
  }
}

const getUserByEmail = (email) => {
  const userIds = Object.keys(users);
  for (const singleUser of userIds) {
    if (email === users[singleUser].email) {
      return users[singleUser];
    } 
  } return null;
}
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
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
    urls: urlDatabase,
    user: iterateUsers(req.cookies["userId"]),
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let { longURL } = req.body;
  if (!longURL.includes("http://") && !longURL.includes("https://")) {
    longURL = "http://" + longURL;
  }
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: iterateUsers(req.cookies["userId"]),
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  for (let idCode in urlDatabase) {
    if (req.params.id === idCode) {
      const templateVars = {
        id: req.params.id,
        longURL: urlDatabase[req.params.id],
        user: iterateUsers(req.cookies["userId"]),
      };
      res.render("urls_show", templateVars);
      return;
    }
  }
  const templateVars = {
    id: req.params.id,
    longURL: "Error: invalid Id code, website undefined",
    user: iterateUsers(req.cookies["userId"]),
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  const { id } = req.params;
  let { longURL } = req.body;
  if (!longURL.includes("http://") && !longURL.includes("https://")) {
    longURL = "http://" + longURL;
  }
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (user) {
    if(user.password === password) {
      res.cookie("userId", user.id);
      res.redirect("/urls");
      return;
    } 
  } 
  console.log(users, req.cookies);
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
  console.log(users);
}
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: iterateUsers(req.cookies["userId"]),
  };
  if (Object.keys(req.cookies).length !== 0) {
    res.redirect("/urls");
  }
  res.render("login", templateVars);
})

