const getUserByEmail = (email, database) => {
  const userIds = Object.keys(database);
  for (const singleUser of userIds) {
    if (email === database[singleUser].email) {
      return database[singleUser];
    }
  }
  return null;
};

const iterateUsers = (userId, users) => {
  for (const ids in users) {
    if (ids === userId) {
      return users[userId];
    }
  }
};

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

const urlsForUser = (id, urlDatabase) => {
  const urls = Object.keys(urlDatabase);
  let userURLS = {};
  for (const shortCode of urls) {
    if (urlDatabase[shortCode].userID === id) {
      userURLS[shortCode] = urlDatabase[shortCode];
    }
  }  return userURLS;
};

module.exports = { getUserByEmail, iterateUsers, generateRandomString, urlsForUser };