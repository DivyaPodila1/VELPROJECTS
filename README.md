# VEL-PROJECT

## End-to-End Test Documentation

This document provides a detailed breakdown of the automated end-to-end test flow for the OrangeHRM system. The test suite validates critical business processes from employee creation to leave management, including dashboard visual checks.

### Test Environment
- Application: OrangeHRM
- Test Framework: Playwright
- Browser: Chromium (default)

### Test Data Management
- The test uses dynamic data generation for unique identifiers
- Employee IDs and usernames are timestamp-based and generated at runtime to ensure uniqueness for every test run
- Dates are automatically set to future dates to ensure test validity
- All test data is configured in `tests/test-data.js`

### Detailed Test Steps

#### 1. Admin Login
- Navigate to the OrangeHRM login page
- Enter admin credentials (username: "Admin", password: "admin123")
- Validate successful login by verifying dashboard access

#### 2. Employee Creation (PIM Module)
- Navigate to PIM > Add Employee
- Enter new employee details:
  - First Name: "Hello"
  - Last Name: "Div"
  - Employee ID: Automatically generated (format: E[MMddHHmmssSSS], unique per run)
- System captures screenshot after employee creation
- Validate successful employee creation

#### 3. Personal Information Update
- Navigate to My Info section
- Update employee's personal details:
  - First Name: "Hello"
  - Middle Name: ""
  - Last Name: "Div"
- Save personal information changes
- Validate successful information update

#### 4. User Account Creation
- Navigate to Admin > User Management
- Create new user account for the employee:
  - Username: Automatically generated (format: hello.div[MMddHHmm])
  - Password: "Test@123456"
  - User Role: ESS (Employee Self Service)
  - Status: Enabled
  - Associate with created employee
- Validate successful user account creation

#### 5. Leave Entitlement Configuration
- Navigate to Leave > Add Entitlements
- Configure leave entitlement for the new employee:
  - Leave Type: "CAN - Bereavement"
  - Entitlement: 5 days
  - Period: Next calendar year
- Validate successful entitlement addition

#### 6. Admin Logout
- Click on user dropdown in top navigation
- Select logout option
- Validate successful logout

#### 7. Employee Login
- Login with newly created employee credentials
- Username: Generated during test
- Password: "Test@123456"
- Validate successful login

#### 8. Leave Application
- From dashboard, use Quick Launch for leave application
- Fill leave request form:
  - Leave Type: "CAN - Bereavement"
  - From Date: Weekday future date (e.g., 2025-07-22)
  - To Date: Weekday future date (e.g., 2025-07-24)
  - Comments: "Automated test leave request"
- Submit leave request
- Validate successful leave application

#### 9. Employee Logout
- Employee logs out after submitting leave

#### 10. Admin Login (Again)
- Admin logs in again
- Navigates to dashboard

#### 11. Dashboard Pie Chart Verification
- Scroll to and verify the "Employee Distribution by Sub Unit" widget is visible
- Locate the pie chart canvas associated with this widget
- Take a screenshot of the pie chart before interaction
- Verify the legend label/title "Human Resources" is present
- Click on the "Human Resources" legend
- Verify the legend is visually marked as deselected (strikethrough on the label)
- Take a screenshot of the pie chart after the legend is struck off

### Test Artifacts
The test generates the following artifacts in the `test-results` directory:
- `after-employee-creation.png`: Screenshot after employee creation
- `after-save-employee.png`: Screenshot after saving employee details
- `before-save-employee.png`: Screenshot before saving employee details
- `chart-subunit-canvas0.png`: Screenshot of the pie chart before legend interaction
- `chart-subunit-after-strikeoff.png`: Screenshot of the pie chart after "Human Resources" legend is struck off

### Page Objects
The test uses a Page Object Model pattern with the following page objects:
- `LoginPage`: Handles login/logout operations
- `DashboardPage`: Dashboard interactions
- `AddEmployeePage`: Employee creation
- `MyInfoPage`: Personal information management
- `UserManagementPage`: User account management
- `EntitlementsPage`: Leave entitlement configuration

### Test Execution
To run the tests:
1. Install dependencies: `npm install`
2. Run the test suite: `npx playwright test`
3. View the test report: `npx playwright show-report`
