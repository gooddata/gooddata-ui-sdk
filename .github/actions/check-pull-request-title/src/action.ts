// (C) 2022 GoodData Corporation

const core = require("@actions/core");

const REGULAR_CHANGE_REGEX = /^(FEATURE|BUGFIX|RELATED|TRIVIAL|CONFIG): [A-Z0-9]+-\d+(, [A-Z0-9]+-\d+)* .+/;
const TRIVIAL_CHANGE_REGEX = /^(TRIVIAL|CONFIG): .+/;
const CROSS_MERGE_REGEX = /^Merge yenkins-admin:.?/;

try {
    const title = core.getInput("pull_request_title");
    if (
        REGULAR_CHANGE_REGEX.test(title) ||
        TRIVIAL_CHANGE_REGEX.test(title) ||
        CROSS_MERGE_REGEX.test(title)
    ) {
        console.log("The pull request title is valid 🎉");
    } else {
        core.setFailed(`
The pull request title "${title}" does not match the contribution guide rules.

The correct format is either:
    \`CHANGE_TYPE: JIRA_TICKET_ID description\`, or
    \`CHANGE_TYPE: JIRA_TICKET_ID1, JIRA_TICKET_ID2 description\`, or
    \`CHANGE_TYPE: description\` for trivial changes

CHANGE_TYPE can be:
    - FEATURE
    - BUGFIX
    - RELATED
    - TRIVIAL
    - CONFIG

- JIRA_TICKET_ID:
    - must be upper cased ID of the JIRA ticket, for example TNT-465
    - is mandatory unless CHANGE_TYPE is TRIVIAL or CONFIG
`);
    }
} catch (error) {
    core.setFailed(error.message);
}
