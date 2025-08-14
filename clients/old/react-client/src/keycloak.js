import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "https://keycloak.mars-ssn.ru", // Твой Keycloak сервер
  realm: "school-social-network",
  clientId: "web-client"
});


setInterval(() => {
  keycloak.updateToken(60).then(refreshed => {
    if (refreshed) {
      console.log("Token was refreshed");
    } else {
      console.log("Token is still valid");
    }
  }).catch(() => {
    console.error("Failed to refresh token");
  });
}, 60000*4); // раз в 4 минуты

export default keycloak;
