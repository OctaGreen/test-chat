import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';
import { LoginComponent } from './login/login.component';
import { ChatService } from './services/chat.service';
import { StorageService } from './services/storage.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [StorageService, ChatService],
  bootstrap: [AppComponent]
})
export class AppModule { }
