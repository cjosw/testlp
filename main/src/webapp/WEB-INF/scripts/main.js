// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function LearningPlanViewModel() {
    this.user = ko.observable();
    this.userImageSrc = ko.observable();
    this.progress = ko.observable();
    this.initial_plan = ko.observable();
    this.category_plan = ko.observable();
    this.errorMessage = ko.observable();
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
    rootImagesUrl  = decodeQueryParam(params, "rootImagesUrl",  'https://rawgit.com/cjosw/testlp/grid/main/src/webapp/WEB-INF/');
    coursesPerRow        = decodeIntQueryParam(params, "coursesPerRow", 6);
    useDummyUser         = decodeBooleanQueryParam(params, "useDummyUser", "false");
    useRealTrainingData  = decodeBooleanQueryParam(params, "useRealTrainingData", "true");
    useDummyTrainingData = decodeBooleanQueryParam(params, "useDummyTrainingData", "false");
}
