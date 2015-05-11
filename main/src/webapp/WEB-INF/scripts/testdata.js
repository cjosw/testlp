function getTestTrainingData() {
    var training_data_list = [];
    for (var i = 0; i < (coursesPerRow+1); i++) {
        training_data_list.push(getTrainingData("Agile Development", i))
    }
    return training_data_list;
}

function getTrainingData(categoryName, num) {
    var online = (num % 2) == 0;
    var lessonType = online ? LessonTypes.Scorm : LessonTypes.Classroom;
    var training_data = {
        CourseCategory: {Title: categoryName},
        Course: {Summary: "Course " + num + (online ? " (online)" : ""), Id: "course-" + num + "-guid"},
        LessonUsers: [
            {
                ShowBestScoreOnLearningPlan: true,
                BestStatus: null,
                Lesson: {
                    Title: "Lesson A",
                    Id: "course-" + num + "-lesson-a-guid",
                    Type: lessonType
                }
            },
            {
                ShowBestScoreOnLearningPlan: true,
                BestStatus: null,
                Lesson: {
                    Title: "Lesson B",
                    Id: "course-" + num + "-lesson-b-guid",
                    Type: lessonType
                }
            },
            {
                ShowBestScoreOnLearningPlan: true,
                BestStatus: null,
                Lesson: {
                    Title: "Lesson C",
                    Id: "course-" + num + "-lesson-c-guid",
                    Type: lessonType
                }
            }
        ],
        PrerequisitesMet: true,
        DummyDescription: "Call me Ishmael. "+
            "Some years ago - never mind how long precisely - having little or no money in my purse, "+
            "and nothing particular to interest me on shore, "+
            "I thought I would sail about a little and see the watery part of the world. "+
            "It is a way I have of driving off the spleen, and regulating the circulation. "+
            "Whenever I find myself growing grim about the mouth; "+
            "whenever it is a damp, drizzly November in my soul; "+
            "whenever I find myself involuntarily pausing before coffin warehouses, "+
            "and bringing up the rear of every funeral I meet; "+
            "and especially when my hypos get such an upper hand of me, "+
            "that it requires a strong moral principle to prevent me from deliberately stepping into the street, "+
            "and methodically knocking people's hats off- "+
            "then, I account it high time to get to a bookstore as soon as I can. "+
            "That is my substitute for the pistol and ball.",
        Status: "Not started"
    };
    if (num == 1) {
        training_data.LessonUsers[0].BestStatus = LearningRecordStatuses.NotStarted;
        training_data.LessonUsers[1].BestStatus = LearningRecordStatuses.Incomplete;
        training_data.LessonUsers[2].BestStatus = LearningRecordStatuses.Cancelled;
    }
    if (num == 2) {
        training_data.LessonUsers[0].BestStatus = LearningRecordStatuses.Complete;
        training_data.LessonUsers[1].BestStatus = LearningRecordStatuses.Incomplete;
    }
    if (num == 3) {
        training_data.LessonUsers[0].BestStatus = LearningRecordStatuses.Complete;
        training_data.LessonUsers[1].BestStatus = LearningRecordStatuses.Complete;
        training_data.LessonUsers[2].BestStatus = LearningRecordStatuses.Complete;
        training_data.Course.Summary = "Course 3 (completed) which is a very long name which needs truncating";
    }
    if (num == 4) {
        training_data.LessonUsers[0].BestStatus = LearningRecordStatuses.Failed;
        training_data.LessonUsers[1].BestStatus = LearningRecordStatuses.DidNotAttend;
        training_data.LessonUsers[2].BestStatus = LearningRecordStatuses.Withdrawn;
        training_data.Course.Summary = "Course 4 (online) with odd statuses";
    }
    if (num == 5) {
        training_data.Course.Summary = "Course 5 (Prerequisites not met)";
        training_data.PrerequisitesMet = false;
    }
    return training_data;
}

function getDummyCourseImageName(num) {
    switch (num % 6) {
        case 0: return "images/ExampleCourseImageBlue.png";
        case 1: return "images/ExampleCourseImageContentMarketing.png";
        case 2: return "images/ExampleCourseImageECommerce.png";
        case 3: return "images/ExampleCourseImageFinance.png";
        case 4: return "images/ExampleCourseImageHTML5.png";
        case 5: return "images/ExampleCourseImageSEO.png";
    }
}
