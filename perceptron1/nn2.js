const features = [[0, 0], [0, 1], [1, 0], [1, 1]];
const labels = [0, 1, 1, 1];
const DEFAULT_STATE = {
    step: -1,
    errors: [],
    weights: [],
    biases: [],
};
const DEFAULT_BIAS = -1.4;
const DEFAULT_EPOCHS = 200;
const state = { ...DEFAULT_STATE };
const sumProducts = (arr1, arr2) => {
	const count = arr1.length;
    let total = 0;
    for (let i = 0; i < count; i ++) {
        total += arr1[i] * arr2[i];
    }
	return total;
};
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

function meanPerceptronError(weights, bias, features, labels) {
	const featureCount = features.length;
	let totalError = 0;
	for (let i = 0; i < featureCount; i ++) {
		totalError += error(weights, bias, features[i], labels[i]);
	}
	return totalError / featureCount;
}

function perceptronTrick(weights, bias, features, label, learning_rate = 0.05) {
	const prediction = predict(weights, bias, features);
	if (prediction === label) {
		return { weights, bias };
	}
	const weightCount = weights.length;
	if (label === 1) {
		for (let i = 0; i < weightCount; i ++) {
			weights[i] += features[i] * learning_rate;
		}
		bias += learning_rate;
	} else {
		for (let i = 0; i < weightCount; i ++) {
			weights[i] -= features[i] * learning_rate;
		}
		bias -= learning_rate;
	}
	return { weights, bias };
}
const runStep = () => {
    const { step } = state;
    if (state.weights[step]) {
        return;
    }
    if (step === 0) {
        state.errors[step] = 0;
        state.weights[step] = Array(features[0].length).fill(1);
        state.biases[step] = DEFAULT_BIAS;
        return;
    }
    const weights = state.weights[step - 1];
    const bias = state.biases[step - 1];
    const error = meanPerceptronError(weights, bias, features, labels);
    const i = Math.floor(Math.random() * features.length);
    const data = perceptronTrick(weights, bias, features[i], labels[i]);
    state.errors[step] = error;
    state.weights[step] = data.weights;
    state.biases[step] = data.bias;
};

