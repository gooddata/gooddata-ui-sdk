(function ($) {
    $(document).ready(function () {
        $(".gd-docs-content-select__tab").on("click", setActive);
    });

    var setActive = function() {
        if(!$(this).hasClass("active")) {
            $(this).siblings().removeClass("active");

            $(this).addClass("active")
                .parent()
                .parent()
                .find(".gd-docs-content__block")
                .removeClass("active")
                .filter(".content-" + $(this).data("content"))
                .addClass("active");
        }
    }
}(jQuery));
