/**
 * AngularJS default filter with the following expression:
 * "person in people | filter: {name: $select.search, age: $select.search}"
 * performs an AND between 'name: $select.search' and 'age: $select.search'.
 * We want to perform an OR.
 */
angular.module('panels').filter('notCollabFilter', ['lodash', function(lodash) {
  return function(items, file) {
    var out = [];
    var keys = lodash.keys(file.collaborators);

    items.forEach(function(item) {
      if (keys.indexOf(item.key) == -1) {
        out.push(item)
      }
    });

    return out;
  };
}]);