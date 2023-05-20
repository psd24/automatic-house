import { Preferences } from '@capacitor/preferences';

export default class StorageHelper {

    static params = {
        SENSOR: 'sensor',
        TEST2: 'test2'
    }

    static type = {
        DOOR: 'door',
        PM: '1pm'
    }

    static subType = {
        STATE: 'state',
        BATTERY: 'battery',
        TEMPERATURE: 'temperature',
        INFO: 'info',
        TOGGLE: 'toggle',
        SWITCH: 'switch'
    }

    static async get(key: string) {
        const { value } = await Preferences.get({ key });
        return value; 
    }
    static async add(key: string, value: string,) { 
        await Preferences.set({
            key,
            value
        });
        return true; 
    }
    static async remove(key: string) {
        await Preferences.remove({ key });
        return true;
    }
}