# Release process

> :information_source: This document serves as a technical description, not a guide. You should never have to do this manually, always use the corresponding github workflows. Starting with version 11.7 all the releases are done via `gdc-ui`. For patching older versions, use workflows in this repository.

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

## Rush Version bumping behavior

This is a documentation of observed behavior of `rush version` command. The various release scripts are designed with this behavior in mind.

### From state: prerelease (e.g. 8.0.0-alpha.#)

- `rush version --bump --override-bump patch|minor|major`

    **Result**: bumps to 8.0.0 - regardless of the value of --override-bump

    _Note_: The `override-prerelease-id` is ignored

- `rush version --bump --override-bump preminor`

    **Result**: bumps to 8.1.0-#

    _Note_: The `override-prerelease-id` value is taken into account. Thus running `rush version --bump --override-bump preminor --override-prerelease-id alpha`
    would result in bump to "8.1.0-alpha.#"

- `rush version --bump --override-bump prerelease`

    **Result**: bumps to 8.0.0-alpha.#+1

    _Note_: the `override-prerelease-id` value is taken into account. Can be used to switch prerelease type. See below.

- `rush version --bump --override-bump prerelease --override-prerelease-id beta`

    **Result**: bumps to 8.0.0-beta.0; will not update changelogs

    _Note_: the prerelease ID can be whatever we want. There is a sanity check in place though: it is not possible to switch prerelease
    ID to a lower version. It appears that comparison is done using typical '>' operators. Thus alpha < beta - which is lucky OK. However careful,
    the comparator is case sensitive and according to the JS rules 'RC' < 'alpha'.

### From state: release (e.g. 8.0.0)

- `rush version --bump --override-bump patch|minor|major`

    **Result**: as expected, creates 8.0.1, 8.1.0 or 9.0.0

    _Note_: The `override-prerelease-id` is ignored

- `rush version --bump --override-bump prerelease --override-prerelease-id alpha`

    **Result**: creates prerelease for next patch release. e.g.: 8.0.1-alpha.0

- `rush version --bump --override-bump preminor --override-prerelease-id alpha`

    **Result**: creates prerelease for the next minor release: 8.1.0-alpha.0

### Summary

It is important to remember that:

- moving between prerelease version is possible and can be done as long as the next prerelease ID
  compares 'greater' than current prerelease ID.
- moving from prerelease version to official version is always about stripping away the `-*` part
  of the release
- moving from official version to prerelease of the next minor or patch version is possible.
- moving from official version to prerelease of the next major version is not possible (seems like
  this either has to be done 'manually' or using some kind of additional version overrides)
