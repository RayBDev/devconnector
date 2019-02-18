const expect = require("expect");
const request = require("supertest");

const app = require("../../server");
const User = require("../../models/User");
const { users, populateUsers } = require("./seed/seed");

beforeEach(populateUsers);

describe("POST /api/users/register", () => {
  it("should create a user", done => {
    let name = "Example User";
    let email = "example@example.com";
    let password = "123mnb!";

    request(app)
      .post("/api/users/register")
      .send({ name, email, password })
      .expect(200)
      .expect(res => {
        // expect(res.headers["x-auth"]).toBeTruthy();
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

  // it("should return validation errors if request invalid", done => {
  //   let email = "example@example";
  //   let password = "123mn";

  //   request(app)
  //     .post("/users")
  //     .send({ email, password })
  //     .expect(400)
  //     .end(done);
  // });

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
  it("should lookup user email and send reset email", done => {
    let email = users[0].email;
    
    request(app)
      .post("/api/users/forgetpw")
      .send({ email })
      .expect(200)
      .end(err => {
        if (err) {
          return done(err);
        }

        User.findOne({ email })
          .then(user => {
            expect(user).toBeTruthy();
            done();
          })
          .catch(e => done(e));
      });
  });