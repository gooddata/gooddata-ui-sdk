<!--

Description of changes (if multi-commit, short global summary & context;
if single-commit, feel free to leave empty).

-->

---

[Check PR owner responsibilities](https://confluence.intgdc.com/display/Development/Code-reviews#Code-reviews-Ownerresponsibilities)

Supported PR commands:

Command | Description
--- | ---
`extended test - examples` | Live examples tests
`extended test - storybook` | Storybook screenshot tests

See more [options](https://confluence.intgdc.com/display/kbhr/How+to+work+with+git+and+Github#HowtoworkwithgitandGithub-Extendedchecks).

# PR Checklist

- [ ] Verify code changes ([Checklist](https://confluence.intgdc.com/display/Development/Code-reviews+checklist), [Best practices](https://confluence.intgdc.com/display/Development/Code-reviews+best+practices))
- [ ] [Verify pull-request formalities](https://confluence.intgdc.com/display/Development/Code-reviews)
- [ ] Change was tested by using [gdc-dev-release](https://confluence.intgdc.com/display/~tomas.vojtasek/Private+NPM) in [gdc-analytical-designer](https://github.com/gooddata/gdc-analytical-designer) and [gdc-dashboards](https://github.com/gooddata/gdc-dashboards) (if applicable)
- [ ] Migration guide (for major changes) is mentioned in [CHANGELOG.md](../blob/master/CHANGELOG.md).
- [ ] Successful `extended test - examples`
- [ ] Successful `extended test - storybook`
- [ ] Checked yarn.lock consistency (no dep. duplicities especially Goodstrap)


# Related PRs
<!-- Mandatory 

Example:
- gdc-analytical-designer: https://github.com/gooddata/gdc-analytical-designer/pull/2072

-->

- gdc-analytical-designer:
- gdc-dashboards:

# Related Jira tasks
<!-- Optional

Example:
- FET-236: https://jira.intgdc.com/browse/FET-236

 -->
