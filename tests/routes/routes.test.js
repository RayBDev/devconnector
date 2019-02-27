const expect = require("expect");
const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = require("../../server");

//Import Models
const User = require("../../models/User");
const Profile = require("../../models/Profile");

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
describe("TEST PROFILE ROUTES", () => {
  describe("GET /api/profile", () => {
    it("should receive 404 if authorized user has no profile", done => {
      let token =
        "Bearer " +
        jwt.sign({ _id: users[2]._id }, process.env.JWT_SECRET, {
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

  describe("GET /api/profile/all", () => {
    it("should return all profiles in database with injected user name and avatar", done => {
      let userInjectedProfiles = profiles.map((profile, index) => {
        let injectProfile = {
          ...profile,
          _id: profiles[index]._id.toString(),
          user: {
            _id: users[index]._id.toString(),
            name: users[index].name,
            avatar: users[index].avatar
          }
        };
        return injectProfile;
      });

      request(app)
        .get("/api/profile/all")
        .expect(200)
        .expect(res => {
          expect(res.body).toMatchObject(userInjectedProfiles);
        })
        .end(done);
    });
  });

  describe("GET /api/profile/handle/:handle", () => {
    it("should return user profile by handle with injected user name and avatar", done => {
      let userInjectedProfile = {
        ...profiles[0],
        _id: profiles[0]._id.toString(),
        user: {
          _id: users[0]._id.toString(),
          name: users[0].name,
          avatar: users[0].avatar
        }
      };

      request(app)
        .get(`/api/profile/handle/${profiles[0].handle}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toMatchObject(userInjectedProfile);
        })
        .end(done);
    });

    it("should return 404 with unknown handle", done => {
      request(app)
        .get(`/api/profile/handle/unknownHandle`)
        .expect(404)
        .expect(res => {
          expect(res.body.noprofile).toBe("There is no profile for this user");
        })
        .end(done);
    });
  });

  describe("GET /api/profile/user/:user_id", () => {
    it("should return user profile by user_id with injected user name and avatar", done => {
      let userInjectedProfile = {
        ...profiles[0],
        _id: profiles[0]._id.toString(),
        user: {
          _id: users[0]._id.toString(),
          name: users[0].name,
          avatar: users[0].avatar
        }
      };

      request(app)
        .get(`/api/profile/user/${users[0]._id.toString()}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toMatchObject(userInjectedProfile);
        })
        .end(done);
    });

    it("should return 404 with invalid user_id", done => {
      request(app)
        .get(`/api/profile/user/${users[0]._id.toString() + 1}`)
        .expect(404)
        .expect(res => {
          expect(res.body.noprofile).toBe("There is no profile for this user");
        })
        .end(done);
    });
  });

  describe("POST /api/profile", () => {
    it("should create new profile", done => {
      let handle = "JohnD";
      let status = "Trainer";
      let skills = "HTML, CSS, JavaScript, PHP";
      let company = "http://www.traversymedia.com";
      let location = "USA";
      let bio = "Coding developer and teacher";
      let githubusername = "traversymedia";
      let youtube = "http://www.youtube.com";
      let linkedin = "http://www.linkedin.com";
      let facebook = "http://www.facebook.com";
      let instagram = "http://www.instagram.com";
      let token =
        "Bearer " +
        jwt.sign({ _id: users[2]._id }, process.env.JWT_SECRET, {
          expiresIn: 600
        });

      request(app)
        .post("/api/profile")
        .set("Authorization", token)
        .send({
          handle,
          status,
          skills,
          company,
          location,
          bio,
          githubusername,
          youtube,
          linkedin,
          facebook,
          instagram
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toMatchObject({
            handle,
            status,
            company,
            location,
            bio,
            githubusername
          });
          expect(res.body.social).toMatchObject({
            youtube,
            linkedin,
            facebook,
            instagram
          });
          expect(res.body.skills).toMatchObject(
            skills.split(",").map(skill => skill.trim())
          );
        })
        .end(done);
    });

    it("should update a user's profile", done => {
      let handle = "RayBDev";
      let skills = "HTML, CSS, JavaScript, React.js, Node.js, Express.js";
      let status = "Full Stack Web Developer";
      let token =
        "Bearer " +
        jwt.sign({ _id: users[0]._id }, process.env.JWT_SECRET, {
          expiresIn: 600
        });

      request(app)
        .post("/api/profile")
        .set("Authorization", token)
        .send({ handle, skills, status })
        .expect(200)
        .expect(res => {
          expect(res.body).toMatchObject({ handle, status });
          expect(res.body.skills).toMatchObject(
            skills.split(",").map(skill => skill.trim())
          );
        })
        .end(done);
    });

    it("should not create profile if handle exists", done => {
      let handle = profiles[0].handle;
      let skills = "HTML, CSS, JavaScript, React.js, Node.js, Express.js";
      let status = "Full Stack Web Developer";
      let token =
        "Bearer " +
        jwt.sign({ _id: users[2]._id }, process.env.JWT_SECRET, {
          expiresIn: 600
        });

      request(app)
        .post("/api/profile")
        .set("Authorization", token)
        .send({ handle, skills, status })
        .expect(400)
        .expect(res => {
          expect(res.body.handle).toBe("That handle already exists");
        })
        .end(done);
    });

    it("should not update profile if handle exists", done => {
      let handle = profiles[1].handle;
      let skills = "HTML, CSS, JavaScript, React.js, Node.js, Express.js";
      let status = "Full Stack Web Developer";
      let token =
        "Bearer " +
        jwt.sign({ _id: users[0]._id }, process.env.JWT_SECRET, {
          expiresIn: 600
        });

      request(app)
        .post("/api/profile")
        .set("Authorization", token)
        .send({ handle, skills, status })
        .expect(400)
        .expect(res => {
          expect(res.body.handle).toBe("That handle already exists");
        })
        .end(done);
    });
  });

  describe("GET /api/profile/experience", () => {
    it("should add experience to a user's profile", done => {
      let title = "Senior Developer";
      let company = "Dev Studio";
      let location = "Calgary, AB";
      let from = "2010-02-08";
      let to = "2012-09-08";
      let description = "Worked on the full LAMP stack.";

      let token =
        "Bearer " +
        jwt.sign({ _id: users[0]._id }, process.env.JWT_SECRET, {
          expiresIn: 600
        });

      request(app)
        .post("/api/profile/experience")
        .set("Authorization", token)
        .send({ title, company, location, from, to, description })
        .expect(200)
        .expect(res => {
          expect(res.body.experience[0]).toMatchObject({
            title,
            company,
            location,
            description
          });
        })
        .end(done);
    });

    it("should not add experience to a user's profile with missing fields", done => {
      let title = "";
      let company = "";
      let from = "";

      let token =
        "Bearer " +
        jwt.sign({ _id: users[0]._id }, process.env.JWT_SECRET, {
          expiresIn: 600
        });

      request(app)
        .post("/api/profile/experience")
        .set("Authorization", token)
        .send({ title, company, from })
        .expect(400)
        .expect(res => {
          expect(res.body.title).toBe("Job title field is required");
          expect(res.body.company).toBe("Company field is required");
          expect(res.body.from).toBe("From date field is required");
        })
        .end(done);
    });
  });

  describe("GET /api/profile/education", () => {
    it("should add education to a user's profile", done => {
      let school = "Udemy";
      let degree = "Full Stack Web Developer Diploma";
      let fieldofstudy = "Full Stack Web Development";
      let from = "2010-02-08";
      let to = "2012-09-08";
      let description = "Worked on the full LAMP stack.";

      let token =
        "Bearer " +
        jwt.sign({ _id: users[0]._id }, process.env.JWT_SECRET, {
          expiresIn: 600
        });

      request(app)
        .post("/api/profile/education")
        .set("Authorization", token)
        .send({ school, degree, fieldofstudy, from, to, description })
        .expect(200)
        .expect(res => {
          expect(res.body.education[0]).toMatchObject({
            school,
            degree,
            fieldofstudy,
            description
          });
        })
        .end(done);
    });

    it("should not add education to a user's profile with missing fields", done => {
      let token =
        "Bearer " +
        jwt.sign({ _id: users[0]._id }, process.env.JWT_SECRET, {
          expiresIn: 600
        });

      request(app)
        .post("/api/profile/education")
        .set("Authorization", token)
        .send({})
        .expect(400)
        .expect(res => {
          expect(res.body.school).toBe("School title field is required");
          expect(res.body.degree).toBe("Degree field is required");
          expect(res.body.fieldofstudy).toBe(
            "Field of study field is required"
          );
          expect(res.body.from).toBe("From date field is required");
        })
        .end(done);
    });
  });

  describe("DELETE api/profile/experience/:exp_id", () => {
    it("should delete a user's experience by id", done => {
      let token =
        "Bearer " +
        jwt.sign({ _id: users[0]._id }, process.env.JWT_SECRET, {
          expiresIn: 600
        });

      request(app)
        .delete(`/api/profile/experience/${profiles[0].experience[0]._id}`)
        .set("Authorization", token)
        .expect(200)
        .end(err => {
          Profile.findOne({ user: users[0]._id }).then(profile => {
            const removedIndex = profile.experience
              .map(item => item.id)
              .indexOf(profiles[0].experience[0]._id);
            expect(removedIndex).toBe(-1);
            done();
          });
        });
    });
  });

  describe("DELETE api/profile/education/:edu_id", () => {
    it("should delete a user's education by id", done => {
      let token =
        "Bearer " +
        jwt.sign({ _id: users[0]._id }, process.env.JWT_SECRET, {
          expiresIn: 600
        });

      request(app)
        .delete(`/api/profile/education/${profiles[0].education[0]._id}`)
        .set("Authorization", token)
        .expect(200)
        .end(err => {
          Profile.findOne({ user: users[0]._id }).then(profile => {
            const removedIndex = profile.education
              .map(item => item.id)
              .indexOf(profiles[0].education[0]._id);
            expect(removedIndex).toBe(-1);
            done();
          });
        });
    });
  });
});

// Test the Posts Route
describe("TEST POSTS ROUTES", () => {
  describe("GET /api/posts", () => {
    it("should create a new post", done => {
      let text = "This is my first post";
      let user = users[0]._id.toString();

      let token =
        "Bearer " +
        jwt.sign({ _id: users[0]._id }, process.env.JWT_SECRET, {
          expiresIn: 600
        });

      request(app)
        .post("/api/posts")
        .set("Authorization", token)
        .send({ text, user })
        .expect(200)
        .expect(res => {
          expect(res.body).toMatchObject({ text, user });
        })
        .end(done);
    });

    it("should not create a new post if text field is not between 10-300 chars", done => {
      let text = "Test";
      let token =
        "Bearer " +
        jwt.sign({ _id: users[2]._id }, process.env.JWT_SECRET, {
          expiresIn: 600
        });

      request(app)
        .post("/api/posts")
        .set("Authorization", token)
        .send({ text })
        .expect(400)
        .expect(res => {
          expect(res.body).toMatchObject({
            text: "Post must be between 10 and 300 characters"
          });
        })
        .end(done);
    });

    it("should not create a new post if text field is missing", done => {
      let token =
        "Bearer " +
        jwt.sign({ _id: users[2]._id }, process.env.JWT_SECRET, {
          expiresIn: 600
        });

      request(app)
        .post("/api/posts")
        .set("Authorization", token)
        .expect(400)
        .expect(res => {
          expect(res.body).toMatchObject({ text: "Text field is required" });
        })
        .end(done);
    });
  });
});
