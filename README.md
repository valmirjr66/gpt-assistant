## Steps to start the API:

1. Add a .env configuration file with following entries:

-   API_PORT
-   OPENAI_SECRET_KEY
-   CLOUD_API_ADDRESS
-   NOTION_TOKEN
-   BASE_BLOB_PATH (e.g.: "./storage")
-   DATABASE_URL (e.g.: "mongodb+srv://<user>:<password>@projetos.splss.mongodb.net/projetos?retryWrites=true&w=majority&appName=projetos")
-   BLOB_MANAGEMENT_STRATEGY ("cloud" or "local")

2. Run `npm i`
3. Run `npm start`
