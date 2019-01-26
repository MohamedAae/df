const User = require("../../models/Users");
const UserSession = require("../../models/UserSession");
const UserTemplates = require("../../models/UserTemplates");
const multer = require("multer");
var fs = require("fs");
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./users/uploads/");
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
            message: "Error, Internal server error."
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
  var tokenvalidation;
  app.get("/api/account/verify", (req, res, next) => {
    // Get User Token
    const { query } = req;
    const { token } = query;
    tokenvalidation = { token };
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
            message: "Valid Token, all good to go."
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
    var { token } = query;
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

  /*
   * Storing user templates to Database and Coverting it to PDF
   */
  app.post("/api/storetemplates", (req, res, next) => {
    const { body } = req;
    let { userHtml } = body;
    let { userCss } = body;
    let { fileDate } = body;
    // Check if either HTML or CSS is blank
    if (!userHtml) {
      return res.send({
        success: false,
        message: "Error, HTML cannot be blank!"
      });
    }
    if (!userCss) {
      return res.send({
        success: false,
        message: "Error, CSS cannot be blank!"
      });
    }
    // Ignore duplicate exports
    User.find(
      {
        fileDate: fileDate
      },
      (err, templates) => {
        if (err) {
          return res.send({
            success: false,
            message: "Error, Internal server error."
          });
        }
        if (userHtml == null) {
          return res.send({
            success: false,
            message: "Error, HTML is blank."
          });
        }
        // Get Token
        console.log(tokenvalidation);
        // Passed all conditions & append variables to Database
        const userTemplates = new UserTemplates();
        userTemplates.userHtml = userHtml;
        userTemplates.userCss = userCss;
        userTemplates.token = tokenvalidation["token"];
        userTemplates.fileDate = fileDate;
        userTemplates.save((err, data) => {
          if (err) {
            return res.send({
              success: false,
              message: "Error, Internal server erro."
            });
          } else {
            // Log user Signing and token
            console.log("A user just signed in.");
            console.log("The user token : " + tokenvalidation["token"]);
            // Connect to Database
            var MongoClient = require("mongodb").MongoClient;
            var ObjectId = require("mongodb").ObjectID;
            var url = "mongodb://localhost:27017/";
            MongoClient.connect(
              url,
              function(err, db) {
                if (err) throw err;
                var dbo = db.db("documentFactory");
                dbo
                  .collection("usersessions")
                  .find({ _id: new ObjectId(tokenvalidation["token"]) })
                  .toArray(function(err, result) {
                    if (err) throw err;
                    // Create user, HTML and CSS folders
                    var userdir = "./users/" + result[0].userId;
                    var htmldir =
                      "./users/" + result[0].userId + "/" + fileDate;
                    var cssdir =
                      "./users/" + result[0].userId + "/" + fileDate + "/css/";
                    if (!fs.existsSync(userdir)) {
                      fs.mkdirSync(userdir);
                    }
                    if (!fs.existsSync(htmldir)) {
                      fs.mkdirSync(htmldir);
                      fs.mkdirSync(cssdir);
                    }
                    console.log(
                      "Directory for user " + result[0].userId + " Created."
                    );
                    // Create HTML File and write data to it
                    fs.writeFile(htmldir + "/index.html", userHtml, function(
                      err
                    ) {
                      if (err) throw err;
                      console.log("HTML Saved!");
                    });
                    // Create CSS file and write to data to it
                    fs.writeFile(cssdir + "style.css", userCss, function(err) {
                      if (err) throw err;
                      console.log("CSS Saved!");
                    });
                    db.close();
                    // Convert HTML and CSS to PDF
                    var pdfpy = require("pdfpy");
                    var data = {
                      //the key as to be same as below
                      input: htmldir + "/index.html",
                      output: userdir + "/" + fileDate + ".pdf",
                      options: {
                        "page-size": "Letter",
                        "margin-top": "0.0",
                        "margin-right": "0.0",
                        "margin-bottom": "0.0",
                        "margin-left": "0.0"
                      }
                    };
                    pdfpy.file(data, function(err, res) {
                      if (err) throw err;
                      if (res) console.log("User pdf created.");
                      console.log("*" + "-".repeat(45) + "*");
                    });
                    // Remove HTML and CSS files after 30 seconds.
                    var rimraf = require("rimraf");
                    setTimeout(function() {
                      rimraf(htmldir, function() {
                        console.log("Directory Removed!");
                      });
                    }, 30000);
                    const scanUserFolder = "./users/" + result[0].userId + "/";
                    setTimeout(function() {
                      fs.readdir(scanUserFolder, (err, files) => {
                        files.forEach(file => {
                          console.log("File: " + file);
                        });
                      });
                    }, 35000);
                  });
              }
            );
            return res.send({
              success: true,
              message: "Template Data Saved & PDF Created."
            });
          }
        });
      }
    );
  });

  /*
   * Reading PDF File and Displaying it to the user
   */
  app.all("/api/view", function(req, res) {
    let filenumber;
    if (req.method !== "POST") {
      const { body } = req;
      let { pdfNumber } = body;
      if (process.env.tezz == null && pdfNumber == null) {
        filenumber = "welcome.pdf";
      } else {
        filenumber = process.env.tezz;
      }
    } else if (req.method == "POST") {
      const { body } = req;
      let { pdfNumber } = body;
      if (pdfNumber !== null) {
        filenumber = pdfNumber;
        process.env.tezz = filenumber;
      } else {
        process.env.tezz = "welcome.pdf";
      }
    }
    var tempFile = "./users/5bee2c2886d2ad1f3a113c43/" + filenumber;
    fs.readFile(tempFile, function(err, data) {
      res.contentType("application/pdf");
      res.send(data);
    });
  });
};
