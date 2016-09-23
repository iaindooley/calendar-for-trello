'use strict';

import {appModule} from '../app';
import ISidenavService = angular.material.ISidenavService;
import {WebStorageAdapter} from '../services/WebStorageAdapter';
import IDialogService = angular.material.IDialogService;
import {InitService} from '../services/initService';

interface MyWindow extends Window {
    Offline: any;
}

declare var window: MyWindow;

export class AppCtrl {
    private offline: boolean;
    private toolbar;

    private keyHandler: Function;

    constructor(private $scope: ng.IScope, private $rootScope: ng.IRootScopeService,
                private ngProgress, private initService: InitService, private $mdSidenav: ISidenavService,
                private WebStorageAdapter: WebStorageAdapter) {
        'ngInject';

        let checks: OfflineChecks = {
            xhr: {url: '/'}
        };
        let options: OfflineOptions = {
            checks: checks,
            checkOnLoad: false,
            interceptRequests: false,
            reconnect: {
                initialDelay: 0,
                delay: 0
            },
            requests: true,
            game: false
        };
        window.Offline.options = options;

        window.addEventListener('offline', () => {
            window.Offline.on('down', () => {
                console.log('Trello Calendar is offline now.');
                this.offline = true;
                this.toolbar = {'background-color': '#B04632'};
                $scope.$apply();

            });

        });
        window.addEventListener('online', () => {
            window.Offline.on('up', () => {
                console.log('Trello Calendar is online now.');

                this.toolbar = {'background-color': '#42548E'};
                this.offline = false;
                $rootScope.$broadcast('updateChange');
                initService.refresh(true);

            });

        });

        if (WebStorageAdapter.hasStorage()) {

            this.ngProgress.color('#CF513D');
            $rootScope.$on('$stateChangeSuccess', () => {
                ngProgress.complete();
            });
            $rootScope.$on('$stateChangeStart', () => {
                this.ngProgress.start();
            });

            this.keyHandler = function (e) {
                var event = window.event ? window.event : e;
                if (event.keyCode === 114) {
                    console.log('reload');
                    $rootScope.$broadcast('reload');
                }
            };

            $rootScope.$on('reload', () => {
                this.ngProgress.start();
                initService.refresh().then(() => {
                    this.ngProgress.complete();
                });
            });

        }
    }


    public drop(item) {
        console.log('drop');
        // console.log('item: ', item.id);
        //console.log('item: ',);
        // console.log(document.getElementById(item.id + '-12,0,0').parentNode.parentNode.id);
    }

}

appModule.controller('AppCtrl', AppCtrl)    ;