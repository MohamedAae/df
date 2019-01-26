const express = require("express");
const historyApiFallback = require("connect-history-api-fallback");
const mongoose = require("mongoose");
const path = require("path");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");

const config = require("../config/config");
const webpackConfig = require("../webpack.config");

const isDev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 8080;

var fs = require("fs");
var cookieParser = require("cookie-parser");
const compression = require("compression");
const filemanagerMiddleware = require("@opuscapita/filemanager-server")
  .middleware;

// Configuration
// ================================================================================================

// Set up Mongoose
mongoose.connect(isDev ? config.db_dev : config.db);
mongoose.Promise = global.Promise;

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

var configs = {
  fsRoot: path.resolve(__dirname, "../users/5bee2c2886d2ad1f3a113c43"),
  rootName: "My Templates",
  capabilities: {
    canListChildren: true,
    canAddChildren: true,
    canRemoveChildren: true,
    canDelete: true,
    canRename: true,
    canCopy: true,
    canEdit: true,
    canDownload: true
  }
};
app.use(compression());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
const baseUrl = process.env.BASE_URL || "/";
app.use(
  baseUrl,
  // function(req, res, next) {
  //   var tokenvalidation = req.cookies["df_access"];
  //   // Connect to Database
  //   var MongoClient = require("mongodb").MongoClient;
  //   var ObjectId = require("mongodb").ObjectID;
  //   var url = "mongodb://localhost:27017/";
  //   MongoClient.connect(
  //     url,
  //     function(err, db) {
  //       if (err) throw err;
  //       var dbo = db.db("documentFactory");
  //       dbo
  //         .collection("usersessions")
  //         .find({ _id: new ObjectId(tokenvalidation) })
  //         .toArray(function(err, result) {
  //           if (err) throw err;
  //           // Create user, HTML and CSS folders
  //           var userdir = "./users/" + result[0].userId;
  //           if (!fs.existsSync(userdir)) {
  //             fs.mkdirSync(userdir);
  //             console.log("You didn't export any templates before.");
  //           }
  //           db.close();
  //           configs["fsRoot"] = path.resolve(__dirname, "../public/");
  //         });
  //     }
  //   );
  //   next();
  // },
  filemanagerMiddleware(configs)
);

// API routes
require("./routes")(app);

if (isDev) {
  const compiler = webpack(webpackConfig);

  app.use(
    historyApiFallback({
      verbose: false
    })
  );

  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
      contentBase: path.resolve(__dirname, "../client/public"),
      stats: {
        colors: true,
        hash: false,
        timings: true,
        chunks: false,
        chunkModules: false,
        modules: false
      }
    })
  );

  app.use(webpackHotMiddleware(compiler));
  app.use(express.static(path.resolve(__dirname, "../dist")));
} else {
  app.use(express.static(path.resolve(__dirname, "../dist")));
  app.get("*", function(req, res) {
    res.sendFile(path.resolve(__dirname, "../dist/index.html"));
    res.end();
  });
}

app.listen(port, "0.0.0.0", err => {
  if (err) {
    console.log(err);
  }

  console.info(">>> 🌎 Open http://0.0.0.0:%s/ in your browser.", port);
});

module.exports = app;
