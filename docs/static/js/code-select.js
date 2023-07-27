(function ($) {
    $(document).ready(function () {
        $(".gd-docs-code-select__tab").on("click", setActive);
        $(".gd-docs-code-select__osdetection .gd-docs-code-select__tab").each(osDetection);
    });

    var setActive = function() {
        if(!$(this).hasClass("active")) {
            $(this).siblings().removeClass("active");
            $(this)
                .addClass("active")
                .parent()
                .parent()
                .find(".gd-docs-code-select__code")
                .removeClass("active")
                .filter(".lang-" + $(this).data("lang"))
                .addClass("active");
        }
    }

    var osDetection = function() {
        if(window.navigator.userAgent.indexOf($(this).data("user-agent")) >= 0) {
            $(this).trigger("click");
        }
    }

}(jQuery));