# GoodData.UI SDK - Interactive Examples

Here are basic usage examples of [GoodData.UI](https://github.com/gooddata/gooddata-ui-sdk).

## List of Examples

<!---{LIST-START}-->

- Attribute Filter Example - [open in CodeSandbox](https://codesandbox.io/p/sandbox/github/gooddata/gooddata-ui-sdk/tree/master/examples/sdk-interactive-examples/examples/example-attributefilter?file=/src/example/Example.tsx)

- Chart config manipulation - [open in CodeSandbox](https://codesandbox.io/p/sandbox/github/gooddata/gooddata-ui-sdk/tree/master/examples/sdk-interactive-examples/examples/example-chartconfig?file=/src/example/Example.tsx)

- ColumnChart - [open in CodeSandbox](https://codesandbox.io/p/sandbox/github/gooddata/gooddata-ui-sdk/tree/master/examples/sdk-interactive-examples/examples/example-columnchart?file=/src/example/Example.tsx)

- ComboChart - [open in CodeSandbox](https://codesandbox.io/p/sandbox/github/gooddata/gooddata-ui-sdk/tree/master/examples/sdk-interactive-examples/examples/example-combochart?file=/src/example/Example.tsx)

- Dashboard component - [open in CodeSandbox](https://codesandbox.io/p/sandbox/github/gooddata/gooddata-ui-sdk/tree/master/examples/sdk-interactive-examples/examples/example-dashboard?file=/src/example/Example.tsx)

- DateFilter - [open in CodeSandbox](https://codesandbox.io/p/sandbox/github/gooddata/gooddata-ui-sdk/tree/master/examples/sdk-interactive-examples/examples/example-datefilter?file=/src/example/Example.tsx)

- Dependent Filters Example - [open in CodeSandbox](https://codesandbox.io/p/sandbox/github/gooddata/gooddata-ui-sdk/tree/master/examples/sdk-interactive-examples/examples/example-dependentfilters?file=/src/example/Example.tsx)

- Execute - [open in CodeSandbox](https://codesandbox.io/p/sandbox/github/gooddata/gooddata-ui-sdk/tree/master/examples/sdk-interactive-examples/examples/example-execute?file=/src/example/Example.tsx)

- Granularity - [open in CodeSandbox](https://codesandbox.io/p/sandbox/github/gooddata/gooddata-ui-sdk/tree/master/examples/sdk-interactive-examples/examples/example-granularity?file=/src/example/Example.tsx)

- Headline - [open in CodeSandbox](https://codesandbox.io/p/sandbox/github/gooddata/gooddata-ui-sdk/tree/master/examples/sdk-interactive-examples/examples/example-headline?file=/src/example/Example.tsx)

- PivotTable - [open in CodeSandbox](https://codesandbox.io/p/sandbox/github/gooddata/gooddata-ui-sdk/tree/master/examples/sdk-interactive-examples/examples/example-pivottable?file=/src/example/Example.tsx)

- RelativeDateFilter - [open in CodeSandbox](https://codesandbox.io/p/sandbox/github/gooddata/gooddata-ui-sdk/tree/master/examples/sdk-interactive-examples/examples/example-relativedatefilter?file=/src/example/Example.tsx)

- Repeater Example - [open in CodeSandbox](https://codesandbox.io/p/sandbox/github/gooddata/gooddata-ui-sdk/tree/master/examples/sdk-interactive-examples/examples/example-repeater?file=/src/example/Example.tsx)

<!---{LIST-END}}-->

## Running Examples in CodeSandbox using GitHubBox

An easy way to open an example in [CodeSandbox](https://codesandbox.io/) via URL is with [GitHubBox.com](https://github.com/dferber90/githubbox). Append 'box' to the github.com URL in between 'hub' and '.com' and it will redirect to CodeSandbox. Here's an example:

Change the GitHub URL:\
https://github.com/gooddata/gooddata-ui-sdk/tree/master/examples/sdk-interactive-examples/examples/example-attributefilter.

To:\
https://githubbox.com/gooddata/gooddata-ui-sdk/tree/master/examples/sdk-interactive-examples/examples/example-attributefilter

## Running Examples locally

You can also run any example on your localhost.

#### Clone whole SDK

1.  Install [nvm](https://github.com/nvm-sh/nvm)
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
    ```
2.  Clone and bootstrap

    ```bash
    git clone git@github.com:gooddata/gooddata-ui-sdk.git
    cd gooddata-ui-sdk
    nvm install
    nvm use
    npm i -g @microsoft/rush
    rush install
    ```

3.  Build

    ```bash
    rush build
    ```

4.  Navigate to example directory

    ```bash
    cd examples/sdk-interactive-examples/examples/example-attributefilter
    ```

5.  Run example

    ```bash
    npm run start
    ```

#### Clone just example directory

1. ```bash
    navigate to example directory
   ```
2. ```bash
    npm run update-version
   ```
3. ```bash
    npm install
   ```
4. ```bash
    npm start
   ```

# Developers guide

## Examples template

The template application in the examples-template directory serves as the foundation for each example. This template is utilized for updating and creating new examples. The entire content, excluding the src/example and .example directories, is synchronized between the template and the example directory.

## Example

The example application in the example directory represents an example. Within the ./src/example directory, you'll find the example code, and within the ./.example directory, there are example-specific files like preview.png. These directories are not synchronized with the template. All other files or directories will not be retained during an update.

In package.json, each example defines:

- name: The name of the package.
- title: The title of the example.
- description: The description of the example.
- exampleDependencies: Specific example dependencies, define dependencies that should by added after template update.

This information persists through template updates and is used to define readme.md and CodeSandbox templates links etc.

## Creating new Example

The tool uses `rsync` to copy changed files.

1. ```bash
    Navigate to the sdk-interactive-examples directory.
    cd sdk-interactive-examples
   ```
2. ```bash
       npm run create-example
   ```
    The script will ask you for example-directory **name**, **title** and **description**, after that will bootstrap new example application base on template. Prepare **package.json** and generate **readme.md** also list of all examples in readme.md in examples root directory.

Navigate to the newly created example directory and begin implementing your example within the **src/example** directory. The entry point is a default exported parameterless component located in **Example.tsx**.

After you finish example coding create preview of example (1024\*768px)PNG and save it to **.example/preview.png**

## Adding example specific dependencies

Each example is valid package in rush monorepo if you need add specific example dependencies, its needed to add via rush command. Rush will check version etc. (Only one version of package is allowed in monorepo)

```
rush add -p highcharts -m
```

After that is necessary specify name of newly added dependency in **package.json** in array **exampleDependencies**

```
"exampleDependencies": [
    "highcharts",
],
```

## Validating example

In sdk-interactive-examples directory are prepared validating scripts. This scripts checks that additional example dependencies are also defined in example package.json in array **exampleDependencies**

1. ```bash
    Navigate to the sdk-interactive-examples directory.
    cd sdk-interactive-examples
   ```
2. ```bash
    npm run validate
   ```

## Updating example

The tool uses `rsync` to copy changed files.

If you change **description**, **title** in example package.json is necessary propagate changes into other files like sandboxcode template, list of examples in root readme.md, example readme.md etc.

1. ```bash
    Navigate to the sdk-interactive-examples directory.
    cd sdk-interactive-examples
   ```
2. ```bash
    npm run update-examples-template
   ```

Script will do it for you

## Updating template

All files in the template are synchronized with example directories, except for the **src/example** and **.example** directories, which are excluded from synchronization.

Information such as **name**, **title**, **description**, and **exampleDependencies** in package.json persists through updates. Additionally, **dependencies** with names defined in exampleDependencies also persist through updates.

After you are done with template update

1. ```bash
    Navigate to the sdk-interactive-examples directory.
    cd sdk-interactive-examples
   ```
2. ```bash
    npm run update-examples-template
   ```

## Updating Catalog Export

At first we need update Catalog in examples-template directory and than update template to all examples.
Do not update catalog in specific example. It will be lost in next template update.

1. ```bash
    Navigate to the examples-template directory.
    cd examples-template
   ```
2. ```bash
    npm run refresh-md
   ```
3. ```bash
    Navigate to the sdk-interactive-examples directory.
    cd sdk-interactive-examples
   ```
4. ```bash
    npm run update-examples-template
   ```

## License

(C) 2017-2021 GoodData Corporation

This repository is under the GoodData commercial license available in the [LICENSE](LICENSE) file because it contains a commercial package, HighCharts.
