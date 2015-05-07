function getTestTrainingData() {
    var training_data_list = [];
    for (var i = 0; i < (coursesPerRow+1); i++) {
        training_data_list.push(getTrainingData("Agile Development", i))
    }
    return training_data_list;
}

function getTrainingData(categoryName, num) {
    var lessonType = ((num % 2) == 0) ? LessonTypes.Scorm : LessonTypes.Classroom;
    var training_data = {
        CourseCategory: {Title: categoryName},
        Course: {Summary: "Course " + num, Id: "course-" + num + "-guid"},
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
        training_data.Course.Summary = "Course 3 which is a very long name which needs truncating";
    }
    if (num == 4) {
        training_data.LessonUsers[0].BestStatus = LearningRecordStatuses.Failed;
        training_data.LessonUsers[1].BestStatus = LearningRecordStatuses.DidNotAttend;
        training_data.LessonUsers[2].BestStatus = LearningRecordStatuses.Withdrawn;
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
