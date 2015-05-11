function invokeAjax(url, successFn, errorFn) {
    console.log("Invoking: " + url + " ...")
    $.ajax({
        url: url,
        crossDomain: true,
        success: successFn,
        error: (function(_this) {
            return function(jqXHR, textStatus, errorThrown) {
                msg = "Failed to retrieve URL: " + url + "; error: " + jqXHR.statusText;
                console.log(msg);
                if (errorFn) {
                    errorFn(msg);
                } else {
                    learning_plan.errorMessage(msg);
                }
            };
        })(this)
    });
}

function getTrailingGuid(url) {
    var res = url.split("/");
    return res[res.length - 1];
}

function retrieveURLQueryParams(){
    var url = location.href;
    var qs = url.substring(url.indexOf('?') + 1).split('&');
    for(var i = 0, result = {}; i < qs.length; i++){
        qs[i] = qs[i].split('=');
        result[qs[i][0]] = decodeURIComponent(qs[i][1]);
    }
    return result;
}

function decodeQueryParam(params, key, option_val, default_val) {
    var param = params[key];
    return param ? param : (option_val ? option_val : default_val);
}

function decodeIntQueryParam(params, key, option_val, default_val) {
    return parseInt(decodeQueryParam(params, key, option_val, default_val));
}

function decodeBooleanQueryParam(params, key, option_val, default_val) {
    return decodeQueryParam(params, key, option_val, default_val) == "true";
}
