import { Component } from '@angular/core';
import { Observable, interval, map } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  toogleThemeButton: boolean = true;
  clock: any;
  subscription: any;
  

  constructor() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes().toString().padStart(2, '0');
    const second = now.getSeconds().toString().padStart(2, '0');
    this.clock = hour + ':' + minute + ':' + second;

    this.subscription = interval(1000).subscribe(() => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes().toString().padStart(2, '0');
      const second = now.getSeconds().toString().padStart(2, '0');
      this.clock = hour + ':' + minute + ':' + second;

      if(hour == 20 &&  minute == '12' && second == '30') {
        console.log('Evento lanzado a las 10:57');
        document.body.setAttribute('color-theme', 'dark');
        this.toogleThemeButton = false;
      }
    
    });
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  toggleTheme() {
    if(this.toogleThemeButton == true) {
      document.body.setAttribute('color-theme', 'dark');
      this.toogleThemeButton = false;
    }else {
      document.body.setAttribute('color-theme', 'light');
      this.toogleThemeButton = true;
    }
  }

}