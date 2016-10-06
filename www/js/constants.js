angular.module('geiaFitApp')
 
.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})
.constant('USER_ROLES', {
  admin: 'admin_role',
  public: 'public_role'
})
.constant('ApiEndpoint', {
  // url:'http://172.16.3.186/geia_api-master/api'
 url: 'https://api.geiafit.com/api'
});