// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function LearningPlanViewModel() {
    var self = this;
    self.user = ko.observable();
    self.progress = ko.observable();
    self.initial_plan = ko.observable();
    self.errorMessage = ko.observable();

    self.filters = {
        searchText: ko.observable(),
        categoryFilter: ko.observable(),
        categoryOptions: ko.observable(),
        showCompletedCoursesOnly: ko.observable(false),
        showOnlineCoursesOnly: ko.observable(false)
    };

    self.category_plan = ko.pureComputed(function() { return assembleCategoryPlan(self.initial_plan(), self.filters); });
}

function startup() {
    decodeQueryParams();

    learning_plan = new LearningPlanViewModel();
    setupKnockoutCustomisations();
    ko.applyBindings(learning_plan);

    loadUser(userId);
    loadTrainingPlan(userId);
}

function decodeQueryParams() {
    var params = retrieveURLQueryParams();
    userId     = decodeQueryParam(params, "userId",     '{CurrentUser}');
    rootAPIUrl = decodeQueryParam(params, "rootAPIUrl", 'https://dev.kallidus.com/DevEval/LMS/Handlers/ApiProxy.ashx/');
    rootUIUrl  = decodeQueryParam(params, "rootUIUrl",  'http://dev.kallidus.com/DevEval/LMS/');
    coursesPerRow        = decodeIntQueryParam(params, "coursesPerRow", 6);
    useDummyUser         = decodeBooleanQueryParam(params, "useDummyUser", "false");
    useRealTrainingData  = decodeBooleanQueryParam(params, "useRealTrainingData", "true");
    useDummyTrainingData = decodeBooleanQueryParam(params, "useDummyTrainingData", "false");
}
