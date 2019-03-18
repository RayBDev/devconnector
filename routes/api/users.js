const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

//Load Input Validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const {
  validateEmailInput,
  validatePasswordInput
} = require("../../validation/pwreset");

// Load User model
const User = require("../../models/User");

// Load Email Sender
const sendEmail = require("../../email");

// @route   POST api/users/register
// @desc    Register a user
// @access  Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  //Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        protocol: "https", // URL Protocol
        s: "200", // Size
        r: "pg", // Rating
        d: "mm" // Default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route   POST api/users/login
// @desc    Login user / Returning JWT Token
// @access  Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  //Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email }).then(user => {
    // Check for user
    if (!user) {
      errors.email = "Email or password incorrect";
      errors.password = "Email or password incorrect";
      return res.status(404).json(errors);
    }

    // Check Password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User Matched

        const payload = { _id: user._id, name: user.name, avatar: user.avatar }; // Create JWT Payload

        // Sign Token
        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        errors.email = "Email or password incorrect";
        errors.password = "Email or password incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ _id: req.user._id, name: req.user.name, email: req.user.email });
  }
);

// @route   POST api/users/forgetpw
// @desc    Check user email and send reset password email
// @access  Public
router.post("/forgetpw", (req, res) => {
  const { errors, isValid } = validateEmailInput(req.body);

  //Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;

  User.findOne({ email })
    .then(user => {
      // Check for user and return status 200 even if not found
      if (!user) {
        return res.status(200).send();
      }

      const payload = { _id: user._id }; // Create JWT Payload

      // Sign Token
      const token = encodeURI(
        "Bearer " +
          jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 600 })
      );

      const subject = "Password reset link - example.com";
      const message = `Please <a href="http://localhost:3000/resetpw/?reset=${token}">click here</a> to reset your password`;

      sendEmail(user.name, user.email, subject, message).catch(err => {
        errors.emailService = "Email service down";
        return res.status(400).json(errors);
      });
      return res.status(200).json({ result: "Email sent" });
    })
    .catch(err => res.status(400).json({ databaseDown: "Database is down." }));
});

// @route   PATCH api/users/resetpw
// @desc    Reset user password
// @access  Public
router.patch(
  "/resetpw",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePasswordInput(req.body);

    //Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    let password = req.body.password;

    // Create promise to wait for password hash to resolve
    const encryptPassword = new Promise((resolve, reject) => {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) throw err;
          resolve((password = hash));
        });
      });
    });

    // Find and update user password after password is hashed
    encryptPassword.then(() => {
      User.findByIdAndUpdate(
        { _id: req.user._id },
        { $set: { password } },
        { new: true }
      ).then(user => {
        if (user) {
          return res.status(200).json({ success: true });
        }
        errors.success = false;
        return res.status(400).json(errors);
      });
    });
  }
);

module.exports = router;
