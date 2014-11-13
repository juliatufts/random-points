;(function() {
	// top canvas
	var canvasTop = document.getElementById("bestCand");
	var ctxTop = canvasTop.getContext("2d");
	var screenSizeTop = { width : canvasTop.width, height : canvasTop.height};

	// bottom canvas
	var canvasBottom = document.getElementById("poisson");
	var ctxBottom = canvasBottom.getContext("2d");
	var screenSizeBottom = { width : canvasBottom.width, height : canvasBottom.height};

	// Point constructor
	var Point = function(x, y) {
		this.x = x;
		this.y = y;
	};

	// returns a list of n uniformly random points
	function randomPoints(n, screenSize) {
		var points = [];
		for (var i = 0; i < n; i++){
			var x = Math.floor(Math.random() * screenSize.width);
			var y = Math.floor(Math.random() * screenSize.height);

			points.push({ x : x, y : y});
		}
		return points;
	}

	// draws the list of random points given as red circles on the canvas
	function drawPoints(points, ctx){
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

	// function for finding the grid cell of a given point
	function findCell(point, cellSize) {
		var tempX = Math.floor(point.x / cellSize);
		var tempY = Math.floor(point.y / cellSize);
		return [tempX, tempY];
	}


	//------------------------- Mitchell’s best-candidate algorithm for sampling points
	//---------------------------------------------------------------------------------
	function bestCandidate(n, sampleSize, screenSize){
		// the list of plot points
		points = randomPoints(1, screenSize);

		// choose n-1 more points
		for (var i = 1; i < n; i++){
			var sample = randomPoints(sampleSize, screenSize);

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

	//---------------------------------------------- Poisson-disc sampling
	//--------------------------------------------------------------------
	function poissonDisc(r, k, screenSize) {

		// grid variables
		var cellSize = (r / Math.sqrt(2));
		var gridWidth = Math.ceil(screenSize.width / cellSize);
		var gridHeight = Math.ceil(screenSize.height / cellSize);
		var grid = [];

		// initialize the grid
		for (var i = 0; i < gridHeight; i++) {
			var row = [];
			for (var j = 0; j < gridWidth; j++) {
				row.push(null);
			}
			grid.push(row);
		}

		// start with one random point
		var activePoints = randomPoints(1, screenSize);
		var finalPoints = [];

		// and add it to the grid
		var cellCoords = findCell(activePoints[0], cellSize);
		grid[cellCoords[1]][cellCoords[0]] = activePoints[0];


		// while we still have active points
		while (activePoints.length > 0) {

			// pick a random active point
			var currentPointIndex = Math.floor(Math.random() * activePoints.length)
			var currentPoint = activePoints[currentPointIndex];
			var allPointsTooClose = true;

			// generate k sample points
			for (var i = 0; i < k; i++) {

				// new sample point coordinates
				var angle = Math.random() * 2 * Math.PI;
				var radius = Math.random() * r + r;
				var x = currentPoint.x + Math.cos(angle) * radius;
				var y = currentPoint.y + Math.sin(angle) * radius;

				// if it's offscreen, go on to the next sample point
				if (x < 0 || x >= screenSize.width || y < 0 || y >= screenSize.height) {
					continue;
				}
				var samplePoint = new Point(x, y);

				// find its cell position in the grid
				var sampleCell = findCell(samplePoint, cellSize);

				// check surrounding cells
				var DIRECTIONS = [[0, 0], [0, 1], [0, 2], [0, -1], [0, -2],
								  [1, 0], [2, 0], [-1, 0], [-2, 0],
								  [1, 1], [1, -1], [-1, 1], [-1, -1],
								  [2, 1], [2, -1], [-2, 1], [-2, -1],
								  [1, 2], [1, -2], [-1, 2], [-1, -2]];

				// compare the sample points distance to every other point in neighboring cells
				var foundClosePoint = false;
				for (var j = 0; j < DIRECTIONS.length; j++) {

					var neighborCell = [sampleCell[0] + DIRECTIONS[j][0],
									    sampleCell[1] + DIRECTIONS[j][1]];

					// check if the neighbor cell is within range
					if (neighborCell[0] < 0 || neighborCell[0] >= gridWidth ||
						neighborCell[1] < 0 || neighborCell[1] >= gridHeight) {
						continue;
					} else if (grid[neighborCell[1]][neighborCell[0]]) {
						var neighborPoint = grid[neighborCell[1]][neighborCell[0]]
						var distance = dist(samplePoint, neighborPoint);

						// if there is a neighboring point within r, its a bad sample point
						if (distance < r) {
							foundClosePoint = true;
							break;
						}
					}
				}

				// if we didn't find any close points, it was a good sample point
				if (!foundClosePoint) {
					activePoints.push(samplePoint);
					grid[sampleCell[1]][sampleCell[0]] = samplePoint;
					allPointsTooClose = false;
					break;
				}
			}

			// after we've checked all the samples
			// if they were all bad samples, then deactivate the current point
			if (allPointsTooClose) {
				finalPoints.push(currentPoint);
				activePoints.splice(currentPointIndex, 1);
			}
		}
		return finalPoints;
	}

	// plot the points resulting from best candidate
	drawPoints(bestCandidate(500, 30, screenSizeTop), ctxTop);

	// plot the points resulting from poisson disc method
	drawPoints(poissonDisc(15, 30, screenSizeBottom), ctxBottom);

})();


