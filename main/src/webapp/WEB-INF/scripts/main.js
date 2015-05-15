// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function LearningPlanViewModel() {
    var self = this;
    self.user$ = ko.observable();
    self.userImageSrc$ = ko.observable();
    self.progress$ = ko.observable();
    self.initial_plan$ = ko.observable();
    self.errorMessage$ = ko.observable();
    self.loadingAnimationSrc$ = ko.observable(rootContentUrl + "images/loading_animation1_transparent.gif");

    self.filters = {
        searchText$: ko.observable(),
        categoryFilter$: ko.observable(),
        categoryOptions$: ko.observable(),
        showIncompleteCoursesOnly$: ko.observable(false),
        showOnlineCoursesOnly$: ko.observable(false)
    };

    self.category_plan$ = ko.pureComputed(function() { return assembleCategoryPlan(self.initial_plan$(), self.filters); });
    self.category_plan$.subscribe(function(){ collapseAllTrainingData(); }); // close any when the filters change
}

function learning_plan_startup(options) {
    lp_compatibilityWorkarounds();
    decodeQueryParams(options);

    learning_plan = new LearningPlanViewModel();
    setupKnockoutCustomisations();
    ko.applyBindings(learning_plan);

    loadUser(userId);
    loadTrainingPlan(userId);
}

function decodeQueryParams(options) {
    var params = retrieveURLQueryParams();
    userId     = decodeQueryParam(params, "userId",     options.userId, '{CurrentUser}');
    rootAPIUrl = decodeQueryParam(params, "rootAPIUrl", options.rootAPIUrl, 'https://dev.kallidus.com/DevEval/LMS/Handlers/ApiProxy.ashx/');
    rootUIUrl  = decodeQueryParam(params, "rootUIUrl",  options.rootUIUrl, 'http://dev.kallidus.com/DevEval/LMS/');
    rootContentUrl  = decodeQueryParam(params, "rootContentUrl",  options.rootContentUrl, '');
    coursesPerRow        = decodeIntQueryParam(params,     "coursesPerRow",        options.coursesPerRow, 6);
    useDummyUser         = decodeBooleanQueryParam(params, "useDummyUser",         options.useDummyUser, "false");
    useRealTrainingData  = decodeBooleanQueryParam(params, "useRealTrainingData",  options.useRealTrainingData, "true");
    useDummyTrainingData = decodeBooleanQueryParam(params, "useDummyTrainingData", options.useDummyTrainingData, "false");
}

function lp_compatibilityWorkarounds() {
    jQuery.support.cors = true; /* needed for IE9 http://stackoverflow.com/questions/9160123/no-transport-error-w-jquery-ajax-call-in-ie */
}
