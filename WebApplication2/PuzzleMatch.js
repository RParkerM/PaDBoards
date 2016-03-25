﻿(function () {
    //current constants for board and tile widths... 
    //TODO: put this in a seperate file?
    var BOARD_HEIGHT = 5;
    var BOARD_WIDTH = 6;
    var TILE_HEIGHT = 40;
    var TILE_WIDTH = 40;

    var blockTypes = 6;

    var canvasInfo;
    var canvas;
    var ctx;
    var lastTime;

    var tileImage;
    
    var selectedBlock = null;
    var lastMousePos = null;

    var TILE_SELECT_SIZE_MOD = 1.3;

    var board;


    function block(type, column, row)
    {
        this.column = column;
        this.row = row;
        this.type = type;
        this.selected = false;

        this.description = function () {
            return "Block type: " + this.type + " Position: " + this.row + "," + this.column + ".";
        };

        this.draw = function (context) { //relies on ctx, tileImage, TILE_WIDTH, TILE_HEIGHT
            context.save();
            if(this.selected == true) context.globalAlpha = 0.5;
            context.drawImage(tileImage, this.type * TILE_WIDTH, 0, TILE_WIDTH, TILE_HEIGHT, this.column * TILE_WIDTH, this.row * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
            //format is ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            context.restore();
        };

        this.select = function () {
            this.selected = true;
        };
        
        this.unselect = function () {
            this.selected = false;
        };        
    }

    function board2(boardHeight, boardWidth, tileHeight, tileWidth, tileImage) { //also relies on blockTypes, variable for how many types
        var self = this;
        //private properties
        var tileWidth = tileWidth;
        var tileHeight = tileHeight;
        var tileImage = tileImage;

        var numRows = boardHeight;
        var numColumns = boardWidth;

        var field = {};

        var findHorizontalMatches  = function () {

        };

        var shuffle = function () {
            console.log("this.numRows:", numRows, "this.numColumns", numColumns, "this:", self);
            for (var y = 0; y < numRows; y++) {
                for (var x = 0; x < numColumns; x++) {
                    do {
                        var blockType = Math.floor(Math.random() * blockTypes);
                    } while ((x >= 2 && blockType == field[y * numColumns + x - 1] && blockType == field[y * numColumns + x - 2])
                        || (y >= 2 && blockType == field[(y - 1) * numColumns + x] && blockType == field[(y - 2) * numColumns + x]));
                    field[y * numColumns + x] = new block((blockType), x, y);
                    //console.log(field[y * numColumns + x], "field");
                }
            }
        };

        //public properties
        this.numRows = boardHeight;
        this.numColumns = boardWidth;
        this.init = function () {
            field.length = this.numRows * this.numColumns;
            shuffle();
            for(var i = 0; i < field.length; i++)
            {
                console.log(field[i]);
            }
        };

        this.draw = function (context) {
            context.fillStyle = "#000";
            context.fillRect(0, 0, this.numColumns * TILE_WIDTH, this.numRows * TILE_HEIGHT);
            for (var i = 0; i < field.length; i++) {

                field[i].draw(context);
                //ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            }
        };

        this.getBlock = function (row, column) { //expects row and column, returns the block or null
            if (column >= 0 && column < this.numColumns && row >= 0 && row >= 0 && row < this.numRows) {
                return field[row * this.numColumns + column];
            }
            console.log("Row, column:", row, column, "=null");
            return null;
        };
        this.setBlock = function (row, column, block) {
            if (column >= 0 && column < this.numColumns && row >= 0 && row < this.numRows) {
                field[row * this.numColumns + column] = block;
            }
        };

        this.swapBlocks = function (block1, block2) {
            console.log("block1:", block1, "block2:", block2);
            var tempRow = block1.row;
            var tempCol = block1.column;
            block1.row = block2.row;
            block1.column = block2.column;
            block2.row = tempRow;
            block2.column = tempCol;

            this.setBlock(block1.row, block1.column, block1);
            this.setBlock(block2.row, block2.column, block2);
        };

        this.solveBoard = function () {

        };

        this.mouseToBlockCoords = function (coords) { // Expects x and y properties. Returns object with row and column properties
            var col = Math.floor(coords.x / tileWidth);
            var row = Math.floor(coords.y / tileHeight);
            if (row < 0) {
                row = 0;
            }
            else if (row >= this.numRows) {
                row = this.numRows - 1;
            }
            if (col < 0) {
                col = 0;
            }
            else if (col >= this.numColumns) {
                col = this.numColumns - 1;
            }
            return { "row": row, "column": col };
        };
    }

    function solveBoard()
    {

    }

    function drawBoard(context) //relies on ctx. this should be in board.... 
    {
        context.fillStyle = "#000";
        context.fillRect(0, 0, board.numColumns * TILE_WIDTH, board.numRows * TILE_HEIGHT);
        for(var i = 0; i < board.field.length; i++)
        {
            
            board.field[i].draw(context);
            //ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        }
    }

    function drawSelectedBlock() //this relies 
    {
        if(selectedBlock)
        {
            ctx.save();
            ctx.globalAlpha = 0.8;
            ctx.drawImage(tileImage, selectedBlock.type * TILE_WIDTH, 0, TILE_WIDTH, TILE_HEIGHT, lastMousePos.x - TILE_WIDTH * TILE_SELECT_SIZE_MOD / 2, lastMousePos.y - TILE_HEIGHT * TILE_SELECT_SIZE_MOD / 2, TILE_WIDTH * TILE_SELECT_SIZE_MOD, TILE_HEIGHT * TILE_SELECT_SIZE_MOD)
            ctx.restore();
        }
    }

    function render() // this relies on board and drawselected block
    {
        //drawBoard(ctx);
        board.draw(ctx);
        drawSelectedBlock();
    }

    function update()
    {
        if(selectedBlock)
        {
            var coords = board.mouseToBlockCoords(lastMousePos);
            if(coords.row != selectedBlock.row || coords.column != selectedBlock.column)
            {
                console.log("over a dif block", coords);
                board.swapBlocks(selectedBlock, board.getBlock(coords.row, coords.column));
            }
        }
    }

    function gameLoop()
    {
        var now = Date.now();
        var dt = (now - lastTime) / 1000;

        update(dt);
        render();

        lastTime = now;
        requestAnimationFrame(gameLoop);
    }

    function startGame()
    {
        console.log("ran startGame()");
        if(window.resources.resourcesLoaded() == true)
        {   
            tileImage = window.resources.images["tileImage"];
            board = new board2(BOARD_HEIGHT, BOARD_WIDTH, TILE_HEIGHT, TILE_WIDTH, tileImage);
            initCanvas();
            board.init();
            gameLoop();
        }
        else{
            requestAnimationFrame(startGame);
        }
    }

    function getMousePos(canvas, evt)
    {
        var rect = canvas.getBoundingClientRect();
        return {
            "x": evt.clientX - rect.left,
            "y": evt.clientY - rect.top
        };
    }
    
    function onMouseMove(e)
    {
        var mouse = getMousePos(canvas, e);
        lastMousePos = mouse;
    }

    function onMouseDown(e)
    {
        console.log(e);
        var mouse = getMousePos(canvas, e);
        lastMousePos = mouse;
        //var row = Math.floor(mouse.y / TILE_HEIGHT);
        //var col = Math.floor(mouse.x / TILE_WIDTH);
        var pos = board.mouseToBlockCoords(mouse);
        selectedBlock = board.getBlock(pos.row, pos.column);
        selectedBlock.select();
        console.log(selectedBlock.description());
    }

    function onMouseUp(e)
    {
        if (selectedBlock)
        {
            selectedBlock.unselect();
            selectedBlock = null;
        }
    }

    function initCanvas()
    {
        canvas.onmousedown = onMouseDown;
        window.onmouseup = onMouseUp;
        window.onmousemove = onMouseMove;

        canvas.width = TILE_WIDTH * board.numColumns;
        canvas.height = TILE_HEIGHT * board.numRows;
    }

    function init()
    {
        window.resources.loadResources();

        

        canvasInfo = this.canvasInfo;
        canvas = canvasInfo.canvas;
        ctx = canvasInfo.ctx;

        lastTime = this.lastTime;

        

        startGame();
    }

   // var game = { "init": init };
    //window.puzzmatch = game;
    if(window.puzzmatch == null || typeof window.puzzmatch !== 'object')
    {
        window.puzzmatch = {};
    }
    window.puzzmatch.init = init;
})();