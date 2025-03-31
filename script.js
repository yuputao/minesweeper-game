class Minesweeper {
    constructor(rows, cols, mines) {
        this.rows = rows;
        this.cols = cols;
        this.mines = mines;
        this.board = [];
        this.gameOver = false;
        this.timeStarted = false;
        this.timer = 0;
        this.timerInterval = null;
        this.remainingMines = mines;
        
        this.init();
    }

    init() {
        // 初始化空板
        this.board = Array(this.rows).fill().map(() => 
            Array(this.cols).fill().map(() => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            }))
        );

        // 随机放置地雷
        let minesPlaced = 0;
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            if (!this.board[row][col].isMine) {
                this.board[row][col].isMine = true;
                minesPlaced++;
            }
        }

        // 计算每个格子周围的地雷数
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.board[row][col].isMine) {
                    this.board[row][col].neighborMines = this.countNeighborMines(row, col);
                }
            }
        }

        this.renderBoard();
        this.updateMineCount();
    }

    countNeighborMines(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < this.rows && 
                    newCol >= 0 && newCol < this.cols && 
                    this.board[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
        return count;
    }

    renderBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, 30px)`;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                if (this.board[row][col].isRevealed) {
                    cell.classList.add('revealed');
                    if (this.board[row][col].isMine) {
                        cell.classList.add('mine');
                        cell.textContent = '💣';
                    } else if (this.board[row][col].neighborMines > 0) {
                        cell.textContent = this.board[row][col].neighborMines;
                        cell.dataset.number = this.board[row][col].neighborMines;
                    }
                } else if (this.board[row][col].isFlagged) {
                    cell.classList.add('flagged');
                    cell.textContent = '🚩';
                }

                cell.addEventListener('click', (e) => this.handleClick(row, col));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(row, col);
                });

                gameBoard.appendChild(cell);
            }
        }
    }

    handleClick(row, col) {
        if (this.gameOver || this.board[row][col].isFlagged) return;

        if (!this.timeStarted) {
            this.startTimer();
            this.timeStarted = true;
        }

        if (this.board[row][col].isMine) {
            this.gameOver = true;
            this.revealAll();
            clearInterval(this.timerInterval);
            alert('Game Over!');
            return;
        }

        this.reveal(row, col);
        this.renderBoard();

        if (this.checkWin()) {
            this.gameOver = true;
            clearInterval(this.timerInterval);
            alert('Congratulations! You won!');
        }
    }

    handleRightClick(row, col) {
        if (this.gameOver || this.board[row][col].isRevealed) return;

        this.board[row][col].isFlagged = !this.board[row][col].isFlagged;
        this.remainingMines += this.board[row][col].isFlagged ? -1 : 1;
        this.updateMineCount();
        this.renderBoard();

        if (this.checkWin()) {
            this.gameOver = true;
            clearInterval(this.timerInterval);
            alert('Congratulations! You won!');
        }
    }

    reveal(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols || 
            this.board[row][col].isRevealed || this.board[row][col].isFlagged) {
            return;
        }

        this.board[row][col].isRevealed = true;

        if (this.board[row][col].neighborMines === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    this.reveal(row + i, col + j);
                }
            }
        }
    }

    revealAll() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col].isRevealed = true;
                this.board[row][col].isFlagged = false;
            }
        }
        this.renderBoard();
    }

    checkWin() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col].isMine && !this.board[row][col].isFlagged) {
                    return false;
                }
                if (!this.board[row][col].isMine && !this.board[row][col].isRevealed) {
                    return false;
                }
            }
        }
        return true;
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            document.getElementById('timer').textContent = this.timer;
        }, 1000);
    }

    updateMineCount() {
        document.getElementById('mineCount').textContent = this.remainingMines;
    }
}

// 游戏配置
const configs = {
    easy: { rows: 9, cols: 9, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 30, mines: 99 }
};

let game = new Minesweeper(9, 9, 10); // 默认简单模式

// 事件监听器
document.getElementById('easyBtn').addEventListener('click', () => {
    game = new Minesweeper(configs.easy.rows, configs.easy.cols, configs.easy.mines);
    game.renderBoard();
});

document.getElementById('mediumBtn').addEventListener('click', () => {
    game = new Minesweeper(configs.medium.rows, configs.medium.cols, configs.medium.mines);
    game.renderBoard();
});

document.getElementById('hardBtn').addEventListener('click', () => {
    game = new Minesweeper(configs.hard.rows, configs.hard.cols, configs.hard.mines);
    game.renderBoard();
});

document.getElementById('newGameBtn').addEventListener('click', () => {
    game = new Minesweeper(game.rows, game.cols, game.mines);
    game.renderBoard();
});