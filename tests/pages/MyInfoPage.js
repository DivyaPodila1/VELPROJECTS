const { expect } = require('@playwright/test');

class MyInfoPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async editMiddleName(middleName) {
    await this.page.waitForSelector('.orangehrm-edit-employee-content form');
    const middleNameInput = this.page.locator('.orangehrm-edit-employee-content form input').nth(1);
    await middleNameInput.fill(middleName);
    const saveButton = this.page.locator('.orangehrm-edit-employee-content button[type="submit"]').first();
    await saveButton.click();
    await this.page.waitForLoadState('networkidle');
    const successMessage = this.page.locator('.oxd-toast');
    await expect(successMessage).toBeVisible({ timeout: 10000 });
  }
}

module.exports = { MyInfoPage }; 