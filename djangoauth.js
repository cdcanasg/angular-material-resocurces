angularDjangoAuth = angular.module('angularDjangoAuthService', [
  'ngCookies'
]);
angularDjangoAuth.service('djangoAuth', function djangoAuth($q, $http, $cookies, $rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var service = {
        /* START CUSTOMIZATION HERE */
        // Change this to point to your Django REST Auth API
        // e.g. /api/rest-auth  (DO NOT INCLUDE ENDING SLASH)
        'API_URL': '/auth',
        // Set use_session to true to use Django sessions to store security token.
        // Set use_session to false to store the security token locally and transmit it as a custom header.
        'use_session': false,
        /* END OF CUSTOMIZATION */
        'authenticated': null,
        'authPromise': null,
        'tokenPrefix': 'JWT',
        'request': function(args) {
            // Let's retrieve the token from the cookie, if available
            if($cookies.get('Authorization')){
                $http.defaults.headers.common.Authorization = this.tokenPrefix + ' ' + $cookies.get('Authorization');
            }
            if($cookies.get('csrftoken')){
                $http.defaults.headers.common['X-CSRFToken'] = $cookies.get('csrftoken');
            }
            // Continue
            params = args.params || {}
            args = args || {};
            var deferred = $q.defer(),
                url = this.API_URL + args.url,
                method = args.method || "GET",
                params = params,
                data = args.data || {};
            // Fire the request, as configured.
            $http({
                url: url,
                withCredentials: this.use_session,
                method: method.toUpperCase(),
                params: params,
                data: data
            })
            .then(
                angular.bind(this,function(response) {
                deferred.resolve(response)}),
                
                angular.bind(this,function(data) {
                console.log("error syncing with: " + url);
                if(data.status == 0){
                    if(data.data == ""){
                        data.data = {};
                        data['status'] = 0;
                        data['non_field_errors'] = ["Could not connect. Please try again."];
                    }
                    // or if the data is null, then there was a timeout.
                    if(data == null){
                        // Inject a non field error alerting the user
                        // that there's been a timeout error.
                        data = {};
                        data['status'] = 0;
                        data['non_field_errors'] = ["Server timed out. Please try again."];
                    }
                }
                deferred.reject(data);
            }));
            return deferred.promise;
        },
        'register': function(username,password1,password2,email,more){
            var data = {
                'username':username,
                'password1':password1,
                'password2':password2,
                'email':email
            }
            data = angular.extend(data,more);
            return this.request({
                'method': "POST",
                'url': "/registration/",
                'data' :data
            });
        },
        'login': function(username,password){
            var djangoAuth = this;
            var defered = $q.defer();
            this.request({
                'method': "POST",
                'url': "/login/",
                'data':{
                    'username':username,
                    'password':password
                }
            }).then(function(response){
                if(!djangoAuth.use_session){
                    $http.defaults.headers.common.Authorization = djangoAuth.tokenPrefix + ' ' + response.data.token;
                    $http.defaults.headers.common['X-CSRFToken'] = $cookies.get('csrftoken');
                    $cookies.put('Authorization',response.data.token);
                }
                djangoAuth.authenticated = true;
                response.data.user.loggedIn = djangoAuth.authenticated;
                $rootScope.$broadcast("djangoAuth.logged_in", response.data);
                defered.resolve(response.data);
            },function(response){
                delete $http.defaults.headers.common.Authorization;
                $cookies.remove('Authorization');
                defered.reject({data:response.data,status:response.status});
            });
            return defered.promise;
        },
        'logout': function(){
            var djangoAuth = this;
            delete $http.defaults.headers.common.Authorization;
            $cookies.remove('Authorization');
            return this.request({
                'method': "POST",
                'url': "/logout/"
            }).then(function(response){
                delete $http.defaults.headers.common['X-CSRFToken'];
                $cookies.remove('csrftoken');
                djangoAuth.authenticated = false;
                $rootScope.$broadcast("djangoAuth.logged_out");
                return response.data;
            });
        },
        'changePassword': function(password1,password2){
            return this.request({
                'method': "POST",
                'url': "/password/change/",
                'data':{
                    'new_password1':password1,
                    'new_password2':password2
                }
            });
        },
        'resetPassword': function(email){
            return this.request({
                'method': "POST",
                'url': "/password/reset/",
                'data':{
                    'email':email
                }
            });
        },
        'profile': function(){
            return this.request({
                'method': "GET",
                'url': "/user/"
            }); 
        },
        'updateProfile': function(data){
            return this.request({
                'method': "PATCH",
                'url': "/user/",
                'data':data
            }); 
        },
        'verify': function(key){
            return this.request({
                'method': "POST",
                'url': "/registration/verify-email/",
                'data': {'key': key} 
            });            
        },
        'confirmReset': function(uid,token,password1,password2){
            return this.request({
                'method': "POST",
                'url': "/password/reset/confirm/",
                'data':{
                    'uid': uid,
                    'token': token,
                    'new_password1':password1,
                    'new_password2':password2
                }
            });
        },
        'authenticationStatus': function(restrict, force){
            // Set restrict to true to reject the promise if not logged in
            // Set to false or omit to resolve when status is known
            // Set force to true to ignore stored value and query API
            restrict = restrict || false;
            force = force || false;
            if(this.authPromise == null || force){
                this.authPromise = this.request({
                    'method': "GET",
                    'url': "/user/"
                })
            }
            var da = this;
            var getAuthStatus = $q.defer();
            if(this.authenticated != null && !force){
                // We have a stored value which means we can pass it back right away.
                if(this.authenticated == false && restrict){
                    getAuthStatus.reject("User is not logged in.");
                }else{
                    getAuthStatus.resolve();
                }
            }else{
                // There isn't a stored value, or we're forcing a request back to
                // the API to get the authentication status.
                this.authPromise.then(function(response){
                    da.authenticated = true;
                    var returnObject = {
                        'user': response.data
                    };
                    returnObject.user.loggedIn = true;
                    getAuthStatus.resolve(returnObject);
                },function(response){
                    da.authenticated = false;
                    if(restrict){
                        delete $http.defaults.headers.common['X-CSRFToken'];
                        delete $http.defaults.headers.common.Authorization;
                        $cookies.remove('csrftoken');
                        $cookies.remove('Authorization');
                        getAuthStatus.reject(response.data);
                    }else{
                        getAuthStatus.resolve();
                    }
                });
            }
            return getAuthStatus.promise;
        },
        'initialize': function(url, sessions){
            this.API_URL = url;
            this.use_session = sessions;
            return this.authenticationStatus();
        },
        'goToApp': function(groupName){
            var deferred = $q.defer();
            var promise = deferred.promise;
            require([groupName],function(){
                deferred.resolve({'url': '/' + groupName + '/main'});
            });

            return promise;
        }

    }
    return service;
  });
angularDjangoAuth.service('Validate', function Validate() {
    return {
        'message': {
            'minlength': 'This value is not long enough.',
            'maxlength': 'This value is too long.',
            'email': 'A properly formatted email address is required.',
            'required': 'This field is required.'
        },
        'more_messages': {
            'demo': {
                'required': 'Here is a sample alternative required message.'
            }
        },
        'check_more_messages': function(name,error){
            return (this.more_messages[name] || [])[error] || null;
        },
        validation_messages: function(field,form,error_bin){
            var messages = [];
            for(var e in form[field].$error){
                if(form[field].$error[e]){
                    var special_message = this.check_more_messages(field,e);
                    if(special_message){
                        messages.push(special_message);
                    }else if(this.message[e]){
                        messages.push(this.message[e]);
                    }else{
                        messages.push("Error: " + e)
                    }
                }
            }
            var deduped_messages = [];
            angular.forEach(messages, function(el, i){
                if(deduped_messages.indexOf(el) === -1) deduped_messages.push(el);
            });
            if(error_bin){
                error_bin[field] = deduped_messages;
            }
        },
        'form_validation': function(form,error_bin){
            for(var field in form){
                if(field.substr(0,1) != "$"){
                    this.validation_messages(field,form,error_bin);
                }
            }
        }
    }
});