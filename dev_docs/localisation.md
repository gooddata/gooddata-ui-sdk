# GoodData.UI SDK - Developer's Guide for managing localisations files

## 1. `en-US.json` is the only file you edit for new or changed strings

Localisation bundles live next to the code that uses them, for example
`sdk/libs/sdk-ui/src/base/localization/bundles`,
`sdk/libs/sdk-ui-dashboard/src/presentation/localization/bundles`,
`libs/<app>/src/translations` and `modules/<module>/module/src/translations`.
Each folder holds `en-US.json` plus one file per target locale. `crowdin.yml`
in the repo root is the authoritative list of source files.

**Only `en-US.json` is hand-written.** Every other locale file is generated
output of the post-merge translation pipeline:

1. You add or change a key in `en-US.json` and merge the PR to `master`.
2. A daily workflow uploads the changed strings to Crowdin, harvests context
   for them and pre-translates them.
3. A second workflow downloads the approved translations and opens its own PR
   against `master`, usually within the next business day.

What follows from this:

- **Never copy a new key into `de-DE.json`, `fr-FR.json`, ... in a feature
  PR.** The next translation download overwrites those files, so the copied
  English is discarded. It also hides the missing string from Crowdin coverage
  reports in the meantime.
- **A new key present only in `en-US.json` is the expected state of a feature
  PR.** Until the translation PR lands, a non-English UI shows the message id
  (or its `defaultMessage`) for that one string. This is accepted; it is not a
  review finding, and editing locale files does not fix it. If a string must be
  translated sooner, request an on-demand pipeline run — see
  [`.claude/l10n-workflow.md`](../../.claude/l10n-workflow.md).
- **The single exception is moving an already-translated key** between bundles
  (renaming or splitting a bundle file). Crowdin sees only a deletion plus a
  brand-new string, so it cannot carry the translation over. Move such keys in
  every locale file of the same PR.
- `*.localization-bundle.ts` files are generated at build time. Do not edit
  them; changes are lost on the next build.

## 2. Structure of localisation json file

Write every new message as a key mapped to an object — in every bundle whose
loader calls `removeMetadata`, which is all of them bar the one exception noted
below. The schema is enforced by
`@gooddata/i18n-toolkit`
([`sdk/tools/i18n-toolkit/src/schema/localization.ts`](../tools/i18n-toolkit/src/schema/localization.ts)),
which rejects unknown properties, so only the three below are valid.

```json
{
    "id.of.local.message": {
        "text": "Save",
        "crowdinContext": "Label of the primary save button in the toolbar. Keep it short.",
        "translate": false
    }
}
```

| Property         | Required | Purpose                                                                   |
| ---------------- | -------- | ------------------------------------------------------------------------- |
| `text`           | Yes      | The English string shown in the GUI. Use ICU MessageFormat for variables. |
| `crowdinContext` | Yes      | Context for the external translators. See the caveat below.               |
| `translate`      | No       | Defaults to `true`. Set `false` to keep a string out of translation.      |

A value may also be a **bare string**, and tooling has to accept that. It is the
form of every exported target locale file, and a few legacy entries in
`en-US.json` still use it (3 in `libs/gdc-analytical-designer-runtime`, 1 in
`sdk/libs/sdk-ui`). Those carry no `crowdinContext` and get no `.text` suffix in
Crowdin.

Which form to **write** depends on how the bundle is consumed. A loader that
calls `removeMetadata` unwraps the object into a plain message map, so the
object form is required there — that is every bundle registered in
`crowdin.yml`. `libs/gdc-datasource-management` is the exception: its
`src/with-intl.tsx` passes the imported JSON straight to `IntlProvider` as
`messages`, with no `removeMetadata`, so its entries must be bare strings or
React Intl cannot read them. Match the bundle you are editing; do not
introduce the bare-string form into a bundle whose loader unwraps metadata.

### Property `crowdinContext`

Use this property to explain where the string is used and in which context.
External translators read it to translate the string correctly.

> **Caveats about `crowdinContext`**
>
> Always fill this property, and describe the usage precisely. Otherwise the
> external translators raise questions, which takes a long time to answer.

### Property `translate`

Use this property to mark strings that must not be translated, for example an
internal error message, or a string that is not final yet.

**Default value `true`.** True is the default and you do not need to specify it.
Use `translate: false` only if you do not want to translate the message.

> **Caveats about `translate`**
>
> Use this property for strings that are not final. Otherwise the external
> company starts to translate a string that can still change, which wastes
> effort and money.

## 3. Using right intl wrapper

Because the SDK has two localisation bundles, we need to import right intl wrapper from right module.

### Working inside `sdk-ui-dashboard` module?

Inside module `sdk-ui-dashboard` we need import wrapper from `sdk-ui-dashboard/src/presentation/localization`

```typescript jsx
import React from "react";
import { IntlWrapper } from "../../localization";

export function Component(props: Props){
    return <IntlWrapper locale={locale}>...</IntlWrapper>;
};
```

### Working inside other `sdk-ui-*` module?

Inside any module `sdk-ui-*` we need import wrapper from `@gooddata/sdk-ui`

```typescript jsx
import React from "react";
import { IntlWrapper } from "@gooddata/sdk-ui";

export function Component(props: Props) {
    return <IntlWrapper locale={locale}>...</IntlWrapper>;
};
```

## 4. Using `FormatMessage`, `intl.formatMessage` and placeholders

Basic usage and recommended one is used `<FormatMessage />` component for react. There is an example how to use this component.

```typescript jsx
<FormattedMessage
    id="message.id"
    values={{
        count: 0,
        name: "Stanley",
    }}
/>
```

In case that we need to get only string, and we are not able to use component, use `intl.formatMessage` as we can see below.

```typescript jsx
const text = intl.formatMessage(
    { id: "message.id" },
    {
        count: 0,
        name: "Stanley",
    },
);
```

> **Caveats for id of message**
>
> Do not create message id dynamically. Try to always used full strings without any conditions. This will be helpful for future where automatic tool for extraction can find if message is used or not. With dynamic messages, this is not possible!

It is good practice using `defineMessages` that is intended to define all messages in current component / file. This allows us to use some dynamic operations with messages.

```typescript jsx
const messages = defineMessages({
    textOne: { id: "message.textOne" },
    textTwo: { id: "message.textTwo" },
});

const text = intl.formatMessage(condition ? messages.textOne : messages.textTwo);
```

### Html placeholders

Html placeholders (like `<b></b>`) are not supported directly in the newest version of react-intl. For this case we need to specify the function which is called if library finds some HTML like tag. You can see this in example bellow. And because this is not html, you can now use any placeholder what you want.

```typescript jsx
//message.id = "This is <strong>cool</strong> <msg>message</msg> <random />."
<FormattedMessage
    id="message.id"
    values={{
        strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
        msg: (chunks: ReactNode) => (
            <strong>
                <i>{chunks}</i>
            </strong>
        ),
        random: () => (
            <strong>
                <i>{Math.random()}</i>
            </strong>
        ),
    }}
/>
```

**More info for message placeholder:** https://formatjs.io/docs/react-intl/api#message-formatting-fallbacks
