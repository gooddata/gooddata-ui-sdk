# Release process

DISCLAIMER: the process described below is run manually now, but we want to automate all of this on build servers. So if all this seems scary, don't worry :)

The release process consists of two steps – bumping the version and publishing the new version. Both are described below.

## Bumping the version

Bumping the version does two things:

1. it updates all the package.json files with the new version number (both in `version` and in `dependencies`/`devDependencies`)
2. if the new version is not a prerelease, it updates CHANGELOGS as well

To bump the version use the following command :

```bash
rush version --bump --override-prerelease-id alpha [--override-bump BUMPTYPE]
```

where `BUMPTYPE` is one of `prerelease, patch, preminor, minor, major` – defaults to `prerelease` (this is configured in `common/config/rush/version-policies.json` in the `nextBump` setting).

Note: the `--override-prerelease-id alpha` is necessary for having prerelease versions in the format of `8.0.0-alpha.1` instead of the default `8.0.0-1`. There is unfortunately no way of configuring this in a config file.

## Publishing the new version

Publishing does what you'd expect: it publishes packages to NPM registry.

First, to check everything is working, run publish in dry-run mode:

```bash
rush publish --include-all
```

Then, if the that command ran successfully and you are completely sure what you are doing, run

```bash
rush publish --include-all -p
```

That will publish the packages to NPM and will create a git tag. Commit and push these changes.
