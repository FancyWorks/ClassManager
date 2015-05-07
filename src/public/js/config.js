/**
 * Created by md on 14-8-10.
 */

define(function(require){

    app.config(function($httpProvider) {
        $httpProvider.defaults.headers.common['Cache-Control'] = 'no-cache';
    });

    app.config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider) {
        var routerArr = [
            {
                url:'/index',
                templateUrl: './view/_.html',
                controller: 'projectListController'
            },

        ];
        for(var i in routerArr) {
            var router = routerArr[i];
            $routeProvider.when(router.url,router);
        }
        $routeProvider
            .when('/', {
                redirectTo:'/index'
            })
            .otherwise({
                templateUrl: './view/_mainboard.html',
                controller: sa.autoload('mainboardController')
            });
        //$locationProvider.html5Mode(true);
    }]);
});
