function loadCourse(courseId, courseName, successFn, errorFn) {
    console.log("Loading courseId: " + courseId + " (" + courseName + ") ...");
    invokeAjax(rootAPIUrl + 'courses/' + courseId, successFn, errorFn);
}
