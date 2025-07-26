const Status = {
  200: "OK",
  304: "Not Modified",
  400: "Bad Request",
  401: "Unauthorized",
  404: "Data Not Found",
  409: "Conflict",
  410: "Gone",
  422: "Unprocessable Entity",
  429: "Too Many Requests",
  500: "Internal Server Error",
  501: "Bad Gateway",
};

const sendResponse = (res, code, message = "", data = null) => {
  const status = Status[code] || "";
  res.status(code).json({
    status,
    status_code: code,
    message,
    data,
  });
};

const success = (res, message = 'Success', data = null) => {
  return sendResponse(res, 200, message, data);
};

const created = (res, message = 'Created', data = null) => {
  return sendResponse(res, 201, message, data);
};

const badRequest = (res, message = 'Bad Request', data = null) => {
  return sendResponse(res, 400, message, data);
};

const unauthorized = (res, message = 'Unauthorized') => {
  return sendResponse(res, 401, message);
};

const forbidden = (res, message = 'Forbidden') => {
  return sendResponse(res, 403, message);
};

const notFound = (res, message = 'Not Found') => {
  return sendResponse(res, 404, message);
};

const conflict = (res, message = 'Conflict') => {
  return sendResponse(res, 409, message);
};

const unprocessable = (res, message = 'Unprocessable Entity') => {
  return sendResponse(res, 422, message);
};

const serverError = (res, message = 'Internal Server Error') => {
  return sendResponse(res, 500, message);
};

export {
  success,
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  unprocessable,
  serverError
};
