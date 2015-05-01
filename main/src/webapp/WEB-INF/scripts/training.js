function loadTrainingPlan(userId) {
    console.log("Loading training plan for userId: " + userId + " ...")
    invokeAjax(rootUrl + 'users/' + userId + '/training', trainingLoadedSuccess);
}

function trainingLoadedSuccess(result, status, xhr) {
    console.log("Got n courses: " + result.length);
    var sorted = result.sort(compareTrainingByCategoryName);
    var trainingDataByCategory = groupByCategories(sorted)
    console.log("Got n categories: " + trainingDataByCategory.length);
    learning_plan.training(trainingDataByCategory);
}

function compareTrainingByCategoryName(training_data_a, training_data_b) {
    var aCategory = training_data_a.CourseCategory;
    var bCategory = training_data_b.CourseCategory;
    if (!aCategory && !bCategory) return 0;
    if (!aCategory) return 1; // null categories get sorted to the end
    if (!bCategory) return -1;
    var aName = aCategory.Title;
    var bName = bCategory.Title;
    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}

function groupByCategories(training_data_list) {
    var arrayByCategoryName = training_data_list.reduce(function(result, current) {
        var category = current.CourseCategory;
        var categoryName = (category == null) ? "" : category.Title;
        result[categoryName] = result[categoryName] || [];
        result[categoryName].push(current);
        return result;
    }, {});
    var trainingByCategory = []
    for (var categoryName in arrayByCategoryName) {
        //var categoryName = (category == null) ? "[No category]" : category.Title;
        trainingByCategory.push({categoryName: categoryName, training_data_list: arrayByCategoryName[categoryName]})
    }
    return trainingByCategory;
}
