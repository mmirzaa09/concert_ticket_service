import morgan from 'morgan';
import { EOL } from 'os';

const jsonFormat = (tokens, req, res) => {
  return JSON.stringify({
    'remote-address': tokens['remote-addr'](req, res),
    'remote-user': tokens['remote-user'](req, res),
    date: tokens.date(req, res, 'iso'),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    'http-version': tokens['http-version'](req, res),
    'status-code': tokens.status(req, res),
    'content-length': tokens.res(req, res, 'content-length'),
    referrer: tokens.referrer(req, res),
    'user-agent': tokens['user-agent'](req, res),
    'response-time': tokens['response-time'](req, res),
    body: JSON.stringify(req.body),
  });
};

const logger = morgan(jsonFormat, {
  stream: {
    write: (message) => {
      const separator = `${EOL}--------------------------------------------------------------------------------${EOL}`;
      console.log(message.replace(EOL, '') + separator);
    },
  },
});

export default logger;
