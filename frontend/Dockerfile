# Используем Node.js
FROM node:18-alpine
  
  # Устанавливаем рабочую директорию
WORKDIR /app
  
  # Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install
  
  # Копируем весь код
COPY . .
  
  # Ждем, пока база данных запустится (по желанию)
CMD ["sh", "-c", "sleep 5 && npm start"]
  
  # Приложение слушает 5000 порт
EXPOSE 5000
