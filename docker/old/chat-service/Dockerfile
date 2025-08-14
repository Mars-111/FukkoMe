FROM eclipse-temurin:17-jdk

WORKDIR /app

# Скопируй сюда свой .jar
COPY ./chats-service-0.0.1-SNAPSHOT.jar app.jar

# Если приложение слушает порт 8082
EXPOSE 8082

CMD ["java", "-jar", "app.jar"]

#docker build -t chat-service-fuko .