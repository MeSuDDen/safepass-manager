# Используем Node.js
FROM node:18-alpine
  
  # Устанавливаем рабочую директорию
WORKDIR /app
  
  # Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install
  
  # Копируем весь код
COPY . .
  
  # Запускаем React-приложение
CMD ["npm", "start"]
  
  # Приложение слушает 3000 порт
EXPOSE 3000
