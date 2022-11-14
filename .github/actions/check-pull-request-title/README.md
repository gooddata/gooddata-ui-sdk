# Checkout pull request title

Simple action that checks if pull request title adheres to SDK contribution guide rules.

## Usage

```
- uses: ./.github/actions/check-pull-request-title
with:
  pull_request_title: ${{ github.event.pull_request.title }}
```

## Development

The action is executed from compiled `build/index.js` file that is versioned otherwise action would not
be able to use it after the checkout. The action is compiled from `src/action.ts` file and
all the dependencies linked in it.

The build is done by [@vercel/ncc](https://github.com/vercel/ncc) tool.

1. Run `yarn install --frozen-lockfile` to install all the dependencies.
2. If you update code in `src` directory run `yarn build` to rebuild `build/index.js`.
3. Commit the changes, including the `build/index.js` file that contains the compiled action for GitHub runner.
