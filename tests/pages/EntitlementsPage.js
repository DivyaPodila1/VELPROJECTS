const { expect } = require('@playwright/test');

class EntitlementsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async gotoAddEntitlements() {
    // Navigate to Entitlements > Add Entitlements
    await this.page.getByRole('link', { name: 'Leave' }).click();
    await expect(this.page.getByText('Entitlements', { exact: true })).toBeVisible();
    await this.page.getByText('Entitlements', { exact: true }).click();
    await this.page.getByText('Add Entitlements', { exact: true }).waitFor({ state: 'visible' });
    await this.page.getByText('Add Entitlements', { exact: true }).click();
    // Wait for the Add Leave Entitlement title to be visible
    await expect(this.page.getByText('Add Leave Entitlement', { exact: true })).toBeVisible();
  }

  async addEntitlement({ employeeName, leaveType, days }) {
    // Wait for the page to be fully loaded
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');

    // Select employee: type name and pick from dropdown
    const employeeInput = this.page.getByPlaceholder('Type for hints...');
    await expect(employeeInput).toBeVisible();
    await employeeInput.fill(employeeName);
    
    // Wait for dropdown and select first matching option
    await this.page.waitForSelector('.oxd-autocomplete-dropdown');
    const employeeOption = this.page.getByRole('option', { name: employeeName }).first();
    await expect(employeeOption).toBeVisible();
    await employeeOption.click();
    
    // Wait for the Leave Type dropdown to be visible and click it
    const leaveTypeDropdown = this.page.locator('.oxd-select-text').first();
    await expect(leaveTypeDropdown).toBeVisible();
    await leaveTypeDropdown.click();

    // Select the leave type
    const leaveTypeOption = this.page.getByRole('option', { name: leaveType });
    await expect(leaveTypeOption).toBeVisible();
    await leaveTypeOption.click();

    // Wait for form to stabilize after leave type selection
    await this.page.waitForTimeout(1000);

    // Find the entitlement input using the grid structure and label
    const entitlementContainer = this.page.locator('.oxd-grid-item').filter({ hasText: 'Entitlement' });
    await expect(entitlementContainer).toBeVisible();

    // Get all inputs and find the one in the entitlement container
    const inputs = await entitlementContainer.locator('.oxd-input').all();
    const daysInput = inputs[0];
    
    // Ensure the input is visible and interactive
    await expect(daysInput).toBeVisible();
    await daysInput.click();
    
    // Clear existing value and fill new value
    await daysInput.clear();
    await daysInput.fill(days.toString());
    
    // Take a screenshot for verification
    await this.page.screenshot({ path: 'test-results/entitlement-field.png' });

    // Submit the form
    const saveButton = this.page.getByRole('button', { name: /Save|Submit/ });
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Handle the confirmation dialog
    const confirmButton = this.page.getByRole('button', { name: 'Confirm' });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await confirmButton.click();

    // Wait for success message
    await expect(this.page.locator('.oxd-toast')).toBeVisible({ timeout: 10000 });
  }
}

module.exports = { EntitlementsPage }; 