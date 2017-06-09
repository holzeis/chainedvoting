
express = require "express"
http = require "http"

app = express()
server = http.createServer(app)

app.get "/", (req, res) -> 
	res.send "Hello World!"


app.listen 3000, () -> console.log "Example app listening on port 3000!"



