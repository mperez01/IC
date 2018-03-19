"use strict";
/**
 * Marcelino Pérez Durán
 */
var startCoord;
var endCoord;
var startNodeMatrix = {
    x: 0,
    y: 0,
    g: 0
};

var endNodeMatrix = {
    x: 0,
    y: 0
}
/** Style, exceeds width screen. If two menu, recommended max 40, if only one menu, 48 */
var maxCol = 48;
var maxRow = 100;
var IsClickDown;

$(() => {

    defaultBoard();

    $('#information').on("click", (event) => {
        alert("Ayuda")
    });


    $("#target").keypress(function () {
        console.log("Handler for .keypress() called.");
    });

    $('#apply').on("click", createBoard);

    /**
     * With this, can create the board pressing "enter" if
     * the cursor is in the input "row" or "col"
     */
    $("#row").keypress(function (e) {
        if (e.which == 13) {
            createBoard();
        }
    });

    $("#col").keypress(function (e) {
        if (e.which == 13) {
            createBoard();
        }
    });
    /******************************************** */

    $('table').on("click", "td", clickBoard);

    /** To draw OBSTACLE (only, no start and end) in the board (no just by clicking) **/
    $('table').mousedown((event) => {
        IsClickDown = true;
        drawObstacle(event);
    });

    /** Mouse up in html better, but this isn't mobile friend */
    $("html").mouseup(() => {
        if (IsClickDown) {
            IsClickDown = false;
        }
    })

    $('table').on("mouseenter", "td", function (event) {
        if (IsClickDown) {
            drawObstacle(event);
        }
    });

    $('table').on("dragstart", (event) => {
        event.preventDefault();
    });
    /**********************************/

    /** Algorithm */
    $('#calculate').on("click", aStar)

    /** Buttons selected or unselected **/
    $('#obs').on("click", () => {
        if ($('#start').hasClass('selected')) {
            $('#start').removeClass('selected')
        }
        if ($('#end').hasClass('selected')) {
            $('#end').removeClass('selected')
        }
        $('#obs').toggleClass("selected");
    })
    $('#start').on("click", () => {
        if ($('#obs').hasClass('selected')) {
            $('#obs').removeClass('selected')
        }
        if ($('#end').hasClass('selected')) {
            $('#end').removeClass('selected')
        }
        $('#start').toggleClass("selected");
    })
    $('#end').on("click", () => {
        if ($('#start').hasClass('selected')) {
            $('#start').removeClass('selected')
        }
        if ($('#obs').hasClass('selected')) {
            $('#obs').removeClass('selected')
        }
        $('#end').toggleClass("selected");
    })
    /****************************************/
})

function aStar() {
    /** Remove the last road */
    $("*").removeClass("road");
    /** First, check if exists start and end coordenate */
    if (startCoord !== null && endCoord !== null) {
        //Getting the board matrix
        mssgAlertRemove();
        var matrix = getMatrix();
        // neighbour
        var openHeap = [];
        var closeHeap = [];
        //First open node is start node
        openHeap.push(startNodeMatrix);
        var find = false;
        var error = false;
        do {
            if (openHeap.length === 0) {
                error = true;
                alert("No hay solución");
            } else {

                var currentNode = openHeap.pop();
                closeHeap.push(currentNode);

                if (currentNode.status === "end") {
                    find = true;
                    console.log("Encotrado")

                    /**
                    * Get all "parents" from curretnNode (end)
                    */
                    var end = false;
                    var search = currentNode;
                    while (!end) {
                        if (search.parent === undefined) {
                            end = true;
                        } else {
                            var myClass = ".r" + search.parent.x + ".c" + search.parent.y;
                            $(String(myClass)).addClass("road");
                            search = search.parent;
                        }
                    }

                } else {
                    var ady = neighbour(matrix, currentNode);
                    for (var i = 0; i < ady.length; i++) {
                        var neig = ady[i];
                        if (!openHeap.includes(neig) && !closeHeap.includes(neig) && neig.status != "start") {
                            neig.parent = currentNode;
                            neig.h = euclidean(neig, endNodeMatrix);
                            neig.g = Number(calulateG(neig, neig.parent.g));
                            // f(x) = g(x) + h(x)
                            neig.f = neig.g + neig.h;
                            openHeap.push(neig);
                        } else if (openHeap.includes(neig) && !closeHeap.includes(neig) && neig.status != "start") {
                            var newG = calulateG(neig, neig.parent.g);
                            var newH = euclidean(neig, endNodeMatrix);
                            var newF = newG + newH;
                            if (newF < neig.f) {
                                neig.f = newF;
                                neig.h = newH;
                                neig.g = newG;
                                neig.parent = currentNode;
                            }
                        }
                    }

                    openHeap.sort(function (obj1, obj2) {
                        // first f(x) less than the previous
                        return obj1.g - obj2.g;
                    });
                    openHeap.reverse();
                }
            }
        } while (!find && !error);

    } else {
        alert("Falta inicio o destino");
    }
}

function calulateG(node, lastG) {
    if (node.isDiagonal) {
        return lastG + Math.sqrt(2);
    } else {
        return lastG + 1;
    }
}

/** 
 * Get the board cells class to create the matrix as array
*/
function getMatrix() {
    let numRows = $("tr").length
    let numColumns = ($($("tr")[0]).children("td").length)
    let matrix = [];

    for (var i = 0; i < numRows; i++) {
        matrix[i] = [];
        for (var j = 0; j < numColumns; j++) {
            if ($($($("tr")[i]).children("td")[j]).hasClass("start")) {
                /**
                 * x = rows, y = columns
                 */

                matrix[i][j] = {
                    status: "start",
                    x: i,
                    y: j,
                    parent: null,
                    f: 0,
                    g: 0,
                    h: 0
                }
                startNodeMatrix.x = i;
                startNodeMatrix.y = j;
            } else if ($($($("tr")[i]).children("td")[j]).hasClass("end")) {
                matrix[i][j] = {
                    status: "end",
                    x: i,
                    y: j,
                    parent: null,
                    f: 0,
                    g: 0,
                    h: 0
                }
                endNodeMatrix.x = i;
                endNodeMatrix.y = j;
            } else if ($($($("tr")[i]).children("td")[j]).hasClass("obstacle")) {
                matrix[i][j] = {
                    status: "obstacle",
                    x: i,
                    y: j,
                    parent: null,
                    f: 0,
                    g: 0,
                    h: 0
                }
            } else {
                matrix[i][j] = {
                    status: "free",
                    x: i,
                    y: j,
                    parent: null,
                    f: 0,
                    g: 0,
                    h: 0
                }
            }
        }
    }
    return matrix;
}

function clickBoard(event) {
    let selected = $(event.target);

    /*** To give style and replace R(row) to F(fila) ***/
    var c = String(selected.attr('class')).toUpperCase();
    c = c.replace("R", "F");
    /**************************************************/
    if ($('#start').hasClass('selected')) {
        if (startCoord === null) {
            if (selected.hasClass("end")) {
                mssgAlert();
            } else {
                startCoord = selected.attr("class");
                $(".coordS").text(" Coordenada de inicio " + c.split(' ')[0] + " " + c.split(' ')[1]);
                selected.toggleClass("start");
                $("*").removeClass("road");
            }
        } else {
            if (selected.hasClass("end")) {
                mssgAlert();
            } else {
                startCoord = selected.attr("class");
                $("td").removeClass("start");
                selected.removeClass("obstacle");
                $(".coordS").text(" Coordenada de inicio " + c.split(' ')[0] + " " + c.split(' ')[1]);
                selected.toggleClass("start");
                $("*").removeClass("road");
            }
        }
    }
    if ($('#end').hasClass('selected')) {
        if (endCoord === null) {
            if (selected.hasClass("start")) {
                mssgAlert();
            } else {
                endCoord = selected.attr("class");
                $(".coordE").text(" Coordenada de destino " + c.split(' ')[0] + " " + c.split(' ')[1]);
                selected.toggleClass("end");
                $("*").removeClass("road");
            }
        } else {
            if (selected.hasClass("start")) {
                mssgAlert();
            } else {
                endCoord = selected.attr("class");
                $("td").removeClass("end");
                selected.removeClass("obstacle");
                $(".coordE").text(" Coordenada de destino " + c.split(' ')[0] + " " + c.split(' ')[1]);
                selected.toggleClass("end");
                $("*").removeClass("road");
            }
        }
    }
}

function drawObstacle(event) {
    let selected = $(event.target);
    //Check if "obstacle" is marked
    mssgAlertRemove();
    if ($('#obs').hasClass('selected')) {
        //if selected has class selected, remove it
        if (selected.hasClass("end") || selected.hasClass("start")) {
            mssgAlert();
        } else {
            selected.toggleClass("obstacle");
            //If exist a road in the board, recalculate the aStar algorithm
            if (selected.hasClass("road")) {
                aStar();
            }
        }
    }
}

function mssgAlert() {
    $(".mssg").addClass("alert");
    $(".mssg").text("No se puede colocar ahí");
}

function mssgAlertRemove() {
    $(".mssg").text("_");
    $(".mssg").removeClass("alert");
}

function defaultBoard() {
    /** Defaults values to the board */
    var rows = 5;
    var columns = 5;
    board(rows, columns);
}

function createBoard(event) {
    //To confirm if the user doesn't want delete the actual board
    var r = confirm("Se borrará el tablero actual");
    if (r === true) {
        /** Getting the value in the fileds **/
        var rows = $("#row").val();
        var columns = $("#col").val();
        /*************************************/
        if (Number(rows) * Number(columns) < 2) {
            alert("Dimensiones muy pequeñas");
        } else if (Number(rows) <= 0 || Number(columns) <= 0) {
            alert("¡Fila y columna no pueden ser 0 ni negativo!");
        } else if (!Number.isInteger(Number(rows)) || !Number.isInteger(Number(columns))) {
            alert("¡Error al introducir los datos!")
        } else if (Number(columns) > maxCol) {
            alert("Máximo " + maxCol + " columnas")
        } else if (Number(rows) > maxRow) {
            alert("Máximo " + maxRow + " filas")
        } else {
            /**Put empty the field value */
            $("#row").val("");
            $("#col").val("");
            /** Create the board */
            board(rows, columns);
        }
    }
}

/**
 * With rows and columns number, create a board with this dimensions
 * @param {*} rows 
 * @param {*} columns 
 */
function board(rows, columns) {
    cleanAll();
    IsClickDown = false;
    startCoord = null;
    endCoord = null;

    startNodeMatrix.x = null;
    startNodeMatrix.y = null;

    endNodeMatrix.x = null;
    endNodeMatrix.y = null;


    $(".infoDim").text("Tablero " + rows + " x " + columns);
    var table = $("table");
    for (var i = 0; i < rows; i++) {
        var row = $("<tr> " + i + "</tr>");
        for (let j = 0; j < columns; j++) {
            var col = $("<td></td>");
            col.addClass("r" + i);
            col.addClass("c" + j);
            row.append(col);
        }
        table.append(row);
    }
    /**
     * Appropriate to differentes size
     */
    if (rows >= 20 || columns >= 20) {
        $('td').css({ "padding": "10px" });
    } else if (rows > 11 || columns > 18) {
        $('td').css({ "padding": "15px" });
    } else if (rows <= 7) {
        $('td').css({ "padding": "30px" });
    } else {
        $('td').css({ "padding": "20px" });
    }
}

/** Remove the last table and clear the text */
function cleanAll() {
    $("table").empty();
    $(".coordS").text('');
    $(".coordE").text('');
    mssgAlertRemove();
    $("#row").val("");
    $("#col").val("");
    $("*").removeClass("road");
}

/**
 * Miramos la distancia euclidea de los ayaccentes del inicio respecto al nodo final
 * distancia de inicio a adyacente + euclidea
 * 
 * Nos quedamos con el de menor coste de todos los adyacentes. Los obstáculos no son adyacentes y se ignoran
 */

/**
 * Matrix, coord 0,0 it's in the top left
 * 
 * @param {*} matrix matrix nodes coord and status
 */
function neighbour(matrix, start) {
    var ady = [];

    var x = start.x;
    var y = start.y;

    // West
    if (matrix[x - 1] && matrix[x - 1][y]) {
        if (matrix[x - 1][y].status != "obstacle") {
            ady.push(matrix[x - 1][y]);
        }
    }

    // East
    if (matrix[x + 1] && matrix[x + 1][y]) {
        if (matrix[x + 1][y].status != "obstacle") {
            ady.push(matrix[x + 1][y]);
        }
    }

    // North
    if (matrix[x] && matrix[x][y - 1]) {
        if (matrix[x][y - 1].status != "obstacle") {
            ady.push(matrix[x][y - 1]);
        }
    }

    // South
    if (matrix[x] && matrix[x][y + 1]) {
        if (matrix[x][y + 1].status != "obstacle") {
            ady.push(matrix[x][y + 1]);
        }
    }

    // -------- DIAGONALS -------------

    // Northwest
    if (matrix[x - 1] && matrix[x - 1][y - 1]) {
        if (matrix[x - 1][y - 1].status != "obstacle") {
            ady.push(matrix[x - 1][y - 1]);
            ady[ady.length - 1].isDiagonal = true;
        }
    }

    // Northheast
    if (matrix[x + 1] && matrix[x + 1][y - 1]) {
        if (matrix[x + 1][y - 1].status != "obstacle") {
            ady.push(matrix[x + 1][y - 1]);
            ady[ady.length - 1].isDiagonal = true;
        }
    }

    // Southwest
    if (matrix[x - 1] && matrix[x - 1][y + 1]) {
        if (matrix[x - 1][y + 1].status != "obstacle") {
            ady.push(matrix[x - 1][y + 1]);
            ady[ady.length - 1].isDiagonal = true;
        }
    }

    // Southeast
    if (matrix[x + 1] && matrix[x + 1][y + 1]) {
        if (matrix[x + 1][y + 1].status != "obstacle") {
            ady.push(matrix[x + 1][y + 1]);
            ady[ady.length - 1].isDiagonal = true;
        }
    }

    // --------------------------------

    return ady;
}

/**
 * Math.Abs(nodoActual.X – nodoFinal.X) + Math.Abs(nodoActual.Y – nodoFinal.Y)
 * 
 * @param {*} pos0 Nodoactual 
 * @param {*} endNodeMatrix nodoFinal
 */
function euclidean(pos0, endNodeMatrix) {
    var d1 = Math.pow((endNodeMatrix.x - pos0.x), 2);
    var d2 = Math.pow((endNodeMatrix.y - pos0.y), 2);
    return Math.sqrt(d1 + d2);
}