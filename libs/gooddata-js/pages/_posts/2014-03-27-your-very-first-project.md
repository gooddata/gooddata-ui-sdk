---
layout: post
title:  "Your Very First Project"
date:   2014-03-27 11:00:00
categories: recipe
next_section: recipe/your-very-first-project
pygments: true
perex: Your very first project with GoodData JS SDK. Start now!
---

Well, you've just downloaded all parts that are in our [Get Started guide](http://sdk.gooddata.com/gooddata-js/getting-started), right? You are ready to run your first Javascript code! Basically our very first example will be very easy. We are going to login to the project. What is it all about? 

## Project Template

First of all, let's prepare a template for your project. Simple HTML code below (feel free to copy&paste it to your destination) is the base. As you can see we are linking the `gooddata.js` library that you've previously built.

{% highlight ruby %}

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"
   "http://www.w3.org/TR/html4/strict.dtd">

<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>GoodData JS Project Template</title>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="copyright" content="Copyright 2008 - 2013 GoodData Corporation. All rights reserved.">

</head>
<body class="app" bgcolor="#ffffff" style="display:block">

    <div id="root" class="app"></div>
    <h1>GoodData JS Project Template</h1>

    <!-- Dendencies of your project can be specified here -->
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
    <script src="../gooddata.js"></script>
    <script src="project.js"></script>

    </body>
</html>

{% endhighlight %}

And now, it's time to javascript itself! Let's login to the GoodData Platform and...do something :) First of all set up your variables

{% highlight ruby %}
var projectId = 'GoodSalesDemo',
    user = 'mygooddatause@company.com',
    passwd = 'superpassword';
{% endhighlight %}

Then, set the message that will be shown during the login process

{% highlight ruby %}
// Show login info
$('body').append('<div class="login-loader">Logging in...</div>');
{% endhighlight %}

and finally call the `.login` function using your variables to log in to the GoodData Project.

{% highlight ruby %}
gooddata.login(user, passwd).then(function() {
    // Loged in
    $('div.login-loader').remove();
    $('body').append('<div class="loading">Loading data...</div>');

    // Do your stuff here
    // ...
});
{% endhighlight %}

Now you can copy complete javacript code and use it in your Project...That's it! Check out our [SDK reference](http://sdk.gooddata.com/gooddata-js/api) to learn more about available methods!

{% highlight ruby %}

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

{% endhighlight %}

Easy enough, right? Look forward for some more advanced examples that we will show you very soon! Let us know!
