# Release process

DISCLAIMER: the process described below is run manually now, but we want to automate all of this on build servers. So if all this seems scary, don't worry :)

## Bumping the version

First, you need to specify which version you want to create. To do that, edit the `"nextBump"` property in `common/config/version-policies.json`.
Then bump the version – this will update all the package.json files and if the new version is not a prerelease, it will update CHANGELOGS as well:

```bash
rush version --bump --override-prerelease-id alpha
```

## Publishing the new version

First, to check everything is working, run the publish in dry-run mode:

```bash
rush publish --include-all
```

Then, if the that command ran successfully and you are completely sure what you are doing, run

```bash
rush publish --include-all -p
```

That will publish the packages to NPM and will create a git tag. Commit and push these changes.
