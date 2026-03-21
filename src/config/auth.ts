const {
  KEYCLOAK_ISSUER = 'http://localhost:8080/realms/postech-car',
  KEYCLOAK_AUDIENCE = 'account',
  KEYCLOAK_REQUIRED_ROLE = 'buyer'
} = process.env;

export const authConfig = {
  issuer: KEYCLOAK_ISSUER,
  audience: KEYCLOAK_AUDIENCE,
  requiredRole: KEYCLOAK_REQUIRED_ROLE
};
