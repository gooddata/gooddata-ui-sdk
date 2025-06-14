---
trigger: model_decision
description: React components accessibility principles
globs:
---

# Accessibility Guidelines

## General Principles

-   All UI components must be accessible for users with disabilities
-   Follow WCAG 2.1 AA standards for accessibility
-   Always provide appropriate ARIA attributes for custom UI controls
-   Use semantic HTML elements whenever possible
-   Ensure keyboard navigation works for all interactive elements
-   Provide appropriate focus management

## Component Guidelines

### Using AccessibilityConfig

Use the `accessibilityConfig` prop for components that support it:

```tsx
<Component
    accessibilityConfig={{
        ariaLabel: "Descriptive label",
        ariaLabelledBy: "id-of-element-with-label",
        ariaDescribedBy: "id-of-element-with-description",
        role: "button", // or appropriate role
    }}
/>
```

### Buttons and Interactive Elements

-   All buttons need an accessible name via `aria-label`, `aria-labelledby`, or visible text content (which is preferred)
-   Use the `accessibilityConfig` prop to provide ARIA attributes
-   Icon-only buttons must have an accessible name via `aria-label`

```tsx
<Button
    accessibilityConfig={{
        ariaLabel: "Close dialog",
    }}
    iconLeft="icon-close"
/>
```

### Dialogs and Modals

-   Use `aria-modal="true"` for modal dialogs
-   Provide `aria-labelledby` referencing the dialog title
-   Provide `aria-describedby` if there's a description
-   Manage focus correctly when opening and closing

```tsx
<DialogBase
    accessibilityConfig={{
        titleElementId: "dialog-title",
        descriptionElementId: "dialog-description",
    }}
>
    <h2 id="dialog-title">Dialog Title</h2>
    <p id="dialog-description">Dialog description</p>
</DialogBase>
```

### Status Messages

-   Use appropriate ARIA roles for messages
-   Use `role="alert"` for error messages
-   Use `role="status"` for status updates
-   Use `aria-live="polite"` for non-critical updates

```tsx
<div role="alert">Error message</div>
<div role="status" aria-live="polite">Status update</div>
```

### Screen Reader Only Content

Use the `.sr-only` class to hide content visually but keep it accessible to screen readers:

```tsx
<span className="sr-only">Additional information for screen readers</span>
```

```scss
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
```

### Form Controls

-   Always associate labels with form controls using `htmlFor` and `id`
-   Provide clear error messages and statuses with `aria-invalid` and `aria-describedby` or `aria-errormessage`
-   Group related form controls with `fieldset` and `legend`

```tsx
<label htmlFor="username">Username</label>
<input
  id="username"
  type="text"
  aria-invalid={hasError}
  aria-describedby={hasError ? "username-error" : undefined}
/>
{hasError && <div id="username-error" role="alert">Invalid username</div>}
```

## Testing and Validation

-   Verify that all interactions can be accomplished without a mouse
-   Verify compatibility with screen readers (NVDA, VoiceOver, JAWS)
-   Check color contrast ratios for all text and UI elements
-   Validate HTML for accessibility issues
