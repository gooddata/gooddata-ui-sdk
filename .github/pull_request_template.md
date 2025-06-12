<!--
Description of changes.
-->

---

> [!IMPORTANT]
> Please, **don't forget to run `rush change`** for the commits that introduce **new features** or **significant changes** 🙏 This information is used to generate the [change log](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-all/CHANGELOG.md).

---

### Run extended test by pull request comment

Commands can be triggered by posting a comment with specific text on the pull request. It is possible to trigger multiple commands simultaneously.

```
extended-test --backstop | --integrated | --isolated | --record [--filter <file1>,<file2>,...,<fileN>]
```

#### Explanation

-   `--backstop` The command to run screen tests (optionally with keeping passing screenshots).
-   `--integrated` The command to run integrated tests against the live backend.
-   `--isolated` The command to run isolated tests against recordings.
-   `--record` The command to create new recordings for isolated tests.
-   `--filter` (Optional) A comma-separated list of test files to run. This parameter is valid only for the `--integrated`, `--isolated`, and `--record` commands.

#### Examples

```
extended-test --backstop
extended-test --backstop --keep-passing-screenshots
extended-test --integrated
extended-test --integrated --filter test1.spec.ts,test2.spec.ts
extended-test --isolated
extended-test --isolated --filter test1.spec.ts,test2.spec.ts
extended-test --record
extended-test --record --filter test1.spec.ts,test2.spec.ts
```

#### Commands for Bear platform working on branch rel/9.9

```
extended-test-legacy --backstop
extended-test-legacy --isolated
extended-test-legacy --record
```
