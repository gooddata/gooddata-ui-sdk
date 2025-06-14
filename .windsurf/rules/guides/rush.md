---
trigger: model_decision
description: Common rush.js commands
globs:
---

# Rush Rules and Guidelines

## Overview

-   This repository uses Rush as the monorepo management system and build orchestrator
-   Rush configuration files are located in `./common/config/rush/`
-   The repository follows a lockStepVersion policy for all SDK packages (all packages share the same version)

## Package Management

-   PNPM is used as the package manager
-   Never use `npm`, `yarn`, or direct `pnpm` commands to add/remove packages
-   Use `rush add -p <package>@^<version> --make-consistent` to add new dependencies
-   Remove dependencies by editing the package.json and running `rush update`
-   The repository enforces consistent versioning across packages via `ensureConsistentVersions: true`

## Common Commands

-   `rush install` - Install dependencies per the lock file (use after every pull)
-   `rush update` - Update dependencies conservatively and update lockfile
-   `rush build` - Build all projects in the correct dependency order
-   `rush clean` - Clean all build and test artifacts (requires rebuild after)
-   `rush validate` - Run all validation (linting, etc.) in all projects
-   `rush test-once` - Run tests for all projects
-   `rush test-ci` - Run tests in CI mode with coverage reporting
-   `rush prettier-check` - Verify code formatting in all projects
-   `rush prettier-write` - Format code in all projects
-   `rush dep-cruiser` - Run dependency analysis on all projects

## After Changes

-   After pulling latest changes, always run `rush install` followed by `rush build`
-   For major updates or structural changes, use `rush clean && rush purge && rush install && rush rebuild`

## Documentation & API

-   Use `rush build-docs` to build API documentation for the entire SDK
-   Use `rush start-docs` to build and run the documentation server
-   Projects should maintain API documentation using API Extractor

## Local Development

-   Use `rush publish-local` to publish SDK packages to local files for testing
-   Certificates for local development can be installed using `rush install-certs`

## Commits

-   Follow the Conventional Commits specification as required by CI checks
-   Format: `<type>(<scope>): <description>` with appropriate body and footer
-   Always include risk level and JIRA ticket references in the commit message

## Project Architecture

-   Projects follow a layered architecture with clear dependencies
-   Projects must adhere to the architectural constraints defined in dev_docs/sdk-dev.md
-   No cyclic dependencies are allowed between packages
