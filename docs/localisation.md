# GoodData.UI SDK - Developer's Guide for managing localisations files

## 1. `en-US.json` is one and only file used for localisation

There are two folders for localisation files `libs/sdk-ui/src/base/localization/bundles` and `libs/sdk-ui-dashboard/src/presentation/localization/bundles`. In these folders there are all localisation files for more languages. **For updating locales, we must do changes only into `en-US.json` file.** Others files are automatically update by company, that create translations.

## 2. Structure of localisation json file

Localisation `*.json` has defined schema and properties what needs to be defined for every message in json file. There is example of file with one location message.

```json
{
  "id.of.local.message": {
    //REQUIRED. This is value of message, that will shows in gui.
    "value": "value",
    //REQUIRED. Some comment and explanation what this message means. Read more info bellow.
    "comment": "comment",
    ////REQUIRED. Number that limit maximum count of latters that can be in value. Read more info bellow.
    "limit": 0,
    //Mark for translate by external company. Read more info bellow
    "translate": false
  },
  ...
}
```

### Property `comment`

Comment property is intended to use for some explanation, describing of context or other message for external translators. It is necessary to use this comment property to describe where is this string used, in which context and similar important descriptions. External translators
can easily understand context of message and will be easy to them translate it correctly.

> **Caveats about `comment`**
>
> Always fill this property and try to describe usage very precisely. External translators can raise some questions if they are not sure how to correctly translate message and took long time and lots of effort to communicate this context!

### Property `limit`

Limit property is used to limit maximum allowed count of character that can be used in final message. This is helpful when we have a limited space for showing our message, and we need to ensure that user will see this message whole.

_In english text can be only 20 chars long, but in another language will have length for example 60 characters. But we have space safely only for 40 characters. In this case set limit property on 40._

**Meaning of value `0`** - Value **`0`** means that limit is turned off, and we do not want to check it.

### Property `translate`

Translate property is used for marking text that are not intended for translation. Can be for example some private thing used for errors that we want to translate for user or translations that are not approved yet.

**Default value `true`** True is a default value and don't need to be specified. Use only `translate: false` if you don't want to translate this specific message.

> **Caveats about `translate`**
>
> Use this property for translations that are not final! If you don't do this, external company start translating this string, and it's a waste of effort and money to translate something that is not final!

## 3. Using right intl wrapper

Because there are two localisation bundles, we need to import right intl wrapper from right module.

### Working inside `sdk-ui-dashboard` module?

Inside module `sdk-ui-dashboard` we need import wrapper from `sdk-ui-dashboard/src/presentation/localization`

```typescript jsx
import React from "react";
import { IntlWrapper } from "../../localization";

export const Component: React.FC<Props> = () => {
    return <IntlWrapper locale={locale}>...</IntlWrapper>;
};
```

### Working inside other `sdk-ui-*` module?

Inside any module `sdk-ui-*` we need import wrapper from `@gooddata/sdk-ui`

```typescript jsx
import React from "react";
import { IntlWrapper } from "@gooddata/sdk-ui";

export const Component: React.FC<Props> = () => {
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
        strong: (chunks: string) => <strong>{chunks}</strong>,
        msg: (chunks: string) => (
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

## 5. Using `|insight` and `|report` special keys

Special usage of localisations. For some customer we need to rename **insight** to **report**. For this case, there is an implementation which can use piped locales `|insight` and `|report` for this. So everytime insight keyword is used in message, we need to change messages into this special definition as you can se below.

```json
{
    "message.with.insight|insight": {
        "value": "INSIGHT CONTEXT",
        "comment": "...",
        "limit": 0
    },
    "message.with.insight|report": {
        "value": "REPORT CONTEXT",
        "comment": "...",
        "limit": 0,
        "translate": false
    }
}
```

In code, we normally use message id without `|insight` or `|report`.

```typescript jsx
<FormattedMessage id="message.with.insight" />
```

> **Caveats for `|report` message id**
>
> Messages with `|report` needs to have `translate: false` because we never want to translate it. This feature is intended only for specific customers and is provided only in **english language**.
