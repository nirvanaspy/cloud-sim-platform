import express from 'express'

export default function createServer(app) {
    const server = express();
    server.get('/startServer', (req, res) => {
        res.send(app.respondToClient(req));
        alert(1)
    })
    server.listen(9999, () => console.log('example are listening on port 9999'))
}
