'use strict';

angular.module('pictifyApp.version', [
  'pictifyApp.version.interpolate-filter',
  'pictifyApp.version.version-directive'
])

.value('version', '0.1');
