const { expect } = require('@playwright/test');

class LeavePage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
    }

    async gotoMyLeave() {
        // Click the main Leave menu item
        await this.page.locator('.oxd-main-menu-item').filter({ hasText: 'Leave' }).click();
        await this.page.waitForLoadState('networkidle');
        
        // Try multiple selectors for My Leave since the structure might vary
        try {
            // First try the top navigation tab
            const myLeaveTab = this.page.locator('.oxd-topbar-body-nav-tab-item').filter({ hasText: 'My Leave' });
            if (await myLeaveTab.isVisible()) {
                await myLeaveTab.click();
            } else {
                // If not found, try the menuitem in the dropdown
                const leaveMenuToggle = this.page.locator('.oxd-topbar-body-nav-tab').filter({ hasText: 'Leave' });
                await leaveMenuToggle.click();
                await this.page.getByRole('menuitem', { name: 'My Leave' }).click();
            }
        } catch (error) {
            // If both attempts fail, try direct navigation
            await this.page.goto('/web/index.php/leave/viewMyLeaveList');
        }

        // Wait for the page to be ready
        await this.page.waitForLoadState('networkidle');
        await expect(this.page.getByRole('heading', { name: 'My Leave' })).toBeVisible();
        
        // Additional wait for the table to be loaded
        await this.page.waitForSelector('.oxd-table', { state: 'visible', timeout: 10000 });
    }

    async verifyLeaveRequest({ fromDate, toDate, leaveType, status = 'Pending' }) {
        // Take screenshot of initial state
        await this.page.screenshot({ path: 'test-results/my-leave-initial.png' });

        // Wait for the leave records table with increased timeout
        await this.page.waitForSelector('.oxd-table', { timeout: 10000 });
        
        // Wait for table to be populated
        await this.page.waitForSelector('.oxd-table-card', { timeout: 10000 });

        // Function to convert YYYY-MM-DD to YYYY-DD-MM format
        const convertDateFormat = (date) => {
            const [year, month, day] = date.split('-');
            return `${year}-${day}-${month}`;
        };

        const tableFromDate = convertDateFormat(fromDate);
        const tableToDate = convertDateFormat(toDate);
        const expectedDateRange = `${tableFromDate} to ${tableToDate}`;

        // Find the leave request row
        const leaveRow = this.page.locator('.oxd-table-card', {
            has: this.page.locator('.oxd-table-cell', { hasText: expectedDateRange })
        });

        // Wait for the row to be visible and take a screenshot
        await expect(leaveRow).toBeVisible({ timeout: 10000 });
        await leaveRow.screenshot({ path: 'test-results/leave-request-found.png' });

        // Verify other details
        await expect(leaveRow.getByText(leaveType)).toBeVisible();
        await expect(leaveRow.getByText(new RegExp(`${status}.*`))).toBeVisible();
    }

    async checkLeaveBalance(leaveType) {
        // Click the main Leave menu item
        await this.page.locator('.oxd-main-menu-item').filter({ hasText: 'Leave' }).click();
        await this.page.waitForLoadState('networkidle');
        
        // Try to find and click My Entitlements in the top navigation
        try {
            // First try the top navigation tab
            const entitlementsTab = this.page.locator('.oxd-topbar-body-nav-tab-item').filter({ hasText: 'Entitlements' });
            if (await entitlementsTab.isVisible()) {
                await entitlementsTab.click();
                await this.page.getByRole('menuitem', { name: 'My Entitlements' }).click();
            } else {
                // If not found, try direct navigation
                await this.page.goto('/web/index.php/leave/viewMyLeaveEntitlements');
            }
        } catch (error) {
            // If both attempts fail, try direct navigation
            await this.page.goto('/web/index.php/leave/viewMyLeaveEntitlements');
        }

        await this.page.waitForLoadState('networkidle');

        // Take screenshot of initial state
        await this.page.screenshot({ path: 'test-results/leave-balance-page.png' });

        // Wait for the table
        await this.page.waitForSelector('.oxd-table');
        
        // Find the row with the specific leave type
        const leaveRow = this.page.locator('.oxd-table-card', {
            has: this.page.locator('.oxd-table-cell', { hasText: leaveType })
        });
        await expect(leaveRow).toBeVisible();

        // Take screenshot of leave balance
        await this.page.screenshot({ path: 'test-results/leave-balance.png' });
        
        return leaveRow;
    }

    async approveLeave({ fromDate, toDate, employeeName }) {
        // Click the main Leave menu item
        await this.page.locator('.oxd-main-menu-item').filter({ hasText: 'Leave' }).click();
        await this.page.waitForLoadState('networkidle');
        
        // Try to find and click Leave List in the top navigation
        try {
            const leaveListTab = this.page.locator('.oxd-topbar-body-nav-tab-item').filter({ hasText: 'Leave List' });
            if (await leaveListTab.isVisible()) {
                await leaveListTab.click();
            } else {
                // If not found, try direct navigation
                await this.page.goto('/web/index.php/leave/viewLeaveList');
            }
        } catch (error) {
            // If navigation fails, try direct URL
            await this.page.goto('/web/index.php/leave/viewLeaveList');
        }

        await this.page.waitForLoadState('networkidle');
        
        // Wait for the search form
        await this.page.waitForSelector('form');
        
        // Search for the employee's leave
        const employeeInput = this.page.getByPlaceholder('Type for hints...');
        await employeeInput.fill(employeeName);
        await this.page.waitForSelector('.oxd-autocomplete-dropdown');
        await this.page.getByRole('option', { name: employeeName }).first().click();
        
        // Click Search
        await this.page.getByRole('button', { name: 'Search' }).click();
        await this.page.waitForLoadState('networkidle');
        
        // Wait for results and find the leave request
        await this.page.waitForSelector('.oxd-table');
        const leaveRow = this.page.locator('.oxd-table-card', {
            has: this.page.locator('.oxd-table-cell', { hasText: fromDate })
        });
        
        // Click the approve button
        const approveButton = leaveRow.getByRole('button', { name: 'Approve' });
        await expect(approveButton).toBeVisible();
        await approveButton.click();
        
        // Confirm approval in the dialog
        const confirmButton = this.page.getByRole('button', { name: 'Confirm' });
        await expect(confirmButton).toBeVisible();
        await confirmButton.click();
        
        // Wait for success message
        await expect(this.page.locator('.oxd-toast')).toBeVisible({ timeout: 30000 });
    }
}

module.exports = { LeavePage }; 