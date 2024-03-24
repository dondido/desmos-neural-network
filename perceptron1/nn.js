const DEFAULT_BIAS = -1.4;
const features = [[0, 0], [0, 1], [1, 0], [1, 1]];
const featureCount = features.length;
let seed = 1;
const random = () => {
    const x = Math.sin(seed ++) * 10000;
    return x - Math.floor(x);
};
const randomInt = (min, max) => Math.floor(random() * (max - min + 1)) + min;
const createPerceptron = layer => () => ({
    layer,
    history: [{
        error: 0,
        prediction: 0,
        weights: [1, 1],
        bias: DEFAULT_BIAS,
    }],
    errors: [0],
    weights: [[1, 1]],
    biases: [DEFAULT_BIAS],
});
const createHiddenLayer = (perceptronCount, layer) => Array.from({ length: perceptronCount }, createPerceptron(layer));
const layerRaw = document.querySelector('.input-layers').value.split(',').filter(Boolean);
const inputs = [[...layerRaw.map(() => ([])), features[randomInt(0, features.length - 1)]]];
const percetrons = [...layerRaw.flatMap(createHiddenLayer), createPerceptron(layerRaw.length)()];
const samples = [];
const sampleIndex = 0;
let step = 0;
let sample = 0;
let perceptronId = 0;
let activePerceptron = percetrons[perceptronId];
const labels = [0, 1, 1, 1];
const DEFAULT_EPOCHS = 200;

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
function stepActivationFunction(x) {
	if (x >= 0) {
		return 1;
	} else {
		return 0;
	}
}
function predict(weights, bias, features) {
	return stepActivationFunction(score(weights, bias, features));
}
function error(weights, bias, features, label) {
	const prediction = predict(weights, bias, features);
	return prediction === label ? 0 : Math.abs(score(weights, bias, features));
}
function meanPerceptronError(weights, bias, features, labels) {
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
			weights[i] = Number((weights[i] + features[i] * learning_rate).toFixed(3));
		}
		bias = Number((bias + learning_rate).toFixed(2));
	} else {
		for (let i = 0; i < weightCount; i ++) {
			weights[i] = Number((weights[i] - features[i] * learning_rate).toFixed(3));
		}
		bias = Number((bias - learning_rate).toFixed(2));
	}
	return { weights, bias, prediction };
}
const triggerPerceptron = (weights, bias, inputs, label, learning_rate = 0.05) => {
	const prediction = predict(weights, bias, inputs);
	if (prediction === label) {
		return { weights, bias, prediction, error: 0 };
	}
	const weightCount = weights.length;
    const error = Math.abs(score(weights, bias, inputs));
	if (label === 1) {
		for (let i = 0; i < weightCount; i ++) {
			weights[i] = Number((weights[i] + inputs[i] * learning_rate).toFixed(3));
		}
		bias = Number((bias + learning_rate).toFixed(2));
	} else {
		for (let i = 0; i < weightCount; i ++) {
			weights[i] = Number((weights[i] - inputs[i] * learning_rate).toFixed(3));
		}
		bias = Number((bias - learning_rate).toFixed(2));
	}
	return { weights, bias, prediction, error };
};
const activatePerceptron = () => {
    if (activePerceptron.history[sample]) {
        return;
    }
    const previousSample = activePerceptron.history.at(-1);
    const id = randomInt(0, featureCount - 1);
    const { weights, bias, prediction = features[id] } = previousSample;
    const fragment = triggerPerceptron(weights, bias, prediction, labels[id]);
    activePerceptron.history.push(fragment);
    //const error = Number(meanPerceptronError(weights, bias, features, labels).toFixed(3));
    /* const i = Math.floor(Math.random() * features.length);
    const data = perceptronTrick(weights, bias, features[i], labels[i]);
    activePerceptron.errors[sample] = error;
    activePerceptron.weights[sample] = data.weights;
    activePerceptron.biases[sample] = data.bias;*/
}; 
const activatePerceptron1 = () => {
    if (activePerceptron.history[sample]) {
        return;
    }
    const weights = activePerceptron.weights[sample - 1];
    const bias = activePerceptron.biases[sample - 1];
    const error = Number(meanPerceptronError(weights, bias, features, labels).toFixed(3));
    const i = Math.floor(Math.random() * features.length);
    const data = perceptronTrick(weights, bias, features[i], labels[i]);
    activePerceptron.errors[sample] = error;
    activePerceptron.weights[sample] = data.weights;
    activePerceptron.biases[sample] = data.bias;
};
const assignFeatureAsInput = () => inputs[0] = features[randomInt(0, features.length - 1)];
const runStep = () => {
    
};