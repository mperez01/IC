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

    $(document).keyup(function (e) {
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

function id3() { $("#result > div").remove(), nameResult = atr[atr.length - 1], data = startValues(); let e = getID3(data), t = getBranchesFromMin(e, data); tree = setTree(t, e, data); let r = [], n = checkIfRecExists(tree, r); for (r = r.reverse(); n;) { let e = getID3(n), t = setTree(getBranchesFromMin(e, n), e, n); setATreeBranchInPosition(tree, t, r), r = [], n = checkIfRecExists(tree, r), r = r.reverse() } $("#table").hide(), $("#result").show(), getID3(data, !0), iterate(tree, "") } function iterate(e, t) { for (var r in e) e.hasOwnProperty(r) && ("object" == typeof e[r] ? iterate(e[r], t + " -> " + r) : $("#result").append($("<div/>").text(t + " -> " + r + " -> " + e[r]))) } function getID3(e, t) { let r = getP(e), n = getN(r), o = getR(r, n), a = {}, c = null; return Object.keys(r).forEach(e => { a[e] = getMerit(o[e], r[e], n[e]), null === c ? c = e : a[c] > a[e] && (c = e), t && $("#result").append($("<div class='merito'/>").text("Mérito de " + e + " = " + a[e])) }), c } function startValues() { for (var e = [], t = 0; t < val.length; t++)e[t] = {}, atr.forEach((r, n) => { e[t][r] = val[t][n] }); return numberN = e.length, e } function getP(e) { let t = {}; return e.forEach(e => { Object.keys(e).forEach(r => { let n = e[r]; r !== nameResult && (t[r] || (t[r] = {}), t[r][n] || (t[r][n] = {}, t[r][n].numerator = 0, t[r][n].denominator = 0), "si" !== String(e[nameResult]).toLowerCase() && "sí" !== String(e[nameResult]).toLowerCase() && "+" !== String(e[nameResult]).toLowerCase() || t[r][n].numerator++ , t[r][n].denominator++) }) }), t } function getN(e) { let t = {}; return Object.keys(e).forEach(r => { Object.keys(e[r]).forEach(n => { t[r] || (t[r] = {}), t[r][n] = {}, t[r][n].numerator = e[r][n].denominator - e[r][n].numerator, t[r][n].denominator = e[r][n].denominator }) }), t } function getR(e, t) { let r = {}; return Object.keys(e).forEach(n => { Object.keys(e[n]).forEach(o => { r[n] || (r[n] = {}), r[n][o] = {}, r[n][o].numerator = e[n][o].numerator + t[n][o].numerator, r[n][o].denominator = numberN }) }), r } function entropia(e, t) { return 0 === e && (e = 1), 0 === t && (t = 1), -e * Math.log2(e) - t * Math.log2(t) } function getMerit(e, t, r) { let n = 0; return Object.keys(e).forEach(o => { n += e[o].numerator / e[o].denominator * entropia(t[o].numerator / t[o].denominator, r[o].numerator / r[o].denominator) }), n } function setATreeBranchInPosition(e, t, r) { if (r.length > 1) { setATreeBranchInPosition(e[r.pop()], t, r) } else if (1 == r.length) { e[r.pop()] = t } } function getBranchesFromMin(e, t) { let r = {}; return t.forEach(t => { let n = t[nameResult], o = [t[e]]; r[o] || (r[o] = {}), r[o][n] || (r[o][n] = 0, r[o][n]++) }), r } function setTree(e, t, r) { let n = {}; return n[t] = {}, Object.keys(e).forEach((o, a) => { let c = Object.keys(e[o]); c.length > 1 ? (n[t][o] = {}, n[t][o].parsedData = setNewParsedData(t, o, r), n[t][o].rec = !0) : n[t][o] = c[0] }), n } function setNewParsedData(e, t, r) { let n = []; return r.forEach((r, o) => { if (r[e] === t) { let t = Object.keys(r), o = {}; t.forEach(t => { t !== e && (o[t] = r[t]) }), n.push(o) } }), n } function checkIfRecExists(e, t) { if ("object" != typeof e) return !1; { let r = Object.keys(e), n = 0, o = !1; for (; n < r.length && !o;) { let a = e[r[n]]; a.rec ? (t.push(r[n]), o = getDataFromObject(a), a.rec = !1) : (t.push(r[n]), (o = checkIfRecExists(a, t)) || t.pop()), n++ } return o } } function getDataFromObject(e) { let t = Object.keys(e); return "rec" === t[0] ? e[t[1]] : e[t[0]] } function getResultFromData(e) { let t, r, n, o = !1, a = tree; for (; !o;)"object" == typeof a && (1 === (n = Object.keys(a)).length ? (r = e[t = n[0]], a = a[t]) : "object" != typeof (a = a[t = r]) && (o = !0, r = a)); return r }
