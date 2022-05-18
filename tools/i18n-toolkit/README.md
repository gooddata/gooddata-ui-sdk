# Validation script for translations

This is a translations validator script that is able to validate rules for valid translations files.

### What this toolkit validates?

1.  **Structure of localisation `.json` files** - Toolkit validate structure of json files based on json schema that is defined in `src/schema/localization.ts`. If file is not valid by this schema, validation immediately failed.
2.  **Message format** - Validation of message format if is valid based on ICU. More information about using ICU can be found here https://unicode-org.github.io/icu/userguide/format_parse/messages/. First error in ICU will cause validation failed.
3.  **HTML syntax** - Because we use html like syntax in some messages, we need to validate if this html is valid or not. Toolkit iterate all messages and if found html inside, make validation on it. First error will cause validation failed.
4.  **Insight to report** - Special usage of localisations. For some customer we need to rename **insight** to **report**. For this case, there is an implementation which can use piped locales `|insight` and `|report` for this. So everytime insight keyword is used in message, we need to change messages into this special definition as you can se below. This toolkit validates if there are all necessary translations and are valid.

### How to install it?

Install by **npm** ...

```
npm install @gooddata/i18n-toolkit --save-dev
```

... or by **yarn**

```
yarn add @gooddata/i18n-toolkit -D
```

### How to use it?

Toolkit is used from command line and has some options to enabled all checks. By default, all check are disabled and need to be turn on by one by for all cases.

#### Option `-p, --path <type>`

This option is **required** and it is path for directory where are translations jsons. There can be lots of `*.json` files, all files are behaving as a localisations files and need to be valid. There need to by file `en-US.json` that is used as a defalt file for other validations. Without this path and file, validator can not work.

#### Option `-s, --structure`

Turn on validation of structure base ond json schema.

#### Option `-i, --intl`

Turn on validation of ICU messages used in localisation files.

#### Option `-h, --html`

Turn on validation of HTML marks inside localisation messages.

#### Option `-ir, --insightToReport`

Turn on validation of translation for insight and reports rename feature.

#### Option `-d, --debug`

Turn on debug mode that shows more info on errors and spam console more often that in normal mode.

### Examples script

**package.json**

```json
{
    ...
    "scripts": {
        ...
        "validate-locales": "i18n-toolkit --path 'app/localization' --structure --intl --html --insightToReport"
    },
    "devDependencies": {
        "@gooddata/i18n-toolkit": "^8.10.0-alpha.101",
        ...
    }
}

```

## License

(C) 2017-2022 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-kit/LICENSE).
