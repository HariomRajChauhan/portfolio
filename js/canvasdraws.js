// lets create a drawing tool using canvas which have a pen, eraser and font tools also save the drawing in png format 

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth/1.2;
let height = canvas.height = window.innerHeight/1.52;
let isDrawing = false;
let isErasing = false;
let isText = false;
let isDrawingText = false;
let isDrawingCircle = false;
let isDrawingRect = false;
let isDrawingLine = false;
let isDrawingPolygon = false;
let isDrawingImage = false;

// lets create a menu for the drawing tool

let menu = document.getElementsByClassName('menu_bar');
