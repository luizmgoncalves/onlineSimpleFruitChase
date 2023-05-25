var PLAYER_NAME = generateName()

draw_all()

perlin.seed()

var time_index = 0

function check_moves() {
    time_index += 1

    let limiarx = (PLAYERS[-1].x - PLAYERS[PLAYER_ID].x)
    let limiary = -(PLAYERS[-1].y - PLAYERS[PLAYER_ID].y)

    if (limiarx && false) {
        limiarx = limiarx / Math.abs(limiarx)
    }
    if (limiary && false) {
        limiary = limiary / Math.abs(limiary)
    }

    d = Math.hypot(limiarx, limiary)

    //limiarx += perlin.get(time_index / 10, 0) * Math.pow(d, 2) / 1

    //limiary += perlin.get(0, time_index / 10) * Math.pow(d, 2) / 1


    STATE.d = limiarx >= 1

    STATE.a = limiarx <= -1

    STATE.w = limiary >= 1

    STATE.s = limiary <= -1




    directions = []

    Object.keys(STATE).forEach(
        (direction) => {
            if (STATE[direction]) {
                if (PLAYERS[PLAYER_ID].move(direction)) {
                    directions.push(direction)
                }
            }
        }
    )

    if (directions.length) {
        draw_all()
        socket.emit('moved', { id: PLAYER_ID, 'd': directions });
    }
}