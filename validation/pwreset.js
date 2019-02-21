const Validator = require("validator");
const isEmpty = require("./is-empty");

const validateEmailInput = data => {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

const validatePasswordInput = data => {
  let errors = {};

  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  if (!Validator.isLength(data.password, { min: 6, max: 32 })) {
    errors.password = "Password must be at least 6 characters";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }

  if (Validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm Password field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

module.exports = { validateEmailInput, validatePasswordInput };
