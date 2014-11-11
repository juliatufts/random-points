;(function() {
	var canvas = document.getElementById("canvasId");
	var ctx = canvas.getContext("2d");
	var screenSize = { width : canvas.width, height : canvas.height};

	var Point = function(x, y) {
		this.x = x;
		this.y = y;
	};

	// returns a list of n uniformly random points
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

	// Poisson-disc sampling
	function poissonDisc(r, k) {

		// grid variables
		var cellSize = (r / Math.sqrt(2));
		var gridWidth = Math.ceil(screenSize.width / cellSize);
		var gridHeight = Math.ceil(screenSize.height / cellSize);
		var grid = [];

		// function for finding the grid cell of a given point
		function findCell(point) {
			var tempX = Math.floor(point.x / cellSize);
			var tempY = Math.floor(point.y / cellSize);
			return [tempX, tempY];
		}
		
		// initialize the grid
		for (var i = 0; i < gridHeight; i++) {
			var row = [];
			for (var j = 0; j < gridWidth; j++) {
				row.push(null);
			}
			grid.push(row);
		}

		// start with one random point
		var activePoints = randomPoints(1);
		var finalPoints = [];

		// and add it to the grid
		var cellCoords = findCell(activePoints[0]);
		grid[cellCoords[1]][cellCoords[0]] = activePoints[0];

		// while we still have active points
		while (activePoints.length > 0) {

			// pick a random active point
			var index = Math.floor(Math.random() * activePoints.length)
			var current = activePoints[index];
			var allPointsTooClose = true;

			// generate k sample points
			for (var i = 0; i < k; i++) {

				var angle = Math.random() * 2 * Math.PI;
				var radius = Math.random() * r + r;

				// new sample point
				var x = Math.floor(current.x + Math.cos(angle) * radius);
				var y = Math.floor(current.y + Math.sin(angle) * radius);
				// if it's offscreen, go on to the next sample point
				if (x < 0 || x >= screenSize.width || y < 0 || y >= screenSize.height) {
					continue;
				}
				var p = new Point(x, y);

				// find its cell position in the grid
				var cell = findCell(p);

				// check surrounding cells
				var directions = [[0, 1], [0, 2], [0, -1], [0, -2],
								  [1, 0], [2, 0], [-1, 0], [-2, 0],
								  [1, 1], [1, -1], [-1, 1], [-1, -1],
								  [2, 1], [2, -1], [-2, 1], [-2, -1],
								  [1, 2], [1, -2], [-1, 2], [-1, -2]];

				var foundClosePoint = false;
				for (var j = 0; j < directions.length; j++) {

					var sampleCell = [cell[0] + directions[j][0],
									  cell[1] + directions[j][1]];

					// check if the cell is within range
					if (sampleCell[0] < 0 || sampleCell[0] >= gridWidth ||
						sampleCell[1] < 0 || sampleCell[1] >= gridHeight) {
						continue;
					} else if (grid[sampleCell[1]][sampleCell[0]]) {
						var distance = dist(p, grid[sampleCell[1]][sampleCell[0]]);
						if (distance < r) {
							foundClosePoint = true;
							break;
						}
					}
				}

				if (!foundClosePoint) {
					activePoints.push(p);
					grid[cell[1]][cell[0]] = p;
					allPointsTooClose = false;
					break;
				}
			}

			// after we've checked all the samples
			if (allPointsTooClose) {
				finalPoints.push(current);
				activePoints.splice(index, 1);
			}
		}
		return finalPoints;
	}

	// plot the points resulting from best candidate
	// drawPoints(bestCandidate(1000, 50));

	drawPoints(poissonDisc(300, 10));

})();


