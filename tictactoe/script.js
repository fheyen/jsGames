var TicTacToe = /** @class */ (function () {
    /**
     * Creates a new TicTacToe object.
     * @param useAi if true, player 2 will be played by an artifical intelligence
     */
    function TicTacToe(useAi) {
        this.useAi = useAi;
        this.state = new Array(9).fill(0);
        this.nextPlayer = 1;
        this.updateUI();
    }
    /**
     * Checks if the game is over eihter by winning or draw.
     * @param state
     */
    TicTacToe.prototype.isGameOver = function (state) {
        // check if board is full
        var full = true;
        for (var i = 0; i < 9; i++) {
            if (state[i] === 0) {
                full = false;
            }
        }
        if (full) {
            return true;
        }
        // check if one player has won
        if (this.getWinner(state) !== null) {
            return true;
        }
        return false;
    };
    /**
     * Returns the number of the winning player or null if no winner.
     * @param state
     */
    TicTacToe.prototype.getWinner = function (state) {
        // check rows
        for (var i = 0; i < 7; i += 3) {
            if (state[i] !== 0
                && state[i] === state[i + 1]
                && state[i] === state[i + 2]) {
                return state[i];
            }
        }
        // check cols
        for (var i = 0; i < 3; i++) {
            if (state[i] !== 0
                && state[i] === state[i + 3]
                && state[i] === state[i + 6]) {
                return state[i];
            }
        }
        // check diagonals
        if (state[4] !== 0) {
            if (state[0] === state[4]
                && state[0] === state[8]) {
                return state[4];
            }
            if (state[2] === state[4]
                && state[2] === state[6]) {
                return state[4];
            }
        }
        return null;
    };
    /**
     * Called if a player has clicked on a button.
     * @param position
     */
    TicTacToe.prototype.buttonClicked = function (position) {
        if (this.state[position] !== 0) {
            // illegal button press
            return;
        }
        if (!this.isGameOver(this.state)) {
            console.log("player " + this.getPlayerSymbol(this.nextPlayer) + " chose " + position);
            // set state
            this.state[position] = this.nextPlayer;
            // switch player
            this.nextPlayer = this.nextPlayer === 1 ? 2 : 1;
            // let AI play
            if (this.nextPlayer === 2 && this.useAi && !this.isGameOver(this.state)) {
                // player 2 is the AI
                var decision = this.testDecisionSubtree(this.state, 2, 0).choice;
                this.buttonClicked(decision);
            }
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
     * Use artificial intelligence to choose best button.
     * Tests all possible outcomes and returns a cost.
     * @param state
     * @param position
     */
    TicTacToe.prototype.testDecisionSubtree = function (state, player, recursionDepth) {
        var choice;
        var choices;
        // game over? stop recursion
        if (this.isGameOver(state)) {
            var winner = this.getWinner(state);
            if (winner === 1) {
                // AI would lose
                choice = {
                    choice: null,
                    cost: 100
                };
            }
            else if (winner === 0) {
                // draw
                choice = {
                    choice: null,
                    cost: 50
                };
            }
            else {
                // AI would win
                choice = {
                    choice: null,
                    cost: 0
                };
            }
        }
        else {
            // play for both players alternating
            choices = [];
            for (var i = 0; i < 9; i++) {
                // test all free buttons
                if (state[i] === 0) {
                    // try a decision
                    var stateAfter = state.slice(0);
                    stateAfter[i] = player;
                    // test the decision
                    var value_1 = this.testDecisionSubtree(stateAfter, player === 1 ? 2 : 1, ++recursionDepth);
                    // remember choices
                    choices[i] = value_1.cost;
                }
            }
            // player 1 takes max., player 2 takes min.
            var index = -1;
            var value = void 0;
            if (player === 1) {
                // get max value and corresponding index
                value = -1;
                for (var i = 0; i < choices.length; i++) {
                    if (choices[i] > value) {
                        value = choices[i];
                        index = i;
                    }
                }
            }
            else {
                // get max value and corresponding index
                value = 101;
                for (var i = 0; i < choices.length; i++) {
                    if (choices[i] < value) {
                        value = choices[i];
                        index = i;
                    }
                }
            }
            choice = {
                choice: index,
                cost: value
            };
        }
        return choice;
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
     * Maps a player number to a symbol.
     * @param player
     */
    TicTacToe.prototype.getPlayerSymbol = function (player) {
        switch (player) {
            case 1:
                return "X";
            case 2:
                return "O";
            default:
                return "";
        }
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
function initTicTacToe(isTwoPlayerMode) {
    console.log("\n~~~ new game ~~~");
    console.log(isTwoPlayerMode ? "two player mode" : "human vs. AI mode");
    game = new TicTacToe(!isTwoPlayerMode);
}
