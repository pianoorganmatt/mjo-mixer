import axios from 'axios';
const HOST = 'https://flowers.cherkasov.dev/wp-json';
const VERSION = '/audiomixer';
const URL = `${HOST}${VERSION}`;
const Api = axios.create({
  baseURL: URL,
});

export default Api;