
(function ($) {
    var s,
        spanizeLetters = {
            settings: {
                letters: $(".subTitle")
            },
            init: function () {
                s = this.settings;
                this.bindEvents();
            },
            bindEvents: function () {
                s.letters.html(function (i, el) {
                    //spanizeLetters.joinChars();
                    var spanizer = $.trim(el).split("");
                    return "<span>" + spanizer.join("</span><span>") + "</span>";
                });
            }
        };
    spanizeLetters.init();
})(jQuery);


$("input[name*='toggle-1']").change(function (e) {
    navgation(e.target.attributes[2].value)

})

function navgation(valor) {
    $("#" + valor).prop('checked', true);

    $("#main").css("display", "none");
    $("#over").css("display", "none");
    $("#projects").css("display", "none");
    $("#contact").css("display", "none");
    $("#loading").css("display", "flex");

    if (valor == "toggle-1") {
        $("#main").css("display", "flex");
    } else if (valor == "toggle-2") {
        $("#over").css("display", "flex");
    } else if (valor == "toggle-3") {
        $("#projects").css("display", "flex");
    } else if (valor == "toggle-4") {
        $("#contact").css("display", "flex");
    }
    setTimeout(() => {
        $("#loading").css("display", "none");
    }, 500);
}

let mobileOn = false;
window.onresize = function () {
    if (window.innerWidth >= '600') {
        $(".navButton").css({
            "display": "flex"
        })
        mobileOn = false;
    } else {
        $(".navButton").css({
            "display": "none"
        })

    }
};
$(".navLogo").on('mouseup', function () {
    if (window.innerWidth <= '600') {
        if (mobileOn == false) {
            $(".navButton").css({
                "display": "flex"
            })
            mobileOn = true;
        } else {
            $(".navButton").css({
                "display": "none"
            })
            mobileOn = false;
        }
    } else {
        navgation('toggle-1');
    }
});

$(".navButton").on('mouseup', function () {
    if (window.innerWidth <= '600') {
        $(".navButton").css({
            "display": "none"
        })
        mobileOn = false;
    }
});