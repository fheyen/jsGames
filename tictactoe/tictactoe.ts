/**
 * Main class of this game.
 */
class TicTacToe
{
    private useAi: boolean;
    private state: number[];
    private nextPlayer: number;

    /**
     * Creates a new TicTacToe object.
     * @param useAi if true, player 2 will be played by an artifical intelligence
     */
    constructor(useAi: boolean)
    {
        this.useAi = useAi;
        this.state = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.nextPlayer = 1;
        this.updateUI();
    }

    /**
     * Called if a player has clicked on a button.
     * @param position
     */
    public buttonClicked(position: number): void
    {
        if (this.state[position] !== 0)
        {
            // illegal button press
            return;
        }
        if (!this.isGameOver(this.state))
        {
            console.log(`player ${this.getPlayerSymbol(this.nextPlayer)} chose ${position}`);

            // set state
            this.state[position] = this.nextPlayer;

            // switch player
            this.nextPlayer = this.nextPlayer === 1 ? 2 : 1;

            // let AI play
            if (this.nextPlayer === 2 && this.useAi && !this.isGameOver(this.state))
            {
                // player 2 is the AI
                const decision = this.testDecisionSubtree(this.state, 2, 0).choice;
                this.buttonClicked(decision);
            }
        }
        // show current field
        this.updateUI();

        // show winner if there is one
        if (this.isGameOver(this.state))
        {
            const winner = this.getWinner(this.state);
            if (winner !== -1)
            {
                this.showMessage(`game over!<br><br>winner: ${this.getPlayerSymbol(winner)}`);
            } else
            {
                this.showMessage("game over!<br><br>draw");
            }
        }
    }

    /**
     * Checks if the game is over eihter by winning or draw.
     * @param state
     */
    private isGameOver(state: number[]): boolean
    {
        // check if board is full
        let full: boolean = true;
        for (let i = 0; i < 9; i++)
        {
            if (state[i] === 0)
            {
                full = false;
            }
        }
        if (full)
        {
            return true;
        }

        // check if one player has won
        if (this.getWinner(state) !== -1)
        {
            return true;
        }

        return false;
    }

    /**
     * Returns the number of the winning player or -1 if no winner.
     * @param state
     */
    private getWinner(state: number[]): number
    {
        // check rows
        for (let i = 0; i < 7; i += 3)
        {
            if (state[i] !== 0
                && state[i] === state[i + 1]
                && state[i] === state[i + 2])
            {
                return state[i];
            }
        }
        // check cols
        for (let i = 0; i < 3; i++)
        {
            if (state[i] !== 0
                && state[i] === state[i + 3]
                && state[i] === state[i + 6])
            {
                return state[i];
            }
        }
        // check diagonals
        if (state[4] !== 0)
        {
            if (state[0] === state[4]
                && state[0] === state[8])
            {
                return state[4];
            }
            if (state[2] === state[4]
                && state[2] === state[6])
            {
                return state[4];
            }
        }
        return -1;
    }

    /**
     * Use artificial intelligence to choose best button.
     * Tests all possible outcomes and returns a cost.
     * @param state
     * @param position
     */
    private testDecisionSubtree(
        state: number[],
        player: number,
        recursionDepth: number
    ): { choice: number, cost: number }
    {
        let choice;
        let choices;
        // game over? stop recursion
        if (this.isGameOver(state))
        {
            const winner = this.getWinner(state);
            if (winner === 1)
            {
                // AI would lose
                choice = {
                    choice: -1,
                    cost: 100
                };
            } else if (winner === 0)
            {
                // draw
                choice = {
                    choice: -1,
                    cost: 50
                };
            } else
            {
                // AI would win
                choice = {
                    choice: -1,
                    cost: 0
                };
            }
        } else
        {
            // play for both players alternating
            choices = [];
            for (let i = 0; i < 9; i++)
            {
                // test all free buttons
                if (state[i] === 0)
                {
                    // try a decision
                    const stateAfter = state.slice(0);
                    stateAfter[i] = player;
                    // test the decision
                    const v = this.testDecisionSubtree(
                        stateAfter,
                        player === 1 ? 2 : 1,
                        ++recursionDepth
                    );
                    // remember choices
                    choices[i] = v.cost;
                }
            }
            // player 1 takes max., player 2 takes min.
            let index = -1;
            let value;
            if (player === 1)
            {
                // get max value and corresponding index
                value = -1;
                for (let i = 0; i < choices.length; i++)
                {
                    if (choices[i] > value)
                    {
                        value = choices[i];
                        index = i;
                    }
                }
            } else
            {
                // get max value and corresponding index
                value = 101;
                for (let i = 0; i < choices.length; i++)
                {
                    if (choices[i] < value)
                    {
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
    }

    /**
     * Displays a message on the UI.
     * @param message
     */
    private showMessage(message: string): void
    {
        const element = document.getElementById("message");
        if (element !== null)
        {
            element.innerHTML = message;
        } else
        {
            console.error("#message div not found!");
        }
        console.log(message);
    }

    /**
     * Maps a player number to a symbol.
     * @param player
     */
    private getPlayerSymbol(player: number): string
    {
        switch (player)
        {
            case 1:
                return "X";
            case 2:
                return "O";
            default:
                return "";
        }
    }

    /**
     * Draws the UI.
     */
    private updateUI(): void
    {
        const buttons = document.getElementsByTagName("button");
        const gameOver = this.isGameOver(this.state);

        for (let i = 0; i < buttons.length; i++)
        {
            buttons[i].innerHTML = this.getPlayerSymbol(this.state[i]);
            // disable or enable button
            buttons[i].disabled = this.state[i] !== 0 || gameOver;
        }

        this.showMessage(`next player: ${this.getPlayerSymbol(this.nextPlayer)}`);
    }
}

let t: TicTacToe;
/**
 * Starts a new game.
 * @param isTwoPlayerMode game mode
 */
function initTicTacToe(isTwoPlayerMode: boolean): void
{
    console.log("\n~~~ new game ~~~");
    console.log(isTwoPlayerMode ? "two player mode" : "human vs. AI mode");
    t = new TicTacToe(!isTwoPlayerMode);
}
