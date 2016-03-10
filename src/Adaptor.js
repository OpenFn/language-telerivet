import { execute as commonExecute, expandReferences } from 'language-common';
import { post } from './Client';
import { resolve as resolveUrl } from 'url';

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for telerivet.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @constructor
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null
  }

  return state => {
    return commonExecute(...operations)({ ...initialState, ...state })
  };

}

/**
 * Send a message
 * @example
 * execute(
 *   send(data)
 * )(state)
 * @constructor
 * @param {object} sendData - Payload data for the message
 * @returns {Operation}
 */
export function send(sendData) {

  return state => {
    const body = expandReferences(sendData)(state);

    const { projectId, apiKey } = state.configuration;

    const url = resolveUrl('https://api.telerivet.com/v1/projects/' + projectId, 'messages/send')

    console.log("Posting message to send:");
    console.log(body)

    return post({ apiKey, body, url })
    .then((result) => {
      console.log("Success:", result);
      return { ...state, references: [ result, ...state.references ] }
    })

  }
}

// Send data values using the dataValueSets resource
export function dataValueSet(dataValueSetData) {

  return state => {
    const body = expandReferences(dataValueSetData)(state);

    const { username, password, apiUrl } = state.configuration;

    const url = resolveUrl(apiUrl + '/', 'api/dataValueSets')

    console.log("Posting data value set:");
    console.log(body)

    return post({ username, password, body, url })
    .then((result) => {
      console.log("Success:", result);
      return { ...state, references: [ result, ...state.references ] }
    })

  }
}

export {
  field, fields, sourceValue,
  merge, dataPath, dataValue, lastReferenceValue
} from 'language-common';
