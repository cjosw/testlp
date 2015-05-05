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
                return $(element).addClass(animationClassname);
            };
            elementFullyHidden = function() {
                return $(element).removeClass(animationClassname);
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
