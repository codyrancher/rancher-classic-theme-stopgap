import { createStore } from 'vuex';
import { IPlugin } from '@shell/core/types';
import extension from '../index';
import packageJson from '../package.json';

/**
 * Stands in for the dashboard's extension manager.
 *
 * Any method your index.ts calls - addProduct, addRoutes, addPanel, addTableColumn, ... - is
 * answered with a jest mock the first time it is read, so this keeps working as you register
 * more things. Assert against them with `expect(plugin.addProduct).toHaveBeenCalledWith(...)`.
 */
const mockPlugin = (): IPlugin => {
  const mocks: Record<string | symbol, unknown> = {};

  return new Proxy({} as Record<string | symbol, unknown>, {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }

      mocks[prop] = mocks[prop] || jest.fn();

      return mocks[prop];
    }
  }) as unknown as IPlugin;
};

const classicStore = () => createStore({
  modules: {
    management: {
      namespaced: true,
      getters:    { brand: () => 'classic' },
    },
  },
});

describe('extension entry point', () => {
  afterEach(() => {
    document.body.className = '';
  });

  it('should expose the package.json metadata to the dashboard', () => {
    const plugin = mockPlugin();

    extension(plugin);

    expect(plugin.metadata).toStrictEqual(packageJson);
  });

  it('should apply the classic class to the page body', () => {
    extension(mockPlugin(), { store: classicStore() });

    expect(document.body.classList.contains('classic')).toStrictEqual(true);
  });

  it('should remove the classic class when the extension is uninstalled', () => {
    const plugin = mockPlugin();

    extension(plugin, { store: classicStore() });

    const [uninstall] = (plugin.addUninstallHook as jest.Mock).mock.calls[0];

    uninstall();

    expect(document.body.classList.contains('classic')).toStrictEqual(false);
  });

  it('should not register an uninstall hook without a store', () => {
    const plugin = mockPlugin();

    extension(plugin);

    expect(plugin.addUninstallHook).toHaveBeenCalledTimes(0);
  });
});
