class Perceptron {
    constructor(layers, inputs) {
        if (layers[0] !== inputs.length)
            throw new Error("Invalid number of inputs");

        this.l = layers;
        this.sigmoid = v => 1 / (1 + Math.exp(-v));
        this.activation = v => 1 / (1 + Math.exp(-v));
        this.dx = x => this.sigmoid(x) * (1 - this.sigmoid(x)); //sigmoid derivative
        this.learningRate = 0.1;

        this.initWeights();
        this.clearValues(inputs);
    }

    initWeights() {
        var layersCount = this.l.length - 1;
        var additional = 1;

        this.w = new Array(layersCount).fill(null).map((_, i) => {
            return new Array(this.l[i] + additional).fill(null).map((_, j) => {
                return new Array(this.l[i + 1])
                    .fill(0)
                    .map((_, n) => {
                        return (Math.random() - 0.5).toFixed(3);
                    })
            });
        });
    }

    clearValues(inputs) {
        this.values = this.l.map(n => new Array(n).fill(0));
        this.values[0] = inputs;
    }

    run(inputs) {
        this.clearValues(inputs);
        var additional = 1;

        for (var l = 0; l < this.w.length; l++) {
            for (var i = 0; i < this.values[l].length; i++)
                for (var n = 0; n < this.w[l][i].length; n++)
                    this.values[l + 1][n] += this.values[l][i] * +this.w[l][i][n];

            var i = this.values[l].length;
            for (var n = 0; n < this.w[l][i].length; n++)
                this.values[l + 1][n] += +this.w[l][i][n];

            for (var n = 0; n < this.w[l][0].length; n++)
                this.values[l + 1][n] = this.activation(this.values[l + 1][n]);
        }
        return this.values;
    }

    *train(inputs, expected) {
        var self = this;

        this.run(inputs);
        var weights_delta = 0;

        function* correctWeights(layer) {

            var actual = self.values[layer];

            var error =
                layer == self.values.length - 1 // last layer
                    ? actual.map((val, i) => val - expected[i])
                    : actual.map((_, i) =>
                        self.values[layer + 1].map((_, j) => {
                            return self.w[layer][i][j] * weights_delta[j];
                        }).reduce((a, b) => a + b)
                    );
            weights_delta = actual.map((x, i) => error[i] * self.dx(x));

            for (var i = 0; i < error.length; i++)
                yield { layer, i, error: error[i] };

            var prevVal = [...self.values[layer - 1], 1];

            var lastWeights = self.w[layer - 1];
            lastWeights.forEach((v, i) =>
                v.forEach((k, j) => {
                    lastWeights[i][j] -= prevVal[i] * weights_delta[j] * self.learningRate;
                })
            );

            for (var i = 0; i < weights_delta.length; i++)
                yield { layer, i, weights_delta: weights_delta[i] };
        };



        for (var i = this.values.length - 1; i > 0; i--)
            for (var value of correctWeights(i))
                yield value;


        this.run(inputs);
    }
}

var layers = [2, 2, 1];
var inputs = [0, 1];

var app = {
    el: "#app",
    data: {
        layers,
        perceptron: new Perceptron(layers, inputs, 0.1),
        trainGenerator: null,
        mounted: false,
        compact: false,
        learningRate: 0.1,
        dataset: `0 0|0\n0 1|1\n1 0|1\n1 1|1`,
        epoch: 100,
        errors: [],
        weights_delta: []
    },
    computed: {
        weights() {
            return app.data.perceptron.w;
        },
        layerValues() {
            return app.data.perceptron.values;
        },
        neuronIndices() {
            var acc = 0;
            return this.perceptron.l.map(a => (acc += a) - a);
        },
        connections() {
            // if (!app.data.mounted) return [];

            var additional = 1; // or 0
            var neurons = Array.from(document.querySelectorAll('.neuron'));

            neurons = neurons.sort((a, b) => {
                var l = a.dataset.layer - b.dataset.layer;
                if (l == 0) return a.dataset.index - b.dataset.index;
                return l;
            });
            var positions = neurons.map(app.neuronPosition);
            var lines = [];
            var offset = 0;
            for (var l = 0; l < app.data.perceptron.l.length - 1; l++) {
                //for each layer
                let count = app.data.perceptron.l[l] + additional;
                offset += count;
                for (var j = 0; j < app.data.perceptron.l[l + 1]; j++) {
                //for (var j = 0; j < app.data.perceptron.l[l + 1]; j++) {
                    for (var i = 0; i < app.data.perceptron.l[l] + additional; i++) {
                        // current layer neurons
                        var coords = [
                            ...positions[i + offset - count],
                            ...positions[j + offset]
                        ];
                        var t = j % 2 == 0 ? 0.3 : 0.6;

                        var center = [];
                        center[0] = coords[0] + t * (coords[2] - coords[0]);
                        center[1] = coords[1] + t * (coords[3] - coords[1]);
                        lines.push({ center: center, path: coords });
                    }
                }
            }
            return lines;
        }
    },
    watch: {
        compact() {
            this.update();
            this.run();
        }
    },
    update() {
        this.data.mounted = false;
        requestAnimationFrame(() => {
            this.data.mounted = true;
            this.$forceUpdate();
        });
    },
    setLayers(val) {
        this.layers = val
            .split(",")
            .map(v => parseInt(v))
            .filter(v => Number.isInteger(v))
            .filter(v => v > 0);
        this.recreate();
    },
    setLearningRate(val) {
        this.learningRate = val;
        this.perceptron.learningRate = val;
    },
    recreate() {
        var inputs = new Array(this.layers[0]).fill(0);
        this.perceptron = new Perceptron(this.layers, inputs, this.learningRate);
        this.update();
        this.cancelTrain();
    },
    neuronPosition(n) {
        var p1 = { 
            top: n.offsetTop, 
            left: n.offsetLeft, 
        };
        var p2 = { 
            top: n.parentElement.offsetTop, 
            left: n.parentElement.offsetLeft, 
        };
        return [
            p1.left + p2.left + n.offsetWidth / 2,
            p1.top + p2.top + n.offsetHeight / 2,
        ];
    },
    wInputPosition(a, b, c) {
        var index = 0;
        var additional = 1;
        for (var i = 0; i < a; i++)
            index += (this.perceptron.l[i] + additional) * this.perceptron.l[i + 1];

        for (var i = 0; i < c; i++) index += this.perceptron.l[a] + additional;

        index += b;
        const connections = app.computed.connections();
        if (connections[index]) {
            var c = connections[index].center;
            return `left: ${c[0]}px; top: ${c[1]}px;`;
        }
    },
    pathData(path) {
        var p = path;
        return `M ${p[0]} ${p[1]} L ${p[2]} ${p[3]}`;
    },
    run() {
        this.cancelTrain();
        this.layerValues = this.perceptron.run(app.data.perceptron.values[0]);
    },
    init() {
        Object.assign(this, this.data);
        Object.entries(this.data).forEach(([key, value]) => {
            const $element = document.querySelector(`[v-model="${key}"]`);
            if ($element) {
                $element.value = value;
            }
        });  
    },
    cancelTrain() {
        this.trainGenerator = null;
        this.errors = [];
        this.weights_delta = [];
    },
    stepTrain() {
        var value = this.trainGenerator.next().value;

        if (value == null)
            this.cancelTrain();
        else if (value.error !== undefined)
            this.errors[value.layer + '_' + value.i] = value.error;
        else if (value.weights_delta !== undefined)
            this.weights_delta[value.layer + '_' + value.i] = value.weights_delta;

        this.$forceUpdate();
    },
    trainStepByStep() {
        var inputs = this.layerValues[0];
        var expected = this.layerValues[this.layerValues.length - 1];
        this.trainGenerator = this.perceptron.train(inputs, expected);
    },
    train(inputs, expected) {
        this.cancelTrain();
        inputs = inputs || this.layerValues[0];
        expected = expected || this.layerValues[this.layerValues.length - 1];
        var gen = this.perceptron.train(inputs, expected);

        for (let state; state = gen.next().value;) {
            // console.log('>>>', state);
        }
    },
    trainDataset() {
        var dataset = this.dataset.split('\n').map(list => {
            var inputs = list.split('|')[0].split(' ');
            var outputs = list.split('|')[1].split(' ');
            return { inputs, outputs };
        });

        for (var i = 0; i < this.epoch; i++)
            dataset.forEach(set => {
                this.train(set.inputs, set.outputs);
            });
    },
    mounted() {
        this.mounted = true;
    }
};
const $net = document.querySelector('.net');
const interpolate = () => {
    const layerCount = app.data.perceptron.l.length - 1;
    const layers = app.data.perceptron.l.reduce((layers, nums, layer) => {
        const createNeuron = (neurons = '', _, idx) => {
            neurons = `${neurons}<div class="neuron" data-layer="${layer}" data-index="${idx}">`
            if (!compact) {
                const ref = `${layer}_${idx - 1}`;
                const error = app.data.errors[ref];
                const weight = app.data.weights_delta[ref];
                neurons += '<div class="hint">';
                if (error !== undefined) {
                    neurons += `<div class="right" title="Error">${error.toFixed(3)}</div>`
                }
                if (weight !== undefined) {
                    neurons += `<div class="left" title="Weights delta">${weight.toFixed(3)}</div>`
                }
            }
            const value = app.layerValues[layer][idx - 1];
            if (layer === 0 || layer === layerCount) {
                neurons += `<input value="${value}" onchange="${layer < layerCount ? 'app.run' : ''}" />`
            }
            else {
                neurons += `<span>${ app.layerValues[layer] ? value.toFixed(3) : '' }</span>`;
            }
            return `${neurons}</div>`;
        };
        layers += `<div class="layer">${Array.from({ length: nums + 1 }).reduce(createNeuron)}`;
        if (layer < layerCount) {
            layers += `<div class="neuron additional" data-layer="${layer}" data-index="${nums + 1}" class="{compact:compact}"><span>+1</span></div>`
        }
        return `${layers}</div>`;
    }, '');
    $net.innerHTML = layers;
    const weight = app.computed.weights().reduce((weights = '', layer, i) => {
        const neurs = layer.reduce((neurs, neur, j) => {
            const ws = neur.reduce((ws = '', w, k) => {
                return `${ws}<input @input="run" style="${app.wInputPosition(i, j, k)}" value=${neur[k]} />`
            }, '');
            return `${neurs}<div class="neur">${ws}</div>`;
        }, '');
        return `${weights}<div class="weights">${neurs}</div>`
    }, '');
    $net.insertAdjacentHTML('beforeend', weight);
    const gs = app.computed.connections().reduce((gs, connect) => {
        return `${gs}<g><path d="${app.pathData(connect.path)}"></path></g>`
    }, '');
    $net.insertAdjacentHTML('beforeend', `<svg>${gs}</svg>`);
};

window.addEventListener('resize', app.update);
document.getElementById('layers').oninput = ({ target }) => {
    console.log(1111, target.value.split(',') );
    /* app.data.perceptron = new Perceptron(target.value.split(',').map(Number), inputs, 0.1);
    app.init();
    app.run();
    interpolate(); */
};
app.init();
app.run();
interpolate();