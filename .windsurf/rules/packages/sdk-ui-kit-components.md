---
trigger: model_decision
description: Writing new sdk-ui-kit components
globs:
---

# SDK UI Kit Component Guidelines

You are helping developers create new components in the GoodData.UI SDK UI Kit package. Follow these guidelines to ensure components are consistent with the project's standards.

## Component Structure

-   **Naming**: Component name must match its file name (e.g., `UiButton.tsx` → `<UiButton />`)
-   **Collocation**: Each component must be collocated with its own styles:
    ```
    ./UiButton.tsx
    ./UiButton.scss
    ```
-   **File Structure**: Follow the package's established directory patterns

## Component Interface

-   Keep the interface as simple as possible
-   Design interfaces from the perspective of the component user
-   Align interfaces with Figma designs - collaborate with UX/UI teams when needed
-   Use TypeScript interfaces for component props with proper documentation

## Styling Guidelines

-   Use BEM methodology for all component styles
-   Always use the bem helper from sdk-ui-kit:

    ```tsx
    import { bem } from "../_infra/bem.js";
    const { b, e } = bem("gd-ui-kit-component-name");
    ```

-   Apply these styling rules:
    -   Use prefixes for root elements to avoid class name collisions (e.g., `.gd-ui-kit-button`)
    -   Minimize nesting and overrides for better readability
    -   Avoid margins on root elements - components must not affect parent/sibling layout
    -   Limit style overrides to local use
    -   Don't specify CSS variable defaults in components - use theming or defaultTheme.scss

### Style Patterns:

**Basic Component**

```tsx
const { b } = bem("gd-ui-kit-button");

<button className={b()}>
```

```scss
.gd-ui-kit-button {
    // component styles
}
```

**Boolean Props**

```tsx
interface IProps {
    isSelected: boolean;
}

<button className={b({ isSelected })}>
```

```scss
.gd-ui-kit-button {
    &--isSelected {
        // styles when isSelected is true
    }
}
```

**String Props**

```tsx
interface IProps {
    style: "primary" | "secondary",
}

<button className={b({ style })}>
```

```scss
.gd-ui-kit-button {
    &--style {
        &-primary {
            // styles for primary variant
        }
        &-secondary {
            // styles for secondary variant
        }
    }
}
```

**Nested Elements**

```tsx
<button className={b()}>
    <span className={e("icon")} />
</button>
```

```scss
.gd-ui-kit-button {
    &__icon {
        // styles for nested element
    }
}
```

## Theming Support

-   Use CSS variables (custom properties) from the theming system
-   Check Figma designs for the specific CSS variables to use
-   Reference default theme values from sdk-ui-kit/src/@ui/defaultTheme.scss
-   For new CSS variables, follow guidelines in sdk-ui-theme-provider/README-DEV.md

## Layout Principles

-   Components should only control their own layout
-   NEVER specify margins or positioning that affects parent/sibling elements
-   Layout positioning should be handled by parent components

## Development & Testing Workflow

1. Develop the component in /examples/playground
2. Create screenshot tests in sdk-ui-tests
3. Include accessibility props in tests (even when not visually impactful)
4. Reference UiButton tests as an example pattern

## Accessibility Requirements

-   Target WCAG 2.1 standards
-   Use semantic HTML elements wherever possible
-   Implement proper keyboard navigation
-   Include ARIA attributes where needed
-   Provide proper focus indicators
-   Ensure sufficient color contrast
-   Test with screen readers

## Implementation Checklist

When implementing a new component, ensure:

-   [ ] Component name matches file name
-   [ ] Component and styles are properly collocated
-   [ ] Interface is simple and user-friendly
-   [ ] BEM methodology is followed for styling
-   [ ] No margins on root elements
-   [ ] Theming via CSS variables is implemented
-   [ ] Component focuses only on its own layout
-   [ ] Accessibility standards are met
-   [ ] Tests include accessibility props
-   [ ] Screenshot tests are created
