const { expect } = require('@playwright/test');

class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async goto() {
    // Wait for page to be ready
    await this.page.waitForLoadState('networkidle');
    
    // Click Dashboard link and wait for navigation
    const dashboardLink = this.page.getByRole('link', { name: 'Dashboard' });
    await expect(dashboardLink).toBeVisible({ timeout: 10000 });
    await dashboardLink.click();
    
    // Wait for navigation with increased timeout
    await this.page.waitForURL(/.*dashboard.*/, { timeout: 20000 });
    
    // Wait for Dashboard heading and content to be visible
    await expect(this.page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10000 });
    await this.page.waitForLoadState('networkidle');

    // Take screenshot to verify we're on the dashboard
    await this.page.screenshot({ path: 'test-results/dashboard-loaded.png' });
  }

  async gotoMyInfo() {
    await this.page.getByRole('link', { name: 'My Info' }).click();
    // Accept both possible URLs
    await expect(this.page).toHaveURL(/\/web\/index\.php\/pim\/view(MyDetails|PersonalDetails\/empNumber\/\d+)/);
    await expect(this.page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
  }

  async applyLeave({ leaveType = null, fromDate, toDate, comment = '' }) {
    // Click on Apply Leave button
    await this.page.getByRole('button', { name: 'Apply Leave' }).click();
    // Wait for the Apply Leave form to appear
    await this.page.waitForSelector('form');

    // Optionally select leave type if needed
    if (leaveType) {
      // Find the leave type dropdown using the form structure
      const leaveTypeDropdown = this.page.locator('.oxd-select-text').first();
      await expect(leaveTypeDropdown).toBeVisible();
      await leaveTypeDropdown.click();

      // Select the leave type from dropdown
      const leaveTypeOption = this.page.getByRole('option', { name: leaveType });
      await expect(leaveTypeOption).toBeVisible();
      await leaveTypeOption.click();
    }

    // Fill From and To dates
    await this.page.getByLabel('From Date').fill(fromDate);
    await this.page.getByLabel('To Date').fill(toDate);

    // Fill comment if provided
    if (comment) {
      await this.page.getByLabel('Comment').fill(comment);
    }

    // Click Apply/Submit button
    await this.page.getByRole('button', { name: /Apply|Submit/ }).click();
    // Wait for confirmation or toast
    await this.page.waitForSelector('.oxd-toast', { timeout: 10000 });
    await expect(this.page.locator('.oxd-toast')).toBeVisible();
  }

  async applyLeaveViaCalendar({ employeeName, leaveType, fromDay, toDay, comment = '' }) {
    // Navigate to Leave module
    await this.page.getByRole('link', { name: 'Leave' }).click();
    await this.page.waitForLoadState('networkidle');

    // Click Apply in the top menu
    await this.page.getByRole('link', { name: 'Apply' }).click();
    await this.page.waitForLoadState('networkidle');

    // Wait for the Apply Leave form
    await this.page.waitForSelector('form');
    await this.page.waitForLoadState('networkidle');

    // Select leave type
    const leaveTypeDropdown = this.page.locator('.oxd-select-text').first();
    await expect(leaveTypeDropdown).toBeVisible();
    await leaveTypeDropdown.click();

    // Wait for dropdown options and select the leave type
    await this.page.waitForSelector('.oxd-select-dropdown');
    const leaveTypeOption = this.page.getByRole('option', { name: leaveType });
    await expect(leaveTypeOption).toBeVisible();
    await leaveTypeOption.click();

    // Wait for form to update after leave type selection
    await this.page.waitForTimeout(1000);

    // Open the From Date calendar and select the date
    const fromDateInput = this.page.locator('input[placeholder="yyyy-mm-dd"]').first();
    await expect(fromDateInput).toBeVisible();
    await fromDateInput.click();
    const fromDateOption = this.page.locator('.oxd-calendar-date').getByText(fromDay);
    await expect(fromDateOption).toBeVisible();
    await fromDateOption.click();

    // Open the To Date calendar and select the date
    const toDateInput = this.page.locator('input[placeholder="yyyy-mm-dd"]').nth(1);
    await expect(toDateInput).toBeVisible();
    await toDateInput.click();
    const toDateOption = this.page.locator('.oxd-calendar-date').getByText(toDay);
    await expect(toDateOption).toBeVisible();
    await toDateOption.click();

    // Fill comment if provided
    if (comment) {
      const commentTextarea = this.page.locator('textarea.oxd-textarea');
      await expect(commentTextarea).toBeVisible();
      await commentTextarea.fill(comment);
    }

    // Take screenshot before submitting
    await this.page.screenshot({ path: 'test-results/before-leave-submit.png' });

    // Click Apply/Submit button
    const submitButton = this.page.getByRole('button', { name: /Apply|Submit/ });
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Wait for success message
    await expect(this.page.locator('.oxd-toast')).toBeVisible({ timeout: 10000 });
  }

  async applyLeaveFromDashboard({ leaveType, fromDate, toDate, comment = '' }) {
    // Click on Apply Leave in Quick Launch and wait for navigation
    await this.page.getByRole('button', { name: 'Apply Leave' }).click();
    await this.page.waitForLoadState('networkidle');
    
    // Wait for form and its elements to be fully loaded
    await this.page.waitForSelector('form');
    await this.page.waitForLoadState('networkidle');

    // Select leave type with retry logic
    const leaveTypeDropdown = this.page.locator('.oxd-select-text').first();
    await expect(leaveTypeDropdown).toBeVisible();
    
    let retries = 3;
    while (retries > 0) {
      try {
        await leaveTypeDropdown.click();
        await this.page.waitForSelector('.oxd-select-dropdown', { timeout: 5000 });
        const leaveTypeOption = this.page.getByRole('option', { name: leaveType });
        await expect(leaveTypeOption).toBeVisible();
        await leaveTypeOption.click();
        await this.page.waitForTimeout(1000); // Brief wait for dropdown to close
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await this.page.waitForTimeout(1000);
      }
    }

    // Handle date inputs with a more robust approach
    const dateInputs = this.page.locator('.oxd-date-input input');
    
    // Fill From Date
    const fromDateInput = dateInputs.first();
    await expect(fromDateInput).toBeVisible();
    await fromDateInput.click();
    await fromDateInput.press('Control+a');
    await fromDateInput.press('Backspace');
    await fromDateInput.type(fromDate, { delay: 100 });
    await this.page.keyboard.press('Tab');
    
    // Check for date validation errors
    const dateError = this.page.locator('.oxd-date-input-error');
    const hasError = await dateError.isVisible();
    if (hasError) {
      const errorText = await dateError.textContent();
      throw new Error(`Date validation error: ${errorText}`);
    }

    // Fill To Date
    const toDateInput = dateInputs.nth(1);
    await expect(toDateInput).toBeVisible();
    await toDateInput.click();
    await toDateInput.press('Control+a');
    await toDateInput.press('Backspace');
    await toDateInput.type(toDate, { delay: 100 });
    await this.page.keyboard.press('Tab');

    // Fill comment if provided
    if (comment) {
      const commentTextarea = this.page.locator('textarea.oxd-textarea');
      await expect(commentTextarea).toBeVisible();
      await commentTextarea.fill(comment);
    }

    // Take screenshot before submitting
    await this.page.screenshot({ path: 'test-results/before-leave-submit.png' });

    // Check for any validation errors
    const errorMessages = this.page.locator('.oxd-input-field-error-message');
    const errorCount = await errorMessages.count();
    if (errorCount > 0) {
      const errors = await errorMessages.allTextContents();
      throw new Error(`Form validation errors: ${errors.join(', ')}`);
    }

    // Submit the form with retry logic
    const submitButton = this.page.getByRole('button', { name: /Apply|Submit/ });
    await expect(submitButton).toBeVisible();
    
    retries = 3;
    while (retries > 0) {
      try {
        await submitButton.click();
        await this.page.waitForLoadState('networkidle');
        
        // Wait for success toast with increased timeout
        await expect(this.page.locator('.oxd-toast')).toBeVisible({ timeout: 30000 });
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          // On final retry, check for error messages
          const errorMessages = await this.page.locator('.oxd-input-field-error-message').allTextContents();
          if (errorMessages.length > 0) {
            throw new Error(`Leave application failed: ${errorMessages.join(', ')}`);
          }
          throw error;
        }
        await this.page.waitForTimeout(2000);
      }
    }
  }

  async logout() {
    // Click the user profile dropdown (top right)
    await this.page.locator('.oxd-userdropdown-tab').click();
    // Click the Logout option
    await this.page.getByRole('menuitem', { name: 'Logout' }).click();
    // Wait for login page to appear
    await this.page.waitForURL(/auth\/login/);
  }
}

module.exports = { DashboardPage }; 