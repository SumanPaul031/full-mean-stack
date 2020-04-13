import { NgModule } from '@angular/core';
import { NgxPermissionsGuard } from 'ngx-permissions'
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { LoginGuardService } from './services/login-guard.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuardService } from './services/auth-guard.service';
import { ProfileComponent } from './components/profile/profile.component';
import { FacebookComponent } from './components/social/facebook/facebook.component';
import { TwitterComponent } from './components/social/twitter/twitter.component';
import { GoogleComponent } from './components/social/google/google.component';
import { ActivateComponent } from './components/activation/activate/activate.component';
import { ResendComponent } from './components/activation/resend/resend.component';
import { UsernameComponent } from './components/reset/username/username.component';
import { PasswordComponent } from './components/reset/password/password.component';
import { NewpasswordComponent } from './components/reset/newpassword/newpassword.component';
import { ManagementComponent } from './components/management/management/management.component';
import { PermissionGuardService } from './services/permission-guard.service';


const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'home'},
  {path: 'home', component: HomeComponent},
  {path: 'about', component: AboutComponent},
  {path: 'register', component: RegisterComponent, canActivate: [LoginGuardService]},
  {path: 'login', component: LoginComponent, canActivate: [LoginGuardService]},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuardService]},
  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService]},
  {path: 'facebook/:token', component: FacebookComponent, canActivate: [LoginGuardService]},
  {path: 'twitter/:token', component: TwitterComponent, canActivate: [LoginGuardService]},
  {path: 'google/:token', component: GoogleComponent, canActivate: [LoginGuardService]},
  {path: 'activate/:token', component: ActivateComponent, canActivate: [LoginGuardService]},
  {path: 'resend', component: ResendComponent, canActivate: [LoginGuardService]},
  {path: 'resetusername', component: UsernameComponent, canActivate: [LoginGuardService]},
  {path: 'resetpassword', component: PasswordComponent, canActivate: [LoginGuardService]},
  {path: 'newpassword/:token', component: NewpasswordComponent, canActivate: [LoginGuardService]},
  {path: 'management', component: ManagementComponent, canActivate: [PermissionGuardService]},
  {path: '**', redirectTo: 'home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
