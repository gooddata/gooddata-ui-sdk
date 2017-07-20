# GoodData React Components

## Installation
```
yarn add @gooddata/react-components
```

## Usage
[Documentation in Confluence](https://confluence.intgdc.com/display/VS/React+Components)

## Releasing
git checkout master && git pull upstream master --tags
npm version patch -m "Release v%s"
npm publish --access=restricted
git push upstream master --tags
