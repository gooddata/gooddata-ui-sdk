// (C) 2022 GoodData Corporation

const core = require("@actions/core");
const load = require("@commitlint/load").default;
const read = require("@commitlint/read").default;
const lint = require("@commitlint/lint").default;
const format = require("@commitlint/format").default;

const prHead = core.getInput("pr_head");
const prBase = core.getInput("pr_base");
const configFilePath = core.getInput("lint_config");

const FOOTER_REGEX = /\n((JIRA\:\s[A-Z]+-\d+(, [A-Z]+-\d+)*)|TRIVIAL)(\n+)?$/;

Promise.all([
    load({}, { file: configFilePath, cwd: process.cwd() }),
    read({ from: prBase, to: prHead }),
]).then((tasks) => {
    const [{ rules, parserPreset, helpUrl, defaultIgnores }, commits] = tasks;

    const lintTasks = commits.map((commit) =>
        lint(
            commit,
            rules,
            parserPreset
                ? {
                      parserOpts: parserPreset.parserOpts,
                      helpUrl,
                      defaultIgnores,
                      ignores: [(message) => message.startsWith("Merge ")],
                  }
                : {},
        ),
    );

    Promise.all(lintTasks).then((results) => {
        const formattedReport = format({ results }, { helpUrl });
        core.info(formattedReport);

        const allCommitsAreValid = results.every((report) => report.valid);
        const allCommitsHaveTicket = commits.every((commit) => {
            return FOOTER_REGEX.test(commit);
        });

        if (allCommitsAreValid && allCommitsHaveTicket) {
            core.info("✅ Every commit message is formatted according to the contribution guide");
        } else {
            core.setFailed("⚠️ Not every commit message is formatted according to the contribution guide.");
        }
    });
});
