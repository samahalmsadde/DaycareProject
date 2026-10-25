"use strict";

/* =========================================

   DAYCARE MANAGEMENT SYSTEM

   Complete Frontend JavaScript

========================================= */

// STORAGE KEYS

const STORAGE = {

  children: "daycareChildren",

  records: "daycareDailyRecords",

  staff: "daycareStaff",

  payments: "daycarePayments"

};

// HELPERS

const $ = (id) => document.getElementById(id);

function today() {

  const date = new Date();

  const local = new Date(

    date.getTime() - date.getTimezoneOffset() * 60000

  );

  return local.toISOString().slice(0, 10);

}

function makeId() {

  if (window.crypto && crypto.randomUUID) {

    return crypto.randomUUID();

  }

  return Date.now().toString(36) +

    Math.random().toString(36).slice(2);

}

function readData(key) {

  try {

    const value = JSON.parse(localStorage.getItem(key) || "[]");

    return Array.isArray(value) ? value : [];

  } catch (error) {

    console.error("Could not read:", key, error);

    return [];

  }

}

function saveData(key, value) {

  try {

    localStorage.setItem(key, JSON.stringify(value));

    return true;

  } catch (error) {

    console.error("Save failed:", error);

    alert("Could not save. Check browser storage.");

    return false;

  }

}

function escapeHTML(value) {

  return String(value ?? "").replace(/[&<>"']/g, (char) => {

    const replacements = {

      "&": "&amp;",

      "<": "&lt;",

      ">": "&gt;",

      '"': "&quot;",

      "'": "&#39;"

    };

    return replacements[char];

  });

}

function money(value) {

  return new Intl.NumberFormat("en-CA", {

    style: "currency",

    currency: "CAD"

  }).format(Number(value) || 0);

}

function childName(child) {

  return [

    child.firstName || "",

    child.lastName || ""

  ].join(" ").trim() || "Unnamed Child";

}

function findChild(id) {

  return children.find(

    (child) => String(child.id) === String(id)

  );

}

function nameById(id) {

  const child = findChild(id);

  return child ? childName(child) : "Deleted Child";

}

function emptyMessage(message) {

  return `<p class="empty-message">${escapeHTML(message)}</p>`;

}

function field(id) {

  return $(id).value.trim();

}

function setField(id, value) {

  $(id).value = value ?? "";

}

function displayValue(value) {

  return escapeHTML(value || "Not recorded");

}

function showSection(id) {

  $(id).scrollIntoView({

    behavior: "smooth",

    block: "start"

  });

}

function optionElement(value, label) {

  const option = document.createElement("option");

  option.value = value;

  option.textContent = label;

  return option;

}

// LOAD DATA

let children = readData(STORAGE.children);

let dailyRecords = readData(STORAGE.records);

let staff = readData(STORAGE.staff);

let payments = readData(STORAGE.payments);

let editingChildId = null;

let editingStaffId = null;

let editingPaymentId = null;

// MIGRATE CHILDREN FROM OLDER VERSIONS

let childrenChanged = false;

children = children.map((child) => {

  if (!child.id) {

    child.id = makeId();

    childrenChanged = true;

  }

  return child;

});

if (childrenChanged) {

  saveData(STORAGE.children, children);

}

// MIGRATE OLDER DAILY RECORDS

let recordsChanged = false;

dailyRecords = dailyRecords.map((record) => {

  if (!record.id) {

    record.id = makeId();

    recordsChanged = true;

  }

  if (!record.date && record.recordDate) {

    record.date = record.recordDate;

    recordsChanged = true;

  }

  if (!record.childId && record.child) {

    const match = children.find(

      (child) => childName(child) === record.child

    );

    if (match) {

      record.childId = match.id;

      recordsChanged = true;

    }

  }

  return record;

});

if (recordsChanged) {

  saveData(STORAGE.records, dailyRecords);

}

// DASHBOARD

function updateDashboard() {

  $("totalChildren").textContent = children.length;

  $("totalMale").textContent = children.filter(

    (child) => String(child.gender).toLowerCase() === "male"

  ).length;

  $("totalFemale").textContent = children.filter(

    (child) => String(child.gender).toLowerCase() === "female"

  ).length;

  const todayRecords = dailyRecords.filter(

    (record) => record.date === today()

  );

  $("presentToday").textContent = todayRecords.filter(

    (record) => record.attendance === "Present"

  ).length;

  $("absentToday").textContent = todayRecords.filter(

    (record) => record.attendance === "Absent"

  ).length;

  $("totalStaff").textContent = staff.length;

  const paidTotal = payments

    .filter((payment) => payment.status === "Paid")

    .reduce(

      (sum, payment) => sum + Number(payment.amount || 0),

      0

    );

  $("totalPayments").textContent = money(paidTotal);

}

// CHILD REGISTRATION

const childFields = [

  "firstName",

  "lastName",

  "dob",

  "gender",

  "startDate",

  "group",

  "parentName",

  "phone",

  "email",

  "address",

  "emergencyName",

  "emergencyPhone",

  "allergies",

  "medical",

  "specialNeeds",

  "notes"

];

$("childForm").addEventListener("submit", (event) => {

  event.preventDefault();

  const data = {};

  childFields.forEach((id) => {

    data[id] = field(id);

  });

  if (editingChildId !== null) {

    const index = children.findIndex(

      (child) => String(child.id) === String(editingChildId)

    );

    if (index !== -1) {

      children[index] = {

        ...children[index],

        ...data

      };

    }

  } else {

    children.push({

      id: makeId(),

      ...data

    });

  }

  if (!saveData(STORAGE.children, children)) return;

  cancelChildEdit();

  refreshAll();

  alert("Child information saved successfully.");

});

function cancelChildEdit() {

  editingChildId = null;

  $("childForm").reset();

  $("childSubmit").textContent = "Register Child";

  $("cancelChildEdit").classList.add("hidden");

}

$("cancelChildEdit").addEventListener(

  "click",

  cancelChildEdit

);

function editChild(id) {

  const child = findChild(id);

  if (!child) return;

  editingChildId = child.id;

  childFields.forEach((fieldId) => {

    setField(fieldId, child[fieldId]);

  });

  $("childSubmit").textContent = "Update Child";

  $("cancelChildEdit").classList.remove("hidden");

  showSection("registration");

}

function deleteChild(id) {

  const child = findChild(id);

  if (!child) return;

  const message =

    "Delete this child and all associated daily records " +

    "and payments? This cannot be undone.";

  if (!confirm(message)) return;

  const nextChildren = children.filter(

    (item) => String(item.id) !== String(id)

  );

  const nextRecords = dailyRecords.filter(

    (record) => String(record.childId) !== String(id)

  );

  const nextPayments = payments.filter(

    (payment) => String(payment.childId) !== String(id)

  );

  // Preserve all existing data if a write fails.

  const backup = {

    children: localStorage.getItem(STORAGE.children),

    records: localStorage.getItem(STORAGE.records),

    payments: localStorage.getItem(STORAGE.payments)

  };

  try {

    localStorage.setItem(

      STORAGE.children,

      JSON.stringify(nextChildren)

    );

    localStorage.setItem(

      STORAGE.records,

      JSON.stringify(nextRecords)

    );

    localStorage.setItem(

      STORAGE.payments,

      JSON.stringify(nextPayments)

    );

  } catch (error) {

    Object.entries(backup).forEach(([key, value]) => {

      const storageKey = STORAGE[key];

      if (value === null) {

        localStorage.removeItem(storageKey);

      } else {

        localStorage.setItem(storageKey, value);

      }

    });

    alert("Deletion failed. Existing data was restored.");

    return;

  }

  children = nextChildren;

  dailyRecords = nextRecords;

  payments = nextPayments;

  cancelChildEdit();

  refreshAll();

}

function displayChildren() {
  const search = field("searchChild").toLowerCase();

  const filtered = children.filter((child) => {

    const searchable = [

      childName(child),

      child.group,

      child.parentName

    ].join(" ").toLowerCase();

    return searchable.includes(search);

  });

  const container = $("childrenList");

  if (!filtered.length) {

    container.innerHTML = emptyMessage(

      "No matching children found."

    );

    return;

  }

  container.innerHTML = filtered.map((child) => `

    <article class="data-card">

      <h3>${escapeHTML(childName(child))}</h3>

      <p><strong>Gender:</strong>

        ${displayValue(child.gender)}</p>

      <p><strong>Date of Birth:</strong>

        ${displayValue(child.dob)}</p>

      <p><strong>Start Date:</strong>

        ${displayValue(child.startDate)}</p>

      <p><strong>Group:</strong>

        ${displayValue(child.group)}</p>

      <p><strong>Parent:</strong>

        ${displayValue(child.parentName)}</p>

      <p><strong>Phone:</strong>

        ${displayValue(child.phone)}</p>

      <p><strong>Email:</strong>

        ${displayValue(child.email)}</p>

      <p><strong>Address:</strong>

        ${displayValue(child.address)}</p>

      <p><strong>Emergency Contact:</strong>

        ${displayValue(child.emergencyName)}</p>

      <p><strong>Emergency Phone:</strong>

        ${displayValue(child.emergencyPhone)}</p>

      <p><strong>Allergies:</strong>

        ${displayValue(child.allergies)}</p>

      <p><strong>Medical Information:</strong>

        ${displayValue(child.medical)}</p>

      <p><strong>Special Needs:</strong>

        ${displayValue(child.specialNeeds)}</p>

      <p><strong>Notes:</strong>

        ${displayValue(child.notes)}</p>

      <div class="card-actions">

        <button type="button" class="edit-button"

          data-action="edit-child"

          data-id="${escapeHTML(child.id)}">

          Edit

        </button>

        <button type="button" class="delete-button"

          data-action="delete-child"

          data-id="${escapeHTML(child.id)}">

          Delete

        </button>

      </div>

    </article>

  `).join("");

}

$("searchChild").addEventListener(

  "input",

  displayChildren

);

// CHILD DROPDOWN MENUS

function updateChildSelectors() {

  const configurations = [

    ["dailyChild", "Select child"],

    ["historyChild", "All children"],

    ["paymentChild", "Select child"],

    ["reportChild", "All children"]

  ];

  configurations.forEach(([id, placeholder]) => {

    const select = $(id);

    const previousValue = select.value;

    select.replaceChildren(

      optionElement("", placeholder)

    );

    children.forEach((child) => {

      select.appendChild(

        optionElement(child.id, childName(child))

      );

    });

    if ([...select.options].some(

      (option) => option.value === previousValue

    )) {

      select.value = previousValue;

    }

  });

}

// DAILY RECORD HELPERS

function findRecord(childId, date) {

  return dailyRecords.find(

    (record) =>

      String(record.childId) === String(childId) &&

      record.date === date

  );

}

function saveDailyRecords() {

  return saveData(STORAGE.records, dailyRecords);

}

// BULK ATTENDANCE

function displayAttendance() {

  const date = $("attendanceDate").value;

  const container = $("attendanceList");

  if (!date) {

    container.innerHTML = emptyMessage(

      "Please select an attendance date."

    );

    return;

  }

  if (!children.length) {

    container.innerHTML = emptyMessage(

      "Register children before marking attendance."

    );

    return;

  }

  container.replaceChildren();

  children.forEach((child) => {

    const existing = findRecord(child.id, date);

    const row = document.createElement("div");

    row.className = "attendance-row";

    const name = document.createElement("span");

    name.textContent = childName(child);

    const select = document.createElement("select");

    select.dataset.childId = child.id;

    select.append(

      optionElement("", "Not marked"),

      optionElement("Present", "Present"),

      optionElement("Absent", "Absent")

    );

    select.value = existing?.attendance || "";

    row.append(name, select);

    container.appendChild(row);

  });

}

$("attendanceDate").addEventListener(

  "change",

  displayAttendance

);

$("saveAttendance").addEventListener("click", () => {

  const date = $("attendanceDate").value;

  if (!date) {

    alert("Please select a date.");

    return;

  }

  const selections = [

    ...$("attendanceList").querySelectorAll(

      "select[data-child-id]"

    )

  ];

  if (!selections.length) {

    alert("No children available.");

    return;

  }

  let savedCount = 0;

  selections.forEach((select) => {

    const childId = select.dataset.childId;

    const attendance = select.value;

// Unmarked children are not automatically absent.

    if (!attendance) return;

    const existing = findRecord(childId, date);

    if (existing) {

      existing.attendance = attendance;

    } else {

      dailyRecords.push({

        id: makeId(),

        childId,

        date,

        attendance,

        meals: "",

        snacks: "",

        napStart: "",

        napEnd: "",

        activities: "",

        incidents: "",

        dailyNotes: ""

      });

    }

    savedCount++;

  });

  if (!savedCount) {

    alert("Please mark at least one child.");

    return;

  }

  if (!saveDailyRecords()) {

    dailyRecords = readData(STORAGE.records);

    return;

  }

  refreshAll();

  alert(`${savedCount} attendance records saved.`);

});

// DAILY CARE

const dailyFields = [

  "attendance",

  "meals",

  "snacks",

  "napStart",

  "napEnd",

  "activities",

  "incidents",

  "dailyNotes"

];

function loadDailyRecord() {

  const childId = $("dailyChild").value;

  const date = $("recordDate").value;

  dailyFields.forEach((id) => setField(id, ""));

  if (!childId || !date) return;

  const record = findRecord(childId, date);

  if (record) {

    dailyFields.forEach((id) => {

      setField(id, record[id]);

    });

  }

}

$("dailyChild").addEventListener(

  "change",

  loadDailyRecord

);

$("recordDate").addEventListener(

  "change",

  loadDailyRecord

);

$("dailyForm").addEventListener("submit", (event) => {

  event.preventDefault();

  const childId = $("dailyChild").value;

  const date = $("recordDate").value;

  if (!childId || !date) {

    alert("Please select a child and date.");

    return;

  }

  const values = {};

  dailyFields.forEach((id) => {

    values[id] = field(id);

  });

  const existing = findRecord(childId, date);

  if (existing) {

    Object.assign(existing, values);

  } else {

    dailyRecords.push({

      id: makeId(),

      childId,

      date,

      ...values

    });

  }

  if (!saveDailyRecords()) {

    dailyRecords = readData(STORAGE.records);

    return;

  }

  refreshAll();

  alert("Daily care record saved successfully.");

});

$("clearDailyForm").addEventListener("click", () => {

  $("dailyForm").reset();

  $("recordDate").value = today();

});

// DAILY RECORD HISTORY

function displayHistory() {

  const selectedChild = $("historyChild").value;

  const selectedDate = $("historyDate").value;

  const filtered = dailyRecords

    .filter((record) => {

      const matchesChild =

        !selectedChild ||

        String(record.childId) === String(selectedChild);

      const matchesDate =

        !selectedDate || record.date === selectedDate;

      return matchesChild && matchesDate;

    })

    .sort((a, b) =>

      String(b.date || "").localeCompare(

        String(a.date || "")

      )

    );

  const container = $("recordsList");

  if (!filtered.length) {

    container.innerHTML = emptyMessage(

      "No daily records found."

    );

    return;

  }

  container.innerHTML = filtered.map((record) => `

    <article class="data-card">

      <h3>${escapeHTML(nameById(record.childId))}</h3>

      <p><strong>Date:</strong>

        ${displayValue(record.date)}</p>

      <p><strong>Attendance:</strong>

        ${displayValue(record.attendance)}</p>

      <p><strong>Meals:</strong>

        ${displayValue(record.meals)}</p>

      <p><strong>Snacks:</strong>

        ${displayValue(record.snacks)}</p>

      <p><strong>Nap:</strong>

        ${displayValue(record.napStart)}

        –

        ${displayValue(record.napEnd)}</p>

      <p><strong>Activities:</strong>

        ${displayValue(record.activities)}</p>

      <p><strong>Incidents:</strong>

        ${displayValue(record.incidents)}</p>

      <p><strong>Notes:</strong>

        ${displayValue(record.dailyNotes)}</p>

      <div class="card-actions">

        <button type="button" class="edit-button"

          data-action="edit-record"

          data-id="${escapeHTML(record.id)}">

          Edit

        </button>
        <button type="button" class="delete-button"

          data-action="delete-record"

          data-id="${escapeHTML(record.id)}">

          Delete

        </button>

      </div>

    </article>

  `).join("");

}

function editRecord(id) {

  const record = dailyRecords.find(

    (item) => String(item.id) === String(id)

  );

  if (!record) return;

  setField("dailyChild", record.childId);

  setField("recordDate", record.date);

  loadDailyRecord();

  showSection("dailyCare");

}

function deleteRecord(id) {

  if (!confirm("Delete this daily record?")) return;

  const previous = dailyRecords;

  dailyRecords = dailyRecords.filter(

    (record) => String(record.id) !== String(id)

  );

  if (!saveDailyRecords()) {

    dailyRecords = previous;

    return;

  }

  refreshAll();

}

$("historyChild").addEventListener(

  "change",

  displayHistory

);

$("historyDate").addEventListener(

  "change",

  displayHistory

);

$("clearHistoryFilters").addEventListener(

  "click",

  () => {

    $("historyChild").value = "";

    $("historyDate").value = "";

    displayHistory();

  }

);

// STAFF MANAGEMENT

const staffFields = [

  "staffName",

  "staffPosition",

  "staffPhone",

  "staffEmail",

  "staffStart",

  "staffGroup"

];

$("staffForm").addEventListener("submit", (event) => {

  event.preventDefault();

  const data = {};

  staffFields.forEach((id) => {

    data[id] = field(id);

  });

  if (editingStaffId !== null) {

    const index = staff.findIndex(

      (member) =>

        String(member.id) === String(editingStaffId)

    );

    if (index !== -1) {

      staff[index] = {

        ...staff[index],

        ...data

      };

    }

  } else {

    staff.push({

      id: makeId(),

      ...data

    });

  }

  if (!saveData(STORAGE.staff, staff)) {

    staff = readData(STORAGE.staff);

    return;

  }

  cancelStaffEdit();

  refreshAll();

  alert("Staff information saved.");

});

function cancelStaffEdit() {

  editingStaffId = null;

  $("staffForm").reset();

  $("staffSubmit").textContent = "Add Staff Member";

  $("cancelStaffEdit").classList.add("hidden");

}

$("cancelStaffEdit").addEventListener(

  "click",

  cancelStaffEdit

);

function displayStaff() {

  const container = $("staffList");

  if (!staff.length) {

    container.innerHTML = emptyMessage(

      "No staff members registered."

    );

    return;

  }

  container.innerHTML = staff.map((member) => `

    <article class="data-card">

      <h3>${displayValue(member.staffName)}</h3>

      <p><strong>Position:</strong>

        ${displayValue(member.staffPosition)}</p>

      <p><strong>Phone:</strong>

        ${displayValue(member.staffPhone)}</p>

      <p><strong>Email:</strong>

        ${displayValue(member.staffEmail)}</p>

      <p><strong>Start Date:</strong>

        ${displayValue(member.staffStart)}</p>

      <p><strong>Assigned Group:</strong>

        ${displayValue(member.staffGroup)}</p>

      <div class="card-actions">

        <button type="button" class="edit-button"

          data-action="edit-staff"

          data-id="${escapeHTML(member.id)}">

          Edit

        </button>

        <button type="button" class="delete-button"

          data-action="delete-staff"

          data-id="${escapeHTML(member.id)}">

          Delete

        </button>

      </div>

    </article>

  `).join("");

}

function editStaff(id) {

  const member = staff.find(

    (item) => String(item.id) === String(id)

  );

  if (!member) return;

  editingStaffId = member.id;

  staffFields.forEach((fieldId) => {

    setField(fieldId, member[fieldId]);

  });

  $("staffSubmit").textContent = "Update Staff";

  $("cancelStaffEdit").classList.remove("hidden");

  showSection("staffSection");

}

function deleteStaff(id) {

  if (!confirm("Delete this staff member?")) return;

  const previous = staff;

  staff = staff.filter(

    (member) => String(member.id) !== String(id)

  );

  if (!saveData(STORAGE.staff, staff)) {

    staff = previous;

    return;

  }

  cancelStaffEdit();

  refreshAll();

}

// PAYMENT MANAGEMENT

const paymentFields = [

  "paymentChild",

  "paymentDate",

  "paymentAmount",

  "paymentStatus",

  "paymentMethod",

  "paymentDescription"

];

$("paymentForm").addEventListener("submit", (event) => {

  event.preventDefault();

  const amount = Number($("paymentAmount").value);

  if (!Number.isFinite(amount) || amount <= 0) {

    alert("Enter a valid payment amount.");

    return;

  }

  const data = {

    childId: field("paymentChild"),

    date: field("paymentDate"),

    amount,

    status: field("paymentStatus"),

    method: field("paymentMethod"),

    description: field("paymentDescription")

  };

  if (editingPaymentId !== null) {

    const index = payments.findIndex(

      (payment) =>

        String(payment.id) === String(editingPaymentId)

    );

    if (index !== -1) {

      payments[index] = {

        ...payments[index],

        ...data

      };

    }

  } else {

    payments.push({

      id: makeId(),

      ...data

    });

  }

  if (!saveData(STORAGE.payments, payments)) {

    payments = readData(STORAGE.payments);
    return;

  }

  cancelPaymentEdit();

  refreshAll();

  alert("Payment record saved.");

});

function cancelPaymentEdit() {

  editingPaymentId = null;

  $("paymentForm").reset();

  $("paymentDate").value = today();

  $("paymentSubmit").textContent = "Save Payment";

  $("cancelPaymentEdit").classList.add("hidden");

}

$("cancelPaymentEdit").addEventListener(

  "click",

  cancelPaymentEdit

);

function displayPayments() {

  const container = $("paymentsList");

  if (!payments.length) {

    container.innerHTML = emptyMessage(

      "No payment records found."

    );

    return;

  }

  const sorted = [...payments].sort(

    (a, b) => String(b.date).localeCompare(String(a.date))

  );

  container.innerHTML = sorted.map((payment) => `

    <article class="data-card">

      <h3>${escapeHTML(nameById(payment.childId))}</h3>

      <p><strong>Date:</strong>

        ${displayValue(payment.date)}</p>

      <p><strong>Amount:</strong>

        ${money(payment.amount)}</p>

      <p><strong>Status:</strong>

        ${displayValue(payment.status)}</p>

      <p><strong>Method:</strong>

        ${displayValue(payment.method)}</p>

      <p><strong>Description:</strong>

        ${displayValue(payment.description)}</p>

      <div class="card-actions">

        <button type="button" class="edit-button"

          data-action="edit-payment"

          data-id="${escapeHTML(payment.id)}">

          Edit

        </button>

        <button type="button" class="delete-button"

          data-action="delete-payment"

          data-id="${escapeHTML(payment.id)}">

          Delete

        </button>

      </div>

    </article>

  `).join("");

}

function editPayment(id) {

  const payment = payments.find(

    (item) => String(item.id) === String(id)

  );

  if (!payment) return;

  editingPaymentId = payment.id;

  setField("paymentChild", payment.childId);

  setField("paymentDate", payment.date);

  setField("paymentAmount", payment.amount);

  setField("paymentStatus", payment.status);

  setField("paymentMethod", payment.method);

  setField("paymentDescription", payment.description);

  $("paymentSubmit").textContent = "Update Payment";

  $("cancelPaymentEdit").classList.remove("hidden");

  showSection("paymentsSection");

}

function deletePayment(id) {

  if (!confirm("Delete this payment record?")) return;

  const previous = payments;

  payments = payments.filter(

    (payment) => String(payment.id) !== String(id)

  );

  if (!saveData(STORAGE.payments, payments)) {

    payments = previous;

    return;

  }

  cancelPaymentEdit();

  refreshAll();

}

// REPORT GENERATION

function generateReport() {

  const date = $("reportDate").value;

  const selectedChild = $("reportChild").value;

  const output = $("reportOutput");

  if (!date) {

    alert("Please select a report date.");

    return;

  }

  const selectedChildren = children.filter(

    (child) =>

      !selectedChild ||

      String(child.id) === String(selectedChild)

  );

  if (!selectedChildren.length) {

    output.innerHTML = emptyMessage(

      "No children available for this report."

    );

    return;

  }

  const recordsForDate = dailyRecords.filter(

    (record) =>

      record.date === date &&

      selectedChildren.some(

        (child) =>

          String(child.id) === String(record.childId)

      )

  );

  const present = recordsForDate.filter(

    (record) => record.attendance === "Present"

  ).length;

  const absent = recordsForDate.filter(

    (record) => record.attendance === "Absent"

  ).length;

  const unmarked = selectedChildren.length -

    present - absent;

  let html = `

    <h2>Daycare Daily Report</h2>

    <p><strong>Date:</strong> ${escapeHTML(date)}</p>

    <p><strong>Total Children:</strong>

      ${selectedChildren.length}</p>

    <p><strong>Present:</strong> ${present}</p>

    <p><strong>Absent:</strong> ${absent}</p>

    <p><strong>Not Marked:</strong> ${unmarked}</p>

    <h3>Individual Records</h3>

  `;

  selectedChildren.forEach((child) => {
    const record = findRecord(child.id, date);

    html += `

      <div class="report-entry">

        <h3>${escapeHTML(childName(child))}</h3>

        <p><strong>Group:</strong>

          ${displayValue(child.group)}</p>

        <p><strong>Attendance:</strong>

          ${record

            ? displayValue(record.attendance || "Not marked")

            : "Not marked"}</p>

        <p><strong>Meals:</strong>

          ${displayValue(record?.meals)}</p>

        <p><strong>Snacks:</strong>

          ${displayValue(record?.snacks)}</p>

        <p><strong>Nap:</strong>

          ${displayValue(record?.napStart)}

          –

          ${displayValue(record?.napEnd)}</p>

        <p><strong>Activities:</strong>

          ${displayValue(record?.activities)}</p>

        <p><strong>Incidents:</strong>

          ${displayValue(record?.incidents)}</p>

        <p><strong>Daily Notes:</strong>

          ${displayValue(record?.dailyNotes)}</p>

      </div>

    `;

  });

  output.innerHTML = html;

}

$("generateReport").addEventListener(

  "click",

  generateReport

);

$("printReport").addEventListener("click", () => {

  if (!$("reportDate").value) {

    alert("Select a report date first.");

    return;

  }

  generateReport();

  window.print();

});

// BACKUP EXPORT

$("exportBackup").addEventListener("click", () => {

  const backup = {

    application: "Daycare Management System",

    version: 2,

    exportedAt: new Date().toISOString(),

    children,

    dailyRecords,

    staff,

    payments

  };

  const json = JSON.stringify(backup, null, 2);

  const blob = new Blob([json], {

    type: "application/json"

  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = `daycare-backup-${today()}.json`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);

});

// BACKUP RESTORE

$("importBackup").addEventListener("click", async () => {

  const file = $("importFile").files[0];

  if (!file) {

    alert("Please select a JSON backup file.");

    return;

  }

  let backup;

  try {

    backup = JSON.parse(await file.text());

  } catch (error) {

    alert("Invalid JSON file.");

    return;

  }

  const required = [

    "children",

    "dailyRecords",

    "staff",

    "payments"

  ];

  const valid =

    backup &&

    backup.application === "Daycare Management System" &&

    required.every((key) => Array.isArray(backup[key]));

  if (!valid) {

    alert("This is not a compatible backup file.");

    return;

  }

  const confirmed = confirm(

    "Restore this backup? All current project data " +

    "will be replaced."

  );

  if (!confirmed) return;

  const oldValues = {};

  Object.values(STORAGE).forEach((key) => {

    oldValues[key] = localStorage.getItem(key);

  });

  try {

    localStorage.setItem(

      STORAGE.children,

      JSON.stringify(backup.children)

    );

    localStorage.setItem(

      STORAGE.records,

      JSON.stringify(backup.dailyRecords)

    );

    localStorage.setItem(

      STORAGE.staff,

      JSON.stringify(backup.staff)

    );

    localStorage.setItem(

      STORAGE.payments,

      JSON.stringify(backup.payments)

    );

  } catch (error) {

    Object.entries(oldValues).forEach(([key, value]) => {

      if (value === null) {

        localStorage.removeItem(key);

      } else {

        localStorage.setItem(key, value);

      }

    });

    alert("Restore failed. Previous data was restored.");

    return;

  }

  children = readData(STORAGE.children);

  dailyRecords = readData(STORAGE.records);

  staff = readData(STORAGE.staff);

  payments = readData(STORAGE.payments);

  cancelChildEdit();

  cancelStaffEdit();

  cancelPaymentEdit();

  $("importFile").value = "";

  refreshAll();

  alert("Backup restored successfully.");

});

// CARD BUTTON ACTIONS

document.addEventListener("click", (event) => {

  const button = event.target.closest(

    "button[data-action]"

  );

  if (!button) return;
  const action = button.dataset.action;

  const id = button.dataset.id;

  switch (action) {

    case "edit-child":

      editChild(id);

      break;

    case "delete-child":

      deleteChild(id);

      break;

    case "edit-record":

      editRecord(id);

      break;

    case "delete-record":

      deleteRecord(id);

      break;

    case "edit-staff":

      editStaff(id);

      break;

    case "delete-staff":

      deleteStaff(id);

      break;

    case "edit-payment":

      editPayment(id);

      break;

    case "delete-payment":

      deletePayment(id);

      break;

  }

});

// REFRESH ALL SECTIONS

function refreshAll() {

  updateDashboard();

  updateChildSelectors();

  displayChildren();

  displayAttendance();

  displayHistory();

  displayStaff();

  displayPayments();

}

// INITIALIZE APPLICATION

function initializeApp() {

  const currentDate = today();

  $("attendanceDate").value = currentDate;

  $("recordDate").value = currentDate;

  $("paymentDate").value = currentDate;

  $("reportDate").value = currentDate;

  refreshAll();

  console.log(

    "Daycare Management System initialized successfully."

  );

}

initializeApp();
