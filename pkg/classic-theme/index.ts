import { Store } from 'vuex';
import { IPlugin } from '@shell/core/types';
import { keepClassicBodyClass } from './classic-body-class';
import './styles/classic.scss';

export default function(plugin: IPlugin, context?: { store?: Store<unknown> }): void {
  plugin.metadata = require('./package.json');

  if (context?.store) {
    plugin.addUninstallHook(keepClassicBodyClass(context.store));
  }
}
