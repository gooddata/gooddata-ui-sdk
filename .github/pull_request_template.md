<!--

Description of changes.

-->

---

Supported PR commands:

| Command                                                 | Description                                                |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| `ok to test`                                            | Re-run standard checks                                     |
| `extended check sonar`                                  | SonarQube tests                                            |
| `extended test - backstop`                              | BackstopJS tests                                           |
| **E2E Cypress tests commands - TIGER**                  |                                                            |
| `extended test - tiger-cypress - isolated <testName>`   | Run isolated tests running against recorded Tiger backend. |
| `extended test - tiger-cypress - record <testName>`     | Create a new recording for isolated Tiger tests.           |
| `extended test - tiger-cypress - integrated <testName>` | Run integrated tests against live backend                  |
| **E2E Cypress tests commands - BEAR**                   |                                                            |
| `extended test - cypress - isolated <testName>`         | Run isolated tests running against recorded Bear backend.  |
| `extended test - cypress - record <testName>`           | Create a new recording for isolated Bear tests.            |
| `extended test - cypress - integrated <testName>`       | Run integrated tests against live backend                  |
| **Compatibility matrix test commands - TIGER Backend**  |                                                            |
| `extended test - matrix-test <AIO_version>`             | Run integrated tests against AIO versions.                 |

`<testName>` in cypress commands is used to filter specfiles. Example, to run record with BEAR backend

-   Against `dashboard.spec.ts` and `drilling.spec.ts`, execute command `extended test - cypress - record dashboard,drilling`
-   Against all specfiles, execute command `extended test - cypress - record` or `extended test - cypress - record *`

`<AIO_version>` in commands is used to start test with multiple AIO instances - each instance in triggered by one jenkins build

-   To run with `master` and `stable`, execute command `extended test - matrix-test master,stable` or `extended test - matrix-test latest`
-   To run with specific version,ex: `2.3.0` and `2.3.1`, execute command `extended test - matrix-test 2.3.0,2.3.1`
-   In case `<AIO_version>` is empty, read versions from file `compTigerVersions.txt` of this repo

---


# PR Checklist

-   [ ] commit messages adhere to the [commit message guidelines](https://github.com/gooddata/gooddata-ui-sdk/blob/master/docs/contributing.md#what-should-the-commits-look-like)
-   [ ] review was done by a Code owner [if necessary](https://github.com/gooddata/gooddata-ui-sdk/blob/master/docs/contributing.md#how-do-i-tell-if-my-pull-request-needs-approval-by-a-code-owner) (if you think it is not necessary, explain the reasoning in the description or in a comment)
-   [ ] `check` passes
-   [ ] `extended test - backstop` passes
-   [ ] `extended test - tiger-cypress - record` to record new mapping files (Tiger BE)
-   [ ] `extended test - cypress - record` to record new mapping files (Bear BE)
-   [ ] `extended test - tiger-cypress - isolated` passes
-   [ ] `extended test - cypress - isolated` passes
-   [ ] `extended test - tiger-cypress - integrated` passes
-   [ ] `rush change` [was run if applicable](https://github.com/gooddata/gooddata-ui-sdk/blob/master/docs/contributing.md#how-do-i-describe-my-changes-for-the-changelog)
