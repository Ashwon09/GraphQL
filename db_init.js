const { Pool } = require("pg");
const client = new Pool({
  user: "postgres",
  host: "localhost",
  database: "league",
  password: "qwerty",
  port: 5432,
});
client.connect(function(err, b) {
  if (err) throw err;
  console.log("Database connected");
});

module.exports = { client };
