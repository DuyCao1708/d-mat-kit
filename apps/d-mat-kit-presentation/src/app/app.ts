import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Navbar } from './layout/navbar/navbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  imports: [RouterModule, Navbar, MatSidenavModule, MatButtonModule],
  selector: 'app-root',
  template: ` <navbar></navbar>
    <mat-sidenav-container
      class="example-sidenav-container"
      [style.marginTop.px]="isMobile() ? 56 : 0"
    >
      <mat-sidenav
        #snav
        [mode]="isMobile() ? 'over' : 'side'"
        [fixedInViewport]="isMobile()"
        fixedTopGap="56"
      >
      </mat-sidenav>

      <mat-sidenav-content>
        <button matButton (click)="snav.toggle()">toggle sidenav</button>
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
}
