const {
  COGNITO_REGION = "us-east-1",
  COGNITO_USER_POOL_ID = "us-east-1_dymlpmCdd",
  COGNITO_CLIENT_ID = "193omfidp7neg18vlf6fq8ve5l",
  COGNITO_ISSUER,
  AUTH_REQUIRED_ROLE = "buyer",
  AUTH_SELLER_ROLE = "seller",
} = process.env;

console.info("[authConfig] Loaded envs", {
  COGNITO_REGION,
  COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID,
  AUTH_REQUIRED_ROLE,
  AUTH_SELLER_ROLE,
  COGNITO_ISSUER_OVERRIDE: COGNITO_ISSUER ? "provided" : "derived",
});

const derivedIssuer =
  COGNITO_ISSUER ||
  (COGNITO_REGION && COGNITO_USER_POOL_ID
    ? `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`
    : "");

export const authConfig = {
  issuer: derivedIssuer,
  audience: COGNITO_CLIENT_ID,
  requiredRole: AUTH_REQUIRED_ROLE,
  sellerRole: AUTH_SELLER_ROLE,
};
