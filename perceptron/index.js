const STEPS_MAX = 200000;
const calculator = Desmos.GraphingCalculator(
    document.querySelector('.calculator'),
    {
        /* expressions: false, */
        folders: true,
        zoomButtons: true,
        settingsMenu: false,
        keypad: false,
        folders: true,
        // authorFeatures: true,
        sliders: false,
        /* showGrid: false, */
    }
);
window.calculator = calculator;
const CALCULATOR_STATE = {
    version: 11,
    graph: {
        viewport: {
            xmin: -.5,
            ymin: -.5,
            xmax: 2,
            ymax: 2
        },
    },
    expressions: {
        list: []
    }
}
const calculatorState = {
    version: 11,
    graph: {
        viewport: {
            xmin: -.5,
            ymin: -.5,
            xmax: 2,
            ymax: 2
        },
    },
    expressions: {
        list: []
    }
};
const sleep = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));
const expressions = [];
const plotPoint = (point, idx) => {
    return ({
    latex: `(${point})`,
    label: String(labels[idx]),
    readonly: true,
    id: 'points' + idx,
    folderId: 'points',
    type: 'expression',
    showLabel: true,
    // dragMode: Desmos.DragModes.XY,
    pointStyle: labels[idx] === 1 ? 'POINT': 'OPEN',
    color: labels[idx] === 1 ? Desmos.Colors.GREEN : Desmos.Colors.RED
})};
const plotPoints = () => setCalculatorState([
    { type: 'folder', id: 'points', secret: true, title: 'Points', },
    ...features.map(plotPoint)
]);
let substep = 0;
let lastExpressionToHideIndex = 0;
let perceptronId = 0;
const setCalculatorState = (entries) => {
    const { list } = calculatorState.expressions;
    const ids = list.map(({ id }) => id);
    entries.forEach((expression, id) => {
        const expressionIndex = ids.indexOf(expression.id);
        if (expressionIndex === -1) {
            return list.push(expression);
        }
        list[expressionIndex] = expression;
    });
    calculatorState.expressions.list = list;
    calculator.setState(calculatorState);
};
const createExpression = (value, id) => ({
    id: `${perceptronId}.${id}`,
    folderId: perceptronId,
    readonly: true,
    type: 'expression',
    latex: `w_{p${perceptronId}w${id}}=${value}`
});
const initGraph = () => {
    perceptronId = '1';
    setCalculatorState([ 
    //calculator.setExpressions([
        { type: 'folder', id: perceptronId, secret: false, title: `Peceptron ${perceptronId}`, },
        { color: 'c74440', type: 'expression', folderId: perceptronId, readonly: true, id: perceptronId + 'formula', latex: `w_{p${perceptronId}w0}+w_{p${perceptronId}w1}x+w_{p${perceptronId}w2}y=0` },
        ...[DEFAULT_BIAS, ...Array(features[0].length).fill(1)].map(createExpression),
    ]);
    //calculator.setState(calculatorState);
    console.log(1111, calculator.getState().expressions.list);
};

const updateGraph = () => {
    // perceptronId = String(sample);
    const { bias, weights } = perceptrons[0].history[sample];
    console.log(111111, perceptronId);
    setCalculatorState([bias, ...weights].map(createExpression));
    console.log(11112, calculator.getState().expressions.list);

    // calculator.setExpressions([bias, ...weights].map(createExpression));
    //calculator.setState(calculatorState);
};
const $epoch = document.querySelector('.epoch');
const $buttonRun = document.querySelector('.button-run');
let stepTimeout;
const updateFrame = () => {
    activatePerceptron();
    updateGraph();
    $epoch.textContent = step;
};
const runNetwork = async () => {
    $buttonRun.classList.add('paused');
    $buttonRun.onclick = pauseNetwork;
    while (step < STEPS_MAX) {
        await new Promise(resolve => {
            stepTimeout = setTimeout(resolve);
        });
        if (stepTimeout) {
            updateFrame();
        }
    }
};
const pauseNetwork = () => {
    clearTimeout(stepTimeout);
    $buttonRun.classList.remove('paused');
    $buttonRun.onclick = runNetwork;
};
$buttonRun.onclick = runNetwork;
document.querySelector('.button-reset').onclick = () => {
    pauseNetwork();
    Object.assign(state, CALCULATOR_STATE);
    $epoch.textContent = 0;
    calculator.setExpressions([]);
    calculator.setExpressions(expressions);
};
document.querySelector('.button-previous').onclick = () => {
    if (step) {
        step --;
        if (step % perceptrons.length === 0) {
            sample --;
            assignFeatureAsInput();
        }
        updateFrame();
    }
};
document.querySelector('.button-next').onclick = () => {
    if (step < STEPS_MAX) {
        substep ++;
        if (step % perceptrons.length === 0) {
            sample ++;
            assignFeatureAsInput();
        }
        updateFrame();
    }
};
calculator.setMathBounds({
    left: -.5,
    right: 1.5,
    bottom: -.5,
    top: 1.5
});
plotPoints();
initGraph();