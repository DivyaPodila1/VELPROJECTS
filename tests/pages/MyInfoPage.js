const { expect } = require('@playwright/test');

class MyInfoPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.getByRole('link', { name: 'My Info' }).click();
    await expect(this.page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
  }

  async editPersonalDetails({ firstName, middleName, lastName }) {
    // Wait for form to be interactive
    await this.page.waitForLoadState('networkidle');

    // Fill in name fields
    await this.page.getByRole('textbox', { name: 'First Name' }).fill(firstName);
    if (middleName) {
      await this.page.getByRole('textbox', { name: 'Middle Name' }).fill(middleName);
    }
    await this.page.getByRole('textbox', { name: 'Last Name' }).fill(lastName);

    // Select Gender as Male using a more specific selector
    const genderSection = this.page.locator('.oxd-form-row').filter({ hasText: 'Gender' });
    await expect(genderSection).toBeVisible();
    
    // Find the Male radio button by its label and input combination
    const maleLabel = genderSection.locator('label').filter({ hasText: /^Male$/ });
    await expect(maleLabel).toBeVisible();
    await maleLabel.click();

    // Save - using more specific selector for the Personal Details form
    const saveButton = this.page.getByRole('button', { name: 'Save' }).first();
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Wait for success message
    await expect(this.page.locator('.oxd-toast')).toBeVisible({ timeout: 10000 });
  }
}

module.exports = { MyInfoPage }; 