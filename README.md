## Steps to start the API:

1. Add a .env configuration file with following entries:

-   API_PORT
-   OPENAI_SECRET_KEY
-   CLOUD_API_ADDRESS
-   BASE_BLOB_PATH (e.g.: "./storage")
-   DATABASE_URL (e.g.: "mongodb+srv://<user>:<password>@projetos.splss.mongodb.net/yoko?retryWrites=true&w=majority&appName=projetos")
-   BLOB_MANAGEMENT_STRATEGY ("cloud" or "local")

2. Run `npm run prisma:generate`
3. Run `npm run prisma:push`
4. Run `npm i`
5. Run `npm start`
