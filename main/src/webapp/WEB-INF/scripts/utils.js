function invokeAjax(url, successFn) {
    console.log("Invoking: " + url + " ...")
    $.ajax({
        url: url,
        crossDomain: true,
        success: successFn,
        error: (function(_this) {
            return function(jqXHR, textStatus, errorThrown) {
                msg = "Failed to retrieve URL: " + url + "; error: " + jqXHR.statusText;
                console.log(msg);
                learning_plan.errorMessage(msg);
            };
        })(this)
    });
}

function getTrailingGuid(url) {
    var res = url.split("/");
    return res[res.length - 1];
}
