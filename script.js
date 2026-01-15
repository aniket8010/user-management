//select DOM elements 
let form = document.querySelector("form");
let submitBtn = document.querySelector("#submitBtn");
let tbody = document.querySelector("#userTableBody");

let nameInput = document.querySelector("#name");
let emailInput = document.querySelector("#email");
let ageInput = document.querySelector("#age");
let roleInput = document.querySelector("#role");
let searchInput = document.querySelector("#searchInput");

let users = JSON.parse(localStorage.getItem(("users"))) || [];

let currentViewUsers = users;
let editUserId = null;

renderUsers(currentViewUsers);

//regex for inputes validation
const nameRegex = /^[A-Za-z ]{2,30}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ageRegex = /^[1-9][0-9]?$/;

//validate the inputes
function validateForm(name, email, age, role) {

    name = name.trim();
    email = email.trim();
    age = age.trim();

    let isValid = true;
    clearErrors();

    if (name === "") {
        showError("nameError", "Name is Required");
        nameInput.classList.add("error-border");
        isValid = false;
    } else if (!nameRegex.test(name)) {
        showError("nameError", "Enter a valid name");
        nameInput.classList.add("error-border");
        isValid = false;
    } else {
        nameInput.classList.remove("error-border");
    }

    if (email === "") {
        showError("emailError", "Email is Required");
        emailInput.classList.add("error-border");
        isValid = false;
    } else if (!emailRegex.test(email)) {
        showError("emailError", "Enter a valid email");
        emailInput.classList.add("error-border");
        isValid = false;
    } else {
        emailInput.classList.remove("error-border");
    }

    const ageValue = Number(age);

    if (age === "") {
        showError("ageError", "Age is required");
        ageInput.classList.add("error-border");
        isValid = false;
    } else if (!ageRegex.test(age) || ageValue < 5 || ageValue > 100) {
        showError("ageError", "Age should be between 5 and 100");
        ageInput.classList.add("error-border");
        isValid = false;
    } else {
        ageInput.classList.remove("error-border");
    }

    if (role === "") {
        showError("roleError", "Select a Role");
        roleInput.classList.add("error-border");
        isValid = false;
    } else {
        roleInput.classList.remove("error-border");
    }

    return isValid;
}

//helper functions for errors
function showError(id, message) {
    document.getElementById(id).innerText = message;
}

function clearErrors() {
    document.querySelectorAll(".error").forEach((e) => { e.innerHTML = "" })
}

//Clear red border and error message while writing
[nameInput, emailInput, ageInput].forEach((input) => {
    input.addEventListener("input", () => {
        input.classList.remove("error-border");
        showError(`${input.id}Error`, "");
        if (input.value === "") {
            input.classList.add("error-border");
            showError(`${input.id}Error`, `Enter the ${input.id}`);
        }
    });
});

roleInput.addEventListener("change", () => {
    roleInput.classList.remove("error-border");
    showError(`roleError`, "");
    if (roleInput.value === "") {
        roleInput.classList.add("error-border");
        showError(`roleError`, `Select the role`);
    }
})

function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
}

function renderUsers(userList) {

    tbody.innerHTML = "";
    if (userList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No users found</td></tr>`;
        return;
    }

    userList.forEach((user) => {
        let tr = document.createElement("tr");
        let td1 = document.createElement("td");
        let td2 = document.createElement("td");
        let td3 = document.createElement("td");
        let td4 = document.createElement("td");
        let td5 = document.createElement("td");

        td1.textContent = `${user.name}`;
        td2.textContent = `${user.email}`;
        td3.textContent = `${user.age}`;
        td4.textContent = `${user.role}`;

        let editBtn = document.createElement("button");
        editBtn.dataset.id = user.id;
        editBtn.className = "edit";
        editBtn.innerHTML = `<i class="fa-solid fa-user-pen"></i>`;

        let deleteBtn = document.createElement("button");
        deleteBtn.dataset.id = user.id;
        deleteBtn.className = "delete";
        deleteBtn.innerHTML = `<i class="fa-solid fa-user-minus"></i>`;

        deleteBtn.addEventListener("click", () => {
            deleteUser(user.id);
        })

        editBtn.addEventListener("click", () => {
            editUser(user.id);
        })
        td5.appendChild(editBtn);
        td5.appendChild(deleteBtn);

        tr.append(td1, td2, td3, td4, td5);
        tbody.appendChild(tr);
    })
}

searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value.trim().toLowerCase();

    // if search is cleared, show all users
    if (searchValue === "") {
        currentViewUsers = users;
        renderUsers(currentViewUsers);
        return;
    }

    currentViewUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue)
    );

    renderUsers(currentViewUsers);
})
function editUser(userId) {

    const user = users.find(u => u.id === userId);

    if (!user) return;

    //fill the form inputes
    nameInput.value = user.name;
    emailInput.value = user.email;
    ageInput.value = user.age;
    roleInput.value = user.role;

    editUserId = userId;

    submitBtn.textContent = "Update User";
}
function deleteUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {

        // update master list
        users = users.filter(user => user.id !== userId);
        saveUsers();

        // update current UI list
        currentViewUsers = currentViewUsers.filter(user => user.id !== userId);

        // re-render UI
        renderUsers(currentViewUsers);
    }
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    let isValid = validateForm(
        nameInput.value,
        emailInput.value,
        ageInput.value,
        roleInput.value
    );
    if (!isValid) return;

    if (editUserId === null) {
        //ADD USER
        const userObj = {
            id: Date.now(),
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            age: Number(ageInput.value.trim()),
            role: roleInput.value.trim()
        };
        users.push(userObj);

        saveUsers();
        currentViewUsers = users;
        renderUsers(currentViewUsers);
        form.reset();
    } else {
        //Edit USER
        const index = users.findIndex(u => u.id === editUserId);

        if (index !== -1) {
            users[index].name = nameInput.value.trim();
            users[index].email = emailInput.value.trim();
            users[index].age = Number(ageInput.value.trim());
            users[index].role = roleInput.value.trim();
        }

        editUserId = null;
        submitBtn.textContent = "Save User";

        saveUsers();
        // currentViewUsers = users;
        renderUsers(currentViewUsers);
        form.reset();
    }

})