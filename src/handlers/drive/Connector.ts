import path from 'path';
import fs from 'fs';
import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';

export default class Connector {
    constructor() {}

    private readonly SCOPES = [
        'https://www.googleapis.com/auth/drive.metadata.readonly',
    ];
    private readonly TOKEN_PATH = path.join(process.cwd(), 'token.json');
    private readonly CREDENTIALS_PATH = path.join(
        process.cwd(),
        'credentials.json',
    );

    private async loadSavedCredentialsIfExist(): Promise<any> {
        try {
            let credentialsContent;
            fs.readFile(this.TOKEN_PATH, (err, data) => {
                if (err) {
                    console.error(err);
                    throw new Error('Error while trying to load credentials');
                }
                credentialsContent = data;
            });

            const credentials = JSON.parse(credentialsContent);
            return google.auth.fromJSON(credentials);
        } catch (err) {
            return null;
        }
    }

    private async saveCredentials(client) {
        let content;
        await fs.readFile(this.CREDENTIALS_PATH, async (err, data) => {
            if (err) {
                console.error(err);
                throw new Error('Error while trying to load credentials');
            }
            content = data;
        });

        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });

        fs.writeFile(this.TOKEN_PATH, payload, (err) => {
            if (err) {
                console.error(err);
                throw new Error('Error while trying to load credentials');
            }
        });
    }

    private async authorize() {
        let client = await this.loadSavedCredentialsIfExist();
        if (client) {
            return client;
        }
        client = await authenticate({
            scopes: this.SCOPES,
            keyfilePath: this.CREDENTIALS_PATH,
        });
        if (client.credentials) {
            await this.saveCredentials(client);
        }
        return client;
    }

    async listFiles(basePath: string) {
        const _listFilesAsync = async (authClient) => {
            const drive = google.drive({ version: 'v3', auth: authClient });
            const res = await drive.files.list({
                pageSize: 100,
                fields: 'nextPageToken, files(id, name)',
                q: `name contains \'${basePath}\'`,
            });
            const files = res.data.files;
            if (files.length === 0) {
                console.log('No files found.');
                return;
            }

            console.log('Files:');
            files.map((file) => {
                console.log(`${file.name} (${file.id})`);
            });
        };

        this.authorize().then(_listFilesAsync).catch(console.error);
    }

    async readFile() {
        const _readFileAsync = async (authClient) => {
            const drive = google.drive({ version: 'v3', auth: authClient });
            const res = await drive.files.get({
                fileId: 'teste.txt',
            });

            console.log(res);
        };

        this.authorize().then(_readFileAsync).catch(console.error);
    }
}
