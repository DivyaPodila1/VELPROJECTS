const { test } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { DashboardPage } = require('./pages/DashboardPage');
const { MyInfoPage } = require('./pages/MyInfoPage');
const { AddEmployeePage } = require('./pages/AddEmployeePage');

test('E2E: Login, Dashboard, My Info, Add Employee', async ({ page }) => {
  // Login
  const loginPage = new LoginPage(page);
  await loginPage.login('Admin', 'admin123');

  // Dashboard
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.goto();

  // My Info
  await dashboardPage.gotoMyInfo();
  const myInfoPage = new MyInfoPage(page);
  await myInfoPage.editMiddleName('Test');

  // Add Employee
  const addEmployeePage = new AddEmployeePage(page);
  await addEmployeePage.goto();
  await addEmployeePage.addEmployee('Test', 'User');
}); 