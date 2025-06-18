const { expect } = require('@playwright/test');

class UserManagementPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
    }

    async goto() {
        // Navigate to Admin > User Management
        await this.page.getByRole('link', { name: 'Admin' }).click();
        await expect(this.page.getByRole('heading', { name: 'System Users' })).toBeVisible();
    }

    async addUser({ username, password, employeeName, userRole, status }) {
        // Click Add button
        await this.page.getByRole('button', { name: 'Add' }).click();
        await expect(this.page.getByRole('heading', { name: 'Add User' })).toBeVisible();

        // Select User Role
        const roleDropdown = this.page.locator('.oxd-select-text').first();
        await roleDropdown.click();
        await this.page.getByRole('option', { name: userRole }).click();

        // Fill Employee Name
        const employeeInput = this.page.getByPlaceholder('Type for hints...');
        await employeeInput.fill(employeeName);
        await this.page.waitForSelector('.oxd-autocomplete-dropdown');
        await this.page.getByRole('option', { name: employeeName }).first().click();

        // Select Status
        const statusDropdown = this.page.locator('.oxd-select-text').nth(1);
        await statusDropdown.click();
        await this.page.getByRole('option', { name: status }).click();

        // Fill Username - using more specific selector
        const inputs = this.page.locator('.oxd-input--active');
        await inputs.nth(1).fill(username);  // Username is typically the second input

        // Fill Password fields using input[type='password']
        const passwordInputs = this.page.locator('input[type="password"]');
        await passwordInputs.nth(0).fill(password);  // Password
        await passwordInputs.nth(1).fill(password);  // Confirm Password

        // Save
        await this.page.getByRole('button', { name: 'Save' }).click();
        
        // Wait for success message
        await expect(this.page.locator('.oxd-toast')).toBeVisible({ timeout: 10000 });
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