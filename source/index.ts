// dans la config: stocker les whitelist de site de repository
// Stocker les paquets en cache: metadata dans un sqlite, fichiers eux même sous pseudonyme_uuid dans un dossier quelconque


// Serveur proxy qui a partir d'une URL [http://cacherepo.webinage.net/http/dl.rockylinux.org/$contentdir/$releasever/BaseOS/$basearch/os/CACHEREPOMARKER/] 
// est capable de reconstruire un chemin de paquet valide et de l


import axios from "axios";
import express from 'express';
import { createWriteStream } from "fs";
import path from "path";
import { exec } from 'child_process';
import config from "../config.json"

const app = express()
const port = 8080
const bind_addr = '127.0.0.1'
const download_dirpath = path.resolve(path.join(__dirname, '..', '..', 'downloaded_packages'))
let createrepo_running_lock: boolean = false
let createrepo_promise: Promise<any> = null

app.get('/proxy/*', async (req, res) => {
    console.log(req.url)

    // ^\/proxy\/(https?)\/(.+?\/)((?:.*\/)?)CACHEREPOMARKER\/(.*)

    const urlparse_regex = new RegExp(Buffer.from('XlwvcHJveHlcLyhodHRwcz8pXC8oLis/XC8pKCg/Oi4qXC8pPylDQUNIRVJFUE9NQVJLRVJcLyguKik=', 'base64').toString('utf-8'), 'g')
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
    const matched_rpm_filenames = req.url.match(rpmname_regex)
    if (matched_rpm_filenames) {
        let matched_rpm_filename = Array.from(matched_rpm_filenames)[0]
        if (matched_rpm_filename) {
            await downloadFile(final_url, path.resolve(path.join(download_dirpath, matched_rpm_filename)))

            if (createrepo_running_lock) {
                await createrepo_promise
            }

            createrepo_promise = update_repo()


        }
    }
    res.redirect(final_url)
})

app.use("/repo/", express.static(download_dirpath));

app.listen(port, bind_addr, async () => {
    await print_gpg_pubkey()
    console.log("YPHC serving on port " + port)
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

async function update_repo() {
    if (createrepo_running_lock)
        return
    createrepo_running_lock = true
    await _execute_createrepo()
    console.log("finished generating metadata")
    await _sign_repo_metadata()
    console.log("finished signing metadata")
    createrepo_running_lock = false
    return
}


function print_gpg_pubkey(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        exec("gpg --export -a '" + config.gpg_username + "'", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                reject("gpg public key export failed")
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            resolve()
        })
    })

}

function _execute_createrepo(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        exec("docker run --user $(id -u) --rm -e verbose=true -e database=true -e update=true -e deltas=true -v '" + download_dirpath + "':/data sark/createrepo:latest", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                reject("docker run failed")
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            resolve()
        })
    })

}

function _sign_repo_metadata(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        exec("gpg --local-user '" + config.gpg_username + "' --detach-sign --armor --yes '" + path.resolve(path.join(download_dirpath, "repodata", "repomd.xml")) + "'", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                reject("Could not sign metadata")
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            resolve()
        })
    })

}