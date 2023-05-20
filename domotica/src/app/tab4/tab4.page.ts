import { Component, OnInit } from '@angular/core';
import StorageHelper from '../helpers/storage.helper';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page {

  public devices: any[] = [];

  constructor(private toastController: ToastController) { }

  async ionViewDidEnter() {
    await StorageHelper.get(StorageHelper.params.SENSOR).then((value) => {
      this.devices = JSON.parse(value!);
    });
  }

  async toggleChange(event: any, topic: any) {
    this.devices.find((device: any) => {
      if (device.id === device.id) {
        device.topics.find((topicFind: any) => {
          if (topicFind.topic === topic.topic) {
            topicFind.state = event.detail.checked;
          }
        }
        )
      }
    })

    await StorageHelper.add(StorageHelper.params.SENSOR, JSON.stringify(this.devices));
  }

  async deleteDevice(device: any) {
    this.devices = this.devices.filter((deviceFilter: any) => deviceFilter.id !== device.id);
    await StorageHelper.add(StorageHelper.params.SENSOR, JSON.stringify(this.devices)).then(() => {
      this.presentToast('bottom', 'Dispositiu eliminat correctament!', 2000, 'danger');
    });
    await StorageHelper.get(StorageHelper.params.SENSOR).then((value) => {
      this.devices = JSON.parse(value!);
    });
  }

  async presentToast(position: 'top' | 'middle' | 'bottom', message: string, duration: number, color: string) {
    const toast = await this.toastController.create({
      message,
      duration,
      position,
      color
    });

    await toast.present();
  }

}
