"use strict";
/**
 * Marcelino Pérez Durán
 */

var atrFile;
var valFile;

var addAtrFile = false;
var addValFile = false;

var numAtr = 0;

$(() => {

    cleanAll();

    $("#atr").change(function (event) {
        if (addAtrFile) {
            var r = confirm("Se borrará la tabla actual");
            if (r) {
                cleanAll();
                addValFile = false;
                $('#bAtr').removeClass('selected');
                $('#bVal').removeClass('selected');
            }
        }
        if (!addAtrFile || r) {
            var fileName = $(this).val();
            var fileExt = fileName.split('.').pop();
            if (fileName === '') {
                alert("Nada seleccionado")
                $('#bAtr').removeClass('selected')
            } else {
                if (fileExt !== "txt") {
                    alert("El archivo debe ser .txt")
                    $('#bAtr').removeClass('selected')
                } else {
                    $('#bAtr').addClass("selected");

                    var input = event.target;
                    var fileReader = new FileReader();
                    fileReader.onload = function () {
                        var data = fileReader.result;
                        valFile = fileReader.result.substring(0, 2000);

                        var aux = valFile.trim();
                        //Separa por comas
                        aux = valFile.split(",");

                        if (aux.length < 8) {
                            if (aux.length > 0) {
                                var table = $("table");
                                var row = $("<tr> </tr>");
                                for (var i = 0; i < aux.length; i++) {
                                    if (aux[i] !== "") {
                                        numAtr++;
                                        var col = $("<th>" + aux[i] + "</th>");
                                        row.append(col);
                                    }
                                }
                                table.append(row);
                                addAtrFile = true;
                            } else {
                                cleanAll();
                                $('#bAtr').removeClass('selected');
                                $('#bVal').removeClass('selected');
                                alert("No se ha encontrado ningun atributo");
                                addAtrFile = false;
                                addValFile = false;
                            }
                        } else {
                            cleanAll();
                            $('#bAtr').removeClass('selected');
                            $('#bVal').removeClass('selected');
                            alert("Se han encontrado muchos atributos");
                            addAtrFile = false;
                            addValFile = false;
                        }
                    };
                    fileReader.readAsText(input.files[0]);
                }
            }
        }
    });

    $("#val").change(function (event) {
        if (addValFile) {
            alert("Ya existen datos, cambia los atributos primero");
        }
        else if (addAtrFile) {
            var fileName = $(this).val();
            var fileExt = fileName.split('.').pop();
            if (fileName === '') {
                alert("Nada seleccionado")
                $('#bVal').removeClass('selected')
            } else {
                if (fileExt !== "txt") {
                    alert("El archivo debe ser .txt")
                    $('#bVal').removeClass('selected')
                } else {
                    $('#bVal').addClass("selected");

                    var input = event.target;
                    var fileReader = new FileReader();
                    fileReader.onload = function () {
                        var data = fileReader.result;
                        valFile = fileReader.result.substring(0, 2000);

                        var aux = valFile.trim();
                        //Separa por salto de linea final
                        aux = valFile.split("\r\n");

                        if (aux.length > 0) {
                            var table = $("table");
                            for (var i = 0; i < aux.length; i++) {
                                var row = $("<tr> </tr>");
                                var res = aux[i].split(",");

                                //Borra arrays vacios
                                res = res.filter(function (x) {
                                    return (x !== (undefined || null || ''));
                                });
                                if (res.length > 0) {
                                    if (res.length === numAtr) {
                                        for (var j = 0; j < res.length; j++) {
                                            if (res[j] !== "") {
                                                var col = $("<td>" + res[j] + "</td>");
                                                row.append(col);
                                            }
                                        }
                                        addValFile = true;
                                        table.append(row);
                                    } else {
                                        i = aux.length;
                                        cleanAll();
                                        $('#bVal').removeClass('selected');
                                        $('#bAtr').removeClass('selected');
                                        console.log(res);
                                        alert("Error en el archivo. Más valores que atributos");
                                        addValFile = false;
                                        addAtrFile = false;
                                    }
                                }
                            }
                        } else {
                            cleanAll();
                            $('#bVal').removeClass('selected');
                            $('#bAtr').removeClass('selected');
                            alert("No se ha encontrado ningun valor");
                            addValFile = false;
                            addAtrFile = false;
                        }
                    };
                    fileReader.readAsText(input.files[0]);
                }
            }
        } else {
            alert("Añada primero los atributos");
        }
    });

    $('#calculate').on("click", (event) => {
        //check if doesn't exist attributes or values
        if (addAtrFile && addValFile){
            alert("Correcto!");
        } else {
            alert("Añada antes los datos");
        }
    });

})

/** Remove the last table and clear the text */
function cleanAll() {
    $("table").empty();
    $("#row").val("");
    $("#col").val("");
}

function id3() {

}