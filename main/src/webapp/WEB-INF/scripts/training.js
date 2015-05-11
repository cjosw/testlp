function loadTrainingPlan(userId) {
    if (!useRealTrainingData) {
        console.log("Loading dummy training plan ...")
        trainingLoadedSuccess([])
    } else {
        console.log("Loading training plan for userId: " + userId + " ...")
        invokeAjax(rootAPIUrl + 'users/' + userId + '/training', trainingLoadedSuccess);
    }
}

function trainingLoadedSuccess(result, status, xhr) {
    var training_data_list = result;
    console.log("Got " + training_data_list.length + " training data courses");
    if (useDummyTrainingData) {
        var dummy_data = getTestTrainingData();
        training_data_list = training_data_list.concat(dummy_data);
        console.log("Got " + dummy_data.length + " dummy training data courses");
        console.log("Got " + training_data_list.length + " training data courses in total");
    }
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
        training_data.imageName = rootImagesUrl + getDummyCourseImageName(t);
    }
}

function updateStaticDataOnTrainingPlan(training_data) {
    var numCompleted = 0;
    var isOnline = false;
    for (var l = 0; l < training_data.LessonUsers.length; l++) {
        var lessonUser = training_data.LessonUsers[l];
        var status = getLessonUserStatus(lessonUser);
        var extraLessonInfo = {
            status: status,
            completed: (status == LearningRecordStatuses.Complete),
            cancelled: (status == LearningRecordStatuses.Cancelled),
            bookable:  (status == LearningRecordStatuses.NotStarted) || (status == LearningRecordStatuses.Unknown),
            stars: [0,0,0,0,0],
            isOnline: isOnlineLesson(lessonUser.Lesson.Type),
            parentTrainingData: training_data
        };
        extraLessonInfo.inprogress = !(extraLessonInfo.completed || extraLessonInfo.cancelled || extraLessonInfo.bookable);
        lessonUser.extraLessonInfo = extraLessonInfo;
        lessonUser.Lesson.lessonId = getTrailingGuid(lessonUser.Lesson.Id);
        isOnline = isOnline || extraLessonInfo.isOnline;
        if (extraLessonInfo.completed) { numCompleted++; }
    }

    var extraTrainingInfo = {
        numCompleted: numCompleted,
        completed: (numCompleted == training_data.LessonUsers.length),
        isOnline: isOnline,
        blank: false,
        expanded: ko.observable(false)
    };
    training_data.extraTrainingInfo = extraTrainingInfo;
    training_data.Course.courseId = getTrailingGuid(training_data.Course.Id);
}

function getLessonUserStatus(lessonUser) {
    var status = lessonUser.ShowBestScoreOnLearningPlan ? lessonUser.BestStatus : lessonUser.LastStatus;
    if (status == null || status == "") {
        status = LearningRecordStatuses.Unknown;
    }
    return status;
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
        numCompleted += training_data.extraTrainingInfo.numCompleted;
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
            training_data_for_category[t].extraTrainingInfo.enclosingRow = row;
            training_data_for_category[t].extraTrainingInfo.columnNumber = row.courses.length;
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
    var row = training_data.extraTrainingInfo.enclosingRow;
    training_data.extraTrainingInfo.expanded(true);
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
                row.current_training().extraTrainingInfo.expanded(false);
                row.expanded(false);
            }
        }
    }
}

function collapseTrainingData(training_data) {
    var row = training_data.extraTrainingInfo.enclosingRow;
    training_data.extraTrainingInfo.expanded(false);
    row.expanded(false);
}

function bookLessonUser(lessonUser) {
    if (lessonUser.extraLessonInfo.isOnline) {
        var lessonId = lessonUser.Lesson.lessonId;
        var courseId = lessonUser.extraLessonInfo.parentTrainingData.Course.courseId;
        console.log("About to launch online course; lessonId: " + lessonId + "; courseId: " + courseId);
        window.open(rootUIUrl + 'student/frmLaunchLesson.aspx?StandardReset=true&url=&learningobjectguid=' + lessonId + '&courseguid='+courseId,
            '',
            'toolbar=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,left=0,screenX=0,top=0,screenY=0,width='
            + (screen.availWidth - 10) + ',height=' + (screen.availHeight - 20)
        );
    } else {
        console.log("About to launch booking page for non-online course");
    }
}

BlankTrainingData = {
    Course: {Summary: "[Blank Data]"},
    LessonUsers: [],
    extraTrainingInfo: {blank: true}
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
