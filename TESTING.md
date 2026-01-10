# Testing Guide

This document describes the comprehensive test suite for the Bus Charter Quote Request Website.

## Overview

We have implemented a robust testing infrastructure to ensure code quality and prevent regressions. The test suite covers:

- **Unit Tests**: Individual function testing with edge cases
- **Integration Tests**: Component interaction testing
- **XSS Protection**: Security validation
- **Edge Cases**: Boundary conditions and error handling
- **Automated CI/CD**: Continuous testing on every push

## Test Statistics

- **Total Tests**: 91+
- **Test Files**: 2
- **Coverage Target**: 75%+
- **Test Framework**: Jest with jsdom

## Running Tests

### Prerequisites

```bash
# Install Node.js (v18 or later)
# Install dependencies
npm install
```

### Run All Tests

```bash
npm test
```

### Watch Mode (for development)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

### CI Mode (for automated testing)

```bash
npm run test:ci
```

## Test Structure

```
tests/
├── setup.js           # Test configuration and mocks
├── script.test.js     # Tests for main form functionality
└── admin.test.js      # Tests for admin dashboard
```

## What's Tested

### script.js Functions

#### `generateQuoteId()`
- ✅ Generates unique IDs with correct format (QUOTE-YYYYMMDD-XXXXX)
- ✅ Includes current date in YYYYMMDD format
- ✅ Creates unique IDs on multiple calls (100+ tested)
- ✅ Uses only uppercase alphanumeric characters

#### `calculateBookingHours(startTime, endTime, endsNextDay)`
- ✅ Calculates hours within same day correctly
- ✅ Handles minutes and fractional hours
- ✅ Handles overnight trips when `endsNextDay` is true
- ✅ Handles midnight correctly
- ✅ Handles same start and end time
- ✅ Handles 15-minute intervals
- ✅ Returns object with hours, minutes, and totalMinutes

#### `validateFormData(formData)`
- ✅ Validates complete and correct form data
- ✅ Catches missing required fields
- ✅ Validates email format (multiple formats tested)
- ✅ Validates passengers is positive
- ✅ Validates trip days have required fields
- ✅ Requires at least one trip day

#### `formatRouteInformation(routeInfo, passengers)`
- ✅ Formats single day trip correctly
- ✅ Handles multi-day trips
- ✅ Handles zero values gracefully
- ✅ Formats duration correctly for hours and minutes
- ✅ Handles null routeInfo
- ✅ Shows overnight trip indicators

#### `formatTripDaysForEmail(tripDays)`
- ✅ Formats single trip day correctly
- ✅ Formats multiple trip days
- ✅ Handles multiple dropoff locations
- ✅ Handles empty tripDays array
- ✅ Indicates overnight trips
- ✅ Formats pickup and dropoff locations clearly

### admin.js Functions

#### `escapeHtml(text)`
- ✅ Escapes HTML special characters
- ✅ Prevents XSS attacks
- ✅ Handles empty strings
- ✅ Handles null/undefined
- ✅ Preserves normal text

#### `getStatusColor(status)`
- ✅ Returns correct color object for each status (Sent, Draft, Accepted, Declined)
- ✅ Has consistent structure (bg, text, border properties)
- ✅ Handles unknown statuses with default
- ✅ Handles null/undefined

#### `getQuoteIdentifier(quote)`
- ✅ Returns quoteId if present
- ✅ Falls back to submittedAt if no quoteId
- ✅ Handles missing fields
- ✅ Prioritizes quoteId over submittedAt

#### `checkMultipleStates(locations)`
- ✅ Detects multiple states in comma-delimited addresses
- ✅ Returns false for single state
- ✅ Handles locations without state abbreviations
- ✅ Requires proper address format (", STATE ")
- ✅ Handles empty arrays

#### `parseTripDaysText(text)`
- ✅ Parses single trip day correctly
- ✅ Parses multiple trip days
- ✅ Parses multiple dropoff locations
- ✅ Handles empty text
- ✅ Handles malformed text gracefully
- ✅ Parses overnight trips
- ✅ Requires both pickup and dropoffs

#### `extractRouteInfoFromNotes(notesText)`
- ✅ Extracts route information from notes
- ✅ Returns null if no route info found
- ✅ Separates route info from user notes
- ✅ Handles empty/null/undefined notes

#### `parseRouteInfoText(text)`
- ✅ Parses route information correctly
- ✅ Handles missing fields gracefully
- ✅ Parses trip day information
- ✅ Returns proper structure

#### `parseGoogleSheetsData(rows)`
- ✅ Parses valid Google Sheets data
- ✅ Skips header row
- ✅ Handles empty rows
- ✅ Handles multiple data rows
- ✅ Handles missing values
- ✅ Handles malformed rows gracefully

#### `buildSheetsApiUrl(spreadsheetId, sheetName, apiKey)`
- ✅ Builds correct API URL
- ✅ Encodes sheet names with spaces
- ✅ Handles special characters in sheet names
- ✅ Includes cache-busting timestamp
- ✅ Throws errors for invalid inputs

## Edge Cases Covered

### Input Validation
- Empty strings
- Null values
- Undefined values
- Special characters (<, >, &, ", ')
- Malformed data
- Missing required fields

### Time Calculations
- Midnight (00:00)
- End of day (23:59)
- Overnight trips
- Same start/end time
- 15-minute intervals

### Data Parsing
- Empty arrays
- Single items
- Multiple items
- Malformed text
- Mixed valid/invalid data

### Security
- XSS attack prevention
- HTML injection
- Script tag injection
- Event handler injection

## Continuous Integration

Tests run automatically on:
- Every push to `main`, `develop`, or `copilot/**` branches
- Every pull request to `main` or `develop`
- Manual trigger via GitHub Actions

### GitHub Actions Workflow

Location: `.github/workflows/test.yml`

Features:
- Runs on Ubuntu Latest
- Tests against Node.js 18.x and 20.x
- Generates coverage reports
- Comments test results on PRs
- Uploads coverage to Codecov (optional)

## Writing New Tests

### Test File Structure

```javascript
/**
 * Unit Tests for [file-name.js] - [Description]
 * Tests all critical functions with edge cases
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');

describe('functionName', () => {
    test('should [description of what it tests]', () => {
        // Arrange
        const input = 'test input';
        
        // Act
        const result = functionName(input);
        
        // Assert
        expect(result).toBe('expected output');
    });
});
```

### Best Practices

1. **Test One Thing**: Each test should verify one specific behavior
2. **Descriptive Names**: Use clear test names that describe what's being tested
3. **AAA Pattern**: Arrange, Act, Assert
4. **Edge Cases**: Always test boundary conditions
5. **Error Handling**: Test both success and failure paths
6. **Mocking**: Mock external dependencies (APIs, DOM, etc.)
7. **Isolation**: Tests should not depend on each other

### Example Test

```javascript
describe('calculateBookingHours', () => {
    test('should handle overnight trips when endsNextDay is true', () => {
        // Arrange
        const startTime = '22:00';
        const endTime = '02:00';
        const endsNextDay = true;
        
        // Act
        const result = calculateBookingHours(startTime, endTime, endsNextDay);
        
        // Assert
        expect(result.hours).toBe(4);
        expect(result.minutes).toBe(0);
        expect(result.totalMinutes).toBe(240);
    });
});
```

## Troubleshooting

### Tests Fail After Code Changes

1. Run tests in watch mode: `npm run test:watch`
2. Check the error message carefully
3. Update tests if function signatures changed
4. Ensure mocks are up to date in `tests/setup.js`

### Coverage Below Threshold

1. Identify uncovered lines: `npm run test:coverage`
2. Open `coverage/lcov-report/index.html` in browser
3. Add tests for uncovered code paths
4. Focus on critical functions first

### Tests Pass Locally But Fail in CI

1. Check Node.js version compatibility
2. Ensure all dependencies are in `package.json`
3. Check for environment-specific code
4. Look at CI logs for detailed error messages

## Coverage Goals

We aim for:
- **75%+ overall coverage**
- **75%+ function coverage**
- **70%+ branch coverage**
- **75%+ line coverage**

Current coverage is visible in:
- Terminal after running `npm run test:coverage`
- `coverage/lcov-report/index.html` (detailed)
- GitHub Actions workflow results
- Codecov dashboard (if configured)

## Integration with Development Workflow

1. **Before Committing**: Run `npm test` to ensure all tests pass
2. **During Development**: Use `npm run test:watch` for instant feedback
3. **Before PR**: Run `npm run test:coverage` to check coverage
4. **CI Checks**: Ensure GitHub Actions passes before merging

## Future Enhancements

Planned additions to the test suite:
- [ ] E2E tests with Playwright
- [ ] Visual regression testing
- [ ] Performance benchmarking
- [ ] API integration tests with mocked responses
- [ ] Accessibility testing
- [ ] Cross-browser testing

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)
- [jsdom Documentation](https://github.com/jsdom/jsdom)

## Support

For issues or questions about testing:
1. Check this guide first
2. Review test files for examples
3. Check Jest documentation
4. Open an issue in the repository

---

**Remember**: Good tests are the foundation of maintainable code. When in doubt, write a test!
