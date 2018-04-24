"use strict";
/**
 * Marcelino Pérez Durán
 */

var atrFile;
var valFile;

var addAtrFile = false;
var addValFile = false;

var numAtr = 0;

var atr = [];
var val = [];

var nameResult = null;

var numberN = 0;
var data = [];
var tree;

$(() => {

    cleanAll();

    $(document).keyup(function(e) {
        if (e.keyCode == 27) { // escape key maps to keycode `27`
        $("#table").show();
        $("#result").hide();
       }
   });

    $("#atr").change(function (event) {
        if (addAtrFile) {
            var r = confirm("Se borrará la tabla actual");
            if (r) {
                cleanAll();
                location.reload(true);
                /*addValFile = false;
                $('#bAtr').removeClass('selected');
                $('#bVal').removeClass('selected');*/
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

                                        //Borra el final descartable del txt
                                        aux[i] = aux[i].replace("\r\n", "");
                                        //Add the atribute list
                                        atr.push(aux[i]);

                                        var col = $("<th>" + aux[i] + "</th>");
                                        row.append(col);
                                    }
                                }
                                table.append(row);
                                addAtrFile = true;
                            } else {
                                cleanAll();
                                alert("No se ha encontrado ningun atributo");
                            }
                        } else {
                            cleanAll();
                            alert("Se han encontrado muchos atributos");
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
                                        //Add the values list
                                        val.push(res);
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
                                        alert("Error en el archivo. Más valores que atributos");
                                    }
                                }
                            }
                        } else {
                            cleanAll();
                            alert("No se ha encontrado ningun valor");
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
        if (addAtrFile && addValFile) {
            id3();
        } else {
            alert("Añada antes los datos");
        }
    });

})

/** Remove the last table and clear the text */
function cleanAll() {
    $("#result").hide();
    $("#table").show();
    $("#table").empty();
    $("#row").val("");
    $("#col").val("");

    $('#bAtr').removeClass('selected');
    $('#bVal').removeClass('selected');
    atr = [];
    val = [];
    addAtrFile = false;
    addValFile = false;
}

function id3() {
    $("#result > div").remove();
    $("#result > h2").remove();
    //nameResult save the name of the last attribute, that is the result
    nameResult = atr[atr.length - 1];
    data = startValues();

    let min = getID3(data);
    let branches = getBranchesFromMin(min, data);
    tree = setTree(branches, min, data);
    let position = [];  //almacenamos las claves del arbol para llegar a rec
    let dat = checkIfRecExists(tree, position);
    position = position.reverse();
    while (dat) {
        let min = getID3(dat);
        let branches = getBranchesFromMin(min, dat);
        let treeBranch = setTree(branches, min, dat);
        setPositionTreeBranch(tree, treeBranch, position)
        position = [];
        dat = checkIfRecExists(tree, position);
        position = position.reverse();
    }

    $("#table").hide();
    $("#result").show();
    $('#result').append($("<h2/>").text("Mérito de atributos"))
    getID3(data, true);
    $('#result').append($("<h2/>").text("Árbol de decisión"))
    iterate(tree, '');

}

function iterate(obj, stack) {
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] === "object") {
                iterate(obj[property], stack + ' -> ' + property);
            } else {
                $('#result').append($("<div/>").text(stack + ' -> ' + property + " -> " + obj[property]))
            }
        }
    }
}

function getID3(pData, mostrar) {
    var p = getPValue(pData);
    var n = getNValue(p);
    var r = getRValue(p, n);
    var merit = {};
    var min = null;
    Object.keys(p).forEach(elem => {
        merit[elem] = getMerit(r[elem], p[elem], n[elem]);
        if (min === null)
            min = elem;
        else if (merit[min] > merit[elem]) {
            min = elem;
        }
        if (mostrar)
            $('#result').append($("<div class='merito'/>").text("Mérito de " + elem  + " = " +  merit[elem]));
    });
    return min;
}

function startValues() {
    var data = [];
    for (var i = 0; i < val.length; i++) {
        data[i] = {};
        atr.forEach((element, index) => {
            data[i][element] = val[i][index];
        });
    }
    numberN = data.length;
    return data;
}

function getPValue(data) {
    var p = {};
    data.forEach(elem => {
        Object.keys(elem).forEach(key => {
            var value = elem[key];
            if (key !== nameResult) {
                if (!p[key])
                    p[key] = {};
                if (!p[key][value]) {
                    p[key][value] = {};
                    p[key][value]["numerator"] = 0;
                    p[key][value]["denominator"] = 0;
                }
                if (String(elem[nameResult]).toLowerCase() === "si" || String(elem[nameResult]).toLowerCase() === "sí"
                    || String(elem[nameResult]).toLowerCase() === "+")
                    p[key][value]["numerator"]++;
                p[key][value]["denominator"]++;
            }
        });
    });
    return p;
}

function getNValue(p) {
    var n = {};
    Object.keys(p).forEach(elem => {
        Object.keys(p[elem]).forEach(key => {
            if (!n[elem])
                n[elem] = {};
            n[elem][key] = {};
            n[elem][key]["numerator"] = p[elem][key]["denominator"] - p[elem][key]["numerator"];
            n[elem][key]["denominator"] = p[elem][key]["denominator"];
        });
    });
    return n;
}

function getRValue(p, n) {
    var r = {};
    Object.keys(p).forEach(elem => {
        Object.keys(p[elem]).forEach(key => {
            if (!r[elem])
                r[elem] = {};
            r[elem][key] = {};
            r[elem][key]["numerator"] = p[elem][key]["numerator"] + n[elem][key]["numerator"];
            r[elem][key]["denominator"] = numberN;
        });
    });
    return r;
}


function entropia(p, n) {
    if (p === 0)
        p = 1;
    if (n === 0)
        n = 1;
    return -p * Math.log2(p) - n * Math.log2(n);
}

function getMerit(rs, ps, ns) {
    var result = 0;
    Object.keys(rs).forEach(key => {
        result += rs[key]["numerator"] / rs[key]["denominator"] *
            entropia(ps[key]["numerator"] / ps[key]["denominator"], ns[key]["numerator"] / ns[key]["denominator"])
    });
    return result;
}

function setPositionTreeBranch(treePosition, treeBranch, position) {
    if (position.length > 1) { 
        var key = position.pop();
        setPositionTreeBranch(treePosition[key], treeBranch, position);
    }
    else if (position.length == 1) {
        var key = position.pop();
        treePosition[key] = treeBranch;
    }
}

function getBranchesFromMin(min, parsedData) {
    var branches = {};
    parsedData.forEach(data => {
        var res = data[nameResult];
        var dat = [data[min]];
        if (!branches[dat])
            branches[dat] = {};
        if (!branches[dat][res]) {
            branches[dat][res] = 0;
            branches[dat][res]++;
        }
    });
    return branches;
}

function setTree(branches, min, parsedData) {
    var res = {};
    res[min] = {};
    var keys = Object.keys(branches);
    keys.forEach((k, index) => {
        var result = Object.keys(branches[k]);
        if (result.length > 1) {
            res[min][k] = {};
            res[min][k].parsedData = setNewData(min, k, parsedData);
            res[min][k].rec = true;
        }
        else {
            res[min][k] = result[0];
        }

    });
    return res;
}

function setNewData(key, value, parsedData) {
    var result = [];
    parsedData.forEach((data, index) => {
        if (data[key] === value) {
            var dataKeys = Object.keys(data);
            var pushThis = {};
            dataKeys.forEach(dataKey => {
                if (dataKey !== key)
                    pushThis[dataKey] = data[dataKey];
            })
            result.push(pushThis);
        }
    });
    return result;
}

function checkIfRecExists(object, position) {
    if (typeof (object) !== "object")
        return false;
    else {
        var keys = Object.keys(object);
        var i = 0;
        var found = false;
        while (i < keys.length && !found) {
            var item = object[keys[i]];
            if (item.rec) {
                position.push(keys[i]);
                found = getDataObject(item);
                item.rec = false;
            }
            else {
                position.push(keys[i]);
                found = checkIfRecExists(item, position);
                if (!found)
                    position.pop();
            }
            i++;
        }
        return found;
    }
}

function getDataObject(object) {
    var keys = Object.keys(object);
    if (keys[0] === "rec")
        return object[keys[1]];
    return object[keys[0]];
}

function getDataResult(d) {
    var result = false;
    var key;
    var valu;
    var branch = tree;
    var treeKeys;
    while (!result) {
        if (typeof (branch) === "object") {
            treeKeys = Object.keys(branch);
            if (treeKeys.length === 1) {
                key = treeKeys[0];
                valu = d[key];
                branch = branch[key];
            }
            else {
                key = valu;
                branch = branch[key];
                if (typeof (branch) !== "object") {
                    result = true;
                    valu = branch;
                }
            }
        }
    }
    return valu;
}
