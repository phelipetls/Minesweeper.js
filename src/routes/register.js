exports.get = (req, res) => {
  res.render("register.html");
};

exports.post = (req, res) => {
  const { name, password, passwordConfirmed } = req.body;

  console.log(name, password);

  const errors = [];

  if (!name || !password) {
    errors.push({ message: "Please enter both username and password" });
  }

  if (password.length <= 6) {
    errors.push({ message: "Please enter a password longer than 6 characters"})
  }

  if (password != passwordConfirmed) {
    errors.push({ message: "Passwords do not match."})
  }

  console.log(errors);

  if (errors) {
    res.render("register.html", { errors: errors })
  }
}
