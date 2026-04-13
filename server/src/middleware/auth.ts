// import { Request, Response, NextFunction } from 'express';
// import { auth } from '../auth/config.js';

// export interface AuthRequest extends Request {
//   user?: {
//     id: string;
//     email: string;
//     name: string;
//     role: string;
//     image?: string;
//   };
//   session?: any;
// }

// export const authMiddleware = async (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const session = await auth.api.getSession({
//       headers: req.headers,
//     });

//     if (!session) {
//       res.status(401).json({ message: 'Unauthorized: No active session' });
//       return;
//     }

//     req.user = session.user as any;
//     req.session = session.session;
//     next();
//   } catch (error) {
//     console.error('Auth error:', error);
//     res.status(401).json({ message: 'Authentication failed' });
//   }
// };

// export const requireRole = (...roles: string[]) => {
//   return (req: AuthRequest, res: Response, next: NextFunction): void => {
//     if (!req.user) {
//       res.status(401).json({ message: 'Unauthorized' });
//       return;
//     }

//     if (!roles.includes(req.user.role)) {
//       res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
//       return;
//     }

//     next();
//   };
// };

// export const optionalAuth = async (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const session = await auth.api.getSession({
//       headers: req.headers,
//     });

//     if (session) {
//       req.user = session.user as any;
//       req.session = session.session;
//     }

//     next();
//   } catch (error) {
//     next();
//   }
// };



import { Request, Response, NextFunction } from 'express';
import { auth } from '../auth/config.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    image?: string;
    // Updated to match your database change
    emailVerified?: Date | null; 
    isActive?: boolean;
  };
  session?: any;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      res.status(401).json({ message: 'Unauthorized: No active session' });
      return;
    }

    // Explicitly casting the session user to our AuthRequest user type
    req.user = session.user as unknown as AuthRequest['user'];
    req.session = session.session;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (session) {
      req.user = session.user as unknown as AuthRequest['user'];
      req.session = session.session;
    }

    next();
  } catch (error) {
    next();
  }
};