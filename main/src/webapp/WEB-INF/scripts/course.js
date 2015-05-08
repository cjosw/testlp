function loadCourse(courseId, successFn, errorFn) {
    console.log("Loading courseId: " + courseId + " ...")
    invokeAjax(rootAPIUrl + 'courses/' + courseId, successFn, errorFn);
}
