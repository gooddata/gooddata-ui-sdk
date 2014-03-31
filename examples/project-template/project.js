// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.
var projectId = 'GoodSalesDemo',
    user = '',
    passwd = '';

// Show login info
$('body').append('<div class="login-loader">Logging in...</div>');

gooddata.user.login(user, passwd).then(function() {
    // Loged in
    $('div.login-loader').remove();
    $('body').append('<div class="loading">Logged in...ready to your next command</div>');

    // Do your stuff here
    // ...
});
