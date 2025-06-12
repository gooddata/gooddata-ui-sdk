$(document).ready(function () {
    const responsiveTables = function() {
        $(".table-responsive").each(function() {
            const wrapperWidth = $(this).width();
            const tableWidth = $(this).find("table").width();
            $(this).toggleClass("table-responsive__wide", tableWidth > wrapperWidth);
        });
    }

    $(".td-content table").wrap($("<div>").addClass("table-responsive")).wrap($("<div>").addClass("table-responsive__inner"));
    responsiveTables();
    $(window).on("resize", responsiveTables);
});