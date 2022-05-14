//connect to packages from mysql2 and inquirer
const mysql = require("mysql2");
const inquirer = require("inquirer");
const fs = require("fs");
const table = require("console.table");

//main function
async function main() {
//read files to reset and seed database
  const schema = fs.readFileSync("db/schema.sql", { encoding: "utf-8" });
  const seed = fs.readFileSync("db/seeds.sql", { encoding: "utf-8" });
//connect to mysql
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    multipleStatements: true,
  });

  //create connection to schema and seed files. Will reset and seed database
  connection.query(schema);
  connection.query(seed);
  //prompt questions
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "View all departments",
          "View department budget",
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
//break connection when user chooses to quit application
    if (action == "Quit") {
      break;
//select all departments and print to console
    } else if (action == "View all departments") {
      const [departments] = await connection
        .promise()
        .query("SELECT * FROM department");
      console.table(departments);
    } else if (action == "View department budget") {
//get all departments for user to choose to select budget for
      const [departments] = await connection.promise().query(`
        SELECT id AS value, name 
        FROM department
      `)
      const departmentChoice = await inquirer.prompt([
        {name: 'department', message: 'Select department to view budget',
        type: 'list', choices: departments
      }
      ])
//selecting all employees in a department and sum their role salary
      const [budgetInfo] = await connection.promise().query(`
        SELECT SUM(r.salary) AS budget
        FROM employee e
        JOIN role r ON r.id = e.role_id
        WHERE r.department_id = ?
        GROUP BY r.department_id
      `, [departmentChoice.department])
//get info of department user selected
      const idx = departments.findIndex(department => department.value == departmentChoice.department)
      console.table([
        {
          id: departments[idx].value, 
          name: departments[idx].name,
          budget: budgetInfo[0].budget
        }
      ])
//select all roles with their department and print to console
    } else if (action == "View all roles") {
      const [roles] = await connection.promise().query(`
            select r.id, r.title, r.salary, d.name as department
            from role r
            join department d on d.id = r.department_id
        `);
      console.table(roles);
//select all employees with their role and department info and print to console
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
        `);
      console.table(employees);
//prompt user for department name and insert into department table
    } else if (action == "Add a department") {
      const departmentInfo = await inquirer.prompt([
        {
          name: "name",
          message: "Enter department name",
        },
      ]);
      await connection.promise().query(
        `
        INSERT INTO department(name)VALUES(?)
      `,
        [departmentInfo.name]
      );
//prompt user for role information and which department role belongs to then insert it into role table
    } else if (action == "Add a role") {
      const [departments] = await connection.promise().query(`
        SELECT * FROM department 
      `);
      const roleInfo = await inquirer.prompt([
        { name: "title", message: "Enter name of role" },
        { name: "salary", message: "Enter salary for role" },
        {
          name: "department",
          message: "Select department for role",
          type: "list",
          choices: departments.map((department) => ({
            name: department.name,
            value: department.id,
          })),
        },
      ]);
      await connection.promise().query(
        `
        INSERT INTO role(title, salary, department_id)
        VALUES(?,?,?)
      `,
        [roleInfo.title, roleInfo.salary, roleInfo.department]
      );
    } else if (action == "Add an employee") {
//get potential managers 
      const [employees] = await connection.promise().query(`
        SELECT id AS value, CONCAT(first_name, ' ', last_name) AS name
        FROM employee
      `);
//get potential roles
      const [roles] = await connection.promise().query(`
        SELECT id AS value, title AS name
        FROM role
      `);
//prompt user for potential managers, roles and name info
      const employeeInfo = await inquirer.prompt([
        {
          name: "firstName",
          message: "Enter employee first name",
        },
        { name: "lastName", message: "Enter employee last name" },
        {
          name: "role",
          message: "Select employee role",
          type: "list",
          choices: roles,
        },
        {
          name: "manager",
          message: "Select manager",
          type: "list",
          choices: [{ name: "None", value: null }, ...employees],
        },
      ]);
//insert into employee table
      await connection.promise().query(
        `
        INSERT INTO employee(first_name, last_name, role_id, manager_id) 
        VALUES(?, ?, ?, ?)
      `,
        [
          employeeInfo.firstName,
          employeeInfo.lastName,
          employeeInfo.role,
          employeeInfo.manager,
        ]
      );
    } else if (action == "Update an employee role") {
//get potential roles
      const [roles] = await connection.promise().query(`
        SELECT id AS value, title AS name
        FROM role
      `)
//get potential employees to update
      const [employees] = await connection.promise().query(`
        SELECT id AS value, CONCAT(first_name, ' ', last_name) AS name
        FROM employee
      `);
//prompt user for employee to update and new role
      const updateInfo = await inquirer.prompt([
        {
          name: "employee", message: "Select employee to update role",
          type: "list", choices: employees
        },
        {
          name: "role", message: "Select new role",
          type: "list", choices: roles
        }
      ])
//update the employee's role
      await connection.promise().query(`
        UPDATE employee
        SET role_id = ?
        WHERE id = ?
      `, [updateInfo.role, updateInfo.employee])
    }
  } 
//disconnect from the database
  connection.end();
}
main();
