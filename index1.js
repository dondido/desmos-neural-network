const calculator = Desmos.GraphingCalculator(
    document.querySelector('.calculator'),
    {
        expressions: false,
        zoomButtons: true,
        settingsMenu: false,
        /* showGrid: false, */
    }
);
const plotPoints = (points, labels) => {
    const count = points.length;
    for (let i = 0; i < count; i ++) {
        const point = points[i];
        const label = labels[i];
        const data = {
            latex: `(${point})`,
            label,
            showLabel: true,
            color: '#2d70b3'
        };
        if (label === 1) {
            data.pointStyle = 'OPEN'
        }
        calculator.setExpression(data);
    }
};
const createExpression = (value, id) => ({ id, latex: `w_{${id}}=${value}` });
const initGraph = () => {
    const expressions = [DEFAULT_BIAS, ...Array(features[0].length).fill(1)].map(createExpression);
    expressions.push({ id:expressions.length, color: 'c74440', latex: 'w_{0}+w_{1}x+w_{2}y=0' });
    calculator.setExpressions(expressions);
};
const updateGraph = () => {
    const { step, weights, biases } = state;
    console.log(111114, weights, biases, step);
    const expressions = [biases[step], ...weights[step]].map(createExpression);
    calculator.setExpressions(expressions);
};
document.querySelector('.button-run').onclick = () => {
    perceptronAlgorithm();
    updateGraph();
};
document.querySelector('.button-reset').onclick = () => {
    Object.assign(state, DEFAULT_STATE);
    runEpoch();
    updateGraph();
};
document.querySelector('.button-previous').onclick = () => {
    state.step && state.step --;
    runEpoch();
    updateGraph();
};
document.querySelector('.button-next').onclick = () => {
    state.step < DEFAULT_EPOCHS && state.step ++;
    runEpoch();
    updateGraph();
};
calculator.setMathBounds({
    left: -.5,
    right: 1.5,
    bottom: -.5,
    top: 1.5
});
plotPoints(features, labels);
initGraph();
/* calculator.setExpression({
    latex: `(1, 1)`,
    label: `(1, 1)`,
});
fetch('g1.json')
    .then(r => r.json())
    .then(expressions => {
        calculator.setExpressions(expressions);
        
        //calculator.setExpression({ id: 'exp1', latex: 'x+10*y-20 = 0' });
        //calculator.setExpression({ id: 'exp2', color: '#c74440', latex: '\\sqrt{5}*x-y^2 = 0' });
    }) */