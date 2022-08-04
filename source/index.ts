// dans la config: stocker les whitelist de site de repository
// Stocker les paquets en cache: metadata dans un sqlite, fichiers eux même sous pseudonyme_uuid dans un dossier quelconque


// Serveur proxy qui a partir d'une URL [http://cacherepo.webinage.net/http/dl.rockylinux.org/$contentdir/$releasever/BaseOS/$basearch/os/CACHEREPOMARKER/] 
// est capable de reconstruire un chemin de paquet valide et de l


import axios from "axios";
import express from 'express'
import { createWriteStream } from "fs";
import path from "path";

const app = express()
const port = 8080
const bind_addr = '127.0.0.1'
const download_dirpath = path.resolve(path.join(__dirname,'..','downloaded_packages'))

app.get('*', async (req, res) => {
    console.log(req.url) 

    // ^\/(https?)\/(.+?\/)((?:.*\/)?)CACHEREPOMARKER\/(.*)

    const urlparse_regex = new RegExp(Buffer.from('XlwvKGh0dHBzPylcLyguKz9cLykoKD86LipcLyk/KUNBQ0hFUkVQT01BUktFUlwvKC4qKQ==', 'base64').toString('utf-8'), 'g')
    const matched_url = Array.from(req.url.matchAll(urlparse_regex))[0]
    console.log(urlparse_regex)
    console.log(matched_url)
    if (!matched_url) {
        res.status(400).send("YPHC says: Bad URL");
        return 1
    }
    const proto = matched_url[1]
    const repo_domain_name = matched_url[2]
    const repo_url = matched_url[3]
    const content_url = matched_url[4]
    const final_url = proto + '://' + repo_domain_name + repo_url + content_url
    console.log(final_url)

    // (?<=\/)[^\/]+\.rpm$
    const rpmname_regex = new RegExp(Buffer.from('KD88PVwvKVteXC9dK1wucnBtJA==', 'base64').toString('utf-8'), 'g')
    const matched_rpm_filename = Array.from(req.url.match(rpmname_regex))[0]
    if (matched_rpm_filename) {
        await downloadFile(final_url, path.resolve(path.join(download_dirpath,matched_rpm_filename )) )

        
    }

    //const proxied_request_res = await axios.get(final_url)

    // console.log(proxied_request_res)
    // res.send('Réussi sur url ' + final_url + ' avec code: ' + proxied_request_res.statusCode + '\n')
    res.redirect(final_url)
})

app.listen(port, bind_addr, () => {
    console.log("Example app listening on port " + port)
})



export async function downloadFile(fileUrl: string, outputLocationPath: string) {
    console.log(outputLocationPath)
    const writer = createWriteStream(outputLocationPath);
    return axios({
        method: 'get',
        url: fileUrl,
        responseType: 'stream',
    }).then(response => {
        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            let error = null;
            writer.on('error', err => {
                error = err;
                writer.close();
                reject(err);
            });
            writer.on('close', () => {
                if (!error) {
                    resolve(true);
                }
            });
        });
    });
}