const {DialogflowConversation} = require('actions-on-google');

// Set library name for debug statements
const name = 'dialogflow-fulfillment';
// Setup debug library for error and debug statements
const debug = require('debug')(`${name}:debug`);
const error = require('debug')(`${name}:error`);
// bind error and debug to error and log consoles
error.log = console.error.bind(console);
debug.log = console.log.bind(console);

module.exports = {debug, error, DialogflowConversation};
