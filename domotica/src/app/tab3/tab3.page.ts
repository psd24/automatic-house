import { Component } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  IMqttMessage,
  MqttModule,
  IMqttServiceOptions,
  MqttService,
  IPublishOptions
} from 'ngx-mqtt';
import StorageHelper  from '../helpers/storage.helper';
import { Validators, FormBuilder, FormArray } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  public message: string = '';
  public topic: string = '';
  public battery: string = '';
  public allSubscriptions: Subscription[] = [];
  public allTopics: any[] = [];
  public deviceTypes: any;
  public formDevice: any;

  constructor(private _mqttService: MqttService, private fb: FormBuilder, private modalCtrl: ModalController, private toastController: ToastController) {}

  async ionViewDidEnter() {

    this.formDevice = this.fb.group({
      id: ['shellydw2-73C75E', [Validators.required, Validators.minLength(10)]],
      name: ['Sensor porta principal', [Validators.required, Validators.minLength(2)]],
      type: ['door', [Validators.required]],
      topics: this.fb.array([
        this.fb.group({
          topic: ['', [Validators.required, Validators.minLength(10)]],
          subType: ['', [Validators.required]],
          state: [true],
        })
      ])
    });

    /* const topics2 = [
      {
        id: 'shellydw2-73C75E',
        name: 'Sensor porta principal',
        topics: [
          {
            topic: `shellies/shellydw2-73C75E/sensor/state`,
            subType: StorageHelper.subType.STATE,
            state: true,
          },
          {
            topic: 'shellies/shellydw2-73C75E/sensor/battery',
            subType: StorageHelper.subType.BATTERY,
            state: false,
          }
        ],
        type: StorageHelper.type.DOOR,
      },
    ]; */

    this.deviceTypes = StorageHelper.type;

    // await StorageHelper.add(StorageHelper.params.SENSOR, JSON.stringify(topics2)).then((value) => {
      // console.log(value);
    // });
    await StorageHelper.get(StorageHelper.params.SENSOR).then((value) => {
      this.allTopics = JSON.parse(value!);
    });
    /* StorageHelper.remove(StorageHelper.params.TEST2).then((value) => {
      console.log(value);
    }); */

    this.startMqtt();
  }

  ionViewWillLeave() {
    this.stopMqtt();
  }

  async submit() {
    this.presentToastDuration('bottom', 'Validando dispositivo', 'primary');
    if(this.formDevice.get(['type']).value == StorageHelper.type.DOOR) {
      const topicsArray = this.formDevice.get('topics') as FormArray;
      topicsArray.clear();

      topicsArray.push(this.fb.group({
        topic: `shellies/${this.formDevice.get(['id']).value}/sensor/state`,
        subType: StorageHelper.subType.STATE,
        state: true
      }));

      topicsArray.push(this.fb.group({
        topic: `shellies/${this.formDevice.get(['id']).value}/sensor/battery`,
        subType: StorageHelper.subType.BATTERY,
        state: true
      }));

      topicsArray.push(this.fb.group({
        topic: `shellies/${this.formDevice.get(['id']).value}/sensor/temperature`,
        subType: StorageHelper.subType.TEMPERATURE,
        state: true
      }));

      topicsArray.push(this.fb.group({
        topic: `shellies/${this.formDevice.get(['id']).value}/info`,
        subType: StorageHelper.subType.INFO,
        state: true
      }));
    }else if(this.formDevice.get(['type']).value == StorageHelper.type.PM) {
      const topicsArray = this.formDevice.get('topics') as FormArray;
      topicsArray.clear();
      topicsArray.push(this.fb.group({
        topic: `${this.formDevice.get(['id']).value}/command/switch:0 -m toggle`,
        subType: StorageHelper.subType.TOGGLE,
        state: true
      }));

      topicsArray.push(this.fb.group({
        topic: `${this.formDevice.get(['id']).value}/status/switch:0`,
        subType: StorageHelper.subType.SWITCH,
        state: true
      }));
    }

    if (this.formDevice.valid){
      /* await StorageHelper.remove(StorageHelper.params.SENSOR).then((value) => {
        console.log(value);
      }); */
      const mqttPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('No se recibió respuesta del MQTT en el tiempo especificado'));
        }, 5000);

        if(this.formDevice.get(['type']).value == StorageHelper.type.DOOR) {
          this._mqttService.observe(`shellies/${this.formDevice.get(['id']).value}/info`).subscribe(async (message: IMqttMessage) => {
            clearTimeout(timeout);
        
            const info = JSON.parse(message.payload.toString())['mqtt']['connected'];
            if (info === true) {
              // Realiza las acciones necesarias si el dispositivo está conectado al MQTT
              this.toastController.dismiss();
              resolve();
            } else {
              // this.toastController.dismiss();
              // Realiza las acciones necesarias si el dispositivo no está conectado al MQTT
              reject(new Error('El dispositivo no está conectado al MQTT'));
            }
          });
        }else {
          this.toastController.dismiss();
          resolve();
        }
      });
      
      mqttPromise.then(async () => {
        // Se recibió respuesta del MQTT correctamente dentro del tiempo especificado
        // Realiza las acciones necesarias aquí
        await StorageHelper.get(StorageHelper.params.SENSOR).then((value) => {
          this.allTopics = JSON.parse(value!) || [];
        });
        this.allTopics.push(this.formDevice.value);
        await StorageHelper.add(StorageHelper.params.SENSOR, JSON.stringify(this.allTopics)).then((value) => {
          // console.log(value);
        });
  
        this.stopMqtt();
        this.startMqtt();
        this.presentToast('bottom', 'Dispositivo añadido', 2000, 'success');
        this.modalCtrl.dismiss(this.formDevice.value);
      }).catch((error) => {
        // Ocurrió un error o no se recibió respuesta del MQTT en el tiempo especificado
        console.error(error);
        this.toastController.dismiss();
        this.presentToast('bottom', error.message, 2000, 'danger');
      });
    }
    else {
      console.log(this.formDevice);
    }
  }

  startMqtt() {
    this._mqttService.connect();
    const subscriptions: Subscription[] = [];
    if(this.allTopics != null && this.allTopics.length != 0) {
      for (let sensors of this.allTopics) {
        sensors.topics.forEach((sensor: any) => {
          const subscription = this._mqttService.observe(sensor.topic).subscribe((message: IMqttMessage) => {
            if (sensor.subType === StorageHelper.subType.STATE) {
              sensor.message = message.payload.toString();
            } else if (sensor.subType === StorageHelper.subType.BATTERY) {
              sensor.battery = message.payload.toString();
            } else if(sensor.subType === StorageHelper.subType.TEMPERATURE) {
              sensor.temperature = message.payload.toString();
            }else if(sensor.subType === StorageHelper.subType.INFO) {
              sensor.info = message.payload.toString();
              // console.log(JSON.parse(sensor.info)['mqtt']['connected']);
            }else if(sensor.subType === StorageHelper.subType.SWITCH) { 
              sensor.switch = JSON.parse(message.payload.toString()).output;
            }
          });
          subscriptions.push(subscription);
        });
      }
    }
    this.allSubscriptions = subscriptions;
  }

  stopMqtt() {
    for (let subscription of this.allSubscriptions) {
      subscription.unsubscribe();
    }
    this._mqttService.disconnect();
  }

  async presentToast(position: 'top' | 'middle' | 'bottom', message: string, duration: number, color: string,) {
    const toast = await this.toastController.create({
      message,
      duration,
      position,
      color
    });

    await toast.present();
  }

  async presentToastDuration(position: 'top' | 'middle' | 'bottom', message: string, color: string, duration?: number) {
    const toast = await this.toastController.create({
      message,
      position,
      color,
      duration: duration || 0
    });

    await toast.present();
  }

  async callSwitch(id: string) {
    this._mqttService.publish(`${id}/command/switch:0`, 'toggle', { qos: 2, retain: true } as IPublishOptions).subscribe({
      next: () => {
        // this.presentToastDuration('bottom', 'Comando enviado', 'success', 1500);
      },
      error: (error: Error) => {
        this.presentToastDuration('bottom', error.message, 'danger', 1500);
      }
    });
  }

}