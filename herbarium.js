/**
 * Created by Kevin Thizy on 13/01/2017.
 */

var colors = new Map();
colors.set("Sauge", "green");
colors.set("Cyanure", "red");
colors.set("Ciguë", "white");

// Classes
class Area {
    constructor(name, edges, type) {
        this.name = name;
        this.edges = edges;
        this.type = type;
    }

    toString() {
        return this.name + " - " + this.type + " : " + this.edges;
    }

    display() {
        areasPolygons.push(L.polygon(this.edges, {
            color: colors.get(this.type)
        }));
        this.polygonId = areasPolygons.length - 1;
        areasPolygons[this.polygonId].addTo(map);
    }

    hide() {
        map.removeLayer(this.polygon);
    }
}

// Include Leaflet librairy
var map;

// Close and Open SideBar
var sidebarClosed = true;
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

// VARIABLES, PARSE FILE DATA

var pointList = [];
var pointListEdges = [];

var mapData = JSON.parse(storedMaps)[0];
var mapName = mapData.name;
var mapImage = mapData.image;
var mapSize = mapData.mapsize;

var areas = [];
var areasPolygons = [];

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

    if(pointList.length > 0) {


        var circle = L.circle(xy(x,y), {
            color: colors.get($("#area-form #type").val()),
            fillcolor: colors.get($("#area-form #type").val()),
            fillOpacity: 1,
            radius: 2
        }).addTo(map);

        pointList.push(xy(x, y));
        pointListEdges.push(circle);

        var thisArea = new Area($("#area-form #name").val(), pointList, $("#area-form #type").val());
        thisArea.display();
        mapData.areas.push(thisArea);

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
        pointListEdges.push(circle)
    }

    console.log(pointList);

    return false;
}

function createMap() {
    map = L.map("mapdiv", {
        crs: L.CRS.Simple,
        minZoom: -2
    });

    var bounds = [[0,0], xy(mapSize)];
    var image = L.imageOverlay(mapImage, bounds).addTo(map);

    map.fitBounds(bounds);

    map.on("click", onMapLeftClick);
    map.on("contextmenu", onMapRightClick);

    for(i=0; i < mapData.areas.length; i++) {
        areas.push(new Area(mapData.areas[i].name, mapData.areas[i].edges, mapData.areas[i].type));
    }
    displayObjects(areas);
}

createMap();