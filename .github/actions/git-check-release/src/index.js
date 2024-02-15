// (C) 2024 GoodData Corporation

const core = require("@actions/core");
const github = require("@actions/github");
const semver = require("semver");

async function run() {
    try {
        const newVersion = core.getInput("version", { required: true });
        // Access the GitHub token from the environment variables
        const token = process.env.GITHUB_TOKEN;
        const octokit = github.getOctokit(token);
        const { owner, repo } = github.context.repo;

        // Fetch the latest release from the GitHub repository
        const { data: latestRelease } = await octokit.rest.repos.getLatestRelease({
            owner,
            repo,
        });

        // Extract version from the latest release tag
        const latestVersion = latestRelease.tag_name.startsWith("v")
            ? latestRelease.tag_name.substring(1)
            : latestRelease.tag_name;

        console.log(`latest release: ${latestVersion}`);

        // Determine if the new version is greater than the latest version
        const isLatest = semver.gt(newVersion, latestVersion);

        console.log(`New version: ${newVersion}`);
        console.log(`is-latest: ${isLatest}`);
        // Set output
        core.setOutput("is-latest", isLatest.toString());
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
