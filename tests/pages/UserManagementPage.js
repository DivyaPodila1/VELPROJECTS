const { expect } = require('@playwright/test');

class UserManagementPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
    }

    async goto() {
        await this.page.click('text=Admin');
        await this.page.waitForLoadState('networkidle');
        // Wait for the System Users header to be visible
        await this.page.waitForSelector('h5:has-text("System Users")');
    }

    async addUser({ username, password, employeeName, userRole, status }) {
        // Click Add button and wait for form
        await this.page.click('button:has-text("Add")');
        await this.page.waitForSelector('h6:has-text("Add User")');
        await this.page.waitForLoadState('networkidle');

        // Select User Role
        const roleDropdown = this.page.locator('.oxd-select-text').first();
        await roleDropdown.click();
        await this.page.waitForTimeout(500);
        await this.page.click(`.oxd-select-option:has-text("${userRole}")`);

        // Enter and select Employee Name
        const employeeInput = this.page.locator('.oxd-autocomplete-text-input input');
        await employeeInput.fill(employeeName);
        await this.page.waitForTimeout(2000); // Wait longer for autocomplete
        await this.page.waitForSelector('.oxd-autocomplete-dropdown');
        await this.page.waitForTimeout(1000);
        await this.page.keyboard.press('ArrowDown');
        await this.page.keyboard.press('Enter');

        // Select Status
        const statusDropdown = this.page.locator('.oxd-select-text').nth(1);
        await statusDropdown.click();
        await this.page.waitForTimeout(500);
        await this.page.click(`.oxd-select-option:has-text("${status}")`);

        // Enter Username - using more specific selector
        const usernameInput = this.page.locator('.oxd-input').nth(1);
        await usernameInput.fill(username);

        // Enter Password and Confirm Password
        const passwordInputs = this.page.locator('input[type="password"]');
        await passwordInputs.first().fill(password);
        await passwordInputs.nth(1).fill(password);

        // Take screenshot before saving
        await this.page.screenshot({ path: 'test-results/before-user-save.png', fullPage: true });

        // Click Save and wait for success message
        await this.page.click('button[type="submit"]');
        await this.page.waitForSelector('.oxd-toast');

        // Take screenshot after user creation
        await this.page.screenshot({ path: 'test-results/after-user-creation.png', fullPage: true });
    }

    async searchUser(username) {
        // Clear and fill username field
        const usernameInput = this.page.locator('.oxd-input--active').first();
        await usernameInput.clear();
        await usernameInput.fill(username);
        
        // Click Search
        await this.page.getByRole('button', { name: 'Search' }).click();
        
        // Wait for results
        await expect(this.page.locator('.oxd-table-card')).toBeVisible();
        
        // Verify user exists
        const userRow = this.page.locator('.oxd-table-card', { hasText: username });
        await expect(userRow).toBeVisible();
        return true;
    }
}

module.exports = { UserManagementPage }; 