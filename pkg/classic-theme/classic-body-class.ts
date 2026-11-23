import { Store } from 'vuex';

export const CLASSIC = 'classic';

/**
 * Keeps the `classic` class on the body while the `ui-brand` setting is `classic`, which is what
 * scopes the Classic stylesheet. The dashboard replaces the body's classes whenever the theme or
 * brand changes, so the class is put back after each replacement.
 *
 * @returns a function that stops keeping the class and removes it
 */
export function keepClassicBodyClass(store: Store<unknown>, body: HTMLElement = document.body): () => void {
  const isClassic = () => store.getters['management/brand'] === CLASSIC;

  const sync = () => {
    if (isClassic() && !body.classList.contains(CLASSIC)) {
      body.classList.add(CLASSIC);
    }
  };

  const observer = new MutationObserver(sync);

  observer.observe(body, { attributes: true, attributeFilter: ['class'] });

  const unwatch = store.watch(isClassic, (classic: boolean) => {
    if (classic) {
      sync();
    } else {
      body.classList.remove(CLASSIC);
    }
  });

  sync();

  return () => {
    observer.disconnect();
    unwatch();
    body.classList.remove(CLASSIC);
  };
}
