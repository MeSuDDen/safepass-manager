# Используем Node.js
FROM node:22.14.0-alpine
  
  # Устанавливаем рабочую директорию
WORKDIR /app
  
  # Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install
  
  # Копируем весь код
COPY . .
  
  # Ждем, пока база данных запустится (по желанию)
CMD ["sh", "-c", "sleep 5 && npm run dev"]
  
  # Приложение слушает 5000 порт
EXPOSE 5000
