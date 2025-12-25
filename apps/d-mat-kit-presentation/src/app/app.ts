import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  imports: [
    RouterModule,
    MatSidenavModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    RouterModule,
    MatListModule,
  ],
  selector: 'app-root',
  template: ` <!--prettier-ignore-->
    <mat-toolbar class="toolbar" [class.is-mobile]="isMobile()">
      <button matButton>
        <mat-icon class="icon-angular-logo" svgIcon="angular-logo"></mat-icon>
        d-mat-kit
      </button>

      <a matButton [routerLink]="['/components']">
        Components
      </a>
    </mat-toolbar>

    <mat-sidenav-container
      class="sidenav-container"
      [class.is-mobile]="isMobile()"
    >
      <mat-sidenav
        #sidenav
        class="sidenav"
        [mode]="isMobile() ? 'over' : 'side'"
        [fixedInViewport]="isMobile()"
        fixedTopGap="56"
      >
        <mat-nav-list>
          <a mat-list-item [routerLink]="['/componennts', 'alerts']">Alert</a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <button matButton (click)="sidenav.toggle()">toggle sidenav</button>
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>`,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        position: absolute;
        inset: 0;
      }

      .toolbar {
        --mat-toolbar-container-background-color: var(
          --mat-sys-secondary-container
        );

        .is-mobile {
          position: fixed;
          z-index: 2;
        }

        button,
        a {
          --mat-button-text-label-text-color: var(--mat-sys-primary) !important;
        }

        button mat-icon.icon-angular-logo {
          height: 1.5rem;
          width: 1.5rem;
        }
      }

      .sidenav-container {
        flex: 1;

        .is-mobile {
          flex: 1 0 auto;
          margin-top: 56px;
        }
      }

      .sidenav {
        width: fit-content;
      }
    `,
  ],
})
export class App {
  isMobile = toSignal(
    inject(BreakpointObserver)
      .observe(Breakpoints.Handset)
      .pipe(map((resuslt) => resuslt.matches)),
    { initialValue: false }
  );

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIconLiteral(
      'angular-logo',
      sanitizer.bypassSecurityTrustHtml(ANGULAR_LOGO_ICON)
    );
  }
}

const ANGULAR_LOGO_ICON = `
 <svg _ngcontent-ng-c3052461960="" x="0px" y="0px" width="960px" height="960px" viewBox="0 0 960 960"><polygon _ngcontent-ng-c3052461960="" points="562.6,109.8 804.1,629.5 829.2,233.1"></polygon><polygon _ngcontent-ng-c3052461960="" points="624.9,655.9 334.3,655.9 297.2,745.8 479.6,849.8 662,745.8"></polygon><polygon _ngcontent-ng-c3052461960="" points="384.1,539.3 575.2,539.3 479.6,307"></polygon><polygon _ngcontent-ng-c3052461960="" points="396.6,109.8 130,233.1 155.1,629.5"></polygon></svg>
`;
