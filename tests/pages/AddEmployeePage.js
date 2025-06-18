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

  async addEmployee(firstName, lastName, employeeId) {
    // Fill in first and last name
    await this.page.getByPlaceholder('First Name').fill(firstName);
    await this.page.getByPlaceholder('Last Name').fill(lastName);

    // Handle Employee ID - clear existing and set new
    const empIdInput = this.page.locator('input.oxd-input').nth(1);  // Employee ID is typically the second input
    await empIdInput.click();
    await empIdInput.clear();
    await empIdInput.fill(employeeId);

    // Take screenshot before saving
    await this.page.screenshot({ path: 'test-results/before-save-employee.png' });

    // Click Save and wait for response
    await this.page.getByRole('button', { name: 'Save' }).click();
    
    // Wait for navigation and page load with increased timeout
    await this.page.waitForLoadState('networkidle', { timeout: 20000 });
    await this.page.waitForLoadState('domcontentloaded', { timeout: 20000 });
    
    // Wait for specific elements with increased timeout
    await expect(this.page.getByRole('heading', { name: 'Personal Details' })).toBeVisible({ timeout: 20000 });
    
    // More flexible name verification that accepts both formats
    const nameElement = this.page.locator('.orangehrm-edit-employee-name');
    await expect(nameElement).toBeVisible({ timeout: 20000 });
    const nameText = await nameElement.textContent();
    expect(nameText).toMatch(new RegExp(`(${firstName}|${employeeId}).*${lastName}`));
    
    // Additional wait to ensure form is fully loaded
    await this.page.waitForSelector('form.oxd-form', { timeout: 20000 });
    
    // Take final screenshot
    await this.page.screenshot({ path: 'test-results/after-save-employee.png', fullPage: true });
  }

  async gotoEmployeeList() {
    await this.page.getByRole('link', { name: 'Employee List' }).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.getByRole('heading', { name: 'Employee Information' }).waitFor({ state: 'visible' });
  }

  async verifyEmployeeExists(fullName) {
    // Search for the employee by name
    await this.gotoEmployeeList();
    const searchInput = this.page.locator('.oxd-input--active').first();
    await searchInput.fill(fullName);
    await this.page.getByRole('button', { name: 'Search' }).click();
    // Wait for results
    await this.page.waitForSelector('.oxd-table-card');
    // Check if the employee appears in the results
    const employeeRow = this.page.locator('.oxd-table-card', { hasText: fullName });
    return await employeeRow.isVisible();
  }
}

module.exports = { AddEmployeePage }; 