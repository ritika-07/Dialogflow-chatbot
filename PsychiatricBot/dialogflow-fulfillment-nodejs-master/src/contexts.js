const _ = require('lodash');
const DELETED_LIFESPAN_COUNT = 0; // Lifespan of a deleted context

/**
 * This is the class that handles Dialogflow's contexts for the WebhookClient class
 */
class Context {
 
  constructor(inputContexts, session) {
 
    this.contexts = {};
    this.session = session;
    if (inputContexts && session) {
      this.inputContexts = this._processV2InputContexts(inputContexts);
      this.contexts = this._processV2InputContexts(inputContexts);
    } else if (inputContexts) {
      this.contexts = this._processV1InputContexts(inputContexts);
      this.inputContexts = this._processV1InputContexts(inputContexts);
    }
  }
  
  set(name, lifespan, params) {
    if (!name || (typeof name !== 'string' && typeof name['name'] !== 'string')) {
      throw new Error('Required "name" argument must be a string or an object with a string attribute "name"');
    }
    if (typeof name !== 'string') {
      params = name['parameters'];
      lifespan = name['lifespan'];
      name = name['name'];
    }
    if (!this.contexts[name]) {
      this.contexts[name] = {name: name};
    }
    if (lifespan !== undefined && lifespan !== null) {
      this.contexts[name].lifespan = lifespan;
    }
    if (params !== undefined) {
      this.contexts[name].parameters = params;
    }
  }


  get(name) {
    return this.contexts[name];

  delete(name) {
    this.set(name, DELETED_LIFESPAN_COUNT);
  }

  [Symbol.iterator]() {
    let contextArray = [];
    for (const contextName of Object.keys(this.contexts)) {
      contextArray.push(this.contexts[contextName]);
    }
    return contextArray[Symbol.iterator]();
    // suppose to be Array.prototype.values(), but can't use because of bug:
    // https://bugs.chromium.org/p/chromium/issues/detail?id=615873
  }
 
  _removeOutgoingContext(name) {
    delete this.contexts[name];
  }
 
  _processV1InputContexts(v1InputContexts) {
    let contexts = {};
    for (let index = 0; index<v1InputContexts.length; index++) {
      const context = v1InputContexts[index];
      contexts[context['name']] = {
        name: context['name'],
        parameters: context['parameters'],
        lifespan: context['lifespan'],
      };
    }
    return contexts;
  }
  /**
   * Translate context object from v2 webhook request format to class format
   *
   * @param {Array} v2InputContexts to be used by the Contexts class
   *
   * @return {Object} internal representation of contexts
   * @private
   */
  _processV2InputContexts(v2InputContexts) {
    let contexts = {};
    for (let index = 0; index<v2InputContexts.length; index++) {
      let context = v2InputContexts[index];
      const name = context['name'].split('/')[6];
      contexts[name] = {
        name: name,
        lifespan: context['lifespanCount'],
        parameters: context['parameters']};
    }
    return contexts;
  }
  /**
   * Get array of context objects formatted for v1 webhook response
   *
   * @return {Object[]} array of v1 context objects for webhook response
   */
  getV1OutputContextsArray() {
    let v1OutputContexts = [];
    for (const ctx of this) {
      // Skip context if it is the same as the input context
      if (this.inputContexts &&
        this.inputContexts[ctx.name] &&
        _.isEqual(ctx, this.inputContexts[ctx.name])) {
        continue;
      }
      let v1Context = {name: ctx.name};
      if (ctx.lifespan !== undefined) {
        v1Context['lifespan'] = ctx.lifespan;
      }
      if (ctx.parameters) {
        v1Context['parameters'] = ctx.parameters;
      }
      v1OutputContexts.push(v1Context);
    }
    return v1OutputContexts;
  }
 
  getV2OutputContextsArray() {
    let v2OutputContexts = [];
    for (const ctx of this) {
      // Skip context if it is the same as the input context
      if (this.inputContexts &&
        this.inputContexts[ctx.name] &&
        _.isEqual(ctx, this.inputContexts[ctx.name])) {
        continue;
      }
      let v2Context = {name: `${this.session}/contexts/${ctx.name}`};
      if (ctx.lifespan !== undefined) {
        v2Context['lifespanCount'] = ctx.lifespan;
      }
      if (ctx.parameters) {
        v2Context['parameters'] = ctx.parameters;
      }
      v2OutputContexts.push(v2Context);
    }
    return v2OutputContexts;
  }
}

module.exports = Context;
