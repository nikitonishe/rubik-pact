/* global describe test expect */
const path = require('path');
const { Kubiks: { Config } } = require('rubik-main');

const { createApp, createKubik } = require('rubik-main/tests/helpers/creators');

const Pact = require('../classes/Pact.js');

const CONFIG_VOLUMES = [
  path.join(__dirname, '../default/'),
  path.join(__dirname, '../config/')
];

const get = () => {
  const app = createApp();
  app.add(new Config(CONFIG_VOLUMES));

  const kubik = createKubik(Pact, app);

  return { app, kubik };
}

describe('Кубик для работы с Pact', () => {
  test('Создается без проблем и добавляется в App', () => {
    const { app, kubik } = get();
    expect(app.pact).toBe(kubik);
    expect(app.get('pact')).toBe(kubik);
  });

  test('Пробует отправить сообщение (не забудьте добавить токен в настройки)', async () => {
    const { app, kubik } = get();
    await app.up();
    const dataForTests = app.config.get('dataForTests');

    const response = await kubik.companies.conversations.messages({
      params: dataForTests,
      body: { message: 'Тест' }
    });

    expect(response.status).toBe('ok')

    await app.down();
  });

});
