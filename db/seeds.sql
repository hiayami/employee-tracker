INSERT INTO department (name) VALUES 
    ('Engineering'), ('Finance'), ('Sales')
;

INSERT INTO role (title, salary, department_id) VALUES
    ('Software Engineer', 100000, 1), 
    ('Accountant', 85000, 2),
    ('Sales Lead', 73000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
    ('John', 'Doe', 2, null),
    ('Chad', 'Broman', 1, null),
    ('Becky', 'Beckster', 3, null);
