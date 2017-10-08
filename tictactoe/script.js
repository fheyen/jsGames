var TicTacToe = /** @class */ (function () {
    /**
     * Creates a new TicTacToe object.
     * @param useAi if true, player 2 will be played by an artifical intelligence
     */
    function TicTacToe(useAi) {
        this.useAi = useAi;
        this.state = (new Array(9)).fill(0);
        this.updateUI();
    }
    /**
     * Checks if the game is over.
     * @param state
     */
    TicTacToe.prototype.isGameOver = function (state) {
        return false;
    };
    /**
     * Returns the number of the winning player or null if no winner.
     * @param state
     */
    TicTacToe.prototype.getWinner = function (state) {
        return null;
    };
    /**
     * Called if a player has clicked on a button.
     * @param position
     */
    TicTacToe.prototype.buttonClicked = function (position) {
        if (!this.isGameOver(this.state)) {
        }
        // show current field
        this.updateUI();
        // show winner if there is one
        if (this.isGameOver(this.state)) {
            var winner = this.getWinner(this.state);
            if (winner !== null) {
                this.showMessage("game over!<br><br>winner: " + this.getPlayerSymbol(winner));
            }
            else {
                this.showMessage("game over!<br><br>draw");
            }
        }
    };
    /**
     * Displays a message on the UI.
     * @param message
     */
    TicTacToe.prototype.showMessage = function (message) {
        document.getElementById("message").innerHTML = message;
        console.log(message);
    };
    /**
     * Draws the UI.
     */
    TicTacToe.prototype.updateUI = function () {
        var buttons = document.getElementsByTagName("button");
        var gameOver = this.isGameOver(this.state);
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].innerHTML = this.getPlayerSymbol(this.state[i]);
            // disable or enable button
            buttons[i].disabled = this.state[i] !== 0 || gameOver;
        }
        this.showMessage("next player: " + this.getPlayerSymbol(this.nextPlayer));
    };
    return TicTacToe;
}());
var game;
/**
 * Starts a new game.
 * @param isTwoPlayerMode game mode
 */
function init(isTwoPlayerMode) {
    console.log("\n~~~ new game ~~~");
    console.log(isTwoPlayerMode ? "two player mode" : "human vs. AI mode");
    game = new TicTacToe(!isTwoPlayerMode);
}
