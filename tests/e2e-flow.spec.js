const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { DashboardPage } = require('./pages/DashboardPage');
const { MyInfoPage } = require('./pages/MyInfoPage');
const { AddEmployeePage } = require('./pages/AddEmployeePage');
const { EntitlementsPage } = require('./pages/EntitlementsPage');
const { UserManagementPage } = require('./pages/UserManagementPage');
const testData = require('./test-data');

test.describe('OrangeHRM E2E Test Suite', () => {
    test('Complete E2E Flow', async ({ page }) => {
        // 1. Login as Admin
        const loginPage = new LoginPage(page);
        await loginPage.login(testData.adminUser.username, testData.adminUser.password);

        // 2. Add New Employee in PIM
        const addEmployeePage = new AddEmployeePage(page);
        await addEmployeePage.goto();
        await addEmployeePage.addEmployee(
            testData.employee.firstName,
            testData.employee.lastName,
            testData.employee.employeeId()
        );
        // Take a screenshot after employee creation
        await page.screenshot({ path: 'test-results/after-employee-creation.png', fullPage: true });

        // 3. Update My Info
        const myInfoPage = new MyInfoPage(page);
        await myInfoPage.goto();
        await myInfoPage.editPersonalDetails({
            firstName: testData.employee.firstName,
            middleName: testData.employee.middleName,
            lastName: testData.employee.lastName
        });

        // 4. Create User Account in Admin
        const userManagementPage = new UserManagementPage(page);
        await userManagementPage.goto();
        await userManagementPage.addUser({
            username: testData.employee.username,
            password: testData.employee.password,
            employeeName: testData.employee.fullName,
            userRole: testData.employee.userRole,
            status: 'Enabled'
        });

        // 5. Add Leave Entitlement for Div Automation
        const entitlementsPage = new EntitlementsPage(page);
        await entitlementsPage.gotoAddEntitlements();
        await entitlementsPage.addEntitlement({
            employeeName: testData.employee.fullName,
            leaveType: testData.leaveEntitlement.leaveType,
            days: testData.leaveEntitlement.entitlementDays
        });

        // 6. Logout as Admin
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.logout();

        // 7. Login as Div Automation
        await loginPage.login(testData.employee.username, testData.employee.password);

        // 8. Apply Leave as Div Automation from Dashboard Quick Launch
        await dashboardPage.applyLeaveFromDashboard({
            leaveType: testData.leaveApplication.leaveType,
            fromDate: testData.leaveApplication.fromDate,
            toDate: testData.leaveApplication.toDate,
            comment: testData.leaveApplication.comment
        });

        // Logout as employee
        await dashboardPage.logout();

        // Login as Admin again
        await loginPage.login(testData.adminUser.username, testData.adminUser.password);

        // Go to dashboard
        await dashboardPage.goto();

        // Verify that the Employee Distribution by Sub Unit pie chart is visible
        const chartTitle = page.locator('div.orangehrm-dashboard-widget-name >> text="Employee Distribution by Sub Unit"');
        await chartTitle.scrollIntoViewIfNeeded();
        await expect(chartTitle).toBeVisible();

        // After scrolling, look for any visible canvas in the viewport
        const visibleCanvases = page.locator('canvas');
        let foundVisible = false;
        const count = await visibleCanvases.count();
        for (let i = 0; i < count; i++) {
          const canvas = visibleCanvases.nth(i);
          if (await canvas.isVisible()) {
            foundVisible = true;
            // Take screenshot of the first visible canvas after scroll
            await canvas.screenshot({ path: `chart-subunit-canvas${i}.png` });
            break;
          }
        }
        expect(foundVisible).toBeTruthy();

        // Verify the label/title 'Human Resources' is present
        const hrLegend = page.locator('li:has-text("Human Resources")');
        await expect(hrLegend).toBeVisible();
        // Click on 'Human Resources' legend
        await hrLegend.click();
        // Wait for the legend to be visually marked as deselected (strikethrough) on the <span>
        const hrLegendSpan = hrLegend.locator('span[title="Human Resources"]');
        await expect(hrLegendSpan).toHaveCSS('text-decoration', /line-through/);
        // Take screenshot of the pie chart after strikeoff
        if (foundVisible) {
          await visibleCanvases.first().screenshot({ path: 'chart-subunit-after-strikeoff.png' });
        }
    });
}); 