# New Component Rules

## Naming

The component name should match its file name.

```tsx
./UiButton.tsx -> <UiButton />
```

## Collocation

Each component should be collocated with its own styles.

```tsx
./UiButton.tsx
./UiButton.scss
```

## Interfaces

Keep interface of the components as simple as possible.

Always think about how you personally would like to use the component.

Interface should be aligned with Figma as much as possible - design of the interface should be discussed together with respective UX and UI personas.

Components **SHOULD NOT** accept a `className` prop for style overrides. Instead, use specific variant props (like `size`, `variant`, etc.) and follow BEM methodology for styling (see [Styles](#styles) section). This ensures consistent use across applications and prevents uncontrolled style modifications.

## Styles

Styles should follow the [BEM](https://en.bem.info/methodology/quick-start/) methodology.

Follow these rules:
- Use prefixes for root elements to avoid class name collisions (e.g., `.gd-ui-kit-button`, `.gd-ui-kit-icon`).
- Minimize nesting and overrides for better readability and maintainability
- Avoid using margins for root elements; components must not affect the layout of their parent or sibling elements.
- Limit overrides to local use and avoid them whenever possible; external overrides must not be applied.
- Do not specify CSS variable defaults in the component, always use values provided by theming or `defaultTheme.scss`.

### Basic Style

```tsx
const { b } = bem("gd-ui-kit-button");

<button className={b()}>
```

```scss
.gd-ui-kit-button {
    // component styles
}
```

### Style Based on Boolean Props

```tsx
interface IProps {
    isSelected: boolean;
}

const { b } = bem("gd-ui-kit-button");

<button className={b({ isSelected })}>
```

```scss
.gd-ui-kit-button {
    // component styles

    &--isSelected {
        // styles when isSelected is true
    }
}
```

### Style Based on String Props

```tsx
interface IProps {
    style: "primary" | "secondary",
}

const { b } = bem("gd-ui-kit-button");

<button className={b({ style })}>
```

```scss
.gd-ui-kit-button {
    // component styles

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

### Combined Style Overrides
*Note: Avoid overrides when possible, as they reduce readability and maintainability. Prefer top-level derived styles, but use overrides if absolutely necessary.*

```tsx
interface IProps {
    isSelected: boolean;
    style: "primary" | "secondary",
}

const { b } = bem("gd-ui-kit-button");

<button className={b({ style, isSelected })}>
```

```scss
.gd-ui-kit-button {
    // component styles
    $root: &;

    &--style {
        &-primary {
            // styles for primary variant

            &#{$root}--isSelected {
                // combined styles for primary and isSelected
            }
        }

        &-secondary {
            // styles for secondary variant

            &#{$root}--isSelected {
                // combined styles for secondary and isSelected
            }
        }
    }
}
```

### Nested Element Styles

```tsx
const { b, e } = bem("gd-ui-kit-button");

<button className={b()}>
    <span className={e("icon")} />
</button>
```

```scss
.gd-ui-kit-button {
    // component styles

    &__icon {
        // styles for nested element
    }
}
```

### Nested Element Styles Based on Props

```tsx
interface IProps {
    isSelected: boolean;
    style: "primary" | "secondary",
}

const { b, e } = bem("gd-ui-kit-button");

<button className={b()}>
    <span className={e("icon", { isSelected, style })} />
</button>
```

```scss
.gd-ui-kit-button {
    // component styles

    &__icon {
        // styles for nested element

        &--isSelected {
            // styles when isSelected is true
        }

        &--style {
            &-primary {
                // styles for primary variant
            }

            &-secondary {
                // styles for secondary variant
            }
        }
    }
}
```

### Nested Element Style Overrides
*Note: Avoid overrides when possible, as they reduce readability and maintainability. Prefer top-level derived styles, but use overrides if necessary.*

```tsx
interface IProps {
    isSelected: boolean;
}

const { b, e } = bem("gd-ui-kit-button");

<button className={b({ isSelected })}>
    <span className={e("icon")} />
</button>
```

```scss
.gd-ui-kit-button {
    // component styles
    $root: &;

    &__icon {
        // styles for nested element
    }

    &--isSelected {
         &#{$root}__icon {
            // style overrides for icon when isSelected is true
        }
    }

    &:active {
        &#{$root}__icon {
            // style overrides for icon when active
        }
    }

}
```

## Theming

All components are respecting our theming.

CSS variables (CSS custom properties e.g. `--gd-custom-property`) to use should be included in Figma designs, if you are not sure which one is correct, discuss it with designers.

All default theme CSS variable values can be found in [defaultTheme.scss](../sdk-ui-kit/src/@ui/defaultTheme.scss).

To add a new CSS variable, read more details in [`README-DEV.md`](../sdk-ui-theme-provider/README-DEV.md) in `@gooddata/sdk-ui-theme-provider`.

## Layouting

Component should care only about its own layout.

Component must not specify any margins or care about its surroundings - this should be handled always by components upper in the component tree.


## Development & Testing
Recommended workflow is to develop the component in the `/examples/playground.`

Once you complete it, you should also prepare screenshot tests in `sdk-ui-tests`.

Please include accessibility props (such as `ariaHidden`) in the stories as well, even when they do not change the visuals.

See [UiButton](../sdk-ui-tests/stories/visual-regression/ui/UiButton.tsx) test for inspiration - used approach can help you with both development and testing.

To support testability of interactive components add data-testid to native elements so they are easily addressable by test selectors.

## Accessibility

Components should target [(WCAG) 2.1](https://www.w3.org/TR/WCAG21/) standard.

In short, follow these simple rules:
- **Assistive Tech Ready**: Use semantic HTML and ARIA roles appropriately.
- **Keyboard-Friendly**: Ensure all functionality works via keyboard alone.
- **Text Alternatives**: Provide alt text for images and captions for videos.
- **Readable Design**: Use clear text, proper headings, and responsive layouts without horizontal scrolling.
- **Avoid Triggers**: No flashing content or elements that could cause seizures.
