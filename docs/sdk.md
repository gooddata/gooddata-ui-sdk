

<!-- Start src/sdk.js -->

# JS SDK
Here is a set of functions that mostly are a thin wraper over the [GoodData API](https://developer.gooddata.com/api).
Before calling any of those functions, you need to authenticate with a valid GoodData
user credentials. After that, every subsequent call in the current session is authenticated.
You can find more about the GD authentication mechanism here.

## Conventions and Dependencies
* Depends on [jQuery JavaScript library](http://jquery.com/) javascript library
* Each SDK function returns [jQuery Deffered promise](http://api.jquery.com/deferred.promise/)

## GD Authentication Mechansim
In this JS SDK library we provide you with a simple `login(username, passwd)` function
that does the magic for you.
To fully understand the authentication mechansim, please read
[Authentication via API article](http://developer.gooddata.com/article/authentication-via-api)
on [GooData Developer Portal](http://developer.gooddata.com/)

# Functions

## login(username, password)

This function provides an authentication entry point to the GD API. It is needed to authenticate
by calling this function prior any other API calls. After providing valid credentiols
every subsequent API call in a current session will be authenticated.

### Params: 

* **String** *username* 

* **String** *password* 

## getProjects(profileId)

Fetches projects available for the user represented by the given profileId

### Params: 

* **String** *profileId* - User profile identifier

### Return:

* **Array** An Array of projects

## getDatasets(projectId)

Fetches all datasets for the given project

### Params: 

* **String** *projectId* - GD project identifier

### Return:

* **Array** An array of objects containing datasets metadata

## getColorPalette(projectId)

Fetches a chart color palette for a project represented by the given
projectId parameter.

### Params: 

* **String** *projectId* - A project identifier

### Return:

* **Array** An array of objects with r, g, b fields representing a project&#39;s

## setColorPalette(projectId, colors)

Sets given colors as a color palette for a given project.

### Params: 

* **String** *projectId* - GD project identifier

* **Array** *colors* - An array of colors that we want to use within the project.

## getData(projectId, elements)

For the given projectId it returns table structure with the given
elements in column headers.

### Params: 

* **String** *projectId* - GD project identifier

* **Array** *elements* - An array of attribute or metric identifiers.

### Return:

* **Object** Structure with `headers` and `rawData` keys filled with values from execution.

## getAttributes(Porject)

Reutrns all attributes in a project specified by projectId param

### Params: 

* **projectId** *Porject* identifier

### Return:

* **Array** An array of attribute objects

## getDimensions(Project)

Returns all dimensions in a project specified by projectId param

### Params: 

* **projectId** *Project* identifier

### Return:

* **Array** An array of dimension objects

## getMetrics(Project)

Returns all metrics in a project specified by the given projectId

### Params: 

* **projectId** *Project* identifier

### Return:

* **Array** An array of metric objects

## validateMaql(maqlExpression, projectId)

Validates a given MAQL expression in the context of the project specified
by a given projectId.

### Params: 

* **String** *maqlExpression* - MAQL Expression

* **String** *projectId* - GD project identifier

### Return:

* **Object** JSON object with either `maqlOK` or `maqlErr` field based on the

<!-- End src/sdk.js -->

