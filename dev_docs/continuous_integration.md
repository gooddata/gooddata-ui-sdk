# Continuous Integration

The application primarily uses Jenkins for continuous integration. Some checks also run in GitHub actions in GitHub environment.

## Triggering of CI commands from pull request

Some CI jobs and checks can be triggered by posting a comment with a specific text to the pull request.
See the list of available commands in the next chapter.

### Limiting commands by a test file name or AOI version

Most of the commands below supports **filtering by spec files** (by a name of file with Cypress e2e tests).
Use the spec file name (delimited by comma in the case of multiple tests) in `<testNames>` placeholder in the
commands in the table below.

Example how to run test fixture recording with Tiger backend:

```
// for specific test files `dashboard.spec.ts` and `drilling.spec.ts`
extended test - tiger-cypress - record dashboard,drilling

// for all spec tests in the suite use one of the following
extended test - tiger-cypress - record
extended test - tiger-cypress - record *
```

## List of available pull request commands

### Run BackstopJS tests

Run BackstopJS screenshot tests against recorded mock backend.

The link to the tests result is posted to the PR once the tests finish. Use the result link to grab the
updated screenshots in the case the tests were run on PR that changes the functionality or design of
the tested UI components or when new BackstopJS tests were introduced by the PR.

```
extended test - backstop
```

### Run integrated tests

Run integrated tests running against live backend.

```
// tiger platform
extended test - tiger-cypress - integrated
extended test - tiger-cypress - integrated <testNames>

// bear platform
extended test - cypress - integrated
extended test - cypress - integrated <testNames>
```

### Run isolated tests

Run isolated tests running against recorded backend.

```
// tiger platform
extended test - tiger-cypress - isolated
extended test - tiger-cypress - isolated <testNames>

// bear platform
extended test - cypress - isolated
extended test - cypress - isolated <testNames>
```

### Record isolated tests

Create a new recording for isolated tests.

The recording will be posted to pull request as a link to Jenkins artifact.

To record `editMode.spec.ts` test, set `editMode` as `<testNames>` parameter value.

To record all the tests, use `*` as `<testNames>` parameter value.

```
// tiger platform
extended test - tiger-cypress - record
extended test - tiger-cypress - record *
extended test - tiger-cypress - record <testNames>

// bear platform
extended test - cypress - record
extended test - cypress - record *
extended test - cypress - record <testNames>
```

### Run integrated compatibility matrix tests against AIO versions

`<AIO_version>` in commands is used to start test with multiple All-in-One (AIO) Tiger images - each
instance in triggered by one jenkins build.

If `<AIO_version>` parameter is empty, the versions are read from `./compTigerVersions.txt` file in
this repository.

```
// run the tests against image build from specific release streams, for example `master` and `stable`
extended test - matrix-test master,stable

// run the tests against the latest AIO image
extended test - matrix-test latest

// to run with specific version,ex: `2.3.0` and `2.3.1`
extended test - matrix-test 2.3.0,2.3.1

// run tests with versions specified in ./compTigerVersions.txt
extended test - matrix-test
```

### Run SonarQube scan

Run SonarQube scan on the files in pull request.

```
extended check sonar
```

### Re-run basic check

The basic checks are executed. These are the checks that are automatically started with each commit push into the pull request. However, sometimes they are not executed or they fail because of the error in CI and you need to re-run them because this check is required for the successful merge.

```
ok to test
```
