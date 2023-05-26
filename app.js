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
    res.render('pages/game', {bot: false, name: req.params.name});
    
});

app.get('/bot', (req, res)=>{
    res.render('pages/game', {bot: true});
})

io.on('connect', (socket) => {
    console.log("connecting with ", socket.id)

    socket.on('join', (player_name) => {

        if (Object.keys(players).length <= 20) {
            console.log(`${player_name} entered the game`)

            //set others players array
            others = []

            Object.keys(players).forEach(pl => {
                player = players[pl]
                others.push({ 'n': player.name, 'id': player.id, 'x': player.x, 'y': player.y, 's': player.score })
            });
            //

            let p = new Player(player_name)

            players[p.id] = p

            players_id_sid[socket.id] = p.id



            socket.emit('set',  p.id, p.x, p.y , others)

            io.sockets.emit('n_p', p.name, p.id, p.x, p.y, p.score)

            socket.on('md', (directions) => { // moved

                directions.forEach(d => {
                    players[players_id_sid[socket.id]].move(d)
                })

                if (players[players_id_sid[socket.id]].x == players[-1].x && players[players_id_sid[socket.id]].y == players[-1].y) {

                    console.log(`${players[players_id_sid[socket.id]].name} scored`)
                    players[players_id_sid[socket.id]].score++

                    players[-1] = new Player("", -1)
                    io.sockets.emit('ptd', players_id_sid[socket.id], players[-1].x, players[-1].y)

                }


                io.sockets.emit('mv', players_id_sid[socket.id], directions)
            })


            socket.on('disconnect', (data) => {
                // json = {id: player.id, 'direction': direction}
                console.log(data, socket.id)

                let player_id = players[players_id_sid[socket.id]].id

                delete players[players_id_sid[socket.id]]

                delete players_id_sid[socket.id]

                io.sockets.emit('del_p', player_id)
            })

        }

    })

})


players[-1] = new Player("", -1)
players[-1].x = -1
players[-1].y = -1

server.listen(8080, () => {
    console.log('listening on *:8080');
});

setTimeout(() => { // spawn new fruit

    players[-1] = new Player("", -1)

    io.sockets.emit('n_p', '', -1, players[-1].x, players[-1].y, 0)
}, 10000)
