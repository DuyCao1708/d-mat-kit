import { Route } from '@angular/router';
import { ComponentViewer } from './pages/component-viewer/component-viewer';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'components' },
  {
    path: 'components',
    component: ComponentViewer,
  },
];
