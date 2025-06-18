/**
 * Test data for OrangeHRM E2E Testing
 * All dates are set in the future to ensure validity
 * All data is matched to actual UI fields in OrangeHRM demo site
 */

const { DateTime } = require('luxon');

// Generate future dates to ensure test validity
const futureDate = DateTime.now().plus({ months: 1 }); // Next month for leave application
const nextYear = DateTime.now().plus({ years: 1 });
const startDate = futureDate.toFormat('yyyy-MM-dd');
const leaveDate = futureDate.toFormat('yyyy-MM-dd');
const periodStart = nextYear.startOf('year').toFormat('yyyy-MM-dd'); // Jan 1st next year
const periodEnd = nextYear.endOf('year').toFormat('yyyy-MM-dd');   // Dec 31st next year

// Generate a unique employee ID with timestamp
const generateEmployeeId = () => {
    const timestamp = DateTime.now().toFormat('MMddHHmm');
    return `E${timestamp}`;
};

// Generate a unique username with timestamp
const timestamp = DateTime.now().toFormat('MMddHHmm');
const uniqueUsername = `div.auto${timestamp}`;

const testData = {
    // Admin credentials (constant in demo environment)
    adminUser: {
        username: "Admin",
        password: "admin123",
        fullName: "Orange Test"
    },

    // Employee data matching all available fields in PIM
    employee: {
        firstName: "Div",
        middleName: "Test",
        lastName: "Automation",
        fullName: "Div Automation", // Used in dropdowns and searches
        employeeId: generateEmployeeId(),
        gender: "Male", // Matches dropdown option
        maritalStatus: "Single", // Matches dropdown option
        nationality: "American", // Matches dropdown option
        dateOfBirth: "1990-01-01",
        driverLicense: "DL123456",
        licenseExpiry: futureDate.plus({ years: 2 }).toFormat('yyyy-MM-dd'),
        bloodType: "O+",
        jobTitle: "QA Engineer", // Matches job titles in demo
        subUnit: "Quality Assurance", // Matches organization units
        location: "HQ - CA, USA", // Matches locations in demo
        status: "Full-Time", // Matches employment status options
        startDate: startDate,
        username: uniqueUsername, // Unique username for each test run
        password: "Test@123456", // Meets password requirements
        userRole: "ESS"
    },

    // Contact details
    contactDetails: {
        street1: "123 Test Street",
        street2: "Suite 456",
        city: "San Francisco",
        state: "California",
        zip: "94105",
        country: "United States",
        homePhone: "415-555-0123",
        mobile: "415-555-0124",
        workPhone: "415-555-0125",
        workEmail: "john.automation@orangehrm.com",
        otherEmail: "john.test@example.com"
    },

    // Emergency contact
    emergencyContact: {
        name: "Jane Emergency",
        relationship: "Spouse",
        homePhone: "415-555-0126",
        mobile: "415-555-0127",
        workPhone: "415-555-0128"
    },

    // Leave entitlement data
    leaveEntitlement: {
        employeeName: "Div Automation",
        leaveType: "CAN - Bereavement",
        entitlementDays: 5,
        period: `${periodStart} to ${periodEnd}` // Next year's period
    },

    // Leave application data
    leaveApplication: {
        employeeName: "Div Automation",
        leaveType: "CAN - Bereavement",
        fromDate: "2025-06-22",
        toDate: "2025-06-24",
        partialDays: "None",
        duration: "Full Day",
        comment: "Automated test leave request"
    }
};

module.exports = testData; 