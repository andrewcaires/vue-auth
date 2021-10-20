[![npm](https://img.shields.io/npm/v/@andrewcaires/vue-auth?color=blue&logo=npm)](https://www.npmjs.com/package/@andrewcaires/vue-auth)
[![downloads](https://img.shields.io/npm/dt/@andrewcaires/vue-auth?color=blue)](https://www.npmjs.com/package/@andrewcaires/vue-auth)
[![size](https://img.shields.io/github/repo-size/andrewcaires/vue-auth?color=blue)](https://github.com/andrewcaires/vue-auth)
[![language](https://img.shields.io/github/languages/top/andrewcaires/vue-auth?color=blue)](https://github.com/andrewcaires/vue-auth)
[![commit](https://img.shields.io/github/last-commit/andrewcaires/vue-auth?color=blue&logo=github)](https://github.com/andrewcaires/vue-auth)
[![license](https://img.shields.io/github/license/andrewcaires/vue-auth?color=blue)](https://github.com/andrewcaires/vue-auth/blob/main/LICENSE)

# vue-auth

VueJS plugin for authentication

## Installation

`npm i @andrewcaires/vue-auth`

## Usage

```js
import VueAuth, { VueAuthOptions } from '@andrewcaires/vue-auth';
import Vue from 'vue';

import router from './router';

Vue.use<VueAuthOptions>(VueAuth, {
  router,
  login: {
    url: 'http://localhost:3000/api/v1/auth/login',
    method: 'post',
    token: (response) => response.data.data,
  },
  redirect: {
    home: '/Home',
    login: '/Login',
  },
  user: {
    url: 'http://localhost:3000/api/v1/auth',
    method: 'get',
    data: (response) => response.data.data,
  },
});

// use Vue.$auth.middleware() in @andrewcaires/vue-middleware

import VueMiddleware, { VueMiddlewareOptions } from '@andrewcaires/vue-middleware';
import Vue from 'vue';

import router from './router';

Vue.use<VueMiddlewareOptions>(VueMiddleware, {
  router,
  middleware: ['auth'],
  middlewares: {
    auth: Vue.$auth.middleware(),
  },
});
```

### Links

*  [Docs](https://github.com/andrewcaires/vue-auth#readme)
*  [GitHub](https://github.com/andrewcaires/vue-auth)
*  [npm](https://www.npmjs.com/package/@andrewcaires/vue-auth)

## License

*  [MIT](https://github.com/andrewcaires/vue-auth/blob/main/LICENSE)
