class TicTacToe {
    useAi: boolean;
    state: Array<number>;
    /**
     * Creates a new TicTacToe object.
     * @param useAi if true, player 2 will be played by an artifical intelligence
     */
    constructor(useAi: boolean) {
        this.useAi = useAi;
        this.state = (new Array(9)).fill(0);
        this.updateUI();
    }

    /**
     * Checks if the game is over.
     * @param state
     */
    isGameOver(state: Array<number>): boolean {


        return false;
    }

    /**
     * Returns the number of the winning player or null if no winner.
     * @param state
     */
    getWinner(state: Array<number>): number {

        return null;
    }

    /**
     * Called if a player has clicked on a button.
     * @param position
     */
    buttonClicked(position: number): void {
        if (!this.isGameOver(this.state)) {

        }
        // show current field
        this.updateUI();

        // show winner if there is one
        if (this.isGameOver(this.state)) {
            let winner = this.getWinner(this.state);
            if (winner !== null) {
                this.showMessage(`game over!<br><br>winner: ${this.getPlayerSymbol(winner)}`);
            } else {
                this.showMessage("game over!<br><br>draw");
            }
        }
    }


    /**
     * Displays a message on the UI.
     * @param message
     */
    showMessage(message: string): void {
        document.getElementById("message").innerHTML = message;
        console.log(message);
    }

    /**
     * Draws the UI.
     */
    updateUI(): void {
        let buttons = document.getElementsByTagName("button");
        let gameOver = this.isGameOver(this.state);

        for (let i = 0; i < buttons.length; i++) {
            buttons[i].innerHTML = this.getPlayerSymbol(this.state[i]);
            // disable or enable button
            buttons[i].disabled = this.state[i] !== 0 || gameOver;
        }

        this.showMessage(`next player: ${this.getPlayerSymbol(this.nextPlayer)}`);
    }
}

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