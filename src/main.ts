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
import { AppProps } from './types';

let app: IApp<Element> | null = null
export function init(initData: { container?: any, props: AppProps }) {
  app = createApp(App, initData.props);
  registerPlugins(app)
  app.mount(initData.container)
}

export function clean() {
  app?.unmount();
}

init({ container: '#app', props: {
  mode: 'quicklookup',
  inEditor: false,
  techOpts: [
    {
      tech: 'FixedLine',
      name: 'Home Plans',
      action: 'button',
      link: {
        href: '/home-plans',
        label: 'Home Plans',
        raw_url: '/home-plans?test=1',
        type: 'url',
        value: 'home-plans',
      }
    },
    {
      tech: 'FixedLine',
      name: 'Business Plans',
      action: 'button',
      link: {
        href: '/home-plans',
        label: 'Home Plans',
        raw_url: '/home-plans?test=1',
        type: 'url',
        value: 'home-plans',
      }
    },
    {
      tech: 'Wireless',
      name: 'Fixed Wireless',
      action: 'button',
      link: {
        href: '/home-plans',
        label: 'Home Plans',
        raw_url: '/home-plans?test=1',
        type: 'url',
        value: 'home-plans',
      }
    },
    {
      tech: 'FibreUpgrade',
      name: 'Fibre Upgrade',
      action: 'button',
      link: {
        href: '/home-plans',
        label: 'Home Plans',
        raw_url: '/home-plans?test=1',
        type: 'url',
        value: 'home-plans',
      }
    },
    {
      tech: 'HighSpeedFW',
      name: 'Wireless Upgrades',
      action: 'button',
      link: {
        href: '/home-plans',
        label: 'Home Plans',
        raw_url: '/home-plans?test=1',
        type: 'url',
        value: 'home-plans',
      }
    }
  ],
} });
