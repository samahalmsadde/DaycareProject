# Daycare Management System
## Week 2 – Requirements Refinement

### 1. Project Idea
The Daycare Management System is a simple application designed to help daycare staff collect and organize children's registration information.

### 2. Business Problem
Daycare staff need an organized way to collect important information about children instead of relying on scattered paper forms or notes.

### 3. Target Users
The main users of the system are:
- Daycare educators
- Daycare administrators

### 4. Project Type
Proof of Concept (POC)

The project focuses on demonstrating one important workflow:

User → Child Registration Form → Data Collection → Display Registered Child

### 5. Project Scope
For the current stage, the system focuses on child registration and displaying the collected information.

A database, API, cloud storage, and other advanced features are not included in Week 2.

### 6. Functional Requirements
The system should allow the user to:

- Enter a child's information.
- Enter parent or guardian information.
- Enter emergency contact information.
- Enter allergies and medical information.
- Enter special needs information.
- Add additional notes.
- Submit the registration form.
- View the registered child after submitting the form.
- View basic statistics about registered children.

### 7. Non-Functional Requirements

#### Usability
The form should be simple and easy to understand.

#### Validation
Important fields should be required before the form can be submitted.

#### Accessibility
Labels should clearly describe the information requested from the user.

#### Reliability
The system should correctly display the information entered by the user.

### 8. Frontend Data Collection

The registration form collects:

#### Child Information
- First Name – Required
- Last Name – Required
- Date of Birth
- Gender
- Start Date
- Group/Class

#### Parent Information
- Parent/Guardian Name
- Phone Number
- Email
- Address

#### Emergency Information
- Emergency Contact Name
- Emergency Contact Phone

#### Additional Information
- Allergies
- Medical Information
- Special Needs
- Notes

### 9. Expected Result

After the user enters the child's information and submits the form:

1. The form collects the entered information.
2. The child is added to the Registered Children section.
3. The submitted information is displayed on the frontend.
4. The dashboard statistics are updated.

No backend API or database is required at this stage.

### 10. Week 2 Frontend Technology

The frontend prototype uses:

- HTML
- CSS
- JavaScript

JavaScript is used to collect the form data and update the frontend.

### 11. AI-Assisted Development

AI tools were used to support:
- Requirements refinement
- HTML structure
- CSS styling
- JavaScript development
- Form validation
- Debugging
- Code explanation

AI-generated suggestions were reviewed and tested in the browser before being accepted.