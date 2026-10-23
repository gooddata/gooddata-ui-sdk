# MAQL language server

TS/JS implementation of Language Server that utilizes LSP.

The project is part of the Rush-managed monorepo. Follow the main repository guidelines.

## Browser consumers

`antlr4ts` is written for Node: it requires the Node built-ins `assert` and `util` and does not
declare them. Browser bundlers such as Vite and webpack 5 do not provide Node built-ins, so this
package declares their browser ports, `assert` and `util`, as dependencies. A package manager that
hoists them (npm, pnpm by default) puts them where `antlr4ts` resolves them. Without them, the
bundle crashes when it loads `antlr4ts` (`assert is not a function`, or `Cannot read properties of
undefined (reading 'custom')` from `util.inspect.custom`).

## Build

To build the MAQL language server run

```shell
rushx build
```

## Testing MAQL grammar changes

To get the latest grammar, upgrade `@gooddata/maql-antlr4ts` dependency, located in gdc-nas repository.
The npm package is not built automatically, it needs to be built by triggering the corresponding workflow
in gdc-nas. See https://github.com/gooddata/gdc-nas/blob/master/libraries/calq/maql-antlr4ts/README.md#publishing for details.

The MAQL lexer and parser are retrieved as a dependency from NPM, after build in gdc-nas
repository.

You may want to test out how changes to MAQL grammar affect the MAQL language server
before such changes are pushed to the repository.

For this purpose you may want to link the folder with the @gooddata/maql-antlr4ts source codes directly.

First move into the folder containing package.json for the dependency. This may be something like
`gdc-nas/libraries/calq/maql-parser/npm-lib`

#### WARNING:

Do not use `yarn link` to link `@gooddata/maql-antlr4ts`. The cause is not exactly clear, possibly library conflicts, but after
linking, antlr4 tokens in token streams have all indices set to -1.

This means that the `antlr4-c3` library will give incorrect results and completions tests will fail. There is no known
fix so far, other than using a different linking method such as [yalc](https://github.com/wclr/yalc) or rsync.

---

## MAQL changes checklist

After you update to a newer version of `@gooddata/maql-antlr4ts ` this checklist serves to verify that the changes
are reflected in the language server. The checklist tries to be as exhaustive as possible while not being
overwhelming. This also means that it can quickly become outdated, so please update any inaccuracies whenever
you encounter them. Also, most changes to MAQL will not require all the steps here mentioned. As an extra step,
please add test cases for new changes when possible.

#### 1. Fix tests (`rushx test`)

Tests may fail if any MAQL grammar rules were changed. But adding new rules will most likely not cause
any test failures. This may also be the last step in many cases.

#### 2. Add semantic highlighting to new tokens - [semantics.ts](./src/semantics.ts) - [semantics.test.ts](./test/semantics.test.ts)

Any new tokens need to have semantic highlighting manually added. Choose appropriate category.
If the highlighting depends on context (this is the case for example for curly brace tokens `{`, `}`
in labels and facts), you need to extend the SemanticTokenizer class for those cases. If you need to
add a new category (not recommended), you will also need to update the clients with the name and colour
of the new category - for example in [useMaqlTheme.ts](../web-app/src/MaqlEditor/maql/hooks/useMaqlTheme.ts).

#### 3. Add completions - [completions](./src/completions) - [completions.test.ts](./test/completions.test.ts)

You should add new completions if you added a rule or a token to MAQL Grammar.

To provide MAQL completions, we are using the [antlr4-c3](https://github.com/mike-lischke/antlr4-c3) library
which takes the grammar and gives us a list of tokens that continue the already written query.
However that is not enough for us as we want to be smarter.

##### 3.1 Add completion descriptions - [descriptions.ts](./src/completions/descriptions.ts)

Each completion item is based on a description in the file. Most things can be copied from the examples already
there, but pay special attention to properties `triggerTokenId` and `ruleId`. Only one of those can be set for
each description, and it signifies when the completion should be shown. If `triggerTokenId` is set, then it will
be shown any time that token is suggested. This is good in most cases but some tokens can have multiple conflicting
meanings. In that case you can use `ruleId` which will on encountering the grammar rule with that id ignore all
tokens and only suggest completions that use the same `ruleId`.

##### 3.2 Add special cases - [complete.ts](./src/completions/complete.ts)

For most cases, adding the description is enough. If something more special is required
(like label elements completions), you must delve into the `complete.ts` file and add that case manually.

#### 4. Add diagnostics - [diagnostics.ts](./src/diagnostics.ts) - [diagnostics.test.ts](./test/diagnostics.test.ts)

Diagnostics from grammar are generated automatically. Change `diagnostics.ts` only if you need a special case
or if you added an error token to MAQL Lexer.

#### 5. Add auto-format rule - [format.ts](./src/format.ts) - [format.test.ts](./test/format.test.ts)

Automatic formatting is quite tightly coupled to the MAQL grammar, so there is a chance it is broken after a change.
Try adding a test case to `format.test.ts` to see what happens.

## Scripts

### Documentation update

```
rushx update-docs <path/to/docs/directory/content>
```

This script, stored at `src/scripts/docsParser.ts`, will take `.md` files in `<path/to/docs/directory/content>`
and transform them into `.ts` files in `src/docs/`, along with an `index.ts` file to easily access the documentation
from inside the server.

The path to docs should point to the directory where different language versions are stored. For
example `docs-repository/docs/content`, where content has `en`, `es`, `fr` etc. folders.

The script should be run only if there are changes to the documentation in the documentation directory.
