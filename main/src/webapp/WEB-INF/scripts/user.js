function loadUser(userId) {
    console.log("Loading userId: " + userId + " ...")
    invokeAjax(rootUrl + 'users/' + userId, userLoadedSuccess);
}

function userLoadedSuccess(result, status, xhr) {
    console.log("Got user: " + result.FirstName + " " + result.LastName);
    learning_plan.user(result);
}
