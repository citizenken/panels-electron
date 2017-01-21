/**
 * AngularJS default filter with the following expression:
 * "person in people | filter: {name: $select.search, age: $select.search}"
 * performs an AND between 'name: $select.search' and 'age: $select.search'.
 * We want to perform an OR.
 */
angular.module('panels').filter('notCollabFilter', ['lodash', function(lodash) {
  return function(items, file, removedUsers, currentUser) {
    var out = [];
    var keys = lodash.keys(file.collaborators);

    items.forEach(function(item) {
      if (currentUser.id != item.key && (keys.indexOf(item.key) == -1 || removedUsers.indexOf(item.key) > -1)) {
        out.push(item)
      }
    });

    return out;
  };
}]);