const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "employees",
});

connection.connect(function (err) {
  if (err) throw err;
  runEmployee();
});

function runEmployee() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View All Employees",
        "View All Employees by Department",
        "View All Employees by Manager",
        "Add Employee",
        "Remove Employee",
      ],
    })
    .then(function (answer) {
      switch (answer.action) {
        case "View All Employees":
          viewAllEmployees();
          break;

        // case "View All Employees by Department":
        //     multiSearch();
        //   break;

        // case "View All Employees by Manager":
        //     rangeSearch();
        //   break;

        case "Add Employee":
          addEmployee();
          break;

        // case "Remove Employee":
        //     songAndAlbumSearch();
        //   break;
      }
    });
}

function viewAllEmployees() {
  const query =
    "SELECT a.id, a.first_name, a.last_name, title, name AS department, salary, CONCAT(b.first_name, ' ' , b.last_name) AS manager FROM employee a LEFT JOIN role ON a.id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee b ON a.manager_id = b.role_id";
  connection.query(query, function (err, res) {
    console.table(res);
    runEmployee();
  });
}

function addEmployee() {
  const query =
    "SELECT a.id, a.first_name, a.last_name, title, name AS department, salary, CONCAT(b.first_name, ' ' , b.last_name) AS manager FROM employee a LEFT JOIN role ON a.id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee b ON a.manager_id = b.role_id";
  connection.query(query, function (err, res) {
    console.table(res);
    runEmployee();
  });
}
