function setupKnockoutCustomisations() {
    ko.bindingHandlers.src = {
        update: function(element, valueAccessor) {
            return ko.bindingHandlers.attr.update(element, function() {
                return {
                    src: valueAccessor()
                };
            });
        }
    };

    ko.bindingHandlers.slideIn = {
        init: function(element, valueAccessor) {
            var value;
            value = ko.utils.unwrapObservable(valueAccessor());
            $(element).toggle(value);
        },
        update: function(element, valueAccessor) {
            var animationClassname, defaultDuration, elementFullyHidden, elementFullyVisible, value;
            animationClassname = "se-fully-visible";
            elementFullyVisible = function() {
                $(element).addClass(animationClassname);
                //if (!isElementInViewport(element)) {
                //    scrollToElement(element);
                //}
            };
            elementFullyHidden = function() {
                $(element).removeClass(animationClassname);
            };
            value = ko.utils.unwrapObservable(valueAccessor());
            defaultDuration = 400;
            if (value) {
                $(element).slideDown(defaultDuration, elementFullyVisible);
            } else {
                $(element).slideUp(defaultDuration, elementFullyHidden);
            }
        }
    };
}

function scrollToElement(element) {
    var el = $(element);
    if (el.length > 0) {
        el[0].scrollIntoView({block: "start", behavior: "smooth"});
    }
}

function isElementInViewport (el) {

    var rect = el.getBoundingClientRect();
    var inViewport = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
    return inViewport;
}
