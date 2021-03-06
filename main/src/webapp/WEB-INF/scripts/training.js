function loadTrainingPlan(userId) {
    if (!useRealTrainingData) {
        console.log("Loading dummy training plan ...");
        trainingLoadedSuccess([])
    } else {
        console.log("Loading training plan for userId: " + userId + " ...");
        invokeAjax(rootAPIUrl + 'users/' + userId + '/training?currentAssignments=true', trainingLoadedSuccess);
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
    training_data_list = filterOutByDates(training_data_list);
    console.log("Got " + training_data_list.length + " training data courses after filtering by date");
    var sorted = training_data_list.sort(compareTrainingByCategoryName);
    updateStaticDataOnTrainingPlans(sorted);
    var progress = getOverallProgress(sorted);
    learning_plan.initial_plan$(sorted);
    learning_plan.progress$(""+progress+"%");
    learning_plan.filters.categoryOptions$(getCategoryNamesForFilter(sorted));
}

function addInitialOrderingForSortStability(training_data_list) {
    training_data_list.forEach(function(training_data, index) { training_data.sortOrder = index; });
}

function filterOutByDates(training_data_list) {
    return training_data_list.filter(isTrainingTrainingDataWithinDateRange);
}

function isTrainingTrainingDataWithinDateRange(training_data) {
    if (training_data.ExpiryDate) {
        var expiryDate = moment(training_data.ExpiryDate); // the date is in ISO 8601 format :-)
        if (expiryDate.isBefore()) { return false; }
    }
    if (training_data.DateAvailable) {
        var dateAvailable = moment(training_data.DateAvailable); // the date is in ISO 8601 format :-)
        if (dateAvailable.isAfter()) { return false; }
    }
    return true;
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

function updateStaticDataOnTrainingPlans(training_data_list) {
    training_data_list.forEach(function(training_data, index) {
        updateStaticDataOnTrainingPlan(training_data);
    });
}

function updateStaticDataOnTrainingPlan(training_data) {
    var numCompleted = 0;
    var isOnline = false;
    for (var l = 0; l < training_data.LessonUsers.length; l++) {
        var lessonUser = training_data.LessonUsers[l];
        var status = getLessonUserStatus(lessonUser);
        var categoriesedLessonType = categoriseLessonType(lessonUser.Lesson.Type);
        var isLessonOnline = categoriesedLessonType == CategorisedLessonTypes.ONLINE;
        var extraLessonInfo = {
            lessonNumber: l + 1,
            status: status,
            visibleStatus: categoriseStatus(status, categoriesedLessonType, lessonUser),
            isOnline: isLessonOnline,
            parentTrainingData: training_data
        };
        lessonUser.extraLessonInfo = extraLessonInfo;
        lessonUser.Lesson.lessonId = getTrailingGuid(lessonUser.Lesson.Id);
        isOnline = isOnline || isLessonOnline;
        if (status == LearningRecordStatuses.Complete) { numCompleted++; }
    }

    var extraTrainingInfo = {
        courseLoaded: false,
        description$: ko.observable(),
        paragraphs$: ko.observableArray(),
        descriptionExpanded$: ko.observable(false),
        numCompleted: numCompleted,
        completed: (numCompleted == training_data.LessonUsers.length),
        isOnline: isOnline,
        blank: false,
        ratingStars: [0,0,0,0,0],
        imageName$: ko.observable(rootContentUrl + LPImagesDir + LPDefaultCourseImageName),
        hasChatRoom$: ko.observable(false),
        expanded$: ko.observable(false)
    };
    training_data.extraTrainingInfo = extraTrainingInfo;
    training_data.Course.courseId = getTrailingGuid(training_data.Course.Id);
}

function getLessonUserStatus(lessonUser) {
    var status = lessonUser.ShowBestScoreOnLearningPlan ? lessonUser.BestStatus : lessonUser.LastStatus;
    return status;
}

function categoriseStatus(status, categoriesedLessonType, lessonUser) {
    if (categoriesedLessonType == CategorisedLessonTypes.UNKNOWN) {
        return VisibleStatuses.NOBUTTON;
    }
    var isOnline = categoriesedLessonType == CategorisedLessonTypes.ONLINE;
    switch (status) {
        case LearningRecordStatuses.Cancelled:
            return VisibleStatuses.CANCELLED;
        case LearningRecordStatuses.Complete:
            return isOnline ? VisibleStatuses.ONLINE_COMPLETED : VisibleStatuses.COMPLETED;
        case LearningRecordStatuses.NotStarted:
            return isOnline ? VisibleStatuses.ONLINE_NOT_STARTED : (isLessonEventBooked(lessonUser) ? VisibleStatuses.BOOKED : VisibleStatuses.AVAILABLE_TO_BOOK);
        case null:
            return isOnline ? VisibleStatuses.ONLINE_NOT_STARTED : VisibleStatuses.AVAILABLE_TO_BOOK;
        case LearningRecordStatuses.Incomplete:
        case LearningRecordStatuses.InProgress:
        case "":
            return isOnline ? VisibleStatuses.ONLINE_IN_PROGRESS : VisibleStatuses.BOOKED;
        default:
            return isOnline ? VisibleStatuses.ONLINE_NOT_STARTED : VisibleStatuses.AVAILABLE_TO_BOOK;
    }
}

function isLessonEventBooked(lessonUser) {
    return lessonUser.ChildEventUsers &&
        lessonUser.ChildEventUsers.some(function(eventUser){ return eventUser.Status == EventUserStatuses.Booked; });
}

function categoriseLessonType(lessonType) {
    switch (lessonType) {
        case LessonTypes.Aicc:
        case LessonTypes.Kallidus:
        case LessonTypes.Url:
        case LessonTypes.Scorm:
        case LessonTypes.Scorm2004:
        case LessonTypes.Basic:
            return CategorisedLessonTypes.ONLINE;
        case LessonTypes.Classroom:
            return CategorisedLessonTypes.CLASSROOM;
        default:
            return CategorisedLessonTypes.UNKNOWN;
    }
}

function getOverallProgress(training_data_list) {
    var numLessons = 0;
    var numCompleted = 0;
    training_data_list.forEach(function(training_data) {
        numLessons += training_data.LessonUsers.length;
        numCompleted += training_data.extraTrainingInfo.numCompleted;
    });
    return Math.round((numCompleted / numLessons) * 100);
}

function getCategoryNamesForFilter(training_data_list) {
    var arrayByCategoryName = groupByCategories(training_data_list);
    var categoryNames = [];
    for (var categoryName in arrayByCategoryName) {
        if (categoryName == "") {
            categoryNames.push(UnknownCategoryName);
        } else {
            categoryNames.push(categoryName);
        }
    }
    return categoryNames;
}

function assembleCategoryPlan(training_data_list, filters) {
    if (!training_data_list) {
        return undefined; // This means that we show a 'Loading...' message
    }
    if (training_data_list.length == 0) {
        return [];
    }
    training_data_list = filterListByUIFields(training_data_list, filters);
    return structurePlanIntoCategoriesAndRows(training_data_list);
}

function filterListByUIFields(training_data_list, filters) {
    return training_data_list.filter(function(training_data) { return trainingDataMatchesFilter(training_data, filters); });
}

function trainingDataMatchesFilter(training_data, filters) {
    if (filters.showIncompleteCoursesOnly$() && training_data.extraTrainingInfo.completed) {
        return false;
    }
    if (filters.showOnlineCoursesOnly$() && !training_data.extraTrainingInfo.isOnline) {
        return false;
    }
    if (filters.categoryFilter$()) {
        if (filters.categoryFilter$() == UnknownCategoryName) {
            if (training_data.CourseCategory != null) {
                return false;
            }
        } else {
            if ((training_data.CourseCategory == null) || (filters.categoryFilter$() != training_data.CourseCategory.Title)) {
                return false;
            }
        }
    }
    if (filters.searchText$() && !matchesSearchText(training_data, filters.searchText$())) {
        return false;
    }
    return true;
}

function matchesSearchText(training_data, searchText) {
    var searchText = searchText.toLowerCase();
    if (matchesSearchTextString(training_data.Course.Summary, searchText)) { return true; }
    if (training_data.extraTrainingInfo.courseLoaded) {
        if (matchesSearchTextString(training_data.extraTrainingInfo.description$(), searchText)) { return true; }
    }
    var lessonMatches = training_data.LessonUsers.some( function(lessonUser) {
        if (matchesSearchTextString(lessonUser.Lesson.Title, searchText)) { return true; }
        if (matchesSearchTextString(lessonUser.Lesson.Description, searchText)) { return true; }
        return false;
    });
    if (lessonMatches) { return true; }
    return false;
}

function matchesSearchTextString(s, lowerCaseSearchText) {
    return s && ((s.toLowerCase().indexOf(lowerCaseSearchText) != -1));
}

function structurePlanIntoCategoriesAndRows(training_data_list) {
    var trainingDataByCategory = groupByCategoriesAndRows(training_data_list);
    console.log("Got " + trainingDataByCategory.length + " categories after applying filters");
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

    var trainingByCategory = [];
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
        for (var b = row.courses.length; b < coursesPerRow; b++) {
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
        expanded$: ko.observable(false),
        current_training$: ko.observable()
    };
}

function loadAndProcessCourses(training_data_list) {
    training_data_list.forEach(function(training_data) {
        loadAndProcessCourse(training_data, function() { } );
    });
}

function expandTrainingData(training_data) {
    collapseTrainingDataIfOpen();
    var row = training_data.extraTrainingInfo.enclosingRow;
    training_data.extraTrainingInfo.expanded$(true);
    row.expanded$(true);
    row.current_training$(training_data);
    loadAndProcessCourse(training_data, clampTrainingDataDescription);
}

function collapseTrainingDataIfOpen() {
    var category_plan_array = learning_plan.category_plan$();
    for (var c = 0; c < category_plan_array.length; c++) {
        var category_plan = category_plan_array[c];
        var rows = category_plan.training_data_rows;
        for (var r = 0; r < rows.length; r++) {
            var row = rows[r];
            if (row.expanded$()) {
                row.current_training$().extraTrainingInfo.expanded$(false);
                row.expanded$(false);
                row.current_training$(undefined);
            }
        }
    }
}

function collapseTrainingData(training_data) {
    var row = training_data.extraTrainingInfo.enclosingRow;
    training_data.extraTrainingInfo.expanded$(false);
    row.expanded$(false);
    row.current_training$(undefined);
}

function collapseAllTrainingData() {
    learning_plan.initial_plan$().forEach(function(training_data) {
        if (training_data.extraTrainingInfo.expanded$()) {
            collapseTrainingData(training_data);
        }
    });
}

function loadAndProcessCourse(training_data, success_fn) {
    if (training_data.extraTrainingInfo.courseLoaded) {
        success_fn(training_data);
        return;
    }
    if (isDummyTrainingData(training_data)) {
        loadedCourseOK(training_data, training_data.DummyCourseData);
        success_fn(training_data);
        return;
    }
    loadCourse(training_data.Course.courseId, training_data.Course.Summary,
        function(data) {
            loadedCourseOK(training_data, data);
            success_fn(training_data);
        },
        function(msg) {
            var description = "[ Failed to retrieve course description ]";
            setupDescription(description);
        }
    );
}

function isDummyTrainingData(training_data) {
    return useDummyTrainingData && training_data.DummyCourseData != undefined;
}

function loadedCourseOK(training_data, course) {
    var description = course.Description || "";
    setupDescription(training_data, description);
    setupImageName(training_data, course);
    training_data.extraTrainingInfo.hasChatRoom$(course.ChatRoom);
    training_data.extraTrainingInfo.courseLoaded = true;
}

function clampTrainingDataDescription(training_data) {
    var linesToShow = 3;
    training_data.extraTrainingInfo.descriptionExpanded$(false);
    var paragraphs = $('.lp_course_expanded_description .lp-paragraph-shrunk');
    if (!paragraphs) {
        return;
    }
    var paragraph = paragraphs[0];
    clamp(paragraph, linesToShow);

    var bigEnoughToNeedTruncation = true;
    var potentiallyDisplayedParagraphs = training_data.extraTrainingInfo.paragraphs$();
    if (potentiallyDisplayedParagraphs.length > linesToShow) {
        bigEnoughToNeedTruncation = true;
    } else {
        var spans = $('.lp_course_expanded_description .lp-paragraph-shrunk span');
        if (spans && spans.length < linesToShow) {
            bigEnoughToNeedTruncation = false;
        } else if (spans && spans.length == linesToShow) {
            var lastVisibleLine = spans[linesToShow - 1];
            if (lastVisibleLine.scrollWidth <= lastVisibleLine.clientWidth) {
                // didn't actually need truncation
                bigEnoughToNeedTruncation = false;
            }
        }
    }
    if (!bigEnoughToNeedTruncation) {
        // short enough not to need any 'expansion' button; show the 'expanded' version instead
        training_data.extraTrainingInfo.descriptionExpanded$(true);
    }
}

function toggleExpandedDescription(training_data) {
    if (training_data.extraTrainingInfo.descriptionExpanded$()) {
        clampTrainingDataDescription(training_data);
    } else {
        training_data.extraTrainingInfo.descriptionExpanded$(true);
    }
}

function setupDescription(training_data, description) {
    description = description.replace(/(<p>|<br>|<\/p>)/gi, "\n");
    var paragraphs = description.split("\n");
    var toDisplay = [];
    for (var p = 0; p < paragraphs.length; p++) {
        var paragraph = paragraphs[p].trim();
        if (paragraph.length != 0) {
            toDisplay.push(paragraph);
        }
    }
    training_data.extraTrainingInfo.description$(description);
    training_data.extraTrainingInfo.paragraphs$(toDisplay);
}

function setupImageName(training_data, course) {
    var courseCode = course.Code;
    if (courseCode) {
        var cleanedCode = courseCode.replace(/\\|\/|:|\*|\?|<|>|\||\[|\]/g, "");
        var imageName = rootContentUrl + LPImagesDir + cleanedCode + ".png";
        useImageIfExists(training_data, imageName);
    }
}

function useImageIfExists(training_data, imageName) {
    var nImg = document.createElement('img');
    nImg.onload = function() {
        // image exists and is loaded, so we can use it for the main page
        training_data.extraTrainingInfo.imageName$(imageName);
    };
    nImg.onerror = function() {
        // image did not load
        console.log("training_data; course: " + training_data.Course.Summary +
            "; image not found: " + imageName + "; so leaving as default image: " +
            training_data.extraTrainingInfo.imageName$());
    };
    nImg.src = imageName;
}

function openLiveChat(training_data) {
    var courseId = training_data.Course.courseId;
    if (window.OpenChatRoomWindow) {
        console.log("About to launch live chat using JS; courseId: " + courseId);
        OpenChatRoomWindow(rootUIUrl, courseId, "");
    } else {
        console.log("About to launch live chat via window; courseId: " + courseId);
        var url = "student/ChatRooms/ChatRoom.aspx?CourseGuid=" + courseId;
        launchUrl(url);
    }
}

function bookLessonUser(lessonUser) {
    var lessonId = lessonUser.Lesson.lessonId;
    var courseId = lessonUser.extraLessonInfo.parentTrainingData.Course.courseId;
    var url = "";
    if (lessonUser.extraLessonInfo.isOnline) {
        console.log("About to launch online course; lessonId: " + lessonId + "; courseId: " + courseId);
        url = 'student/frmLaunchLesson.aspx?StandardReset=true&url=&learningobjectguid=' + lessonId + '&courseguid='+courseId;
    } else {
        console.log("About to launch course booking; lessonId: " + lessonId + "; courseId: " + courseId);
        url = 'PortalLink.aspx?PortalSection=LearningPlan&PortalPage=LearningEventList&CourseGuid='+courseId+'&LearningObjectGuid=' + lessonId;
    }
    launchUrl(url);
}

function launchUrl(url) {
    console.log("Launching URL: " + url);
    console.log("Full URL: " + rootUIUrl + url);
    window.open(rootUIUrl + url,
        '',
        'toolbar=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,left=0,screenX=0,top=0,screenY=0,width='
        + (screen.availWidth - 10) + ',height=' + (screen.availHeight - 20)
    );
}

BlankTrainingData = {
    Course: {Summary: "[Blank Data]"},
    LessonUsers: [],
    extraTrainingInfo: {blank: true}
};

// These are listed in the API with numerical values, but in fact they appear as strings
LearningRecordStatuses = {
    Exempt: "Exemppt",
    Complete: "Complete",
    Passed: "Passed",
    Attended: "Attended",
    Failed: "Failed",
    Browsed: "Browsed",
    Cancelled: "Cancelled",
    Declined: "Declined",
    DidNotAttend: "Did Not Attend",
    Incomplete: "Incomplete",
    Withdrawn: "Withdrawn",
    NotStarted: "Not started",
    InProgress: "In progress", // online courses only?
    Unknown: "Unknown"
};

TrainingDataStatuses = {
    NotStarted: "Not started",
    InProgress: "In progress",
    Complete: "Complete"
};

EventUserStatuses = {
    Booked: "Booked",
    Unknown: "Unknown"
};

VisibleStatuses = {
    AVAILABLE_TO_BOOK: 0,
    BOOKED: 1,
    ONLINE_NOT_STARTED: 2,
    ONLINE_IN_PROGRESS: 3,
    COMPLETED: 4,
    CANCELLED: 5,
    NOBUTTON: 6,
    ONLINE_COMPLETED: 7,
    UNKNOWN: 999
};

LessonTypes = {
    Aicc: "Aicc",
    Kallidus: "Kallidus",
    Url: "Url",
    Scorm: "Scorm",
    Scorm2004: "Scorm2004",
    Basic: "Basic",
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

CategorisedLessonTypes = {
    ONLINE: 0,
    CLASSROOM: 1,
    UNKNOWN: 2
};

UnknownCategoryName = "Other";
LPImagesDir = "images/";
LPDefaultCourseImageName = "DefaultCourseImage.png";
