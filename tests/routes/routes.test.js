const expect = require("expect");
const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = require("../../server");

//Import Models
const User = require("../../models/User");

//Import Seed Data
const {
  users,
  populateUsers,
  profiles,
  populateProfiles
} = require("./seed/seed");

// Add seed data to database before testing
beforeEach(populateUsers);
beforeEach(populateProfiles);

// Test the User routes
describe("TEST ALL USER ROUTES", () => {
  describe("POST /api/users/register", () => {
    it("should create a user", done => {
      let name = "Example User";
      let email = "example@example.com";
      let password = "123mnb!";
      let password2 = "123mnb!";

      request(app)
        .post("/api/users/register")
        .send({ name, email, password, password2 })
        .expect(200)
        .expect(res => {
          expect(res.body._id).toBeTruthy();
          expect(res.body.avatar).toBeTruthy();
          expect(res.body.name).toBe(name);
          expect(res.body.email).toBe(email);
        })
        .end(err => {
          if (err) {
            return done(err);
          }

          User.findOne({ email })
            .then(user => {
              expect(user).toBeTruthy();
              expect(user.avatar).toBeTruthy();
              expect(user.name).toBe(name);
              expect(user.password).not.toBe(password);
              done();
            })
            .catch(e => done(e));
        });
    });

    it("should not create user if email in use", done => {
      let name = "Example User";
      let email = users[0].email;
      let password = "123mnb!";

      request(app)
        .post("/api/users/register")
        .send({ name, email, password })
        .expect(400)
        .end(done);
    });
  });

  describe("POST /api/users/login", () => {
    it("should login user and return JWT token", done => {
      request(app)
        .post("/api/users/login")
        .send({
          email: users[1].email,
          password: users[1].password
        })
        .expect(200)
        .expect(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.token).toBeTruthy();
        })
        .end(done);
    });

    it("should reject invalid password", done => {
      request(app)
        .post("/api/users/login")
        .send({
          email: users[1].email,
          password: users[1].password + "1"
        })
        .expect(400)
        .expect(res => {
          expect(res.body.token).toBeFalsy();
          expect(res.body.password).toBe("Password incorrect");
        })
        .end(done);
    });

    it("should reject invalid email", done => {
      request(app)
        .post("/api/users/login")
        .send({
          email: "joe" + users[1].email,
          password: users[1].password
        })
        .expect(404)
        .expect(res => {
          expect(res.body.token).toBeFalsy();
          expect(res.body.email).toBe("User not found");
        })
        .end(done);
    });
  });

  describe("POST /api/users/forgetpw", () => {
    it("should lookup user email and send reset email if found", done => {
      let email = users[0].email;

      request(app)
        .post("/api/users/forgetpw")
        .send({ email })
        .expect(200)
        .expect(res => {
          expect(res.body.result).toBe("Email sent");
        })
        .end(done);
    });

    it("should lookup user email and do nothing if email not found", done => {
      let email = "failemail@example.com";

      request(app)
        .post("/api/users/forgetpw")
        .send({ email })
        .expect(200)
        .expect(res => {
          expect(res.body.result).toBeFalsy();
        })
        .end(done);
    });

    it("should return 400 status code if email is not valid", done => {
      let email = "failemail@example";

      request(app)
        .post("/api/users/forgetpw")
        .send({ email })
        .expect(400)
        .expect(res => {
          expect(res.body.email).toBe("Email is invalid");
        })
        .end(done);
    });

    it("should return 400 status code if email is blank", done => {
      let email = "";

      request(app)
        .post("/api/users/forgetpw")
        .send({ email })
        .expect(400)
        .expect(res => {
          expect(res.body.email).toBe("Email field is required");
        })
        .end(done);
    });
  });

  describe("PATCH /api/users/resetpw", () => {
    it("should receive password and jwt header and update user", done => {
      let email = users[0].email;
      let password = "newPassword";
      let password2 = "newPassword";
      let token =
        "Bearer " +
        jwt.sign({ _id: users[0]._id }, process.env.JWT_SECRET, {
          expiresIn: 600
        });

      request(app)
        .patch("/api/users/resetpw")
        .set("Authorization", token)
        .send({ password, password2 })
        .expect(200)
        .expect(res => {
          expect(res.body.success).toBe(true);
        })
        .end(err => {
          User.findOne({ email })
            .then(user => {
              bcrypt.compare(password, user.password).then(isMatch => {
                expect(isMatch).toBe(true);
              });
              done();
            })
            .catch(e => done(e));
        });
    });

    it("should receive 400 status code if password doesn't meet length or matching requirements", done => {
      let password = "123";
      let password2 = "321";
      let token =
        "Bearer " +
        jwt.sign({ _id: users[0]._id }, process.env.JWT_SECRET, {
          expiresIn: 600
        });

      request(app)
        .patch("/api/users/resetpw")
        .set("Authorization", token)
        .send({ password, password2 })
        .expect(400)
        .expect(res => {
          expect(res.body.password).toBe(
            "Password must be at least 6 characters"
          );
          expect(res.body.password2).toBe("Passwords must match");
        })
        .end(done);
    });

    it("should receive 400 status code if either password is blank", done => {
      let password = "";
      let password2 = "";
      let token =
        "Bearer " +
        jwt.sign({ _id: users[0]._id }, process.env.JWT_SECRET, {
          expiresIn: 600
        });

      request(app)
        .patch("/api/users/resetpw")
        .set("Authorization", token)
        .send({ password, password2 })
        .expect(400)
        .expect(res => {
          expect(res.body.password).toBe("Password field is required");
          expect(res.body.password2).toBe("Confirm Password field is required");
        })
        .end(done);
    });

    it("should receive Unauthorized status code if token has expired", done => {
      let password = "";
      let password2 = "";
      let token =
        "Bearer " +
        jwt.sign({ _id: users[0]._id }, process.env.JWT_SECRET, {
          expiresIn: 1
        });

      setTimeout(() => {
        request(app)
          .patch("/api/users/resetpw")
          .set("Authorization", token)
          .send({ password, password2 })
          .expect(401)
          .end(done);
      }, 1001);
    });
  });
});

// Test the Profile Routes
describe("TEST ALL PROFILE ROUTES", () => {
  describe("GET /api/profile", () => {
    it("should receive 404 if authorized user has no profile", done => {
      let token =
        "Bearer " +
        jwt.sign({ _id: users[1]._id }, process.env.JWT_SECRET, {
          expiresIn: 600
        });

      request(app)
        .get("/api/profile")
        .set("Authorization", token)
        .expect(404)
        .expect(res => {
          expect(res.body.noprofile).toBeTruthy();
        })
        .end(done);
    });

    it("should receive 200 if authorized user has a profile", done => {
      let token =
        "Bearer " +
        jwt.sign({ _id: users[0]._id }, process.env.JWT_SECRET, {
          expiresIn: 600
        });

      request(app)
        .get("/api/profile")
        .set("Authorization", token)
        .expect(200)
        .expect(res => {
          expect(res.body).toBeTruthy();
          expect(res.body.noprofile).toBeFalsy();
        })
        .end(done);
    });
  });
});
