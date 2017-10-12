"use strict";
var TicTacToe = (function () {
    function TicTacToe(useAi) {
        this.useAi = useAi;
        this.state = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.nextPlayer = 1;
        this.updateUI();
    }
    TicTacToe.prototype.isGameOver = function (state) {
        var full = true;
        for (var i = 0; i < 9; i++) {
            if (state[i] === 0) {
                full = false;
            }
        }
        if (full) {
            return true;
        }
        if (this.getWinner(state) !== -1) {
            return true;
        }
        return false;
    };
    TicTacToe.prototype.getWinner = function (state) {
        for (var i = 0; i < 7; i += 3) {
            if (state[i] !== 0
                && state[i] === state[i + 1]
                && state[i] === state[i + 2]) {
                return state[i];
            }
        }
        for (var i = 0; i < 3; i++) {
            if (state[i] !== 0
                && state[i] === state[i + 3]
                && state[i] === state[i + 6]) {
                return state[i];
            }
        }
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
        return -1;
    };
    TicTacToe.prototype.buttonClicked = function (position) {
        if (this.state[position] !== 0) {
            return;
        }
        if (!this.isGameOver(this.state)) {
            console.log("player " + this.getPlayerSymbol(this.nextPlayer) + " chose " + position);
            this.state[position] = this.nextPlayer;
            this.nextPlayer = this.nextPlayer === 1 ? 2 : 1;
            if (this.nextPlayer === 2 && this.useAi && !this.isGameOver(this.state)) {
                var decision = this.testDecisionSubtree(this.state, 2, 0).choice;
                this.buttonClicked(decision);
            }
        }
        this.updateUI();
        if (this.isGameOver(this.state)) {
            var winner = this.getWinner(this.state);
            if (winner !== -1) {
                this.showMessage("game over!<br><br>winner: " + this.getPlayerSymbol(winner));
            }
            else {
                this.showMessage("game over!<br><br>draw");
            }
        }
    };
    TicTacToe.prototype.testDecisionSubtree = function (state, player, recursionDepth) {
        var choice;
        var choices;
        if (this.isGameOver(state)) {
            var winner = this.getWinner(state);
            if (winner === 1) {
                choice = {
                    choice: null,
                    cost: 100
                };
            }
            else if (winner === 0) {
                choice = {
                    choice: null,
                    cost: 50
                };
            }
            else {
                choice = {
                    choice: null,
                    cost: 0
                };
            }
        }
        else {
            choices = [];
            for (var i = 0; i < 9; i++) {
                if (state[i] === 0) {
                    var stateAfter = state.slice(0);
                    stateAfter[i] = player;
                    var value_1 = this.testDecisionSubtree(stateAfter, player === 1 ? 2 : 1, ++recursionDepth);
                    choices[i] = value_1.cost;
                }
            }
            var index = -1;
            var value = void 0;
            if (player === 1) {
                value = -1;
                for (var i = 0; i < choices.length; i++) {
                    if (choices[i] > value) {
                        value = choices[i];
                        index = i;
                    }
                }
            }
            else {
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
    TicTacToe.prototype.showMessage = function (message) {
        var element = document.getElementById("message");
        if (element !== null) {
            element.innerHTML = message;
        }
        else {
            console.error("#message div not found!");
        }
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
    TicTacToe.prototype.updateUI = function () {
        var buttons = document.getElementsByTagName("button");
        var gameOver = this.isGameOver(this.state);
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].innerHTML = this.getPlayerSymbol(this.state[i]);
            buttons[i].disabled = this.state[i] !== 0 || gameOver;
        }
        this.showMessage("next player: " + this.getPlayerSymbol(this.nextPlayer));
    };
    return TicTacToe;
}());
var t;
function initTicTacToe(isTwoPlayerMode) {
    console.log("\n~~~ new game ~~~");
    console.log(isTwoPlayerMode ? "two player mode" : "human vs. AI mode");
    t = new TicTacToe(!isTwoPlayerMode);
}
