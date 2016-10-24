angular.module('geiaFitApp').service('utilityService', ['$rootScope', '$log', '$q', '$cordovaCapture', '$ionicPopup', '$state', function ($rootScope, $log, $q, $cordovaCapture, $ionicPopup, $state) {

    return {

        calculcateAge: function (dateString) {
            var today = new Date();
            var newDate = moment.unix(dateString).utcOffset('-07:00').format();
            var birthDate = moment(newDate)
            var age = today.getFullYear() - birthDate.year();
            var m = today.getMonth() - birthDate.month();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.date())) {
                age--;
            }
            return age;
        },

        unixTimeToDate: function (timeStamp) {
            return new Date(timeStamp * 1000);
        },

        round: function (value, precision) {
            var multiplier = Math.pow(10, precision || 0);
            return Math.round(value * multiplier) / multiplier;
        },

        captureVideo: function () {
            var addPopup;
            addPopup = $ionicPopup.show({
                template: '<div style="font-weight:bold;"> <button class="button button-block btn-yellow" style="color: #fff;font-weight:bold;" ng-click="captureVideoFromGallery()">My Mobile Device</button><button class="button button-block btn-yellow" style="color: #fff;font-weight:bold;">My Library</button><button class="button button-block btn-yellow" style="color: #fff;font-weight:bold;" ng-click="captureVideoFromCamera()">Create New</button></div>',
                // template: '<div style="background: #121516; color: #fff;"> <button class="button button-block btn-yellow" style="background: #121516; color: #fff;">My Mobile Device</button><button class="button button-block btn-yellow">My Library</button><button class="button button-block btn-yellow">Create New</button></div>',
                title: 'Add Exercise',
                subTitle: 'Choose a Source',
                scope: $rootScope,
                buttons: [
                    { text: 'Cancel' }
                ]
            });


            $rootScope.addFromLibrary = function () {
                addPopup.close();
                $state.transitionTo('main.exerciseLibrary', { isAdd: true }, { reload: true });
            }

            var deferred = $q.defer();
            var promise = deferred.promise;

            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }


            $rootScope.excVideo = null;
            $rootScope.excVideoData = null;
            $rootScope.excVideoFileName = null;

            $rootScope.captureVideoFromGallery = function () {
                addPopup.close();
                navigator.camera.getPicture($rootScope.uploadVideo, onFail, {
                    destinationType: Camera.DestinationType.DATA_URL,
                    mediaType: 2,
                    sourceType: 2,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
                    //encodingType: 0, // 0=JPG 1=PNG
                    allowEdit: true
                }
                );
            };

            $rootScope.uploadVideo = function (videoURI) {

                var name = videoURI.slice(0, -4);
                window.PKVideoThumbnail.createThumbnail(videoURI, name + '.png', function (prevSucc) {
                    $rootScope.thumbnail = prevSucc;
                    return prevImageSuccess(prevSucc);
                }, fail);

                var newvideoURI = "file://" + videoURI;
                $rootScope.excVideo = newvideoURI;
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function () {
                    // alert('success requestFileSystem');
                }, function () {
                    //error
                });
                window.resolveLocalFileSystemURL(newvideoURI, function (fileEntry) {
                    fileEntry.file(function (file) {
                        // alert(JSON.stringify(file)); //view full metadata
                        var type = file.type;
                        var nameoffile = file.name;
                        $rootScope.excVideoFileName = file.name;

                        if (file != null || file != undefined) {
                            var fileReader = new FileReader();
                            fileReader.readAsDataURL(file);
                            fileReader.onload = function (e) {
                                var dataUrl = e.target.result;
                                var base64Data = dataUrl.substr(dataUrl.indexOf('base64,') + 'base64,'.length);
                                $rootScope.excVideoData = base64Data;
                                 //Redirect
                                 $state.transitionTo("setExerciseProgram", {}, { reload: true });
                            };
                        }
                    }, function () {
                        //error
                    });
                }, function () {
                    // error
                });
            };

            function onFail(e) { };

            $rootScope.captureVideoFromCamera = function () {
                addPopup.close();
                $cordovaCapture.captureVideo().then(function (data) {
                    saveVideo(data).success(function (data) {
                        if (!$rootScope.$$phase) {
                            $rootScope.$apply();
                        }
                    }).error(function (data) {
                        console.log('ERROR: ' + data);
                    });
                });
            };

            function saveVideo(data) {
                createFileEntry(data[0].localURL);
                return promise;
            }

            function createFileEntry(fileURI) {
                window.resolveLocalFileSystemURL(fileURI, function (entry) {
                    return copyFile(entry);
                }, onFail);
            }

            function fail(error) {
                console.log('FAIL: ' + error.code);
                // deferred.reject('ERROR');
            }
            // Create a unique name for the videofile
            // Copy the recorded video to the app dir
            function copyFile(fileEntry) {
                var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
                var newName = makeid() + name;
                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (fileSystem2) {
                    fileEntry.copyTo(fileSystem2, newName, function (succ) {
                        return onCopySuccess(succ);
                    }, fail);
                },
                    fail
                );
            }
            function makeid() {
                var text = '';
                var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                for (var i = 0; i < 5; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            }
            // Called on successful copy process
            // Creates a thumbnail from the movie
            // The name is the moviename but with .png instead of .mov
            function onCopySuccess(entry) {
                $rootScope.excVideo = entry.nativeURL;
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function () {
                    // alert('success requestFileSystem');
                }, function () {
                    //error
                });
                window.resolveLocalFileSystemURL($rootScope.excVideo, function (fileEntry) {
                    fileEntry.file(function (file) {
                        // alert(JSON.stringify(file)); //view full metadata
                        var type = file.type;
                        var nameoffile = file.name;
                        $rootScope.excVideoFileName = file.name;
                        if (file != null || file != undefined) {
                            var fileReader = new FileReader();
                            fileReader.readAsDataURL(file);
                            fileReader.onload = function (e) {
                                var dataUrl = e.target.result;
                                var base64Data = dataUrl.substr(dataUrl.indexOf('base64,') + 'base64,'.length);
                                $rootScope.excVideoData = base64Data;
                                //Redirect
                                 $state.transitionTo("setExerciseProgram", {}, { reload: true });
                            };
                        }
                    }, function () {
                        //error
                    });
                }, function () {
                    // error
                });
                var name = entry.nativeURL.slice(0, -4);
                window.PKVideoThumbnail.createThumbnail(entry.nativeURL, name + '.png', function (prevSucc) {
                    $rootScope.thumbnail = prevSucc;
                    return prevImageSuccess(prevSucc);
                }, fail);
            }

            // Called on thumbnail creation success
            // Generates the currect URL to the local moviefile
            // Finally resolves the promies and returns the name
            function prevImageSuccess(succ) {
                var correctUrl = succ.slice(0, -4);
                correctUrl += '.MOV';
                deferred.resolve(correctUrl);
            }


        }

    };

}]);