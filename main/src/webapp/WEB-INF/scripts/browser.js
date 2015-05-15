function isUsingCompatibleDocumentMode() {
    // http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
    var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // At least Safari 3+: "[object HTMLElementConstructor]"
    var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
    var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6
    if (isChrome) {
        console.log("Detected running on browser: Chrome");
    }
    if (isFirefox) {
        console.log("Detected running on browser: Firefox");
    }
    if (isIE) {
        console.log("Detected running on browser: Internet Explorer");
    }
    if (isSafari) {
        console.log("Detected running on browser: Safari");
    }
    if (isOpera) {
        console.log("Detected running on browser: Opera");
    }

    // https://msdn.microsoft.com/en-gb/library/jj676915(v=vs.85).aspx
    if (isIE)
    {
        var engine = null;
        // This is an IE browser. What mode is the engine in?
        if (document.documentMode) // IE8 or later
            engine = document.documentMode;
        else // IE 5-7
        {
            engine = 5; // Assume quirks mode unless proven otherwise
            if (document.compatMode)
            {
                if (document.compatMode == "CSS1Compat")
                    engine = 7; // standards mode
            }
            // There is no test for IE6 standards mode because that mode
            // was replaced by IE7 standards mode; there is no emulation.
        }
        // the engine variable now contains the document compatibility mode.
        console.log("Detected IE running in mode: " + engine);
        if (engine < 9) {
            // Put in a 'friendly' error message instead of just leaving the user wondering why the web page isn't working
            var msg = "This web page does not support running any version of Internet Explorer less than 9, "+
                "or running later versions in compatibility mode; "+
                "it appears that you are running IE version: " + engine;
            learning_plan.errorMessage$(msg);
            return false;
        }
    }
    return true;
}
