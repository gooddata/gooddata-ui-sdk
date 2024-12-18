<!--
Description of changes.
-->

---

> [!IMPORTANT]
> Please, **don't forget to run `rush change`** for the commits that introduce **new features** 🙏

---

Refer to [documentation](https://github.com/gooddata/gooddata-ui-sdk/blob/master/dev_docs/continuous_integration.md) to see how to run checks and tests in the pull request. This is the list of the most used commands:

### Run extended test by pull request comment

```
extended-test --backstop | --integrated | --isolated | --record [--filter <file1>,<file2>,...,<fileN>]
```

#### Explanation

-   `--backstop` The command to run screen tests.
-   `--integrated` The command to run integrated tests against the live backend.
-   `--isolated` The command to run isolated tests against recordings.
-   `--record` The command to create new recordings for isolated tests.
-   `--filter` (Optional) A comma-separated list of test files to run. This parameter is valid only for the `--integrated`, `--isolated`, and `--record` commands.

#### Examples

```
extended-test --backstop
extended-test --integrated
extended-test --integrated --filter test1.spec.ts,test2.spec.ts
extended-test --isolated
extended-test --isolated --filter test1.spec.ts,test2.spec.ts
extended-test --record
extended-test --record --filter test1.spec.ts,test2.spec.ts
```
