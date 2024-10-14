/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

console.log('SCRIPT LOADED');

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { App as IApp, createApp } from 'vue'

let app: IApp<Element> | null = null
export function init({ container, props = {} }: { container?: any, props?: {} } = {}) {
  console.log('LIP NBN ADDRESS INIT');
  app = createApp(App);
  registerPlugins(app)
  app.mount(container)
}

export function clean() {
  console.log('LIP NBN ADDRESS INIT');
  app?.unmount();
}


(function(global){

  console.log('GLOBAL REGISTER');

  var handler: any = {
    init: init,
    clean: clean,
  };

  (global as any).dmAPI.registerExternalWidget('nbn-address', handler)

}(window));
