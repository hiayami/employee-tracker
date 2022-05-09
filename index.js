const mysql = require("mysql2");
const inquirer = require("inquirer");
const fs = require("fs");

async function main() {
  const schema = fs.readFileSync("db/schema.sql", { encoding: "utf-8" });
  const seed = fs.readFileSync("db/seeds.sql", { encoding: "utf-8" });
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    multipleStatements: true,
  });

  connection.query(schema);
  connection.query(seed);
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Select command",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add a department",
          "Add a role",
          "Add an employee",
          "Update an employee role",
          "Quit",
        ],
      },
    ]);
    if (action == 'Quit') {
        break
    }
  }
  connection.end();
}
main();
