// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.
var projectId = '', // Your project ID
    user = '',
    passwd = '';


// Fill in your gooddata CORS enabled url (e.g. https://gd.domain.tld)
gooddata.config.setCustomDomain('<your_gooddata_endpoint>');

// Show login info
$('#root').append('<div class="login-loader">Logging in...</div>');

gooddata.user.login(user, passwd).then(function() {
    // Loged in
    $('div.login-loader').remove();
    $('#root').append('<div class="loading">Logged in... Loading dataSets</div>');

    // Do your stuff here
    // ...
    gooddata.project.getDatasets(projectId).then(function(dataSets) {
        $('.loading').remove();
        dataSets.forEach(function(ds) {
            $('#datasets').append('<li>'+ds.title+'</li>');
        });
    });
});
