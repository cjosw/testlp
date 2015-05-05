// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function LearningPlanViewModel() {
    this.user = ko.observable();
    this.progress = ko.observable();
    this.initial_plan = ko.observable();
    this.category_plan = ko.observable();
    this.errorMessage = ko.observable();
}

function startup() {
    rootUrl = 'https://dev.kallidus.com/DevEval/LMS/Handlers/ApiProxy.ashx/';
    userId = '80380afd-42fa-4baa-a8c1-66ff2c8799d7';
    coursesPerRow = 6;

    learning_plan = new LearningPlanViewModel();
    setupKnockoutCustomisations();
    ko.applyBindings(learning_plan);

    loadUser(userId);
    loadTrainingPlan(userId);
}
