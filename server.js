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
        "View Employees",
        "View Roles",
        "View Departments",
        "Update Employee Role",
        "Add Employee",
        "Add Role",
        "Add Department",
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
        case "Add Employee":
          addEmployee();
          break;
        case "Add Role":
          addRole();
          break;
        case "Add Department":
          addDepartment();
          break;
        case "Update Employee Role":
          updateRole();
          break;
        case "View Employees":
          viewEmployees();
          break;
        case "View Departments":
          viewDepartments();
          break;
        case "View Roles":
          viewRolesGenerator();
          break;
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

function viewEmployees() {
  const query =
    "SELECT CONCAT(first_name, ' ' , last_name) AS employees FROM employee";
  connection.query(query, function (err, res) {
    console.table(res);
    runEmployee();
  });
  return;
}

function viewDepartments() {
  const query = "SELECT CONCAT(name) AS departments FROM department";
  connection.query(query, function (err, res) {
    console.table(res);
    runEmployee();
  });
  return;
}

function viewAllDepartments(cb) {
  const query = "SELECT * FROM department";
  connection.query(query, function (err, res) {
    return cb(res);
  });
}

function addRole() {
  viewAllDepartments(function (data) {
    let tempDepartment = data;
    let department = [];
    for (i = 0; i < tempDepartment.length; i++) {
      department.push(tempDepartment[i].name);
    }
    inquirer
      .prompt([
        {
          name: "title",
          type: "input",
          message: "What is the title of the new role?",
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary?",
        },
        {
          name: "departmentID",
          type: "list",
          message: "What is the role's department?",
          choices: department,
        },
      ])

      .then(function (answer) {
        let departmentSelect = [];
        for (i = 0; i < tempDepartment.length; i++) {
          if (answer.departmentID === tempDepartment[i].name) {
            departmentSelect.push(tempDepartment[i].id);
          }
        }
        const query =
          "INSERT INTO role (title, salary, department_id) VALUES (?,?, ?)";
        connection.query(
          query,
          [answer.title, parseInt(answer.salary), departmentSelect[0]],
          function (err, res) {
            return;
          }
        );
        viewAllEmployees(function (results) {
          console.table(results);
          runEmployee();
        });
      });
  });
}
function addDepartment() {
  inquirer
    .prompt([
      {
        name: "name",
        type: "input",
        message: "What department would you like to add?",
      },
    ])

    .then(function (answer) {
      const query = "INSERT INTO department (name) VALUES (?)";
      connection.query(query, [answer.name], function (err, res) {
        return;
      });
      viewAllEmployees(function (results) {
        console.table(results);
        runEmployee();
      });
    });
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

function updateRole() {
  viewAllRoles(function (roles) {
    let tempRoles = [];
    for (i = 0; i < roles.length; i++) {
      tempRoles.push(roles[i].title);
    }
    viewAllEmployeeData(function (employeeData) {
      let employees = [];
      for (i = 0; i < employeeData.length; i++) {
        employees.push(
          employeeData[i].first_name + " " + employeeData[i].last_name
        );
      }
      inquirer
        .prompt([
          {
            name: "roleUpdatePerson",
            type: "list",
            message: "Which employee role would you like to update?",
            choices: employees,
          },
          {
            name: "roleUpdate",
            type: "list",
            message: "Which role will this employee now have?",
            choices: tempRoles,
          },
        ])

        .then(function (answer) {
          let roleSelect = roles;
          let role = [];
          for (i = 0; i < roleSelect.length; i++) {
            if (answer.roleUpdate === roleSelect[i].title) {
              role.push(roleSelect[i].id);
            }
          }
          let newRole = role[0];
          console.log(newRole);

          const query =
            "UPDATE employee SET role_id = ? WHERE ? = CONCAT(first_name, ' ' , last_name)";
          connection.query(query, [newRole, answer.roleUpdatePerson], function (
            err,
            res
          ) {
            return;
          });
          viewAllEmployees(function (results) {
            console.table(results);
            runEmployee();
          });
        });
    });
  });
}

function viewRolesGenerator() {
  viewAllRoles(function (data) {
    let roles = [];
    for (let i = 0; i < data.length; i++) {
      roles.push({ roles: data[i].title });
    }
    console.table(roles);
    runEmployee();
  });
}
