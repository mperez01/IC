"use strict";
/**
 * Marcelino Pérez Durán
 */
var startCoord;
var endCoord;

$(() => {
    defaultBoard();
    $('#apply').on("click", createBoard);
    $('table').on("click", "td", clickBoard);

    /** Algorithm */
    $('#calculate').on("click", aStar)

    //Obstacle button selected or unselected
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

})

function aStar() {
    /** First, check if exists start and end coordenate */
    if (startCoord !== null && endCoord !== null) {
        var start = startCoord.split(" ");
        var end = endCoord.split(" ");
    } else {
        alert("Falta inicio o destino");
    }
}

function clickBoard(event) {
    let selected = $(event.target);
    $(".mssg").text("_");
    $(".mssg").removeClass("alert");
    if ($('#start').hasClass('selected')) {
        if (startCoord === null) {
            startCoord = selected.attr("class");
            $(".coordS").text(" Coordenada de inicio " + selected.attr('class'));
            selected.toggleClass("start");
        } else {
            if (selected.hasClass("end")) {
                mssgAlert();
            } else {
                startCoord = selected.attr("class");
                $("td").removeClass("start");
                selected.removeClass("obstacle");
                $(".coordS").text(" Coordenada de inicio " + selected.attr('class'));
                selected.toggleClass("start");
            }
        }
    }
    if ($('#end').hasClass('selected')) {
        if (endCoord === null) {
            endCoord = selected.attr("class");
            $(".coordE").text(" Coordenada de destino " + selected.attr('class'));
            selected.toggleClass("end");
        } else {
            if (selected.hasClass("start")) {
                mssgAlert();
            } else {
                endCoord = selected.attr("class");
                $("td").removeClass("end");
                selected.removeClass("obstacle");
                $(".coordE").text(" Coordenada de destino " + selected.attr('class'));
                selected.toggleClass("end");
            }
        }
    }
    //Check if "obstacle" is marked
    if ($('#obs').hasClass('selected')) {
        //if selected has class selected, remove it
        if (selected.hasClass("end") || selected.hasClass("start")) {
            mssgAlert();
        } else {
            if (selected.hasClass("selected"))
                selected.removeClass("selected");
            selected.toggleClass("obstacle");
        }
    }
}

function mssgAlert() {
    $(".mssg").addClass("alert");
    $(".mssg").text("No se puede colocar ahí");
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

        if (Number(rows) <= 0 || Number(columns) <= 0) {
            alert("¡Fila y columna no pueden ser 0 ni negativo!");
        } else if (!Number.isInteger(Number(rows)) || !Number.isInteger(Number(columns))) {
            alert("¡Error al introducir los datos!")
        } else if (Number(columns) > 25) {
            /** For me screem dimensions **/
            alert("Máximo 25 columnas")
        } else {
            /**Put empty the field value */
            $("#row").val("");
            $("#col").val("");
            /** For that create the board */
            board(rows, columns);
        }
    }
}

/**
 * With a rows and columns number, create a board with this dimensions
 * @param {*} rows 
 * @param {*} columns 
 */
function board(rows, columns) {
    /** Remove the last table and clear the text */
    $("table").empty();
    $(".coordS").text('');
    $(".coordE").text('');
    $(".mssg").text("_");
    $(".mssg").removeClass("alert");
    /*********************************************/
    startCoord = null;
    endCoord = null;

    $(".infoDim").text("Tablero de " + rows + " x " + columns);
    let table = $("table");
    for (let i = 0; i < rows; i++) {
        let row = $("<tr></tr>");
        for (let j = 0; j < columns; j++) {
            let col = $("<td></td>");
            /** Adding class to know the cell position 
             * with attr doesn't work becouse just keep the first **/
            //col.attr('id', i);
            //row.attr('id', j);
            col.addClass("r" + i);
            col.addClass("c" + j);
            row.append(col);
        }
        table.append(row);
    }
}