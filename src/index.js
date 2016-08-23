$ = require('jquery');
d3 = require('d3');

const rectPoints = [];
const circlePoints = [];

function setup(svg) {
}

let state = 'circle'; // 'circle' or 'rect'
$(document).ready( () => {

	const svg = d3.select('#canvas').style('background-color', '#223344');
	setup(svg);

	$('#canvas').click( (e) => {
		const offset =  $('#canvas').offset();
		const mousePos = [e.pageX - offset.left, e.pageY - offset.top];
		console.log(mousePos);
		if (state==='circle') circlePoints.push(mousePos);
		else if (state==='rect')  rectPoints.push(mousePos);
		else {
			console.log('invalid state');
			return;
		}
		
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
			.attr('r', 6)
			.attr('fill', '#ed90da');
	});

	$('#classify').click( () => {

	});

	$('#reset').click( () => {

	});

	$("input[name='radio']:radio").change( () => {
		state = $('input[name=radio]:checked').val();
	});

});





