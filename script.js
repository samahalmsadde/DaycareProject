const form = document.getElementById("childForm");
const childrenList = document.getElementById("childrenList");
const submitButton = document.getElementById("submitButton");
const searchChild = document.getElementById("searchChild");

const totalChildren = document.getElementById("totalChildren");
const totalMale = document.getElementById("totalMale");
const totalFemale = document.getElementById("totalFemale");

let children = JSON.parse(localStorage.getItem("daycareChildren")) || [];
let editingIndex = null;


// GET INFORMATION FROM FORM

function getFormData() {
    return {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        dob: document.getElementById("dob").value,
        gender: document.getElementById("gender").value,
        startDate: document.getElementById("startDate").value,
        group: document.getElementById("group").value.trim(),

        parentName: document.getElementById("parentName").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        address: document.getElementById("address").value.trim(),

        emergencyName: document.getElementById("emergencyName").value.trim(),
        emergencyPhone: document.getElementById("emergencyPhone").value.trim(),

        allergies: document.getElementById("allergies").value.trim(),
        medical: document.getElementById("medical").value.trim(),
        specialNeeds: document.getElementById("specialNeeds").value.trim(),
        notes: document.getElementById("notes").value.trim()
    };
}


// SAVE DATA

function saveChildren() {
    localStorage.setItem("daycareChildren", JSON.stringify(children));
}


// DASHBOARD

function updateDashboard() {
    totalChildren.textContent = children.length;

    totalMale.textContent = children.filter(function(child) {
        return child.gender === "Male";
    }).length;

    totalFemale.textContent = children.filter(function(child) {
        return child.gender === "Female";
    }).length;
}


// REGISTER OR UPDATE CHILD

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const child = getFormData();

    if (editingIndex === null) {
        children.push(child);
        alert("Child registered successfully!");
    } else {
        children[editingIndex] = child;
        editingIndex = null;
        submitButton.textContent = "Register Child";

        alert("Child information updated successfully!");
    }

    saveChildren();
    updateDashboard();
    displayChildren(searchChild.value);

    form.reset();
});


// DISPLAY CHILDREN

function displayChildren(searchText = "") {
    childrenList.innerHTML = "";

    const search = searchText.toLowerCase().trim();

    const filteredChildren = children
        .map(function(child, index) {
            return {
                child: child,
                originalIndex: index
            };
        })
        .filter(function(item) {
            const fullName =
                (item.child.firstName + " " + item.child.lastName)
                .toLowerCase();

            return fullName.includes(search);
        });


    if (filteredChildren.length === 0) {
        childrenList.innerHTML =
            '<p class="empty-message">No children found.</p>';

        return;
    }


    filteredChildren.forEach(function(item) {
        const child = item.child;
        const index = item.originalIndex;

        const card = document.createElement("div");
        card.className = "child-card";


        const title = document.createElement("h3");

        title.textContent =
            "👶 " + child.firstName + " " + child.lastName;

        card.appendChild(title);


        addInfo(card, "Date of Birth", child.dob);
        addInfo(card, "Gender", child.gender);
        addInfo(card, "Start Date", child.startDate);
        addInfo(card, "Group/Class", child.group);

        addInfo(card, "Parent/Guardian", child.parentName);
        addInfo(card, "Phone", child.phone);
        addInfo(card, "Email", child.email);
        addInfo(card, "Address", child.address);

        addInfo(card, "Emergency Contact", child.emergencyName);
        addInfo(card, "Emergency Phone", child.emergencyPhone);

        addInfo(card, "Allergies", child.allergies);
        addInfo(card, "Medical Information", child.medical);
        addInfo(card, "Special Needs", child.specialNeeds);
        addInfo(card, "Notes", child.notes);


        const buttonArea = document.createElement("div");
        buttonArea.className = "card-buttons";


        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-button";

        editButton.addEventListener("click", function() {
            editChild(index);
        });


        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", function() {
            deleteChild(index);
        });


        buttonArea.appendChild(editButton);
        buttonArea.appendChild(deleteButton);

        card.appendChild(buttonArea);
        childrenList.appendChild(card);
    });
}


// ADD INFORMATION TO CHILD CARD

function addInfo(card, label, value) {
    const paragraph = document.createElement("p");

    const strong = document.createElement("strong");
    strong.textContent = label + ": ";

    const text = document.createTextNode(value || "N/A");

    paragraph.appendChild(strong);
    paragraph.appendChild(text);

    card.appendChild(paragraph);
}


// EDIT CHILD

function editChild(index) {
    const child = children[index];

    document.getElementById("firstName").value = child.firstName || "";
    document.getElementById("lastName").value = child.lastName || "";
    document.getElementById("dob").value = child.dob || "";
    document.getElementById("gender").value = child.gender || "";
    document.getElementById("startDate").value = child.startDate || "";
    document.getElementById("group").value = child.group || "";

    document.getElementById("parentName").value = child.parentName || "";
    document.getElementById("phone").value = child.phone || "";
    document.getElementById("email").value = child.email || "";
    document.getElementById("address").value = child.address || "";

    document.getElementById("emergencyName").value =
        child.emergencyName || "";

    document.getElementById("emergencyPhone").value =
        child.emergencyPhone || "";

    document.getElementById("allergies").value = child.allergies || "";
    document.getElementById("medical").value = child.medical || "";
    document.getElementById("specialNeeds").value =
        child.specialNeeds || "";

    document.getElementById("notes").value = child.notes || "";

    editingIndex = index;

    submitButton.textContent = "Update Child";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// DELETE CHILD

function deleteChild(index) {
    const child = children[index];

    const confirmed = confirm(
        "Are you sure you want to delete " +
        child.firstName +
        " " +
        child.lastName +
        "?"
    );

    if (confirmed) {
        children.splice(index, 1);

        saveChildren();
        updateDashboard();
        displayChildren(searchChild.value);

        editingIndex = null;

        form.reset();

        submitButton.textContent = "Register Child";
    }
}


// SEARCH

searchChild.addEventListener("input", function() {
    displayChildren(searchChild.value);
});


// LOAD PAGE

updateDashboard();
displayChildren();