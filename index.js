const mysql = require("mysql2");
const inquirer = require("inquirer");
const fs = require("fs");
const table = require('console.table');

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

    if (action == "Quit") {
      break;
    } else if (action == "View all departments") {
        const [departments] = await connection.promise().query('select * from department')
        console.table(departments)
    } else if (action == "View all roles") {
        const [roles] = await connection.promise().query(`
            select r.id, r.title, r.salary, d.name as department
            from role r
            join department d on d.id = r.department_id
        `)
        console.table(roles)
    } else if (action == "View all employees") {
        const [employees] = await connection.promise().query(`
            select 
                e.id, 
                e.first_name, 
                e.last_name, 
                r.title, 
                d.name as department,
                r.salary,
                concat(m.first_name, ' ', m.last_name) as manager
            from employee e
            join role r on r.id = e.role_id
            left join employee m on m.id = e.manager_id
            join department d on d.id = r.department_id
        `) 
        console.table(employees)
    }
  }
  connection.end();
}
main();
