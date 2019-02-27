const { ObjectID } = require("mongodb");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");

const User = require("../../../models/User");
const Profile = require("../../../models/Profile");

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const userThreeId = new ObjectID();
const profileOneId = new ObjectID();
const profileTwoId = new ObjectID();
const experienceOneId = new ObjectID();
const experienceTwoId = new ObjectID();
const educationOneId = new ObjectID();
const educationTwoId = new ObjectID();
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
  },
  {
    _id: userThreeId,
    name: "John Doe",
    email: "johnD@gmail.com",
    password: "userThreePass",
    avatar
  }
];

const profiles = [
  {
    _id: profileOneId,
    user: userOneId,
    handle: "RayB",
    status: "Full Stack Developer",
    skills: ["HTML", "CSS", "JavaScript", "React.js", "Node.js"],
    company: "Tactic Apps",
    website: "https://www.tacticapps.com",
    experience: [
      {
        _id: experienceOneId.toString(),
        title: "Full Stack Developer",
        company: "Tactic Apps",
        from: "2018-08-09T00:00:00.000Z",
        description: "CEO and Lead web developer"
      }
    ],
    education: [
      {
        _id: educationOneId.toString(),
        school: "University of Calgary",
        degree: "None",
        fieldofstudy: "Computer Engineering",
        from: "2003-01-05T00:00:00.000Z",
        to: "2004-05-10T00:00:00.000Z",
        description: "UofC Computer Engineering 1st year"
      }
    ]
  },
  {
    _id: profileTwoId,
    user: userTwoId,
    handle: "BradT",
    status: "Developer and Trainer",
    skills: ["HTML", "CSS", "JavaScript", "PHP"],
    company: "Traversy Media",
    website: "https://www.traversymedia.com",
    experience: [
      {
        _id: experienceTwoId.toString(),
        title: "Developer",
        company: "TechGuy Solutions",
        from: "2010-08-09T00:00:00.000Z",
        description: "Lead web developer"
      }
    ],
    education: [
      {
        _id: educationTwoId.toString(),
        school: "University of Essex",
        degree: "Associates",
        fieldofstudy: "Computer Science",
        from: "2008-01-05T00:00:00.000Z",
        to: "2010-05-10T00:00:00.000Z",
        description: "Basic computer science diploma"
      }
    ]
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

const populateProfiles = done => {
  Profile.deleteMany({})
    .then(() => {
      let userOneProfile = new Profile(profiles[0]).save();
      let userTwoProfile = new Profile(profiles[1]).save();

      return Promise.all([userOneProfile, userTwoProfile]);
    })
    .then(() => done());
};

module.exports = { users, populateUsers, profiles, populateProfiles };
