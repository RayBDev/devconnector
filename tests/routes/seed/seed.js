const { ObjectID } = require("mongodb");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");

const User = require("../../../models/User");

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const avatar = gravatar.url(this.email, {
  s: "200", //Size
  r: "pg", //Rating
  d: "mm" //Default
});

const users = [
  {
    _id: userOneId,
    name: "Ray Bernard",
    email: "ray@example.com",
    password: "userOnePass",
    avatar
  },
  {
    _id: userTwoId,
    name: "Brad Traversy",
    email: "techguyinfo@gmail.com",
    password: "userTwoPass",
    avatar
  }
];

const populateUsers = done => {
  User.deleteMany({})
    .then(() => {
      let userArray = [];
      users.forEach((user, index) => {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) throw err;
            userArray.push(
              new User({ ...users[index], password: hash }).save()
            );
          });
        });
      });

      return Promise.all(userArray);
    })
    .then(() => done());
};

module.exports = { users, populateUsers };
