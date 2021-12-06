# GoodData UI.SDK - Catalog Export

Catalog export is a command line program which loads metadata - Logical Data Model (LDM) and User Data Model (UDM)
from the workspace of your choice and transforms it into TypeScript, JavaScript or JSON representation.

-   The TypeScript and JavaScript code contains definition of LDM and UDM objects which you can use as inputs to
    visualization components or the Execute component.

-   The JSON document can be input to CatalogHelper utility which then lets you obtain document contents through
    a convenient API. However, there is no interplay with the LDM Objects which you have to construct yourself before
    you can use them as input to visualization components or the Execute component.

## Usage Notes

The program is able to run in interactive or silent modes:

1.  The program reads input parameters from `.gdcatalogrc` config file. It will look for this file in the current directory.

    If the configuration file is present, it is expected to be JSON and can contain any / all parameters which you would normally provide on the command line:

    ```json
    {
        "hostname": "your.gooddata.hostname.com",
        "projectId": "your gooddata project id",
        "username": "email",
        "password": "password",
        "output": "desired_file_name.ts|js|json"
    }
    ```

    > Note: TypeScript, JavaScript or JSON output will be generated based on the filename extension of the output.

2.  The program reads input parameters from the command line. Run:

    `npx gdc-catalog-export --help`

    To learn more. Inputs from the command line take precedence over inputs in the config file.

3.  If values of all required parameters are known at this point, the catalog export runs and performs the export.
    If some of the parameters are missing the program will prompt you to enter them.

> Note: the program does not accept passwords on the command line.
> You can either put the password into .gdcatalogrc or enter it interactively.
> **DO NOT save .gdcatalogrc into version control system**.

> Note: by default, the tool will fail when connecting to non-production deployment of GoodData platform where
> the X.509 certificates are not setup correctly (self-signed, internal authority): node.js will reject the
> connection due to invalid certificates. You can use the `--accept-untrusted-ssl` option to disable this
> check (under the covers this sets the node.js documented ENV var `NODE_TLS_REJECT_UNAUTHORIZED` to `0`)

## Tiger usage notes

The program can retrieve and generate catalogs from either GoodData Platform (bear) or GoodData Cloud Native (tiger)
backends. The program does not do auto-detection of the backend type - you have to indicate type of backend
either through config or on command line.

The catalog-export by default expects that it is connecting to GoodData Platform (bear). To switch the
export to work with GoodData Anywhere (tiger), either specify the `--backend tiger` option on the CLI or include tiger
setting in the `.gdcatalogrc`. Here is an example of full config for tiger:

```json
{
    "hostname": "https://your.hostname.or.ip",
    "backend": "tiger",
    "workspaceId": "your workspace identifier",
    "username": "tiger_user_id",
    "output": "workspaceObjects.ts"
}
```

### Tiger Authentication

When connecting to a Tiger backend, the tool expects that you have TIGER_API_TOKEN set with a value of the API Token
which you yourself obtain from your installation. The username and password authentication is not possible against
Tiger backend.

The TIGER_API_TOKEN variable can be also set in the `.env` file in the application root directory.

While the configuration allows to specify `username` this is optional and will be used only to open a browser window
at location where you can obtain an API Token.

## Workspace or project?

The GoodData Cloud Native (tiger backend) uses the term 'workspace' to identify the entity which contains LDM and data and from
which you can calculate analytics.

On the other hand, the GoodData Platform (bear backend) historically uses the term 'project' to identify the same type of entity and
started using the term 'workspace' recently.

For this reason, the program supports both workspace-id and project-id command line arguments and workspaceId and projectId
configuration parameters. These are essentially synonymous for now with the plan to remove the project-id argument and
projectId configuration parameter in favor for the workspace variant.

At the moment you can use either project-id or workspace-id and the end result will be the same. If you specify both
of these parameters then the workspace-id has the priority.

If you use the project-id when exporting catalog from tiger backend the program will warn you that you are using a
deprecated option.

## Recommendations

Working with the catalog-export and its outputs on daily basis, we found a few good practices that we suggest for
your consideration:

-   Include the `@gooddata/catalog-export` as a devDependency of your application and define an NPM script `refresh-ldm`
    to run the program with the necessary parameters. For example given that you have username and password in
    config file:

    ```json
    {
        "scripts": {
            "refresh-ldm": "gdc-catalog-export --hostname \"your.domain.gooddata.com\" --project-id \"yourProjectId\" --output \"catalog.ts\""
        }
    }
    ```

-   Do not import the constants directly. Instead wrap the constants into a namespace as follows:

    ```typescript
    import * as ReferenceLdm from "./ldm/generatedFile";
    export { ReferenceLdm };
    ```

-   Never modify the generated files

-   If you need to modify the generated constants or add new LDM objects, do so through a layer of indirection -
    in a different file adjacent to the generated code.

## Important

We are planning to drop support for export to JSON. We will drop this in next major together with the CatalogHelper.

## Learn more

Please read the official documentation site for more information:
[Official documentation](https://sdk.gooddata.com/gooddata-ui/docs/gdc_catalog_export.html)

Also, check out [the generated results](../reference-workspace/src/ldm/full.ts) to see example of the
generated output.

## License

(C) 2017-2021 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/tools/catalog-export/LICENSE).
