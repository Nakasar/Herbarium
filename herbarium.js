/**
 * Created by Kevin Thizy on 13/01/2017.
 */

var qualityList = new Map();
qualityList.set("rare", 0.1);
qualityList.set("non commune", 0.2);
qualityList.set("commune", 0.3);
qualityList.set("abondante", 0.5);

var colorList = new Set(["blue", "red", "yellow", "gray", "orange", "pink", "lightblue", "green", "lightgreen", "black"]);
buildColorSelector(colorList);

// Classes
/**
 * Area(name, adges, type, quality, color)
 * Represents an area of the map.
 */
class Area {
    constructor(name, edges, type, quality, color) {
        this.name = name;
        this.edges = edges;
        this.type = type;
        if(!quality) {
            quality = "commune"
        }
        this.quality = quality;
        this.color = color;
        this.show = false;
        this.polygonId = -1;
    }

    /**
     * Print information about the Area.
     * @returns {string}
     */
    toString() {
        return this.name + " - " + this.type + " : " + this.edges + ", with id " + this.polygonId;
    }

    /**
     * Display the area on the map
     */
    display() {
        this.show = true;
        if(this.polygonId == -1) {
            // Create a new polygon
            this.polygonId = areasPolygons.length ;
            areasPolygons.push(L.polygon(this.edges, {
                fillOpacity: qualityList.get(this.quality),
                opacity: qualityList.get(this.quality) + 0.1,
                color: colors.get(this.type)
            }).bindTooltip(this.quality + " : " + this.polygonId).on("contextmenu", this.delete)); //TODO : Delete area
        }
        // Then, display the polygon
        areasPolygons[this.polygonId].addTo(map);
    }

    /**
     * Hide the area from the map
     */
    hide() {
        this.show = false;
        map.removeLayer(areasPolygons[this.polygonId]);
    }

    /**
     * TODO : Delete Area
     */
    delete(e) {
        if(statusToolDelete) {
            var id = areasPolygons.indexOf(e.target);
            for (let a of areas) {
                if (a.polygonId == id) {
                    var area = a
                }
            }
            area.hide();
            areas.splice(areas.indexOf(area), 1);
            mapData.areas.splice(mapData.areas.indexOf(area), 1);
        }
    }
}

// Include Leaflet librairy
var map;

// Close and Open SideBar
var sidebarClosed = false;
function sidebarClose() {
    $("#sidebar").animate({
        width: "0"
    }, 500, function() {
        map.invalidateSize();
    });
    $("#sidebarswitch").removeClass("glyphicon-menu-left").addClass("glyphicon-menu-right");
    sidebarClosed = true;
}
function sidebarOpen() {
    $("#sidebar").animate({
        width: "300"
    }, 500, function() {
        map.invalidateSize();
    });
    $("#sidebarswitch").removeClass("glyphicon-menu-right").addClass("glyphicon-menu-left");
    sidebarClosed = false;
}
function sidebarSwitch() {
    if(sidebarClosed) {
        sidebarOpen();
    }
    else {
        sidebarClose();
    }
}

// Geographical coordinates to XY
var yx = L.latLng;
var xy = function(x, y) {
    if (L.Util.isArray(x)) { // When typing xy([x, y])
        return yx(x[1], x[0]);
    }
    return yx(y, x); // When typing xy(x, y)
}

// USEFULL FONCTIONS FOR MAP USE

/** Delete Objects from the map interface.
 *
 * @param objects -> Arrey of objects to delete from the map view
 */
function hideObjects(objects) {
    if(objects.length > 0) {
        for (i = 0; i < objects.length; i++) {
            map.removeLayer(objects[i]);
        }
    }
}
function saveMap() {
    mapData.areas = areas;
    var text = "data:text/json;charset=utf-8,storedMaps='" + encodeURIComponent(JSON.stringify(mapData)) + "'";
    $("#downloadMap").attr({
        "href": text,
        "download": "savMap.json"
    });
    document.getElementById("downloadMap").click();
}
function displayObjects(objects) {
    for(i=0; i < objects.length; i++) {
        objects[i].display();
    }
}
function showAreas(areatype) {
    for(var i=0, area; area = areas[i]; i++) {
        if(area.type == areatype && !area.show) {
            area.display();
            $("#showbtn_" + areatype).removeClass("btn-default").addClass("btn-success");
        }
    }
}
function hideAreas(areatype) {
    for(var i=0, area; area = areas[i]; i++) {
        if(area.type == areatype && area.show) {
            area.hide();
            $("#showbtn_" + areatype).removeClass("btn-success").addClass("btn-default");
        }
    }
}
function toggleArea(areatype) {
    for(var i=0, area; area = areas[i]; i++) {
        if(area.type == areatype) {
            if(area.show) {
                area.hide();
                $("#showbtn_" + areatype).removeClass("btn-success").addClass("btn-default");
            }
            else {
                area.display();
                $("#showbtn_" + areatype).removeClass("btn-default").addClass("btn-success");
            }
        }
    }
}
function buildTypeButtons(areasTypes) {
    var html = "";
    if(areasTypes.size == 0) {
        html = "<p>No area on this map.</p>"
    }
    else {
        for(let areatype of areasTypes) {
            html += "<button type=\"button\" class=\"btn btn-default btn-sm\" onclick=\"toggleArea('" + areatype + "')\" id=\"showbtn_" + areatype + "\">" + areatype + "</button>\n"
        }
    }

    $("#areaTypesButtons").html(html);
}
function addTypeButtonActive(areatype) {
    if($("#areaTypesButtons").html().substr(0, 2) == "<p") {
        var html = "";
    }
    else {
        var html = $("#areaTypesButtons").html();
    }

    html += "<button type=\"button\" class=\"btn btn-success btn-sm\" onclick=\"toggleArea('" + areatype + "')\" id=\"showbtn_" + areatype + "\">" + areatype + "</button>\n"

    $("#areaTypesButtons").html(html);
}
function addType() {
    var typeName = $("#typeName").val();
    var typeColor = $("#typeColor").val();

    colors.set(typeName, typeColor);
    buildTypeSelector(colors);
}
function buildTypeSelector(colors) {
    var html = '<option>      </option>';
    if(!(colors.size == 0)) {
        for(var [type, color] of colors.entries()) {
            html += '<option style="color: ' + color + '">' + type + '</option>'
        }
    }
    $("#type").html(html);
}
function buildColorSelector(colorList) {
    var html = "";
    if(!(colorList.size == 0)) {
        for(let color of colorList) {
            html += '<option style="background-color: ' + color + '; color: '+ color + ';">' + color + '</option>'
        }
    }
    $("#typeColor").html(html);
}

// Map events
function onMapLeftClick(e) {
    var x = e.latlng.lng;
    var y = e.latlng.lat;

    if(pointList.length > 0) {
        var circle = L.circle(xy(x,y), {
            color: colors.get($("#area-form #type").val()),
            fillcolor: colors.get($("#area-form #type").val()),
            fillOpacity: 1,
            radius: 2
        }).addTo(map);

        pointList.push(xy(x, y));
        pointListEdges.push(circle)
    }
    else {

    }

    return false;
}
function onMapRightClick(e) {
    var x = e.latlng.lng;
    var y = e.latlng.lat;

    if($("#area-form #type").val() === "" || statusToolDelete) {
        return false;
    }

    if(pointList.length > 0) {


        var circle = L.circle(xy(x,y), {
            color: colors.get($("#area-form #type").val()),
            fillcolor: colors.get($("#area-form #type").val()),
            fillOpacity: 1,
            radius: 2
        }).addTo(map);

        pointList.push(xy(x, y));
        pointListEdges.push(circle);

        var thisArea = new Area($("#area-form #name").val(), pointList, $("#area-form #type").val(), $('input[name=quality]:checked', '#area-form').val(), colors.get($("#area-form #type").val()));
        thisArea.display();
        mapData.areas.push(thisArea);
        areas.push(thisArea);

        if(!areasTypes.has(thisArea.type)) {
            areasTypes.add(thisArea.type);
            addTypeButtonActive(thisArea.type);
        }

        showAreas(thisArea.type);

        hideObjects(pointListEdges);
        pointList = [];
    }
    else {
        var circle = L.circle(xy(x, y), {
            color: 'yellow',
            fillcolor: 'yellow',
            fillOpacity: 1,
            radius: 2
        }).addTo(map);

        pointList = [xy(x, y)];
        pointListEdges = [circle];
    }

    return false;
}
var statusToolDelete = false;
function toggleToolDelete() {
    if(statusToolDelete) {
        // Deactivate delete tool
        $("#btnTool_delete").removeClass("btn-danger").addClass("btn-default");
        statusToolDelete = false;

        // TODO: Deactivate delete tool
    }
    else {
        // Activate delete tool
        $("#btnTool_delete").removeClass("btn-default").addClass("btn-danger");
        statusToolDelete = true;

        // TODO: Activate delete tool
    }
    return false;
}
function doNothing() {
    return false;
}

function createMap() {
    map = L.map("mapdiv", {
        crs: L.CRS.Simple,
        minZoom: -1
    });

    bounds = [[0,0], xy(mapSize)];
    image = L.imageOverlay(mapImage, bounds).addTo(map);

    map.fitBounds(bounds);

    map.on("click", onMapLeftClick);
    map.on("contextmenu", onMapRightClick)
    map.on("zoomanim", doNothing);

    for(i=0; i < mapData.areas.length; i++) {
        areas.push(new Area(mapData.areas[i].name, mapData.areas[i].edges, mapData.areas[i].type, mapData.areas[i].quality, mapData.areas[i].color));
        areasTypes.add(mapData.areas[i].type);
        colors.set(mapData.areas[i].type, mapData.areas[i].color);
    }

    buildTypeButtons(areasTypes);
    buildTypeSelector(colors);
}

// MODALS
$("#loadmap-btn").click(function() {
    $("#loadmapModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

// Map Loading
// BROWSER CHECKS
// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
} else {
    alert('Navigateur ne supportant pas le chargement des fichiers.');
}

function mapLoader(e) {
    var files = e.target.files; //FileList object

    var filenames = [];
    for(var i=0, f; f = files[i]; i++) {
        // Check for json :
        var fileName = f.name.split('.');
        if(!(fileName[fileName.length - 1] == "json")) {
            filenames.push("<span style='color: red'>" + f.name + "</span>");
            continue;
        }
        else {
            var reader = new FileReader();
            reader.onload = (function(mapfile) {
                return function(e) {
                    // Parse Data

                    var content = e.target.result.split("storedMaps=")[1];
                    mapData = JSON.parse(content.substr(1, content.length - 2));
                    mapName = mapData.name;
                    mapImage = mapData.image;
                    mapSize = mapData.mapsize;

                    filenames.push("<span style='color: green'>" + mapName + "</span>");

                    areas = [];
                    areasPolygons = [];

                    // UPDATE MAP
                    map.eachLayer(function (layer) {
                        map.removeLayer(layer);
                    });

                    bounds = [[0,0], xy(mapSize)];
                    image = L.imageOverlay(mapImage, bounds).addTo(map);

                    map.fitBounds(bounds);

                    areasTypes = new Set();
                    colors = new Map();
                    for(i=0; i < mapData.areas.length; i++) {
                        areas.push(new Area(mapData.areas[i].name, mapData.areas[i].edges, mapData.areas[i].type, mapData.areas[i].quality, mapData.areas[i].color));
                        areasTypes.add(mapData.areas[i].type)
                        colors.set(mapData.areas[i].type, mapData.areas[i].color);
                    }

                    buildTypeButtons(areasTypes);
                    buildTypeSelector(colors);
                    //displayObjects(areas);
                };
            })(f);

            reader.readAsText(f);
        }
    }
    $("#filecomments").html(filenames.join(", "));
}

var image;
var bounds;
var pointList = [];
var pointListEdges = [];

var mapData = JSON.parse(storedMaps);
var mapName = mapData.name;
var mapImage = mapData.image;
var mapSize = mapData.mapsize;

var areas = [];
var areasTypes = new Set();
var areasPolygons = [];

var colors = new Map();
buildTypeSelector(colors);

createMap();

document.getElementById("mapsToLoad").addEventListener('change', mapLoader, false);