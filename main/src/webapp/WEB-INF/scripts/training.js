function loadTrainingPlan(userId) {
    console.log("Loading training plan for userId: " + userId + " ...")
    invokeAjax(rootUrl + 'users/' + userId + '/training', trainingLoadedSuccess);
}

function trainingLoadedSuccess(result, status, xhr) {
    console.log("Got n courses: " + result.length);
    var training_data_list = result.concat(getTestTrainingData());
    addInitialOrderingForSortStability(training_data_list);
    var sorted = training_data_list.sort(compareTrainingByCategoryName);
    updateStaticDataOnTrainingPlans(sorted);
    var progress = getOverallProgress(sorted);
    learning_plan.initial_plan(sorted);
    learning_plan.progress(""+progress+"%");
    learning_plan.category_plan(structurePlanIntoCategoriesAndRows(sorted));
}

function updateStaticDataOnTrainingPlans(training_data_list) {
    for (var t = 0; t < training_data_list.length; t++) {
        var training_data = training_data_list[t];
        updateStaticDataOnTrainingPlan(training_data);
        training_data.imageName = getDummyCourseImageName(t);
    }
}

function updateStaticDataOnTrainingPlan(training_data) {
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
        lessonUser.status = status; // save the correct copy of the status
        lessonUser.cancelled = (status == LearningRecordStatuses.Cancelled);
        lessonUser.bookable  = (status == LearningRecordStatuses.NotStarted) || (status == null);
        lessonUser.inprogress  = !(lessonUser.completed || lessonUser.cancelled || lessonUser.bookable);
        lessonUser.stars = [0,0,0,0,0];
        lessonUser.isOnline = isOnlineLesson(lessonUser.Lesson.Type);
        isOnline = isOnline || lessonUser.isOnline;
    }

    training_data.numCompleted = numCompleted;
    training_data.completed = (numCompleted == training_data.LessonUsers.length);
    training_data.isOnline = isOnline;
    training_data.blank = false;
    training_data.expanded = ko.observable(false);
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

function addInitialOrderingForSortStability(training_data_list) {
    for (var t = 0; t < training_data_list.length; t++) {
        training_data_list[t].sortOrder = t;
    }
}

function compareTrainingByCategoryName(training_data_a, training_data_b) {
    var aCategory = training_data_a.CourseCategory;
    var bCategory = training_data_b.CourseCategory;
    if (!aCategory && !bCategory) return (training_data_a.sortOrder - training_data_b.sortOrder);
    if (!aCategory) return 1; // null categories get sorted to the end
    if (!bCategory) return -1;
    var aName = aCategory.Title;
    var bName = bCategory.Title;
    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : (training_data_a.sortOrder - training_data_b.sortOrder)));
}

function getOverallProgress(training_data_list) {
    var numLessons = 0;
    var numCompleted = 0;
    for (var t = 0; t < training_data_list.length; t++) {
        var training_data = training_data_list[t];
        numLessons += training_data.LessonUsers.length;
        numCompleted += training_data.numCompleted;
    }
    return Math.round((numCompleted / numLessons) * 100);
}

function structurePlanIntoCategoriesAndRows(training_data_list) {
    var trainingDataByCategory = groupByCategoriesAndRows(training_data_list)
    console.log("Got n categories: " + trainingDataByCategory.length);
    return trainingDataByCategory;
}

function groupByCategoriesAndRows(training_data_list) {
    var arrayByCategoryName = groupByCategories(training_data_list);
    return groupCategoriesIntoRows(arrayByCategoryName);
}

function groupByCategories(training_data_list) {

    // This returns an associative array keyed by categoryName,
    // each holding a list of training_data records.

    var arrayByCategoryName = training_data_list.reduce(function(result, current) {
        var category = current.CourseCategory;
        var categoryName = (category == null) ? "" : category.Title;
        result[categoryName] = result[categoryName] || [];
        result[categoryName].push(current);
        return result;
    }, {});
    return arrayByCategoryName;
}

function groupCategoriesIntoRows(arrayByCategoryName) {

    // This returns a list of categories, in the same order as the incoming array.
    // Each category has a list of rows, each holding exactly n entries.
    // Each row has a list of trainig_data entries ('courses'), plus some flags.
    // The rows are 'blank padded' to the full width to aid layout on the page.

    var trainingByCategory = []
    for (var categoryName in arrayByCategoryName) {
        var rows = [];
        var row = blankRow();
        var training_data_for_category = arrayByCategoryName[categoryName];
        for (var t = 0; t < training_data_for_category.length; t++) {
            if (row.courses.length == coursesPerRow) {
                rows.push(row);
                row = blankRow();
            }
            training_data_for_category[t].enclosingRow = row;
            training_data_for_category[t].columnNumber = row.courses.length;
            row.courses.push(training_data_for_category[t]);
        }
        for (var t = row.courses.length; t < coursesPerRow; t++) {
            row.courses.push(BlankTrainingData);
        }
        rows.push(row);
        trainingByCategory.push({categoryName: categoryName, training_data_rows: rows})
    }
    return trainingByCategory;
}

function blankRow() {
    return {
        courses: [],
        expanded: ko.observable(false),
        current_training: ko.observable()
    };
}

function expandTrainingData(training_data) {
    collapseTraningDataIfOpen();
    var row = training_data.enclosingRow;
    training_data.expanded(true);
    row.expanded(true);
    row.current_training(training_data);
}

function collapseTraningDataIfOpen() {
    var category_plan_array = learning_plan.category_plan();
    for (var c = 0; c < category_plan_array.length; c++) {
        var category_plan = category_plan_array[c];
        var rows = category_plan.training_data_rows;
        for (var r = 0; r < rows.length; r++) {
            var row = rows[r];
            if (row.expanded()) {
                row.current_training().expanded(false);
                row.expanded(false);
            }
        }
    }
}

function collapseTrainingData(training_data) {
    var row = training_data.enclosingRow;
    training_data.expanded(false);
    row.expanded(false);
}

BlankTrainingData = {
    Course: {Summary: "[Blank Data]"},
    LessonUsers: [],
    //Status: "Not started",
    //completed: false,
    //numCompleted: 0,
    blank: true
};

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
};

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
};
