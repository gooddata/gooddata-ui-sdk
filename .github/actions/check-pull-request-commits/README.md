# Checkout pull request commits

Simple action that checks if pull request commits adhere to SDK contribution guide rules.

## Usage

```
  - name: Checkout
    uses: actions/checkout@v3
    with:
      fetch-depth: 0
  - name: Set commit range variables
    run: |
      echo "PR_HEAD=${{ github.event.pull_request.head.sha }}" >> $GITHUB_ENV
      echo "PR_BASE=${{ github.event.pull_request.base.sha }}" >> $GITHUB_ENV
  - name: Install dependencies
    run: |
      cd ./.github/actions/check-pull-request-commits
      yarn install --frozen-lockfile
  - name: Check commit messages
    uses: ./.github/actions/check-pull-request-commits
    with:
      pr_head: ${{ env.PR_HEAD }}
      pr_base: ${{ env.PR_BASE }}
      lint_config: ./.github/actions/check-pull-request-commits/commitlint.config.js
```

## Development

The action is executed from its build `action-build/index.js`.

To modify action go to action dir and run

```
npm run install
```

after that call

```
npm run build
```

Commit also content of action-build dir
