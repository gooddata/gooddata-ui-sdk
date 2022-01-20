# GoodData.UI SDK

## Getting Started

The easiest way to start developing analytical applications using GoodData.UI SDK is to use
the [Accelerator Toolkit](https://github.com/gooddata/gooddata-create-gooddata-react-app). You will
be up and running in minutes.

For detailed description of available components and capabilities see the [official documentation](https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html).

You can also view our [live examples](https://gdui-examples.herokuapp.com/login) or start the live examples
[application locally](examples/sdk-examples).

## Contributing

### Getting started

1.  Install nvm; for instance: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash`
2.  Clone and bootstrap

    ```bash
    git clone git@github.com:gooddata/gooddata-ui-sdk.git
    cd gooddata-ui-sdk
    nvm install
    nvm use
    npm i -g @microsoft/rush
    rush install
    ```

3.  Build: `rush build`
4.  Read the [contribution guide](./docs/contributing.md)

**HINT**: The repository includes the `.envrc` configuration file for [direnv](https://direnv.net/); you can use this
to auto-nvm-use the correct node.js installation every time you enter the `gooddata-ui-sdk` directory.

### After you pull latest changes

Always run `rush install`; this will make sure all the dependencies from the lock file will be installed in all
the projects managed in the repository. After that run `rush build`.

In case the pull brings in new projects or large bulk of changes, it is safer (albeit more time-consuming) to run
`rush install && rush link --force && rush clean && rush rebuild`.

> You can find more technical information in [contributor manual](./docs/contributing.md) and in [developer guide](./docs/sdk-dev.md).

## License

(c) 2017-2022 GoodData Corporation

This repository is under a GoodData commercial license available in the [LICENSE](LICENSE) file because it contains a
commercial package, HighCharts. Subdirectories containing the MIT license are not subject to the GoodData
commercial license and do not contain any commercial code.
Please see the [NOTICE](NOTICE) file for additional licensing information related to this project's third-party open source components.
