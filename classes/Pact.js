const { Kubik } = require('rubik-main');
const FormData = require('form-data');
const fetch = require('node-fetch');
const set = require('lodash/set');
const isObject = require('lodash/isObject');
const get = require('lodash/get');
const querystring = require('querystring');

const methods = require('./Pact/methods');

const PactError = require('../errors/PactError');

const DEFAULT_HOST = 'https://api.pact.im';
const DEFAULT_VERSION = 'api/p2';
const SUCCESS_STATUS_REG = /2\d\d/;

/**
 * Кубик для запросов к API Pact
 * @class
 * @prop {String} [token] токен для доступа к API
 * @prop {String} [host=DEFAULT_HOST] адрес API Pact
 */
class Pact extends Kubik {
  constructor(token, host, version) {
    super(...arguments);
    this.token = token || null;
    this.host = host || null;
    this.version = version || null;

    this.methods.forEach(this.generateMethod, this);
  }

  /**
   * Поднять кубик
   * @param  {Object} dependencies зависимости
   */
  up({ config }) {
    this.config = config;

    const options = this.config.get(this.name);

    this.token = this.token || options.token || null;
    this.host = this.host || options.host || DEFAULT_HOST;
    this.version = this.version || options.version || DEFAULT_VERSION;
  }

  getUrl({ path, queryParams, params, host }) {
    if (!host) host = this.host;
    if (!host) throw new TypeError('host is not defined');

    if (!params) params = {};
    if (params.companyId) path = path.replace('{{companyId}}', params.companyId);
    if (params.conversationId) path = path.replace('{{conversationId}}', params.conversationId);
    if (params.channelId) path = path.replace('{{channelId}}', params.channelId);

    if (!queryParams) queryParams = {};

    const query = querystring.stringify(queryParams);
    const base = `${host.replace(/\/$/, '')}/${this.version.replace(/^\//, '')}/`;
    return query ? `${base}${path}?${query}` : `${base}${path}`;
  }

  /**
   * Сделать запрос к API Viber
   * @param  {String} name  имя метода
   * @param  {Object|String} body тело запроса
   * @param  {Object} params Параметры для url
   * @param  {String} [token=this.token] токен для запроса
   * @param  {String} [host=this.host] хост API Viber
   * @return {Promise<Object>} ответ от Pact API
   */
  async request({ path, body, params, token, host, method, queryParams }) {
    const url = this.getUrl({ path, params, host, queryParams});

    if (!token) token = this.token;
    const headers = { 'X-Private-Api-Token': token };

    if (!method) {
      if (body) method = 'POST';
      else method = 'GET';
    }

    if (body instanceof FormData) {
      Object.assign(headers, body.getHeaders());
    } else if (isObject(body)) {
      body = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, { method, body, headers });

    if (!SUCCESS_STATUS_REG.test(`${res.status}`)) {
      throw new Error(`Invalid status ${res.status}`);
    }

    const resBody = await res.json();

    if (resBody.status === 'errored') {
      throw new PactError(`${get(resBody, 'errors.0.code')} ${get(resBody, 'errors.0.description')}`);
    }

    return resBody;
  }

  /**
   * Привязка вебхука компании через старую версию API (p1)
   * @param  {Object} options
   * @param  {Number|String} options.companyId ID компании
   * @param  {String} options.webhookUrl URL вебхука
   * @param  {String} [options.token=this.token] токен для запроса
   * @param  {String} [options.host=this.host] хост API Pact
   * @return {Promise<Object>} ответ от Pact API
   */
  async setCompanyWebhook({ companyId, webhookUrl, token, host }) {
    if (!companyId) throw new TypeError('companyId is required');
    if (!webhookUrl) throw new TypeError('webhookUrl is required');
    const resolvedHost = host || this.host || DEFAULT_HOST;
    const resolvedToken = token || this.token;

    const base = `${resolvedHost.replace(/\/$/, '')}/p1/`;
    const path = `companies/${companyId}`;
    const query = querystring.stringify({ webhook_url: webhookUrl });
    const url = `${base}${path}?${query}`;

    const headers = { 'X-Private-Api-Token': resolvedToken };
    const method = 'PUT';

    const res = await fetch(url, { method, headers });

    if (!SUCCESS_STATUS_REG.test(`${res.status}`)) {
      throw new Error(`Invalid status ${res.status}`);
    }

    const resBody = await res.json();

    if (resBody.status === 'errored') {
      throw new PactError(`${get(resBody, 'errors.0.code')} ${get(resBody, 'errors.0.description')}`);
    }

    return resBody;
  }

  /**
   * Сгенерировать метод API
   *
   * Создает функцию для запроса к API, привязывает ее к текущему контексту
   * и кладет в семантичное имя внутри this.
   * В итоге он разбирет путь на части, и раскладывает его по семантичным объектам:
   * one/two/three -> this.one.two.three(currency, body, id);
   * @param  {String}  path путь запроса, без ведущего /: one/two/three
   */
  generateMethod({ kubikName, apiName }) {
    const method = (options) => {
      if (!options) options = {};
      const { params, body, token, host, queryParams, method } = options;
      return this.request({ path: apiName, body, params, token, host, queryParams, method });
    };
    set(this, kubikName, method);
  }
}

// Чтобы не создавать при каждой инициализации класса,
// пишем значения имени и зависимостей в протип
Pact.prototype.dependencies = Object.freeze(['config']);
Pact.prototype.methods = Object.freeze(methods);
Pact.prototype.name = 'pact';

module.exports = Pact;
