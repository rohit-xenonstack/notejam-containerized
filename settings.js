import fs from "fs";

// var env = process.env.NODE_ENV;
// if (!env) {
//   env = "production";
// }

const {
  POSTGRES_HOST: PG_HOST,
  POSTGRES_USER: PG_USER,
  POSTGRES_PASSWORD: PG_PASSWORD,
  POSTGRES_PASSWORD_FILE: PG_PASS_FILE,
  POSTGRES_DB: PG_NAME,
  POSTGRES_PORT: PG_PORT,
} = process.env;

const password = PG_PASS_FILE
  ? fs.readFileSync(PG_PASS_FILE, "utf8")
  : PG_PASSWORD;

const DSN = `postgresql://${PG_USER}:${password}@${PG_HOST}:${PG_PORT}/${PG_NAME}`;

var settings = {
  dsn: DSN,
};

console.log(settings.dsn);
export default settings;
