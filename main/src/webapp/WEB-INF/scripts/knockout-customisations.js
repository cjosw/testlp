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
}
