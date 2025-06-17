const { expect } = require('@playwright/test');

class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(this.page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  }

  async gotoMyInfo() {
    await this.page.getByRole('link', { name: 'My Info' }).click();
    // Accept both possible URLs
    await expect(this.page).toHaveURL(/\/web\/index\.php\/pim\/view(MyDetails|PersonalDetails\/empNumber\/\d+)/);
    await expect(this.page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
  }
}

module.exports = { DashboardPage }; 