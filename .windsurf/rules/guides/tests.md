---
trigger: model_decision
description: Writing tests
globs:
---

# Testing Rules and Guidelines

## Testing Framework

-   Use Vitest as the primary testing framework for all packages
-   Tests use a combination of Jest-style and Vitest-native APIs
-   For React components, use React Testing Library
-   For DOM assertions, use vitest-dom

## Test Structure

1. **Unit Tests**

    - Test each non-trivial function and class independently
    - Test files should be located in the same directory as the file being tested
    - Name test files as `<testedFile>.test.ts` or `<testedFile>.test.tsx`
    - Group tests using `describe()` for logical organization
    - Use `it()` for individual test cases
    - Use `it.each()` for parameterized tests with multiple scenarios

2. **Component Tests**

    - Test React components using React Testing Library
    - Focus on component behavior, not implementation details
    - Minimize complexity of these tests
    - Use black-box testing approach

3. **Visual Regression Tests**
    - Located in the `sdk-ui-tests` package
    - Define test scenarios that verify component rendering
    - Use standard test data from reference workspace

## Test Best Practices

1. **Fixtures and Mocks**

    - Place test fixtures in files named `<testedFile>.fixture.ts`
    - Use mocks to isolate units under test
    - Prefer realistic test data that matches domain models

2. **Test Organization**

    - Group related tests within a `describe` block
    - Use nested `describe` blocks for subgroups of tests
    - Keep test cases focused on a single behavior
    - Use clear, descriptive test names that explain the expected behavior

3. **Assertions**

    - Use specific assertions (e.g., `toEqual`, `toBeInTheDocument`)
    - When appropriate, use snapshot testing with `toMatchSnapshot()`
    - For complex objects, test specific properties rather than entire objects

4. **Setup and Teardown**
    - Use `beforeEach` for common test setup
    - Use `afterEach` for cleanup (React Testing Library cleanup is automatic)
    - Avoid shared state between tests

## Test Commands

-   `rush test-once` - Run tests for all projects once
-   `rush test-ci` - Run tests in CI mode with coverage reporting
-   `rushx test` - Run tests for a specific package (when in that package directory)
-   `rushx test-watch` - Run tests in watch mode for active development

## Reference Workspace Testing

-   Use standardized test data from reference workspace
-   Use `sdk-ui-tests` package to define scenarios and recordings
-   Share test scenarios across packages to maintain consistency
