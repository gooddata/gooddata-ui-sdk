(function ($) {
    $(document).ready(function () {
        $("#gd-docs-share__button").popover({
            toggle: "popover",
            placement: "bottom",
            title: "URL:",
            template: `
                <div class="popover gd-docs-share__dialog" role="tooltip">
                    <div class="arrow gd-docs-share__arrow"></div>
                    <h3 class="popover-header gd-docs-share__header"></h3>
                    <span id="gd-docs-share__close" class="gd-docs-share__close"></span>
                    <div id="gd-docs-share__body" class="popover-body gd-docs-share__body"></div>
                    <a id="gd-docs-share__copy" class="gd-docs-share__copy">Copy to clipboard</a>
                </div>
            `,
        }).on("inserted.bs.popover", function() {
            var button = $(this);
            $("#gd-docs-share__body").wrapInner("<textarea>").children("textarea").attr("readonly", true);
            $("#gd-docs-share__copy").on("click", function() {
                $("#gd-docs-share__body textarea").select();
                document.execCommand("copy");
                button.popover("hide");
            });
            $("#gd-docs-share__close").on("click", function() {
                button.popover("hide");
            });
        });
    });
})(jQuery);