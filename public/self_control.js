draw_all()

var keys = {
    w: 'w',
    a: 'a',
    s: 's',
    d: 'd',
    ArrowRight: 'd',
    ArrowUp: 'w',
    ArrowDown: 's',
    ArrowLeft: 'a'
}

document.addEventListener('keydown', function (event) {
    if (event.key in keys) {
        STATE[keys[event.key]] = true
    }
})

document.addEventListener('keyup', function (event) {
    if (event.key in keys) {
        STATE[keys[event.key]] = false
    }
})



function check_moves() {
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

    if (STATE.d && STATE.a) {
        directions.splice(directions.indexOf('d'), 1);

        directions.splice(directions.indexOf('a'), 1);

    }
    if (STATE.w && STATE.s) {
        directions.splice(directions.indexOf('w'), 1);

        directions.splice(directions.indexOf('s'), 1);
    }

    if (directions.length) {
        draw_all()
        socket.emit('moved', { id: PLAYER_ID, 'd': directions });
    }
}