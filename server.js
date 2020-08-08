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
});

runEmployee();

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
        "Add Role",
        "Add Department",
        "Remove Employee",
      ],
    })
    .then(function (answer) {
      switch (answer.action) {
        case "View All Employees":
          viewAllEmployees(function (results) {
            console.table(results);
            runEmployee();
          });
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
        case "Add Role":
          addRole();
          break;
        case "Add Department":
          addDepartment();
          break;

        case "Remove Employee":
          removeEmployee();
          break;
        // case "Update Employee Role":
        //     updateRole();
        //   break;
        // case "Update Employee Manager":
        //     updateManager();
        //   break;
        default:
          runEmployee();
      }
    });
}

function viewAllEmployees(cb) {
  const query =
    "SELECT a.id, a.first_name, a.last_name, title, name AS department, salary, CONCAT(b.first_name, ' ' , b.last_name) AS manager FROM employee a LEFT JOIN role ON a.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee b ON a.manager_id = b.id";
  connection.query(query, function (err, results) {
    return cb(results);
  });
}
function addEmployee() {
  viewRoles(function (questions) {
    viewManager(function (manager) {
      viewAllEmployees(function (results) {
        viewAllRoles(function (roles) {
          viewAllEmployeeData(function (employeeData) {
            inquirer
              .prompt([
                {
                  name: "firstname",
                  type: "input",
                  message: "What is the employees first name?",
                },
                {
                  name: "lastname",
                  type: "input",
                  message: "What is the employees last name?",
                },
                {
                  name: "role",
                  type: "list",
                  message: "What is the employees role?",
                  choices: questions,
                },
                {
                  name: "manager",
                  type: "list",
                  message: "Who is the employees manager?",
                  choices: manager,
                },
              ])

              .then(function (answer) {
                let roleID = rolesReturn(answer.role, roles);
                let managerID = managerReturn(answer.manager, employeeData);
                console.log(
                  answer.firstname,
                  answer.lastname,
                  roleID,
                  managerID
                );
                addingEmployee(
                  answer.firstname,
                  answer.lastname,
                  roleID,
                  managerID
                );
                viewAllEmployees(function (results) {
                  console.table(results);
                  runEmployee();
                });
              });
            return;
          });
        });
      });
    });
  });
}
//use inquirer to get title, salary and department id for role
function addRole() {
  const query =
    'INSERT INTO role (title, salary, department_id) VALUES ("Salesperson", 50000, 3)';
  connection.query(query, function (err, res) {
    return;
  });
  viewAllEmployees();
  runEmployee();
}
//use inquirer to get department name
function addDepartment() {
  const query = 'INSERT INTO department (name) VALUES ("Salesperson")';
  connection.query(query, function (err, res) {
    return;
  });
  viewAllEmployees();
  runEmployee();
}

function removeEmployee() {
  const query = "DELETE FROM employee WHERE id = 11";
  connection.query(query, function (err, res) {
    return;
  });

  viewAllEmployees();
  runEmployee();
}

function viewRoles(cb) {
  const query = "SELECT id, title FROM role";
  let questions = [];
  connection.query(query, function (err, data) {
    for (i = 0; i < data.length; i++) {
      questions.push(data[i].title);
    }
    return cb(questions);
  });
}

function viewManager(cb) {
  const query = "SELECT first_name, last_name FROM employee";
  let manager = ["null"];
  connection.query(query, function (err, data) {
    for (i = 0; i < data.length; i++) {
      manager.push(data[i].first_name + " " + data[i].last_name);
    }
    return cb(manager);
  });
}

function viewAllRoles(cb) {
  const query = "SELECT * FROM role";
  connection.query(query, function (err, data) {
    return cb(data);
  });
}

function rolesReturn(selectedRole, roles) {
  for (i = 0; i < roles.length; i++) {
    if (selectedRole === roles[i].title) {
      return roles[i].id;
    }
  }
}

function managerReturn(selectedManager, Manager) {
  for (i = 0; i < Manager.length; i++) {
    if (
      selectedManager ===
      Manager[i].first_name + " " + Manager[i].last_name
    ) {
      return Manager[i].id;
    }
  }
}

function viewAllEmployeeData(cb) {
  const query = "SELECT * FROM employee";
  connection.query(query, function (err, data) {
    return cb(data);
  });
}

function addingEmployee(firstname, lastname, role, manager) {
  const query =
    "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)";
  connection.query(query, [firstname, lastname, role, manager], function (
    err,
    res
  ) {
    return;
  });
}
