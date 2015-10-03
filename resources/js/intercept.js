/**
 * Application
 * @type {module}
 * @author Jaziel Lopez
 */
var app = angular.module('intercept', ['ui.bootstrap']);

/**
 * Interceptors
 */
app.config(function ($httpProvider) {

    $httpProvider.interceptors.push(interceptHttp);

    /**
     * Define what to do when intercept request and response
     * @returns {{request: request, response: response}}
     */
    function interceptHttp($q){

        // Intercept request
        function request(config) {

            try {

                // enable default dictionary
                pottymouth.badwords.set(badwords);

                // set threshold of regex
                pottymouth.validate.threshold.set(0.5);

                // separate subject string
                var test = config.data.subject.split(' ');

                // test each keyword
                for(var i in test){

                    var subject = test[i];

                    if ( pottymouth.validate.regex(subject) || pottymouth.validate.dictionary(subject))
                        throw 'Violation has been found';

                }
            } catch(e){

                // cancel request
                var cancel = $q.defer();
                config.timeout = cancel.promise;
                cancel.resolve();

            } finally{

                // return the evaluated request
                return config;
            }
        }

        // Intercept response
        function response( response ) {

            return(response);
        }

        return({
            request: request,
            response: response
        });
    }
});

/**
 * Post Service
 */
app.service('Post', function($http){

    return function(subject){

        // attempt to post a text without previous sanity
        // sanity is added before the request is sent
        // for the POST service is totally transparent
        return $http.post('post.json', {subject: subject}, function(){});
    };
});

/***
 * Controller
 */
app.controller('interceptCtrl', ['$scope', 'Post', function($scope, Post) {

    $scope.log = [];

    /**
     * Submit
     */
    $scope.submit = function(){

        Post($scope.subject).then(function(){

            // success
            $scope.log.push({message:'Post has been successfully emitted: ' + $scope.subject + ' at '+ new Date(), type: 'success'});
            $scope.subject = null;

        }, function(){

            // false
            $scope.log.push({message:'Post has been cancelled due to bad words at: ' + new Date(), type: 'danger'});
        });
    };
}]);
