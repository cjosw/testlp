function getTestTrainingData() {
    var training_data_list = [];
    var i = 0;
    for (i = 0; i < (coursesPerRow+2); i++) {
        training_data_list.push(getTrainingData("Agile Development", i))
    }
    for (; i < (coursesPerRow+4); i++) {
        training_data_list.push(getTrainingData("Scroll Development", i))
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
                    Title: "Lesson A pqr",
                    Description: "Lesson A with extra text: " + (num + 7),
                    Id: "course-" + num + "-lesson-a-guid",
                    Type: lessonType
                }
            },
            {
                ShowBestScoreOnLearningPlan: true,
                BestStatus: null,
                Lesson: {
                    Title: "Lesson B xyz",
                    Description: "Banana",
                    Id: "course-" + num + "-lesson-b-guid",
                    Type: lessonType
                }
            },
            {
                ShowBestScoreOnLearningPlan: true,
                BestStatus: null,
                Lesson: {
                    Title: "Lesson C",
                    Description: "Zoo keeper",
                    Id: "course-" + num + "-lesson-c-guid",
                    Type: lessonType
                }
            }
        ],
        PrerequisitesMet: true,
        DummyCourseData: {
            ChatRoom: true,
            Description: "<p>Call me Ishmael. " +
            "Some years ago - never mind how long precisely - having little or no money in my purse, "+
            "and nothing particular to interest me on shore, "+
            "I thought I would sail about a little and see the watery part of the world.<br> "+
            "It is a way I have of driving off the spleen, and regulating the circulation. </p>"+
            "<p>Whenever I find myself growing grim about the mouth; "+
            "whenever it is a damp, drizzly November in my soul; "+
            "whenever I find myself involuntarily pausing before coffin warehouses, "+
            "and bringing up the rear of every funeral I meet; "+
            "and especially when my hypos get such an upper hand of me, "+
            "that it requires a strong moral principle to prevent me from deliberately stepping into the street, "+
            "and methodically knocking people's hats off- "+
            "then, I account it high time to get to a bookstore as soon as I can.<br> "+
            "That is my substitute for the pistol and ball.</p>"+
            "<p>With a philosophical flourish Cato throws himself upon his sword; "+
            "I quietly take to the ship. There is nothing surprising in this. "+
            "If they but knew it, almost all men in their degree, some time or other, "+
            "cherish very nearly the same feelings towards the ocean with me.</p>"
            ,Code: "DUMMY-COURSE-" + num
        }
        ,
        Status: "Not started"
    };
    if (num == 0) {
        training_data.DummyCourseData.Code = "ExampleCourseImageBlue";
    }
    if (num == 1) {
        training_data.LessonUsers[0].BestStatus = LearningRecordStatuses.NotStarted;
        training_data.LessonUsers[1].BestStatus = LearningRecordStatuses.Incomplete;
        training_data.LessonUsers[2].BestStatus = LearningRecordStatuses.Cancelled;
        training_data.DummyCourseData.Description = "";
        training_data.Course.Summary = "Course 1, no description";
        training_data.DummyCourseData.Code = "ExampleCourseImageContentMarketing";
    }
    if (num == 2) {
        training_data.LessonUsers[0].BestStatus = LearningRecordStatuses.Complete;
        training_data.LessonUsers[1].BestStatus = LearningRecordStatuses.Incomplete;
        training_data.DummyCourseData.Description = "This is a short description";
        training_data.Course.Summary = "Course 2 (online) with short description";
        training_data.DummyCourseData.Code = "ExampleCourseImageECommerce";
    }
    if (num == 3) {
        training_data.LessonUsers[0].BestStatus = LearningRecordStatuses.Complete;
        training_data.LessonUsers[1].BestStatus = LearningRecordStatuses.Complete;
        training_data.LessonUsers[2].BestStatus = LearningRecordStatuses.Complete;
        training_data.Course.Summary = "Course 3 (completed) which is a very long name which needs truncating";
        training_data.DummyCourseData.Description = "Call me Ishmael. "+
            "Some years ago - never mind how long precisely - having little or no money in my purse, "+
            "and nothing particular to interest me on shore, "+
            "I thought I would sail about a little and see the watery part of the world.";
        training_data.DummyCourseData.Code = "ExampleCourseImageFinance";
    }
    if (num == 4) {
        training_data.LessonUsers[0].BestStatus = LearningRecordStatuses.Failed;
        training_data.LessonUsers[1].BestStatus = LearningRecordStatuses.DidNotAttend;
        training_data.LessonUsers[2].BestStatus = LearningRecordStatuses.Withdrawn;
        training_data.Course.Summary = "Course 4 (online) with odd statuses";
        training_data.DummyCourseData.Code = "ExampleCourseImageHTML5";
    }
    if (num == 5) {
        training_data.Course.Summary = "Course 5 (Prerequisites not met)";
        training_data.PrerequisitesMet = false;
        training_data.DummyCourseData.Code = "ExampleCourseImage/SEO";
    }
    if (num == 7) {
        training_data.LessonUsers[0].Lesson.Description = "Babbage";
        training_data.LessonUsers[1].BestStatus = LearningRecordStatuses.DidNotAttend;
        training_data.DummyCourseData.Description = "Description line 1. <br>"+
            "Description line 2. <br>"+
            "Description line 3. <br>"+
            "Description line 4. ";
    }
    return training_data;
}

function getDummyCourseImageName(num) {
    switch (num % 6) {
        case 0: return "ExampleCourseImageBlue.png";
        case 1: return "ExampleCourseImageContentMarketing.png";
        case 2: return "ExampleCourseImageECommerce.png";
        case 3: return "ExampleCourseImageFinance.png";
        case 4: return "ExampleCourseImageHTML5.png";
        case 5: return "ExampleCourseImageSEO.png";
    }
}
