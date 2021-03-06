/**
 * AngularJS default filter with the following expression:
 * "person in people | filter: {name: $select.search, age: $select.search}"
 * performs an AND between 'name: $select.search' and 'age: $select.search'.
 * We want to perform an OR.
 */
angular.module('panels').filter('propsFilter', function() {
  return function(items, props) {
    var out = [];
    var keys = Object.keys(props);

    items.forEach(function(item) {
      var itemMatches = false;

      for (var i = 0; i < keys.length; i++) {
        var prop = keys[i];
        var text = props[prop].toLowerCase();
        if (item.value[prop].toString().toLowerCase().indexOf(text) !== -1) {
          itemMatches = true;
          break;
        }
      }

      if (itemMatches) {
        out.push(item.value);
      }
    });

    return out;
  };
});