# Validation script for translations

[![npm version](https://img.shields.io/npm/v/@gooddata/i18n-toolkit)](https://www.npmjs.com/@gooddata/i18n-toolkit)&nbsp;
[![npm monthly downloads](https://img.shields.io/npm/dm/@gooddata/i18n-toolkit)](https://npmcharts.com/compare/@gooddata/i18n-toolkit?minimal=true)&nbsp;
![typescript](https://img.shields.io/badge/typescript-first-blue?logo=typescript)

This is a translations validator script that is able to validate rules for valid translations files.

### What this toolkit validates?

1.  **Structure of localisation `.json` files** - Toolkit validate structure of json files based on json schema that is defined in `src/schema/localization.ts`. If file is not valid by this schema, validation immediately failed.
2.  **Message format** - Validation of message format if is valid based on ICU. More information about using ICU can be found here https://unicode-org.github.io/icu/userguide/format_parse/messages/. First error in ICU will cause validation failed.
3.  **HTML syntax** - Because we use html like syntax in some messages, we need to validate if this html is valid or not. Toolkit iterate all messages and if found html inside, make validation on it. First error will cause validation failed.

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

#### Option `-p, --paths <paths>`

This option is **required** and it is more paths for directory where are translations jsons that is **split by ","**. There can be lots of `*.json` files, all files are behaving as a localisations files and need to be valid. There need to be file `en-US.json` that is used as a default file for other validations. Without this path and file, validator can not work.

**Example**

```
 i18n-toolkit --paths src/share/translations src/Component/translations
```

#### Option `-c, --config <path>`

This option is path for [Configuration file](#configuration-file) that can be used for determine all options and also specified rules for option `-u, --usage` that turns on localisation usage messages id validation.

#### Option `-s, --structure`

Turn on validation of structure base ond json schema.

#### Option `-i, --intl`

Turn on validation of ICU messages used in localisation files.

#### Option `-h, --html`

Turn on validation of HTML marks inside localisation messages.

#### Option `-u, --usage`

Turn on localisation message id usage validation. This fill turn on feature that try to find if key is really used in application or not. There are more options related to this see [Configuration file](#configuration-file).

#### Option `-d, --debug`

Turn on debug mode that shows more info on errors and spam console more often that in normal mode.

#### Option `-w, --cwd <path>`

This option is used to define another working directory that is current. By defaul this tool has working directory as directory where program run, but this option can override this and define another directory as cwd.

### Examples script

**package.json**

```json
{
    ...
    "scripts": {
        ...
        "validate-locales": "i18n-toolkit --paths app/localization --structure --intl --html"
    },
    "devDependencies": {
        "@gooddata/i18n-toolkit": "^8.10.0-alpha.101",
        ...
    }
}

```

## Configuration file `.i18nrc.js`

Instead of command line arguments, this tool also be configured by config file. Configuration file is necessary to use if you want to use `--usage` otpion to determine if localizations ids are used or not because there are rules for messages. **By default, toolkit search for config file `.i18nrc.js` in cwd, but can be overridden by `--config` option on command line.**

### Structure of config file

```javascript
module.exports = {
    paths: ["./src/fixtures/", "./src/translations/"],
    //settings
    structure: true, //OPTIONAL, same as "--structure" option on command line
    intl: true, //OPTIONAL, same as "--intl" option on command line
    html: true, //OPTIONAL, same as "--html" option on command line
    usage: true, //OPTIONAL, same as "--usage" option on command line
    debug: true, //OPTIONAL, same as "--debug" option on command line
    //REQUIRED if usage=true, source files with code from tool reads and parse usage of localisations messages
    source: "src/**/*.{ts,js,tsx,jsx}",
    //REQUIRED if usage=true, rules definition for validation usage
    rules: [
        {
            //OPTIONAL, define regular expression, this option will be valid only for locales inside dir that match expression
            dir: /src\/fixtures/,
            //REQUIRED, define pattern for messages id to have been process with this rule, if you want all, use /.+/ pattern, can be array of expressions or single expression
            pattern: [/^text\./, /^properly\./],
            //OPTIONAL, if set true, locales messages will be filtered by previous regex pattern and other messages will be skipped, more info bellow
            filterTranslationFile: false,
            //OPTIONAL, all messages for this rule will be ignored (not processed and not marked as missing or unused)
            ignore: false,
        },
    ],
};
```

#### Property `source: string`

This is setting for usage check and its only required if `usage=true`. It is pattern for source files with code from tool reads and parse usage of localisations messages. Default value is `src/**/*.{ts,js,tsx,jsx}` and can be changed to any glob style files path.

#### Property `rules: Array<ToolkitTranslationRule>`

List of rules that will be applied on extracted and loaded rules. Tool extract all messages from `source` files and load localisation files defined in `path` or `paths` and then apply these rules on files. Every rule can have some special settings and these properties are described below.

#### Property `rules[].dir: RegExp`

Define regular expression, this option will be valid only for locales inside dir that match expression. If there are more directories with locales (for example `src/locales` and `src/external/locales`) you can specify, that this rule can be valid only for locales that is inside directory with matching regex pattern. If `dir` is omitted, this rule will be applied in every folder.

#### Property `rules[].pattern: RegExp`

Define pattern for messages id to have been process with this rule, if you want all, use /.+/ pattern, can be array of expressions or single expression. If `filterTranslationFile` is set to `false` and there will be messages. that not match by pattern Regex, tool automatically mark this messages as invalid.

#### Property `rules[].filterTranslationFile: boolean`

If set true, locales messages will be filtered by previous regex pattern and other messages will be skipped. This is useful if your locales file contains also locales for 3rd party library, and you want to validate only yours validation messages and others will be skipped. In this case you need to define 2 rules tha one validate messages and second mark others as ignored.

```javascript
rules: [
    //all message that starts with dialogs. and screen. will be validated
    {
        pattern: [/^dialogs\./, /^screen\./],
        filterTranslationFile: true,
    },
    //all messages that starts with share.widget will be ignored
    {
        pattern: [/^share\.widget\./],
        filterTranslationFile: true,
        ignore: true,
    },
];
```

#### Property `rules[].ignore: boolean`

All messages for this rule will be ignored (not processed and not marked as missing or unused). Its handy for keys that can be extracted from source code or keys that are used in other apps.

## How to right define messages in code to make usage check work?

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

#### Dynamic usage of message id?

> Do not create message id dynamically. Try to always used full strings without any conditions. With dynamic messages, this is not possible to found usages of localisation string!

It is good practice using `defineMessages` that is intended to define all messages in current component / file. This allows us to use some dynamic operations with messages.

```typescript jsx
const messages = defineMessages({
    textOne: { id: "message.textOne" },
    textTwo: { id: "message.textTwo" },
});

const text = intl.formatMessage(condition ? messages.textOne : messages.textTwo);
```

## License

(C) 2017-2022 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-kit/LICENSE).
