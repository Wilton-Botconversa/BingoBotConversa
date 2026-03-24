import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const SECRET = process.env.JWT_SECRET || 'bingo-secret-key-change-in-production-must-be-256-bits!!';

export function generateToken(email: string, role: string): string {
  return jwt.sign({ email, role }, SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): { email: string; role: string } | null {
  try {
    return jwt.verify(token, SECRET) as { email: string; role: string };
  } catch {
    return null;
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const payload = verifyToken(header.substring(7));
  if (!payload) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  (req as any).userEmail = payload.email;
  (req as any).userRole = payload.role;
  next();
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if ((req as any).userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
}
