$(document).ready(function () {
    var menu = $(".gd-docs-menu"),
        menuActive = $(".gd-docs-menu-page.active");

    if(menuActive.length > 0) {
        menu.scrollTop(menuActive.offset().top - menu.offset().top - parseInt(menu.css("paddingTop")));
    }

    menu.removeClass("init");
});