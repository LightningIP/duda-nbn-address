/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { App as IApp, createApp } from 'vue'

let app: IApp<Element> | null = null
export function init({ container, props = {} }: { container?: any, props?: {} } = {}) {
  app = createApp(App, props);
  registerPlugins(app)
  app.mount(container)
}

export function clean() {
  app?.unmount();
}

init({ container: '#app', props: {
  redirect: {
    fixedline: 'https://www.lightningip.com.au/services/nbn-plans',
    wireless: 'https://www.lightningip.com.au/services/nbn-wireless-plans',
    satellite: 'https://www.lightningip.com.au/services/nbn-satellite-plans',
  }
} });
