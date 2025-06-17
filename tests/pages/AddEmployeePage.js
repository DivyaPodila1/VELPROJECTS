const { expect } = require('@playwright/test');

class AddEmployeePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.getByRole('link', { name: 'PIM' }).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.getByRole('link', { name: 'Add Employee' }).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('.orangehrm-employee-container');
  }

  async addEmployee(firstName, lastName) {
    await this.page.getByPlaceholder('First Name').fill(firstName);
    await this.page.getByPlaceholder('Last Name').fill(lastName);
    await this.page.screenshot({ path: 'test-results/before-save-employee.png' });
    await Promise.all([
      this.page.waitForResponse(response => response.url().includes('/api/v2/pim/employees') && response.status() === 200),
      this.page.getByRole('button', { name: 'Save' }).click()
    ]);
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
    await expect(this.page.locator('.orangehrm-edit-employee-name')).toContainText(`${firstName} ${lastName}`);
    await this.page.screenshot({ path: 'test-results/after-save-employee.png', fullPage: true });
  }
}

module.exports = { AddEmployeePage }; 