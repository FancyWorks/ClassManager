/**
 * Created by Ken on 2015-5-4.
 */

app.controller("indexController", ['$rootScope','$scope','Ajax','$browser','$q','$timeout','Upload',
function($rootScope,$scope,Ajax,$browser,$q,$timeout,Upload) {

    $scope.wordPair = {text:''};

    Ajax.get('/user/getUserList').then(function(data){
        $scope.users = data;
        $scope.curUser = data[0];
        Ajax.get('/imagetext/'+$scope.curUser.u_id).then(function(data){
            console.log('imagetext',data);
            $scope.words = data;
        });
    });

    //$scope.words = [
    //    {img:'./image/avatar1.png',text:'teacher'},
    //    {img:'./image/avatar4.png',text:'student'}
    //];

    $scope.onSubmit = function() {
        console.log($scope.wordPair);
        if($scope.files)
            $scope.upload($scope.files);
    };

    $scope.log = '';
    $scope.onClickUser = function(user) {
        $scope.curUser = user;
        Ajax.get('/imagetext/'+user.u_id).then(function(data){
            $scope.words = data;
        });
    };
    $scope.upload = function (files) {
        if(!$scope.curUser) {
            alert('please select a user first.');
            return false;
        }
        if (!files || files.length<1) {
            alert('please select file first');
            return false;
        }
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            Upload.upload({
                url: '/imagetext/add',
                fields: {
                    'username': $scope.curUser.username,
                    'uid': $scope.curUser.u_id,
                    'text': $scope.wordPair.text
                },
                file: file
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                $scope.log = 'progress: ' + progressPercentage + '% ' +
                            evt.config.file.name + '\n' + $scope.log;
            }).success(function (data, status, headers, config) {
                $scope.log = 'file ' + config.file.name + 'uploaded. Response: ' + JSON.stringify(data) + '\n' + $scope.log;
                Ajax.get('/imagetext/'+$scope.curUser.u_id).then(function(data){
                    $scope.words = data;
                    $scope.wordPair.text = '';
                    $scope.$apply();
                });
            });
        }
    };

    SetPositionOfPageContent();
}] );
