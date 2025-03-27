# Используем Node.js
FROM node:22.14.0-alpine
  
  # Устанавливаем рабочую директорию
WORKDIR /app
  
  # Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install
  
  # Копируем весь код
COPY . .
  
RUN chmod +x entrypoint.sh  # Делаем скрипт исполняемым

ENTRYPOINT ["./entrypoint.sh"]