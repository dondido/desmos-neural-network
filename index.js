const STEPS_MAX = 200000;
const calculator = Desmos.GraphingCalculator(
    document.querySelector('.calculator'),
    {
        /* expressions: false, */
        folders: true,
        zoomButtons: true,
        settingsMenu: false,
        keypad: false,
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
    folderId: 'points',
    type: 'expression',
    showLabel: true,
    // dragMode: Desmos.DragModes.XY,
    pointStyle: labels[idx] === 1 ? 'POINT': 'OPEN',
    color: labels[idx] === 1 ? Desmos.Colors.GREEN : Desmos.Colors.RED
})};
const plotPoints = () => setCalculatorState([
    { type: 'folder', id: 'points', secret: true, "title": "secret Folder", },
    ...features.map(plotPoint)
]);

let lastExpressionToHideIndex = 0;
const setCalculatorState = (list) => {
    calculatorState.expressions.list = list;
    calculator.setState(calculatorState);
};
const createExpression = (value, id) => ({
    id: calculatorState.expressions.list + 1 + id,
    readonly: true,
    type: 'expression',
    latex: `w_{${id}}=${value}`
});
const initGraph = () => {
    calculator.setExpressions([
        { color: 'c74440', type: 'expression', readonly: true, id: calculatorState.expressions.list, latex: `w_{0}+w_{1}x+w_{2}y=0` },
        ...[DEFAULT_BIAS, ...Array(features[0].length).fill(1)].map(createExpression),
    ]);
    //calculator.setState(calculatorState);
};

const updateGraph = () => {
    const { step, weights, biases } = state;
    folderId = String(state.step);
    calculator.setExpressions([...[biases[step], ...weights[step]].map(createExpression)]);
    //calculator.setState(calculatorState);
};
const $epoch = document.querySelector('.epoch');
const $buttonRun = document.querySelector('.button-run');
let stepTimeout;
const updateFrame = () => {
    runEpoch();
    updateGraph();
    $epoch.textContent = state.step;
};
const runNetwork = async () => {
    $buttonRun.classList.add('paused');
    $buttonRun.onclick = pauseNetwork;
    while (state.step < STEPS_MAX) {
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
    if (state.step) {
        state.step --;
        updateFrame();
    }
};
document.querySelector('.button-next').onclick = () => {
    state.step < STEPS_MAX && state.step ++;
    updateFrame();
};
calculator.setMathBounds({
    left: -.5,
    right: 1.5,
    bottom: -.5,
    top: 1.5
});
plotPoints();
initGraph();