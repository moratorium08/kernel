$ = require('jquery');
d3 = require('d3');
SVM = require('./svm');


const rectPoints = [];
const circlePoints = [];
const tiles = [];
const tileSize = 100;

function setup(svg) {

}

function draw(svg) {
	svg.selectAll('rect')
		.remove();
	svg.selectAll('circle')
		.remove();

	svg.selectAll('rect')
		.data(rectPoints)
		.enter()
		.append('rect')
		.attr('x', (d) => (d[0] - 3))
		.attr('y', (d) => (d[1] -3))
		.attr('width', 6)
		.attr('height',6)
		.attr('fill', 'lightgreen');

	svg.selectAll('circle')
		.data(circlePoints)
		.enter()
		.append('circle')
		.attr('cx', (d) => (d[0] - 3))
		.attr('cy', (d) => (d[1] -3))
		.attr('r', 3)
		.attr('fill', '#ed90da');

}

let state = 'circle'; // 'circle' or 'rect'
$(document).ready( () => {

	const svg = d3.select('#canvas').style('background-color', '#223344');
	setup(svg);

	$('#canvas').click( (e) => {
		const offset =  $('#canvas').offset();
		const mousePos = [e.pageX - offset.left, e.pageY - offset.top];
		if (state==='circle') circlePoints.push(mousePos);
		else if (state==='rect')  rectPoints.push(mousePos);
		else {
			console.log('invalid state');
			return;
		}
		draw(svg);
	});

	$('#classify').click( () => {
		const targets = circlePoints.map(()=>(1)).concat(rectPoints.map(()=>(-1)));
		const svm = new SVM(circlePoints.map((x) => ([x[0]/100, x[1]/100]))
					.concat(rectPoints.map((x) => ([x[0]/100, x[1]/100]))), targets);
		svm.learn();
		const width = $('#canvas').width();
		const height = $('#canvas').height();

		const sizeX = width/tileSize;
		const sizeY = height/tileSize;

		const sign = (x) => (x > 0 ? 1 : -1);

		for(let i = 0; i < tileSize; i++){
			for (let j = 0; j < tileSize; j++) {
				const px = sizeX*i;
				const py = sizeY*j;
				const y = svm.presume([px/100,py/100]);
				tiles.push([px,py,sign(y)]);
				//console.log(sign(y));
			}
		}

		console.log(tiles);

		svg.selectAll("rect")
			.data(tiles)
			.enter()
			.append("rect")
			.attr("x", (x) => (x[0]))
			.attr("y", (x) => (x[1]))
			.attr("width", sizeX)
			.attr("height", sizeY)
			.attr("fill", (x) => ( x[2] > 0 ? "pink" : "springgreen"))
			.attr("opacity", 0.3);


		
	});

	$('#reset').click( () => {
		rectPoints.length = 0;
		circlePoints.length = 0;
		draw(svg);
	});

	$("input[name='radio']:radio").change( () => {
		state = $('input[name=radio]:checked').val();
	});
});


