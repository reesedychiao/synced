import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";
import authConfig from "../../../auth.config";

export default handleAuth({
  ...authConfig,
  async login(req, res) {
    try {
      await handleLogin(req, res, {
        authorizationParams: {
          redirect_uri: "https://localhost:3000/initial-section",
        },
      });
    } catch (error) {
      res.status(error.status || 500).end(error.message);
    }
  },
});
