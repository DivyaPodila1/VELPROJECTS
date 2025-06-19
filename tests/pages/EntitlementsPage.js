const { expect } = require('@playwright/test');

class EntitlementsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async gotoAddEntitlements() {
    // Navigate to Leave
    await this.page.click('text=Leave');
    await this.page.waitForLoadState('networkidle');

    // Click Entitlements dropdown using text selector
    await this.page.click('text=Entitlements');
    await this.page.waitForTimeout(500);

    // Click Add Entitlements from the dropdown menu
    await this.page.getByRole('menuitem', { name: 'Add Entitlements' }).click();
    await this.page.waitForLoadState('networkidle');
    
    // Take screenshot of navigation
    await this.page.screenshot({ path: 'test-results/add-entitlements-page.png', fullPage: true });
  }

  async addEntitlement({ employeeName, leaveType, days }) {
    // Wait for form to be ready
    await this.page.waitForSelector('form.oxd-form');

    // Select Leave Type
    const leaveTypeDropdown = this.page.locator('.oxd-select-text').first();
    await leaveTypeDropdown.click();
    await this.page.waitForTimeout(500);
    await this.page.click(`.oxd-select-option:has-text("${leaveType}")`);

    // Enter and select Employee Name
    const employeeInput = this.page.locator('.oxd-autocomplete-text-input input');
    await employeeInput.fill(employeeName);
    await this.page.waitForTimeout(2000); // Wait longer for autocomplete
    await this.page.waitForSelector('.oxd-autocomplete-dropdown');
    await this.page.waitForTimeout(1000);
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');

    // Take screenshot before entering entitlement
    await this.page.screenshot({ path: 'test-results/entitlement-field.png', fullPage: true });

    // Enter Entitlement days
    const entitlementInput = this.page.locator('input.oxd-input').nth(1);
    await entitlementInput.fill(days.toString());

    // Click Save
    await this.page.click('button[type="submit"]');

    // Wait for the Confirm button to appear and take a screenshot
    await this.page.waitForSelector('text=Confirm', { timeout: 30000 });
    await this.page.screenshot({ path: 'test-results/before-confirm-entitlement.png', fullPage: true });

    // Click Confirm
    await this.page.click('text=Confirm');

    // Wait for success message
    await this.page.waitForSelector('.oxd-toast');

    // Take screenshot after saving entitlement
    await this.page.screenshot({ path: 'test-results/after-entitlement-save.png', fullPage: true });
  }
}

module.exports = { EntitlementsPage }; 