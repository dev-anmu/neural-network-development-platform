import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {NnBuilderComponent} from './pages/project/nn-builder/nn-builder.component';
import {ProjectsComponent} from './pages/projects/projects.component';
import {ProjectComponent} from './pages/project/project.component';

const routes: Routes = [
  {path: '', component: HomeComponent, pathMatch: 'full', title: 'Home | WebNet'},
  {path: 'home', redirectTo: '', pathMatch: 'full'},
  {
    path: 'builder',
    component: NnBuilderComponent,
    pathMatch: 'full',
    title: 'Builder | WebNet'
  },
  {path: 'projects/:websiteName', component: ProjectComponent, title: 'Project | WebNet'},
  {
    path: 'projects',
    component: ProjectsComponent,
    pathMatch: 'full',
    title: 'Projects | WebNet',
  },
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
