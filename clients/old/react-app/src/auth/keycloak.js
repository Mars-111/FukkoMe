import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "https://keycloak.mars-ssn.ru", // Твой Keycloak сервер
  realm: "school-social-network",
  clientId: "web-client"
});

export default keycloak;
