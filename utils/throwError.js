export default (res, error, code = 400) => res.status(code).send({ error });
