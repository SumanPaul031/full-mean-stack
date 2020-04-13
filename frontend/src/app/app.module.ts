import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SocialLoginModule, AuthServiceConfig, FacebookLoginProvider } from 'angularx-social-login';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTableFilterModule } from 'mat-table-filter';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FlexLayoutModule } from '@angular/flex-layout'
import { ReactiveFormsModule, FormControl, FormsModule, FormGroup } from '@angular/forms';
import { NgxPermissionsGuard } from 'ngx-permissions'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AboutComponent } from './components/about/about.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { AuthService } from './services/auth.service';
import { WebRequestService } from './services/web-request.service';
import { ValidateService } from './services/validate.service';
import { ProfileComponent } from './components/profile/profile.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuardService } from './services/auth-guard.service';
import { LoginGuardService } from './services/login-guard.service';
import { DataSharingService } from './services/data-sharing.service';
import { AuthInterceptorsService } from './services/auth-interceptors.service';
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
import { EditComponent } from './components/management/edit/edit.component';

const config = new AuthServiceConfig([
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider('937406590010553')
  }
]);

export function provideConfig() {
  return config;
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    AboutComponent,
    RegisterComponent,
    LoginComponent,
    ProfileComponent,
    DashboardComponent,
    FacebookComponent,
    TwitterComponent,
    GoogleComponent,
    ActivateComponent,
    ResendComponent,
    UsernameComponent,
    PasswordComponent,
    NewpasswordComponent,
    ManagementComponent,
    EditComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      progressBar: true,
      progressAnimation: 'increasing',
      preventDuplicates: true
    }),
    HttpClientModule,
    SocialLoginModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    FlexLayoutModule,
    MatPaginatorModule,
    NgbModule,
    MatSelectModule,
    MatTableFilterModule,
    NgxPaginationModule
  ],
  providers: [
    AuthService,
    WebRequestService,
    ValidateService,
    AuthGuardService,
    LoginGuardService,
    PermissionGuardService,
    DataSharingService,
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorsService, multi: true},
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
