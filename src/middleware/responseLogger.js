import { EOL } from 'os';

const responseLogger = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (error) {
      parsedBody = body;
    }
    const log = {
      response: {
        statusCode: res.statusCode,
        body: parsedBody,
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
