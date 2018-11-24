const User = require("../../models/Users");
const UserSession = require("../../models/UserSession");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

module.exports = app => {
  /*
   * Add User
   */
  app.post("/api/account/signup", (req, res, next) => {
    const { body } = req;
    const { firstName, lastName, password } = body;

    let { email } = body;

    if (!firstName) {
      return res.send({
        success: false,
        message: "Error, First name cannot be blank!"
      });
    }
    if (!lastName) {
      return res.send({
        success: false,
        message: "Error, Last name cannot be blank!"
      });
    }
    if (!email) {
      return res.send({
        success: false,
        message: "Error, Email cannot be blank!"
      });
    }
    if (!password) {
      return res.send({
        success: false,
        message: "Error, Password cannot be blank!"
      });
    }

    email = email.toLowerCase();

    // Checking if email already exists
    User.find(
      {
        email: email
      },
      (err, previousUsers) => {
        if (err) {
          return res.send({
            success: false,
            message: "Error, Internal server error."
          });
        } else if (previousUsers.length > 0) {
          return res.send({
            success: false,
            message: "Error, Account already exists."
          });
        }

        // Add User
        const newUser = new User();
        newUser.email = email;
        newUser.firstName = firstName;
        newUser.lastName = lastName;
        newUser.password = newUser.generateHash(password);
        newUser.save((err, user) => {
          if (err) {
            return res.send({
              success: false,
              message: "Error, Internal server error."
            });
          }
          return res.send({
            success: true,
            message: "Signed up."
          });
        });
      }
    );
  });

  /*
   * Sign In
   */
  app.post("/api/account/signin", (req, res, next) => {
    const { body } = req;
    const { password } = body;

    let { email } = body;

    if (!email) {
      return res.send({
        success: false,
        message: "Error, Email cannot be blank!"
      });
    }
    if (!password) {
      return res.send({
        success: false,
        message: "Error, Password cannot be blank!"
      });
    }

    email = email.toLowerCase();

    User.find(
      {
        email: email
      },
      (err, users) => {
        if (err) {
          return res.send({
            success: false,
            message: "Error, Internal server erro."
          });
        }
        if (users.length != 1) {
          return res.send({
            success: false,
            message: "Error, Invalid."
          });
        }
        const user = users[0];
        if (!user.validPassword(password)) {
          return res.send({
            success: false,
            message: "Error, Invalid."
          });
        }
        // Correct User Login
        const userSession = new UserSession();
        userSession.userId = user._id;
        userSession.save((err, doc) => {
          if (err) {
            return res.send({
              success: false,
              message: "Error, Internal server erro."
            });
          }
          return res.send({
            success: true,
            message: "Valid Login.",
            token: doc._id
          });
        });
      }
    );
  });

  /*
   * Verify Token
   */
  app.get("/api/account/verify", (req, res, next) => {
    // Get User Token
    const { query } = req;
    const { token } = query;
    // Verify User Token is Valid
    UserSession.find(
      {
        _id: token,
        isDeleted: false
      },
      (err, sessions) => {
        if (err) {
          return res.send({
            success: false,
            message: "Error, Internal server error."
          });
        }
        if (sessions.length != 1) {
          return res.send({
            success: false,
            message: "Invalid"
          });
        } else {
          return res.send({
            success: true,
            message: "Valid Token"
          });
        }
      }
    );
  });

  /*
   * Logout Request
   */
  app.get("/api/account/logout", (req, res, next) => {
    // Get User Token
    const { query } = req;
    const { token } = query;
    // Verify User Token is Valid
    UserSession.findOneAndUpdate(
      {
        _id: token,
        isDeleted: false
      },
      {
        $set: {
          isDeleted: true
        }
      },
      null,
      (err, sessions) => {
        if (err) {
          return res.send({
            success: false,
            message: "Error, Internal server error."
          });
        }
        return res.send({
          success: true,
          message: "Token Deleted"
        });
      }
    );
  });

    /*
   * Image Upload Endpoint
   */
  app.post("/api/uploadimage", upload.single("files[]"), (req, res, next) => {
    console.log(req.file);
    return res.send({
      data: [
        req.file.path,
        {
          src: req.file.path,
          type: "image"
        }
      ]
    });
  });
};
