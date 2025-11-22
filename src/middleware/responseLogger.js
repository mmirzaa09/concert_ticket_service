import { EOL } from 'os';

const responseLogger = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    const log = {
      response: {
        statusCode: res.statusCode,
        body: JSON.parse(body),
      },
    };
    console.log(JSON.stringify(log));
    const separator = `${EOL}--------------------------------------------------------------------------------${EOL}`;
    console.log(separator);
    originalSend.call(this, body);
  };

  next();
};

export default responseLogger;
