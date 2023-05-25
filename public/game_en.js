class Player {
    constructor(name, id, x, y, score) {
        this.name = name
        this.id = id
        this.x = x
        this.y = y
        this.score = score



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

function show_placar() {
    let placar = document.getElementById('placar')
    placar.innerText = ''

    let i = 1

    Object.keys(PLAYERS).sort((b, c) => {
        return PLAYERS[c].score - PLAYERS[b].score
    }
    ).forEach(id => {
        if (id >= 0) {
            try {
                let name = PLAYERS[id].name
                let score = PLAYERS[id].score

                if (id == PLAYER_ID) {
                    placar.innerHTML += `<tr><td><strong>${i++}° ${name}: </strong></td><td><strong>${score}</strong></td></tr>`
                } else {
                    placar.innerHTML += `<tr><td>${i++}° ${name}:</td><td>${score}</td></tr>`
                }

            } catch { }
        }
    })
}

function draw_all() {
    ctx.clearRect(0, 0, game_dims[1] * square_dim, game_dims[0] * square_dim)

    Object.keys(PLAYERS).forEach(
        (player_) => {
            draw_player(PLAYERS[player_])
        }
    )

    if (DRAW_LINES) {
        for (let i = 0; i < game_dims[0]; i++) {
            for (let j = 0; j < game_dims[1]; j++) {
                ctx.strokeRect(square_dim * j, square_dim * i, square_dim, square_dim);
            }
        }
    }
}

function draw_player(player_) {
    if (player_.id == -1) {
        ctx.fillStyle = "rgba(255, 0, 0, 0.9)"
    } else if (player_.id == PLAYER_ID) {
        ctx.fillStyle = "rgba(255, 175, 50, 0.8)"
    } else {
        ctx.fillStyle = "rgba(10, 200, 200, 0.7)"
    }

    ctx.fillRect(square_dim * player_.x, square_dim * player_.y, square_dim, square_dim)
}

// script inits here

var canvas = document.getElementById('game_map_tb');
var ctx = canvas.getContext('2d');

let game_dims = [20, 40]

let square_dim = 25

var PLAYER_ID = 0

var DRAW_LINES = false

document.getElementById('draw_lines').addEventListener('click', ()=>{
    DRAW_LINES = !DRAW_LINES
    draw_all()
})

var PLAYERS = {}

var MAIN_LOOP = undefined // store timeInterval ID

STATE = { // loads the players current direction 
    w: false,
    a: false,
    s: false,
    d: false
}




const socket = io();

socket.on('connect', function () {
    try {
        clearInterval(MAIN_LOOP);
    } catch { }

    socket.emit("join", { n: PLAYER_NAME })
});

socket.on('set', function (data) { // data = {"player": {'id': p.id, 'x': p.x, 'y': p.y}}
    PLAYER_ID = data.player.id

    PLAYERS[PLAYER_ID] = new Player(PLAYER_NAME, PLAYER_ID, data.player.x, data.player.y, 0)


    data.others.forEach((p) => {
        PLAYERS[p.id] = new Player(p.n, p.id, p.x, p.y, p.s)

    })
    show_placar()

    MAIN_LOOP = setInterval(check_moves, 75)

    draw_all()
});

socket.on("new_player", (data) => { // data = {'id': p.id, 'x': p.x, 'y': p.y}
    if (data.id != PLAYER_ID) {
        console.log("new player: ", data)
        PLAYERS[data.id] = new Player(data.n, data.id, data.x, data.y, data.s)
        show_placar()
        draw_all()
    }
});

socket.on("pointed", (data) => { // data = {'id': p.id, 'x': p.x, 'y': p.y}
    PLAYERS[-1] = new Player('', -1, data.x, data.y, 0)
    PLAYERS[data.id].score++
    show_placar()
    draw_all()
});

socket.on("delete_player", (data) => { // data = {'id': p.id}
    if (data.id != PLAYER_ID) {
        delete PLAYERS[data.id]
        console.log("del player " + data.id)
        draw_all()
    }
});

socket.on("move", (data) => { // data = {id: player.id, 'direction': direction}
    if (data.id != PLAYER_ID) {

        data.d.forEach((d) => {
            PLAYERS[data.id].move(d)
        })

        draw_all()
    }
});
