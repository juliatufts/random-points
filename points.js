;(function() {
	var canvas = document.getElementById("canvasId");
	var ctx = canvas.getContext("2d");
	var screenSize = { width : canvas.width, height : canvas.height};

	// returns a list of n random points
	function randomPoints(n) {
		var points = [];
		for (var i = 0; i < n; i++){
			var x = Math.floor(Math.random() * screenSize.width);
			var y = Math.floor(Math.random() * screenSize.height);

			points.push({ x : x, y : y});
		}
		return points;
	}

	// draws the list of random points given as red circles on the canvas
	function drawPoints(points){
		ctx.fillStyle = "#FF0000";
		var size = 3;

		for (var i = 0; i < points.length; i++) {
			ctx.beginPath();
			ctx.arc( points[i].x, points[i].y, size, 0, 2*Math.PI );
			ctx.stroke();
			ctx.fill();
		}
	}

	// returns the distance between two points
	function dist(a, b) {

		var dx = b.x - a.x;
		var dy = b.y - a.y;

		return Math.sqrt(dx * dx + dy * dy);
	}

	//  Mitchell’s best-candidate algorithm for sampling points
	function bestCandidate(n, sampleSize){
		// the list of plot points
		points = randomPoints(1);

		// choose n-1 more points
		for (var i = 1; i < n; i++){
			var sample = randomPoints(sampleSize);

			// for each sample point
			var minDistances = [];
			for (var samplePoint = 0; samplePoint < sampleSize; samplePoint++) {

				var minDistance = dist(points[0], sample[samplePoint]);
				var minPlotPointIndex = 0;

				// find the closest plot point
				for (var plotPoint = 0; plotPoint < i; plotPoint++) {
					if (minDistance > dist(sample[samplePoint], points[plotPoint])) {
						minDistance = dist(sample[samplePoint], points[plotPoint]);
						minPlotPointIndex = plotPoint;
					}
				}
				minDistances.push({distance : minDistance, point : sample[samplePoint]});
			}

			// find the max among the min distances
			var maxDistance = minDistances[0];
			for (var j = 0; j < sampleSize; j++) {
				if (minDistances[j].distance > maxDistance.distance) {
					maxDistance = minDistances[j];
				}
			}
			points.push(maxDistance.point);
		}
		return points;
	}

	// plot the points resulting from best candidate
	drawPoints(bestCandidate(1000, 50));

})();


