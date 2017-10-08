var TicTacToe = /** @class */ (function () {
    function TicTacToe(useAi) {
        this.useAi = useAi;
        this.state = (new Array(9)).fill(0);
        this.nextPlayer = 1;
        this.updateUI();
    }
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
    TicTacToe.prototype.buttonClicked = function (position) {
        if (this.state[position] !== 0) {
            // illegal button press
            return;
        }
        if (!this.isGameOver(this.state)) {
            console.log("player " + this.nextPlayer + " chose " + position);
            // set state
            this.state[position] = this.nextPlayer;
            // switch player
            this.nextPlayer = this.nextPlayer === 1 ? 2 : 1;
            // let AI play
            if (this.nextPlayer === 2 && this.useAi && !this.isGameOver(this.state)) {
                // player 2 is the AI
                var decision = this.makeDecision();
                this.buttonClicked(decision);
            }
        }
        // show current field
        this.updateUI();
        // show winner if there is one
        if (this.isGameOver(this.state)) {
            var winner = this.getWinner(this.state);
            if (winner !== null) {
                this.showMessage("winner: " + winner);
            }
            else {
                this.showMessage("draw");
            }
        }
    };
    TicTacToe.prototype.makeDecision = function () {
        // use artificial intelligence to choose best button
        console.log("thinking..");
        // try out all postions and check who wins
        var choice = this.testDecisionSubtree(this.state, 2, 0).choice;
        console.log(choice);
        return choice;
    };
    /**
     * Tests all possible outcomes and returns a cost.
     * @param state
     * @param position
     */
    TicTacToe.prototype.testDecisionSubtree = function (state, player, recursionDepth) {
        // game over? stop recursion
        if (this.isGameOver(state)) {
            var winner = this.getWinner(state);
            if (winner === 1) {
                // AI would lose
                return {
                    choice: null,
                    cost: 100
                };
            }
            else if (winner === 0) {
                // draw
                return {
                    choice: null,
                    cost: 50
                };
            }
            else {
                // AI would win
                return {
                    choice: null,
                    cost: 0
                };
            }
        }
        // play for both players alternating
        player = player === 1 ? 2 : 1;
        var choices = [];
        for (var i = 0; i < 9; i++) {
            // test all free buttons
            if (state[i] === 0) {
                // try a decision
                var stateAfter = state.slice(0);
                stateAfter[i] = player;
                // test the decision
                var value = this.testDecisionSubtree(stateAfter, player, ++recursionDepth);
                var pad = "> ".repeat(recursionDepth);
                // remember choices
                choices[i] = value.cost;
            }
        }
        // player 1 takes max., player 2 takes min.
        if (player === 1) {
            var max = Math.max.apply(Math, choices);
            return {
                choice: choices.indexOf(max),
                cost: max
            };
        }
        else {
            var min = Math.min.apply(Math, choices);
            return {
                choice: choices.indexOf(min),
                cost: min
            };
        }
    };
    TicTacToe.prototype.showMessage = function (message) {
        document.getElementById("message").innerHTML = message;
        console.log(message);
    };
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
    TicTacToe.prototype.stateToString = function (state, pad) {
        var str = pad;
        for (var i = 0; i < state.length; i++) {
            str += state[i] + " ";
            if ((i + 1) % 3 === 0) {
                str += "\n" + pad;
            }
        }
        return str;
    };
    TicTacToe.prototype.updateUI = function () {
        var buttons = document.getElementsByTagName("button");
        var gameOver = this.isGameOver(this.state);
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].innerHTML = this.getPlayerSymbol(this.state[i]);
            if (this.state[i] !== 0 || gameOver) {
                // disable button
                buttons[i].disabled = true;
            }
        }
        this.showMessage("next player: " + this.nextPlayer);
    };
    return TicTacToe;
}());
var game;
function init() {
    game = new TicTacToe(false);
}
