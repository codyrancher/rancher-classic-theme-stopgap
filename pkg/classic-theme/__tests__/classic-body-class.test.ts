import { nextTick } from 'vue';
import { createStore, Store } from 'vuex';
import { keepClassicBodyClass } from '../classic-body-class';

interface BrandState {
  brand?: string;
}

const createBrandStore = (brand?: string): Store<{ management: BrandState }> => createStore({
  modules: {
    management: {
      namespaced: true,
      state:      (): BrandState => ({ brand }),
      getters:    { brand: (state: BrandState) => state.brand },
      mutations:  { setBrand: (state: BrandState, value?: string) => (state.brand = value) },
    },
  },
});

// What the dashboard's brand mixin does whenever the theme or brand changes
const replaceBodyClasses = (body: HTMLElement) => {
  body.className = 'theme-dark overflow-hidden dashboard-body';
};

// MutationObserver callbacks run as microtasks
const flushObserver = () => new Promise((resolve) => setTimeout(resolve));

describe('keepClassicBodyClass', () => {
  let body: HTMLElement;
  let stop: () => void;

  beforeEach(() => {
    body = document.createElement('div');
    body.className = 'theme-light overflow-hidden dashboard-body';
  });

  afterEach(() => {
    stop?.();
  });

  it('should add the classic class when ui-brand is classic', () => {
    stop = keepClassicBodyClass(createBrandStore('classic'), body);

    expect(body.classList.contains('classic')).toStrictEqual(true);
  });

  it.each([
    ['unset', undefined],
    ['empty', ''],
    ['suse', 'suse'],
  ])('should not add the classic class when ui-brand is %s', (_, brand) => {
    stop = keepClassicBodyClass(createBrandStore(brand), body);

    expect(body.classList.contains('classic')).toStrictEqual(false);
  });

  it('should put the classic class back after the dashboard replaces the body classes', async() => {
    stop = keepClassicBodyClass(createBrandStore('classic'), body);

    replaceBodyClasses(body);
    await flushObserver();

    expect(body.className).toStrictEqual('theme-dark overflow-hidden dashboard-body classic');
  });

  it('should not add the classic class when the body classes are replaced and ui-brand is not classic', async() => {
    stop = keepClassicBodyClass(createBrandStore('suse'), body);

    replaceBodyClasses(body);
    await flushObserver();

    expect(body.classList.contains('classic')).toStrictEqual(false);
  });

  it('should add the classic class when ui-brand changes to classic', async() => {
    const store = createBrandStore();

    stop = keepClassicBodyClass(store, body);

    store.commit('management/setBrand', 'classic');
    await nextTick();

    expect(body.classList.contains('classic')).toStrictEqual(true);
  });

  it('should remove the classic class when ui-brand changes from classic', async() => {
    const store = createBrandStore('classic');

    stop = keepClassicBodyClass(store, body);

    store.commit('management/setBrand', 'suse');
    await nextTick();

    expect(body.classList.contains('classic')).toStrictEqual(false);
  });

  it('should remove the classic class and stop putting it back once stopped', async() => {
    const store = createBrandStore('classic');

    keepClassicBodyClass(store, body)();

    expect(body.classList.contains('classic')).toStrictEqual(false);

    replaceBodyClasses(body);
    await flushObserver();
    store.commit('management/setBrand', 'classic');
    await nextTick();

    expect(body.classList.contains('classic')).toStrictEqual(false);
  });
});
