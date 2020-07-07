exports.validate = (username, password, password2) => {
  const errors = [];

  if (!username || !password) {
    errors.push({ message: "Please enter both username and password" });
  }

  if (password.length <= 6) {
    errors.push({
      message: "Please enter a password longer than 6 characters"
    });
  }

  if (password !== password2) {
    errors.push({ message: "Passwords do not match." });
  }

  return errors;
};
