const registrationForm = document.getElementById('registrationForm');
const loginForm = document.getElementById('loginForm');
const employeeForm = document.getElementById('employeeForm');
const employeeList = document.getElementById('employeeList');
const registrationSection = document.getElementById('registrationSection');
const loginSection = document.getElementById('loginSection');

let editEmployeeId = null;

window.onload = () => {
    const token = localStorage.getItem('token');
    if (token) {
        showEmployeeManagement(); 
        fetchEmployees(); 
    } else {
        loginSection.style.display = 'block'; 
    }
};

function showEmployeeManagement() {
    loginSection.style.display = 'none';
    registrationSection.style.display = 'none';
    document.getElementById('employeeManagementSection').style.display = 'block';
}

document.getElementById('showRegisterLink').addEventListener('click', (event) => {
    event.preventDefault();
    loginSection.style.display = 'none';
    registrationSection.style.display = 'block';
});

document.getElementById('showLoginLink').addEventListener('click', (event) => {
    event.preventDefault();
    registrationSection.style.display = 'none';
    loginSection.style.display = 'block';
});

registrationForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const firstName = document.getElementById('firstName').value; 
    const lastName = document.getElementById('lastName').value; 
    const email = document.getElementById('email').value; 

    const user = { username, password, firstName, lastName, email };

    const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });

    if (response.ok) {
        alert('User registered successfully!');
        registrationForm.reset();
    } else {
        
        const errorMessage = await response.text(); 
        alert(errorMessage); 
    }
});

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const user = { username, password };

    const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        alert('Login successful!');
        loginForm.reset();
        showEmployeeManagement();
        fetchEmployees();
    } else {
        const errorMessage = await response.text();
        alert('Login failed: Incorrect Username or Password');
        loginForm.reset();
    }
});


document.getElementById('logoutButton').addEventListener('click', () => {
    
    const confirmLogout = confirm('Are you sure you want to logout?');

    if (confirmLogout) {
        localStorage.removeItem('token'); 
        alert('You have been logged out successfully.');

        document.getElementById('employeeManagementSection').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('employeeManagementSection').style.display = 'none';
        }, 500); 

        loginSection.style.display = 'block';
        registrationSection.style.display = 'none';
        loginSection.style.opacity = '0';
        setTimeout(() => {
            loginSection.style.opacity = '1';
        }, 100);

    }
});


employeeForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const firstName = document.getElementById('employeeFirstName').value;
    const lastName = document.getElementById('employeeLastName').value;
    const department = document.getElementById('employeeDepartment').value;
    const email = document.getElementById('employeeEmail').value;
    const dateOfJoining = document.getElementById('employeeDateOfJoining').value;

    // Create the employee object without id for POST requests
    const employee = {
        firstName,
        lastName,
        department,
        email,
        dateOfJoining
    };

    const token = localStorage.getItem('token');
    let response;

    if (editEmployeeId) {
        // If editing, include id in the PUT request
        employee.id = editEmployeeId; // Add the id only when editing
        response = await fetch(`/api/employees/${editEmployeeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(employee)
        });
    } else {
        // If creating, do not include id in the POST request
        response = await fetch('/api/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(employee)
        });
    }

    if (response.ok) {
        fetchEmployees();
        employeeForm.reset();
        editEmployeeId = null; // Reset editEmployeeId after the operation
    } else {
        console.error('Error adding/updating employee:', response.statusText);
    }
});


async function fetchEmployees() {
    const token = localStorage.getItem('token'); 

    const response = await fetch('/api/employees', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        console.error('Error fetching employees:', response.statusText);
        return; 
    }

    const employees = await response.json();

    if (!Array.isArray(employees)) {
        console.error('Expected an array of employees, but got:', employees);
        return; 
    }

    employeeList.innerHTML = ''; 

    employees.forEach(employee => {
        const li = document.createElement('li');

        const employeeInfo = document.createElement('span');
        employeeInfo.className = 'employee-info';
        employeeInfo.textContent = `${employee.firstName} ${employee.lastName} - ${employee.department} - ${employee.email} - ${employee.dateOfJoining}`;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editEmployee(employee);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteEmployee(employee.id);

        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);

        li.appendChild(employeeInfo);
        li.appendChild(actionsDiv);

        employeeList.appendChild(li);
    });

}


function editEmployee(employee) {
    document.getElementById('employeeFirstName').value = employee.firstName;
    document.getElementById('employeeLastName').value = employee.lastName;
    document.getElementById('employeeDepartment').value = employee.department;
    document.getElementById('employeeEmail').value = employee.email;
    const dateOfJoining = employee.dateOfJoining.split('T')[0]; // Extract the date part (YYYY-MM-DD)
    document.getElementById('employeeDateOfJoining').value = dateOfJoining;

    editEmployeeId = employee.id; 
}

async function deleteEmployee(employeeId) {
    const token = localStorage.getItem('token'); 

    const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}` 
        }
    });

    if (response.ok) {
        fetchEmployees(); 
    } else {
        console.error('Error deleting employee:', response.statusText);
    }
}

fetchEmployees();
