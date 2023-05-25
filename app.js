const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

class Player {
    constructor(name, id = CURR_ID++) {
        this.id = id
        this.x = Math.floor(Math.random() * game_dims[1])
        this.y = Math.floor(Math.random() * game_dims[0])
        this.name = name
        this.score = 0
    }
    move(direction) {
        switch (direction) {
            case 'w': //up
                if (this.y) {
                    this.y -= 1
                    return true
                }
                break

            case 'a': //left
                if (this.x) {
                    this.x -= 1
                    return true
                }

                break;

            case 'd': //right
                if (this.x + 1 < game_dims[1]) {
                    this.x += 1
                    return true
                }

                break;

            case 's': //down
                if (this.y + 1 < game_dims[0]) {
                    this.y += 1
                    return true
                }
        }
        return false
    }
}

var CURR_ID = 0
var players = {}
var players_id_sid = {}

game_dims = [20, 40]

app.set('view engine', 'ejs');

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('pages/enter_name');
    
});

app.get('/game/:name', (req, res) => {
    res.render('pages/bot', {bot: false, name: req.params.name});
    
});

app.get('/bot', (req, res)=>{
    res.render('pages/bot', {bot: true});
})

io.on('connect', (socket) => {
    console.log("connecting with ", socket.id)

    socket.on('join', (data) => {
        // socket.data = {n: name} // direction = w|a|s|d

        if (Object.keys(players).length <= 20) {
            console.log(`${data.n} entered the game`)

            //set others players array
            others = []

            Object.keys(players).forEach(pl => {
                player = players[pl]
                others.push({ 'n': player.name, 'id': player.id, 'x': player.x, 'y': player.y, 's': player.score })
            });
            //

            let p = new Player(data.n)

            players[p.id] = p

            players_id_sid[socket.id] = p.id



            socket.emit('set', {
                "player": { 'id': p.id, 'x': p.x, 'y': p.y },
                'others': others
            })

            io.sockets.emit('new_player', { 'n': p.name, 'id': p.id, 'x': p.x, 'y': p.y, 's': p.score })

            socket.on('moved', (data) => {
                // socket.data = {id: player.id, 'd': direction} // direction = w|a|s|d

                data.d.forEach(d => {
                    players[data.id].move(d)
                })

                if (players[data.id].x == players[-1].x && players[data.id].y == players[-1].y) {

                    console.log(`${players[data.id].name} scored`)
                    players[data.id].score++

                    players[-1] = new Player("", -1)
                    io.sockets.emit('pointed', { 'id': data.id, 'x': players[-1].x, 'y': players[-1].y })

                }


                io.sockets.emit('move', data)
            })


            socket.on('disconnect', (data) => {
                // json = {id: player.id, 'direction': direction}
                console.log(data, socket.id)

                let player_id = players[players_id_sid[socket.id]].id

                delete players[players_id_sid[socket.id]]

                delete players_id_sid[socket.id]

                io.sockets.emit('delete_player', { 'id': player_id })
            })

        }

    })

})


players[-1] = new Player("", -1)
players[-1].x = -1
players[-1].y = -1

server.listen(3000, () => {
    console.log('listening on *:3000');
});

setTimeout(() => { // spawn new fruit

    players[-1] = new Player("", -1)

    io.sockets.emit('new_player', { 'id': players[-1].id, 'x': players[-1].x, 'y': players[-1].y })
}, 10000)