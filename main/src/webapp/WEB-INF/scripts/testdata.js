function getTestTrainingData() {
    var training_data_list = [];
    for (var i = 0; i < (coursesPerRow+1); i++) {
        training_data_list.push(getTrainingData("Agile Development", i))
    }
    return training_data_list;
}

function getTrainingData(categoryName, num) {
    var training_data = {
        CourseCategory: {Title: categoryName},
        Course: {Summary: "Course " + num},
        LessonUsers: [
            {
                ShowBestScoreOnLearningPlan: true,
                BestStatus: null,
                Lesson: {
                    Title: "Lesson A",
                    Type: "Scorm"
                }
            },
            {
                ShowBestScoreOnLearningPlan: true,
                BestStatus: null,
                Lesson: {
                    Title: "Lesson B",
                    Type: "Scorm"
                }
            }
        ],
        Status: "Not started"
    };
    if (num == 3) {
        training_data.LessonUsers[0].BestStatus = LearningRecordStatuses.Complete;
        training_data.LessonUsers[1].BestStatus = LearningRecordStatuses.Complete;
        training_data.Course.Summary = "Course 3 which is a very long name which needs truncating";
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
