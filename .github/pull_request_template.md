<!--

Description of changes.

-->

---

Supported PR commands:

| Command                  | Description             |
| ------------------------ | ----------------------- |
| `ok to test`             | Re-run standard checks  |
| `extended test`          | BackstopJS tests        |
| `extended check sonar`   | SonarQube tests         |
| `extended check cypress` | Cypress E2E tests       |
| `extended check plugins` | Dashboard plugins tests |

---

# PR Checklist

-   [ ] commit messages adhere to the [commit message guidelines](https://github.com/gooddata/gooddata-ui-sdk/blob/master/docs/contributing.md#what-should-the-commits-look-like)
-   [ ] review was done by a Code owner [if necessary](https://github.com/gooddata/gooddata-ui-sdk/blob/master/docs/contributing.md#how-do-i-tell-if-my-pull-request-needs-approval-by-a-code-owner) (if you think it is not necessary, explain the reasoning in the description or in a comment)
-   [ ] `check` passes
-   [ ] `check-extended` passes
-   [ ] `check-extended-cypress` passes
-   [ ] `rush change` [was run if applicable](https://github.com/gooddata/gooddata-ui-sdk/blob/master/docs/contributing.md#how-do-i-describe-my-changes-for-the-changelog)
