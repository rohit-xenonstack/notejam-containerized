import express from "express";
import session from "express-session";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";
import serveFavicon from "serve-favicon";
import logger from "morgan";
import cookieParser from "cookie-parser";
import flash from "connect-flash";
import bodyParser from "body-parser";
import orm from "orm";
import expressValidator from "express-validator";
import passport from "passport";
import users from "./routes/users.js";
import pads from "./routes/pads.js";
import notes from "./routes/notes.js";
import settings from "./settings.js";
import pg from "pg";
import models from "./models.js";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = dirname(__filename); // get the name of the directory
const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(serveFavicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(expressValidator());
app.use(cookieParser());
app.use(session({ cookie: { maxAge: 60000 }, secret: "secret" }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// DB configuration
// const { Pool } = pg;
// const db = new Pool({
//   connectionString: settings.dsn,
// });

orm.settings.set("instance.returnAllErrors", true);
app.use(
  orm.express(settings.dsn, {
    define: async function (db, modelDefinitions, next) {
      try {
        await models(db, function (err) {
          if (err) {
            console.error("Error defining models:", err);
            return next(err);
          }
          console.log("Models loaded:", Object.keys(db.models));
          if (db.models.users) modelDefinitions.User = db.models.users;
          if (db.models.pads) modelDefinitions.Pad = db.models.pads;
          if (db.models.notes) modelDefinitions.Note = db.models.notes;
          console.log("Final models mapping:", Object.keys(modelDefinitions));
          next();
        });
      } catch (error) {
        console.error("Error in ORM setup:", error);
        next(error);
      }
    },
  })
);

// Flash Messages configuration
app.use(function (req, res, next) {
  res.locals.flash_messages = {
    success: req.flash("success"),
    error: req.flash("error"),
  };
  next();
});

// Inject request object and user pads in view scope
app.use(function (req, res, next) {
  res.locals.req = req;

  if (req.isAuthenticated()) {
    req.user.getPads(function (i, pads) {
      res.locals.pads = pads;
      next();
    });
  } else {
    next();
  }
});

app.use("/", users);
app.use("/", pads);
app.use("/", notes);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {},
  });
});

export default app;
