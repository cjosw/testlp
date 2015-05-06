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

function decodeURLQueryParams(){
    var url = location.href;
    var qs = url.substring(url.indexOf('?') + 1).split('&');
    for(var i = 0, result = {}; i < qs.length; i++){
        qs[i] = qs[i].split('=');
        result[qs[i][0]] = decodeURIComponent(qs[i][1]);
    }
    return result;
}
