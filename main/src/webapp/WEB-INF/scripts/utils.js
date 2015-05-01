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
                training_plan.errorMessage(msg);
            };
        })(this)
    });
}
