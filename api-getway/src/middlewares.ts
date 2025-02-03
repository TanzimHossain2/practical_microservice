import axios from 'axios';
import chalk from 'chalk';
import { NextFunction, Request, Response } from 'express';
import { AUTH_SERVICE } from './const';

const auth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers['authorization']) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  try {
    const token = req.headers['authorization']?.split(' ')[1];

    const { data } = await axios.post(`${AUTH_SERVICE}/auth/verify-token`, {
      accessToken: token,
      headers: {
        ip: req.ip,
        'user-agent': req.headers['user-agent'],
      },
    });

    req.headers['x-user-id'] = data.user.id;
    req.headers['x-user-email'] = data.user.email;
    req.headers['x-user-name'] = data.user.name;
    req.headers['x-user-role'] = data.user.role;

    next();
  } catch (err) {
    console.log(chalk.bgBlue(`[auth Middleware] Error: ${err}`));

    if (err instanceof axios.AxiosError) {
      return res.status(err.response?.status || 500).json(err.response?.data);
    } else {
      return res.status(401).send({ message: 'Unauthorized' });
    }
  }
};

const middlewares = {
  auth,
};
export default middlewares;

