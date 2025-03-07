import {Component, OnInit, ViewChild} from '@angular/core';
import {SideMenuComponent} from "./side-menu/side-menu.component";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {HistoryService} from "./history.service";
import {filter, map, mergeMap} from "rxjs/operators";
import {IdentityService} from "./identity.service";
import {ShareService} from "./share.service";
import {of} from "rxjs";
import {EntityService} from "jor-angular";
import {environment} from "../environments/environment";
import {App} from "./role";
import {MessageService} from "ui-message-angular";
import {LogonService} from "ui-logon-angular";
import {msgStore} from './msgStore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild(SideMenuComponent, { static: true })
  private sideMenu: SideMenuComponent;

  isCollapsed = false;
  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private identityService: IdentityService,
              private shareService: ShareService,
              private historyService: HistoryService,
              private entityService: EntityService,
              private messageService: MessageService,
              private logonService: LogonService
  ) {
    this.entityService.setOriginalHost(environment.originalHost);
    this.logonService.setHost(environment.originalHost);
    this.logonService.session().subscribe( data => {
      this.identityService.setSession( data );
      this.messageService.setMessageStore(msgStore, this.identityService.Session.LANGUAGE);
    });
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      filter(route => route.outlet === 'primary'),
      map(route => {
        let url = '';
        while (route.firstChild) {
          route = route.firstChild;
          if ( route.snapshot.url.length > 0 ) {
            url = url ? url + '/' + route.snapshot.url.join('/') : route.snapshot.url.join('/');
          }
        }
        return url;
      }),
      mergeMap(url => {
        if (this.shareService.apps.length === 0) {
          // return this.identityService.getApp('/' + url);
          return of(null);
        } else {
          return of(this.shareService.apps.find( app => app.routeLink === '/' + url ));
        }
      }))
      .subscribe(app => {
        if (app && app['routeLink']) {
          this.sideMenu.activateApp(<App>app);
          this.historyService.addHistory(<App>app);
        }
      });
  }

  onCollapse() {
    this.isCollapsed = this.sideMenu.collapse();
  }
}
