import async from "async";
import pg from "pg";
import settings from "./settings.js";

const { Pool } = pg;
const pool = new Pool({
  connectionString: settings.dsn,
});

var functions = {
  createTables: function (next) {
    async.series(
      {
        createUsers: function (callback) {
          pool.query(
            "CREATE TABLE IF NOT EXISTS users (" +
              "id BIGSERIAL PRIMARY KEY NOT NULL," +
              "email VARCHAR(75) NOT NULL," +
              "password VARCHAR(128) NOT NULL);",
            [],
            function () {
              callback(null);
            }
          );
        },
        createPads: function (callback) {
          pool.query(
            "CREATE TABLE IF NOT EXISTS pads (" +
              "id BIGSERIAL PRIMARY KEY NOT NULL," +
              "name VARCHAR(100) NOT NULL," +
              "user_id INTEGER NOT NULL REFERENCES users(id));",
            [],
            function () {
              callback(null);
            }
          );
        },
        createNotes: function (callback) {
          pool.query(
            "CREATE TABLE IF NOT EXISTS notes (" +
              "id BIGSERIAL PRIMARY KEY NOT NULL," +
              "pad_id INTEGER REFERENCES pads(id)," +
              "user_id INTEGER NOT NULL REFERENCES users(id)," +
              "name VARCHAR(100) NOT NULL," +
              "text text NOT NULL," +
              "created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP," +
              "updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);",
            [],
            function () {
              callback(null);
            }
          );
        },
      },
      function (err, results) {
        next();
      }
    );
  },

  applyFixtures: function (next) {
    this.truncateTables(function () {
      async.series(
        [
          function (callback) {
            pool.query(
              "INSERT INTO users VALUES (1, 'user1@example.com', " +
                "'$2a$10$mhkqpUvPPs.zoRSTiGAEKODOJMljkOY96zludIIw.Pop1UvQCTx8u')",
              [],
              function () {
                callback(null);
              }
            );
          },
          function (callback) {
            pool.query(
              "INSERT INTO users VALUES (2, 'user2@example.com', " +
                "'$2a$10$mhkqpUvPPs.zoRSTiGAEKODOJMljkOY96zludIIw.Pop1UvQCTx8u')",
              [],
              function () {
                callback(null);
              }
            );
          },
          function (callback) {
            pool.query(
              "INSERT INTO pads VALUES (1, 'Pad 1', 1)",
              [],
              function () {
                callback(null);
              }
            );
          },
          function (callback) {
            pool.query(
              "INSERT INTO pads VALUES (2, 'Pad 2', 1)",
              [],
              function () {
                callback(null);
              }
            );
          },
          function (callback) {
            pool.query(
              "INSERT INTO notes VALUES (1, 1, 1, 'Note 1', 'Text')",
              [],
              function () {
                callback(null);
              }
            );
          },
          function (callback) {
            pool.query(
              "INSERT INTO notes VALUES (2, 1, 1, 'Note 2', 'Text')",
              [],
              function () {
                callback(null);
              }
            );
          },
        ],
        function (err, results) {
          next();
        }
      );
    });
  },

  truncateTables: function (next) {
    async.series(
      [
        function (callback) {
          pool.query("DELETE FROM users;", [], function () {
            callback(null);
          });
        },
        function (callback) {
          pool.query("DELETE FROM notes;", [], function () {
            callback(null);
          });
        },
        function (callback) {
          pool.query("DELETE FROM pads;", [], function (result) {
            callback(null);
          });
        },
      ],
      function (err, results) {
        next();
      }
    );
  },
};

functions.createTables(function () {
  console.log("DB successfully initialized");
});

export default functions;
