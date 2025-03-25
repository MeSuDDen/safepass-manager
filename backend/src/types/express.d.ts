// src/types/express.d.ts
import { User } from '@prisma/client'; // Импортируйте тип пользователя из Prisma (если нужно)

declare global {
  namespace Express {
    interface Request {
      user: { userId: string; email: string }; // Определите структуру объекта user
    }
  }
}
