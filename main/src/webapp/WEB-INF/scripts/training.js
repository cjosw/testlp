function loadTrainingPlan(userId) {
    console.log("Loading training plan for userId: " + userId + " ...")
    invokeAjax(rootUrl + 'users/' + userId + '/training', trainingLoadedSuccess);
}

function trainingLoadedSuccess(result, status, xhr) {
    console.log("Got n courses: " + result.length);
    var training_data_list = result.concat(getTestTrainingData());
    addInitialOrderingForSortStability(training_data_list);
    var sorted = training_data_list.sort(compareTrainingByCategoryName);
    var progress = updateLessonCountsOnTrainingPlans(sorted);
    learning_plan.initial_plan(sorted);
    learning_plan.progress(""+progress+"%");
    learning_plan.category_plan(structurePlanIntoCategoriesAndRows(sorted));
}

function updateLessonCountsOnTrainingPlans(training_data_list) {
    var numLessons = 0;
    var numCompleted = 0;
    for (var t = 0; t < training_data_list.length; t++) {
        var training_data = training_data_list[t];
        updateLessonCountsOnTrainingPlan(training_data);
        numLessons += training_data.LessonUsers.length;
        numCompleted += training_data.numCompleted;
        training_data.imageName = getDummyCourseImageName(t);
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
    if (!aCategory && !bCategory) return 0;
    if (!aCategory) return 1; // null categories get sorted to the end
    if (!bCategory) return -1;
    var aName = aCategory.Title;
    var bName = bCategory.Title;
    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : (training_data_a.sortOrder - training_data_b.sortOrder)));
}

function structurePlanIntoCategoriesAndRows(training_data_list) {
    var trainingDataByCategory = groupByCategoriesAndRows(training_data_list)
    console.log("Got n categories: " + trainingDataByCategory.length);
    return trainingDataByCategory;
}

function groupByCategoriesAndRows(training_data_list) {
    var arrayByCategoryName = training_data_list.reduce(function(result, current) {
        var category = current.CourseCategory;
        var categoryName = (category == null) ? "" : category.Title;
        result[categoryName] = result[categoryName] || [];
        result[categoryName].push(current);
        return result;
    }, {});
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
    console.log("Clicked on expandTrainingData: row: " + training_data.enclosingRow + "; col: " + training_data.columnNumber);
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
                console.log("Collapsing: category: " + c + "; row: " + r);
                row.current_training().expanded(false);
                row.expanded(false);
            }
        }
    }
}

function collapseTrainingData(training_data) {
    console.log("Clicked on collapseTrainingData: row: " + training_data.enclosingRow + "; col: " + training_data.columnNumber);
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
