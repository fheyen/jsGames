// global game variable
var game;
/**
 * Processes keyboard events.
 * @param event keyboard event
 */
function keyDownAsteroids(event) {
    // some keys should be processed by the browser
    switch (event.key) {
        case "F5":
            return;
        case "F11":
            return;
        case "F12":
            return;
        default:
            // pass on to game
            if (game) {
                game.keyDown(event);
            }
    }
}
/**
 * Starts a new game.
 */
function initAsteroids() {
    if (game) {
        game.remove();
    }
    game = new Asteroids();
}
