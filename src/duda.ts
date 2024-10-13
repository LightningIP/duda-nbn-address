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
function init({ container, props = {} }: { container?: any, props?: {} } = {}) {
  app = createApp(App);
  registerPlugins(app)
  app.mount(container)
}

function clean() {
  app?.unmount();
}

(window as any).init = init;
(window as any).clean = clean;
