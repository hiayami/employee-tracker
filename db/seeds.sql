INSERT INTO department (name) VALUES 
    ('Engineering'), ('Finance'), ('Sales'), ('Legal')
;

INSERT INTO role (title, salary, department_id) VALUES
    ('Software Engineer', 100000, 1), 
    ('Accountant', 85000, 2),
    ('Sales Lead', 73000, 3),
    ('Lawyer', 125000, 4),
    ('Lead Software Engineer', 130000, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
    ('John', 'Doe', 2, null),
    ('Chad', 'Broman', 1, 5),
    ('Becky', 'Beckster', 3, null),
    ('Diane', 'Lawman', 4, null),
    ('Susan', 'Bossman', 5, null)
