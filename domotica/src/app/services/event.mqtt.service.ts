import { Injectable } from '@angular/core';
import { IMqttMessage, IMqttServiceOptions, MqttService } from "ngx-mqtt";
import { Observable } from "rxjs";
import { environment } from 'src/environments/environment';

@Injectable()
export class EventMqttService {

  constructor(
    private _mqttService: MqttService,
  ) {
  }

  connect() {
    const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
        hostname: environment.mqtt.server,
        port: 9001,
        protocol: (environment.mqtt.protocol === "wss") ? "wss" : "wss",
        path: ''
      };
    this._mqttService.connect(MQTT_SERVICE_OPTIONS);
    }
}