import VueFetch, { VueFetchResponse } from '@andrewcaires/vue-fetch';
import { VueMiddlewareNavigation } from '@andrewcaires/vue-middleware';
import Vue from 'vue';
import VueRouter, { RawLocation } from 'vue-router';

import '@andrewcaires/vue-cookie';

export interface VueAuthOptions {
  cookie?: VueAuthCookie;
  login?: VueAuthLogin;
  logout?: VueAuthFetch;
  redirect?: VueAuthRedirect;
  router?: VueRouter;
  token?: VueAuthToken;
  user?: VueAuthUser;
}

export type VueAuthBody = { [key: string]: string }

export interface VueAuthCookie {
  prefix?: string;
}

export type VueAuthCookies = { [key: string]: string }

export interface VueAuthFetch {
  url?: string;
  method?: string;
}

export type VueAuthMiddleware = (guard: VueMiddlewareNavigation) => void

export interface VueAuthLogin extends VueAuthFetch {
  token?: (response: VueFetchResponse) => string;
}

export interface VueAuthUser extends VueAuthFetch {
  data?: (response: VueFetchResponse) => VueAuthCookies;
}

export interface VueAuthRedirect {
  home?: RawLocation;
  login?: RawLocation;
}

export interface VueAuthToken {
  header?: string;
}

const DefaultOptions: VueAuthOptions = {

  cookie: {
    prefix: 'auth',
  },

  login: {
    url: '/auth/login',
    method: 'POST',
    token: (response) => response.data.token || '',
  },

  logout: {
    url: '/auth/logout',
    method: 'GET',
  },

  redirect: {
    home: '/',
    login: '/login',
  },

  token: {
    header: 'Authorization',
  },

  user: {
    url: '/auth/user',
    method: 'GET',
    data: (response) => response.data.user || {},
  },

};

let installed = false;

export class VueAuth {

  private fetch: VueFetch;

  private options: VueAuthOptions;

  constructor(options: VueAuthOptions) {

    this.fetch = new VueFetch();

    this.options = { ...DefaultOptions, ...options };

    this.fetch.on('before', (request) => {

      const prefix = this.options.cookie?.prefix || 'auth';
      const token = Vue.$cookie.get(prefix + '.authorization');
      const header = this.options.token?.header || 'Authorization';

      if (token) {

        request.headers[header] = token;
      }
    });
  }

  data(): VueAuthCookies {

    const data: VueAuthCookies = {};
    const cookies = Vue.$cookie.all();
    const prefix = this.options.cookie?.prefix || 'auth';

    Object.entries(cookies).forEach(([key, value]) => {

      if (key.indexOf(prefix + '.user.') == 0) {

        data[key.substring(prefix.length + 6)] = value;
      }
    });

    return data;
  }

  async login(body: VueAuthBody): Promise<VueFetchResponse | void> {

    const path = this.options.login?.url || '/login';
    const method = this.options.login?.method || 'POST';

    const response = await this.fetch.fetch({ path, method, body });

    if (!response.error) {

      const token = this.options.login?.token;
      const prefix = this.options.cookie?.prefix || 'auth';

      if (token) {

        const authorization = token(response);

        if (authorization) {

          Vue.$cookie.set(prefix + '.authorization', authorization);
        }
      }

      return this.redirect(this.options.redirect?.home);
    }

    return response;
  }

  async logout(): Promise<VueFetchResponse | void> {

    const path = this.options.logout?.url || '/logout';
    const method = this.options.logout?.method || 'GET';

    const response = await this.fetch.fetch({ path, method });

    if (!response.error) {

      this.clear();

      return this.redirect(this.options.redirect?.login);
    }

    return response;
  }

  middleware(): VueAuthMiddleware {

    return (({ to, next, redirect }: VueMiddlewareNavigation): void => {

      if (to.matched.some(route => route.meta.auth === true)) {

        this.user().then((auth) => {

          return auth ? next() : this.options.redirect?.login && redirect(this.options.redirect?.login);
        });

      } else if (to.matched.some(route => route.meta.auth === 'guest')) {

        this.user().then((auth) => {

          return auth ? this.options.redirect?.home && redirect(this.options.redirect?.home) : next();
        });

      } else {

        return next();
      }

    }).bind(this);
  }

  private clear(): void {

    const prefix = this.options.cookie?.prefix || 'auth';

    if (this.options.user?.data) {

      const cookies = Vue.$cookie.all();

      Object.keys(cookies).forEach((key) => {

        if (key.indexOf(prefix + '.user.') == 0) {

          Vue.$cookie.remove(key);
        }
      });
    }

    Vue.$cookie.remove(prefix + '.authorization');
  }

  private redirect(location?: RawLocation): void {

    location && this.options.router?.push(location).catch((error) => { });
  }

  private async user(): Promise<boolean> {

    const prefix = this.options.cookie?.prefix || 'auth';
    const token = Vue.$cookie.get(prefix + '.authorization');

    if (token) {

      const path = this.options.user?.url || '/auth';
      const method = this.options.user?.method || 'POST';
      const response = await this.fetch.fetch({ path, method });

      if (!response.error) {

        if (this.options.user?.data) {

          const data = this.options.user.data(response);

          Object.entries(data).forEach(([key, value]) => {

            Vue.$cookie.set(prefix + '.user.' + key, value);
          });
        }

        return true;
      }
    }

    this.clear();

    return false;
  }

  static install(vue: any, options: VueAuthOptions = {}): void {

    if (installed) { return; } else { installed = true; }

    if (!Vue.$cookie) {

      throw new Error('[vue-auth] @andrewcaires/vue-cookie not installed');
    }

    Vue.$auth = new VueAuth(options);
    Vue.prototype.$auth = Vue.$auth;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $auth: VueAuth;
  }
  interface VueConstructor {
    $auth: VueAuth;
  }
}

export default VueAuth;
