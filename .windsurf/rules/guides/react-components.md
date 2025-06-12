---
trigger: model_decision
description: Rule to write React components
globs:
---

# React Components Guidelines

## Component Structure and Organization

1. **Component Declaration**

    - Prefer functional components with hooks for new code
    - Use TypeScript with proper interface definitions
    - Class components should extend `React.Component<Props, State>`
    - Include copyright header: `// (C) {years} GoodData Corporation`

2. **File Organization**

    - Components should be in PascalCase (e.g., `Button.tsx`)
    - Interfaces should be in separate files or within component files
    - Group related components in folders with index.ts exports
    - Follow naming pattern: `Component.tsx`, `Component.styles.ts/scss`, `tests/Component.test.tsx`

3. **Component API**
    - Document exported components with TSDoc
    - Annotate with API maturity level: `@public`, `@beta`, `@alpha`, or `@internal`
    - Define props interfaces with "I" prefix (e.g., `IButtonProps`)
    - Use default props via static property or parameter defaults
    - Do not expose className for styles, always use semantic props instead

## React Best Practices

1. **Performance Optimization**

    - Memoize callbacks with `useCallback`
    - Memoize expensive calculations with `useMemo`
    - Use `React.memo()` for components that render often with the same props
    - Specify complete dependency arrays for hooks
    - Avoid unnecessary re-renders

2. **State Management**

    - Use React Context for shared state when appropriate
    - Split complex state logic with useReducer
    - Avoid state duplication and prop drilling
    - Keep state as close as possible to where it's used

3. **Component Composition**
    - Prefer composition over inheritance
    - Use hooks or passing components as props / render props pattern for complex reusable logic
    - Create small, focused components with single responsibilities

## Styles and CSS

1. **CSS/SCSS Guidelines**

    - Use BEM methodology for CSS class naming
    - Prefix classes with package and component namespace (e.g., `gd-ui-kit-button`)
    - Minimize CSS nesting (max 3 levels)
    - Avoid margins on root elements of components
    - Use CSS variables from the theming system

2. **Theme Support**
    - Use the theming system via `sdk-ui-theme-provider`
    - Don't specify CSS variable defaults in components
    - Reference theme colors, spacing, and typography variables

## Accessibility

1. **Accessibility Requirements**
    - Use the `accessibilityConfig` prop for ARIA attributes
    - Ensure keyboard navigation for all interactive elements
    - Provide text alternatives for non-text content
    - Use semantic HTML elements whenever possible
    - Test with screen readers

```tsx
<Button
    accessibilityConfig={{
        ariaLabel: "Close dialog",
        role: "button",
        ariaDescribedBy: "description-id",
    }}
    onClick={onClose}
/>
```

2. **Focus Management**
    - Properly manage focus for modals and dialogs
    - Use `React.useRef()` and `focus()` for programmatic focus
    - Implement proper focus trapping in modals

## Testing

1. **Component Testing**

    - Write unit tests for all components using Vitest and React Testing Library
    - Test both happy path and edge cases
    - Test accessibility features
    - Test component APIs and props

2. **Specialized Component Types**
    - Create specialized components for common patterns:
        - Container components (data fetching, state management)
        - Presentational components (UI rendering only)
        - Custom Hooks (for reusable logic)
