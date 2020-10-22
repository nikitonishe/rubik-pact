# rubik-pact
Pact's Bot API kubik for the Rubik

## Install

### npm
```bash
npm i rubik-pact
```

### yarn
```bash
yarn add rubik-pact
```

## Use
```js
const { App, Kubiks } = require('rubik-main');
const Pact = require('rubik-pact');
const path = require('path');

// create rubik app
const app = new App();
// config need for most modules
const config = new Kubiks.Config(path.join(__dirname, './config/'));

const pact = new Pact();

app.add([ config, pact ]);

app.up().
then(() => console.info('App started')).
catch(err => console.error(err));
```

## Config
`pact.js` config in configs volume may contain the host and token.

If you do not specify a host, then `https://api.pact.im/` will be used by default.

If you don't specify a token, you will need to pass it.
```js
...
const response = await app.get('pact').companies.conversations.messages({
  params: { companyId: '123',  },
  body: { message: 'Test', conversationId: '1234' }
});;
...
```

You may need the host option if for some reason Pact host is not available from your server
and you want to configure a proxy server.


For example:
`config/pact.js`
```js
module.exports = {
  host: 'https://my.pact.proxy.example.com/'
};
```

## Extensions
Pact kubik doesn't has any extension.
