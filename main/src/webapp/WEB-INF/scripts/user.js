function loadUser(userId) {
    if (useDummyUser) {
        console.log("Loading dummy user ...")
        userLoadedSuccess({FirstName: "Mona", LastName: "Lisa"})
    } else {
        console.log("Loading userId: " + userId + " ...")
        invokeAjax(rootAPIUrl + 'users/' + userId, userLoadedSuccess);
    }
}

function userLoadedSuccess(result, status, xhr) {
    console.log("Got user: " + result.FirstName + " " + result.LastName);
    learning_plan.user(result);
}
