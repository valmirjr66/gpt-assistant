export default class DummyConnector {
    // private readonly files: string[] = [
    //     '/gravações ato black sind-UTE MG/vídeos recebedios email/2024644168.mp4',
    //     '/gravações ato black sind-UTE MG/vídeos recebedios email/video blm.mp4',
    //     '/gravações ato black sind-UTE MG/vídeos recebedios email/7816983.mp4',
    //     '/gravações ato black sind-UTE MG/vídeos recebedios email/WhatsApp Image 2024-10-01 at 15.51.36.mp4',
    //     '/gravações ato black sind-UTE MG/vídeos recebedios email/upload luisa.mp4',
    //     '/gravações ato black sind-UTE MG/vídeos recebedios email/Gravação.mp4',
    //     '/gravações ato black sind-UTE MG/Nossas gravações/Gravação 1.mp4',
    //     '/gravações ato black sind-UTE MG/Nossas gravações/Gravação 2.mp4',
    //     '/gravações ato black sind-UTE MG/Nossas gravações/Gravação 3.mp4',
    //     '/gravações ato black sind-UTE MG/Nossas gravações/Gravação 4.mp4',
    //     '/gravações ato black sind-UTE MG/Nossas gravações/Gravação 5.mp4',
    //     '/gravações ato black sind-UTE MG/Material Mídia Ninja/Gravação.mp4',
    //     '/entrevistas/manifestação defesa democracia',
    //     '/entrevistas/relato violencia policial',
    // ];

    private readonly files: string[] = [
        'directory/document.txt',
        'directory/video.mp4',
        'directory/document.fake.pdf'
    ]

    constructor() { }

    async list(): Promise<string[]> {
        return Promise.resolve(this.files);
    }

    async readFile(path: string): Promise<Buffer> {
        console.log(`Reading file at ${path}`);
        return Promise.resolve(Buffer.from('teste', 'binary'));
    }
}
