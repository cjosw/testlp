function loadTrainingPlan(userId) {
    console.log("Loading training plan for userId: " + userId + " ...")
    invokeAjax(rootUrl + 'users/' + userId + '/training', trainingLoadedSuccess);
}

function trainingLoadedSuccess(result, status, xhr) {
    console.log("Got n courses: " + result.length);
    var sorted = result.sort(compareTrainingByCategoryName);
    var progress = updateLessonCountsOnTrainingPlans(sorted);
    learning_plan.initial_plan(sorted);
    learning_plan.progress(""+progress+"%");
    learning_plan.category_plan(filterPlanIntoCategories(sorted));
}

function updateLessonCountsOnTrainingPlans(training_data_list) {
    var numLessons = 0;
    var numCompleted = 0;
    for (var t = 0; t < training_data_list.length; t++) {
        var training_data = training_data_list[t];
        updateLessonCountsOnTrainingPlan(training_data);
        numLessons += training_data.LessonUsers.length;
        numCompleted += training_data.numCompleted;
    }
    return Math.round((numCompleted / numLessons) * 100);
}

function updateLessonCountsOnTrainingPlan(training_data) {
    var numCompleted = 0;
    var isOnline = false;
    for (var l = 0; l < training_data.LessonUsers.length; l++) {
        var lessonUser = training_data.LessonUsers[l];
        var status = getLessonUserStatus(lessonUser);
        if (status == LearningRecordStatuses.Complete) {
            lessonUser.completed = true;
            numCompleted++;
        } else {
            lessonUser.completed = false;
        }
        lessonUser.isOnline = isOnlineLesson(lessonUser.Lesson.Type);
        isOnline = isOnline || lessonUser.isOnline;
        console.log("updating: " + lessonUser.Lesson.Title + "; completed: " + lessonUser.completed + "; online: " + lessonUser.isOnline);
    }

    // qq just for making the test data look more useful
    if (training_data.LessonUsers.length > 1 && numCompleted == 0) { numCompleted = 1; }

    console.log("updating: " + training_data.Course.Summary + " " + numCompleted + "/" + training_data.LessonUsers.length);
    training_data.numCompleted = numCompleted;
    training_data.completed = (numCompleted == training_data.LessonUsers.length);
    training_data.isOnline = isOnline;
}

function getLessonUserStatus(lessonUser) {
    return lessonUser.ShowBestScoreOnLearningPlan ? lessonUser.BestStatus : lessonUser.LastStatus;
}

function isOnlineLesson(lessonType) {
    switch (lessonType) {
        case LessonTypes.Aicc:
        case LessonTypes.Kallidus:
        case LessonTypes.Url:
        case LessonTypes.Scorm:
        case LessonTypes.Scorm2004:
            return true;
        default:
            return false;
    }
}

function filterPlanIntoCategories(training_data_list) {
    var trainingDataByCategory = groupByCategories(training_data_list)
    console.log("Got n categories: " + trainingDataByCategory.length);
    return trainingDataByCategory;
}

function compareTrainingByCategoryName(training_data_a, training_data_b) {
    var aCategory = training_data_a.CourseCategory;
    var bCategory = training_data_b.CourseCategory;
    if (!aCategory && !bCategory) return 0;
    if (!aCategory) return 1; // null categories get sorted to the end
    if (!bCategory) return -1;
    var aName = aCategory.Title;
    var bName = bCategory.Title;
    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}

function groupByCategories(training_data_list) {
    var arrayByCategoryName = training_data_list.reduce(function(result, current) {
        var category = current.CourseCategory;
        var categoryName = (category == null) ? "" : category.Title;
        result[categoryName] = result[categoryName] || [];
        result[categoryName].push(current);
        return result;
    }, {});
    var trainingByCategory = []
    for (var categoryName in arrayByCategoryName) {
        trainingByCategory.push({categoryName: categoryName, training_data_list: arrayByCategoryName[categoryName]})
    }
    return trainingByCategory;
}

LearningRecordStatuses = {
    Exempt: 0,
    Complete: 1,
    Passed: 2,
    Attended: 3,
    Failed: 4,
    Browsed: 5,
    Cancelled: 6,
    Declined: 7,
    DidNotAttend: 8,
    Incomplete: 9,
    Withdrawn: 10,
    NotStarted: 11,
    Unknown: 12
}

LessonTypes = {
    Aicc: "Aicc",
    Kallidus: "Kallidus",
    Url: "Url",
    Scorm: "Scorm",
    Scorm2004: "Scorm2004",
    Classroom: "Classroom",
    Book: "Book",
    Audio: "Audio",
    Video: "Video",
    Dvd: "Dvd",
    CDRom: "CDRom",
    Assessment: "Assessment",
    WebEx: "WebEx",
    Container: "Container",
    Other: "Other"
}
