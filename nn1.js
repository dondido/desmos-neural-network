const features = [[0, 0], [0, 1], [1, 0], [1, 1]];
const labels = [0, 1, 1, 1];
const sumProducts = (arr1, arr2) => {
	const count = arr1.length;
    let total = 0;
    for (let i = 0; i < count; i ++) {
        total += arr1[i] * arr2[i];
    }
	return total;
}
plotPoints(features, labels);
// utils.plot_points(features, labels);

function score(weights, bias, features) {
	return sumProducts(features, weights) + bias;
}

function step(x) {
	if (x >= 0) {
		return 1;
	} else {
		return 0;
	}
}

function predict(weights, bias, features) {
	return step(score(weights, bias, features));
}

function error(weights, bias, features, label) {
	const prediction = predict(weights, bias, features);
	return prediction === label ? 0 : Math.abs(score(weights, bias, features))
}

function mean_perceptron_error(weights, bias, features, labels) {
	const featureCount = features.length;
	let totalError = 0;
	for (let i = 0; i < featureCount; i ++) {
		totalError += error(weights, bias, features[i], labels[i]);
	}
	return totalError / featureCount;
}

function perceptron_trick(weights, bias, features, label, learning_rate = 0.1) {
	const prediction = predict(weights, bias, features);
	if (prediction === label) {
		return [weights, bias];
	}
	const weightCount = weights.length;
	if (label === 1) {
		for (let i = 0; i < weightCount; i ++) {
			weights[i] += features[i] * learning_rate;
		}
		bias += learning_rate;
	} else {
		for (let i = 0; i < weightCount; i ++) {
			weights[i] += features[i] * learning_rate;
		}
		bias -= learning_rate;
	}
	return [weights, bias];
}

function perceptron_algorithm(features, labels, epochs = 20) {
	let error;
	let weights = Array(features[0].length).fill(1);
	let bias = 0;
	let errors = [];
	for (var epoch = 0; epoch < epochs; epoch ++) {
		/* utils.draw_line(weights[0], weights[1], bias, {
			"color": "grey",
			"linewidth": 1.0,
			"linestyle": "dotted"
		}); */
		error = mean_perceptron_error(weights, bias, features, labels);
		errors.push(error);
		const i = Math.floor(Math.random() * features.length);
		[weights, bias] = perceptron_trick(weights, bias, features[i], labels[i]);
	}
	/* utils.draw_line(weights[0], weights[1], bias);
	utils.plot_points(features, labels);
	plt.show();
	plt.scatter(range(epochs), errors); */
	console.log(1111, weights, bias);
	return [weights, bias];
}

perceptron_algorithm(features, labels);
