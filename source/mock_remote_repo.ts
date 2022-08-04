// dans la config: stocker les whitelist de site de repository
// Stocker les paquets en cache: metadata dans un sqlite, fichiers eux même sous pseudonyme_uuid dans un dossier quelconque


// Serveur proxy qui a partir d'une URL [http://cacherepo.webinage.net/http/dl.rockylinux.org/$contentdir/$releasever/BaseOS/$basearch/os/CACHEREPOMARKER/] 
// est capable de reconstruire un chemin de paquet valide et de l


import express from 'express';
import path from "path";

const app = express()
const port = 8000
const bind_addr = '127.0.0.1'
const download_dirpath = path.resolve(path.join(__dirname, '..', '..', 'mocked_repo'))


app.use("/repo/", express.static(download_dirpath));

app.listen(port, bind_addr, async () => {
    console.log("Mocked repo serving on port " + port)
})
