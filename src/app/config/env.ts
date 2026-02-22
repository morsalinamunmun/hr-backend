import  dotenv  from "dotenv";
interface EnvConfig {
  PORT: string;     
    DB_URL: string;      
    NODE_ENV: string | "development" | "production";
    BCRYPT_SALT_ROUND: string;
    JWT_ACCESS_SECRET: string;
     JWT_ACCESS_EXPIRES: string
}

dotenv.config();
const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVars = ["PORT", "DB_URL", "NODE_ENV"];
    requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
        }
  })

  return{
    PORT: process.env.PORT as string,
    DB_URL: process.env.DB_URL as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string, 
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string
  }
}
export const envVars = loadEnvVariables();