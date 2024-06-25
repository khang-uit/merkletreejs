var $form = document.getElementById('form');
var $input = document.getElementById('input');
var $multiInputForm = document.getElementById('multiInputForm');
var $multiInput = document.getElementById('multiInput');
var $verifyForm = document.getElementById('verifyForm');
var $rootOutput = document.getElementById('rootOutput');
var $proofOutput = document.getElementById('proofOutput');
var $verifyOutput = document.getElementById('verifyOutput');
var $layersOutput = document.getElementById('layersOutput');
var $flatLayersOutput = document.getElementById('flatLayersOutput');
var $leafInput = document.getElementById('leafInput');
var $proof = document.getElementById('proof');
var $treeVisualization = document.getElementById('treeVisualization');
var $insertionTimeOutput = document.getElementById('insertionTimeOutput');
var $proofGenerationTimeOutput = document.getElementById('proofGenerationTimeOutput');
var $verificationTimeOutput = document.getElementById('verificationTimeOutput');
var $memoryUsageOutput = document.getElementById('memoryUsageOutput');
var $proofMemoryUsageOutput = document.getElementById('proofMemoryUsageOutput');
var $verificationMemoryUsageOutput = document.getElementById('verificationMemoryUsageOutput');

var tree;

function getMemoryUsage() {
    if (performance.memory) {
        return performance.memory.usedJSHeapSize * 8; // Convert to bits
    } else {
        return null;
    }
}

function initializeTree() {
    const height = 4; // Set the height of your tree here

    const leaves = [
        { path: '1000', value: 'value1' },
        { path: '1110', value: 'value2' },
        { path: '1111', value: 'value3' },
        { path: '0111', value: 'value4' },
    ];
    $input.textContent = `1000, value1\n1110, value2\n1111, value3\n0111, value4`;
    tree = new window.MerkleSparseTree(height, leaves);

    updateOutputs();
}

// Function to generate random leaf paths and values
function generateRandomData(numLines, height) {
    const testData = [];
    const pathLength = height; // Assuming each path is of length 4 (adjust as needed)
    const characters = ['0', '1'];

    for (let i = 0; i < numLines; i++) {
        // Generate a random path of specified length
        let path = '';
        for (let j = 0; j < pathLength; j++) {
            path += characters[Math.floor(Math.random() * characters.length)];
        }
        
        // Generate a random value (for demonstration, using a simple incremental value)
        let value = 'value' + (i + 1);
        if(i==numLines-1){
            console.log(path, value)
        }
        // Store the generated data as an object
        testData.push({ path: path, value: value });
    }

    return testData;
}

// Function to insert generated test data into the Merkle tree
function insertGeneratedDataIntoTree(numLines, height) {
    const testData = generateRandomData(numLines, height);

    const insertionTime = performance.now();
    const memoryBefore = getMemoryUsage();
    tree = new window.MerkleSparseTree(height, testData);
    const memoryAfter = getMemoryUsage();

    const memoryUsage = (memoryAfter !== null && memoryBefore !== null) ? (memoryAfter - memoryBefore) : 'N/A';
    const memoryUsageText = memoryUsage >= 0 ? `${memoryUsage} bits` : `0 bits`;

    $insertionTimeOutput.textContent = `Insertion Time: ${performance.now() - insertionTime} ms`;
    $memoryUsageOutput.textContent = `Memory Usage: ${memoryUsageText}`;
}

// Event listener for the "Insert 1000 Lines of Test Data" button
$multiInputForm.addEventListener('submit', function (event) {
    // Insert 1000 lines of generated data into the Merkle tree
    event.preventDefault();
    const numLines = $multiInput.value.trim();
    const height = Math.ceil(Math.log2(numLines));
    insertGeneratedDataIntoTree(numLines, height);
});

$form.addEventListener('submit', function (event) {
    event.preventDefault();
    const value = $input.value.trim();
    const height = 4; // Set the height of your tree here
    tree = new window.MerkleSparseTree(height);

    const leaves = value.split('\n').map(function (line) {
        const [path, hash] = line.trim().split(',');
        return { path: path.trim(), value: hash.trim() };
    });

    const insertionTime = performance.now();
    const memoryBefore = getMemoryUsage();
    tree = new window.MerkleSparseTree(height, leaves);
    const memoryAfter = getMemoryUsage();

    const memoryUsage = (memoryAfter !== null && memoryBefore !== null) ? (memoryAfter - memoryBefore) : 'N/A';
    const memoryUsageText = memoryUsage >= 0 ? `${memoryUsage} bits` : `0 bits`;

    $insertionTimeOutput.textContent = `Insertion Time: ${performance.now() - insertionTime} ms`;
    $memoryUsageOutput.textContent = `Memory Usage: ${memoryUsageText}`;

    updateOutputs();
});

// Handle proof generation
document.getElementById('proofForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const path = $leafInput.value.trim();

    const proofGeneration = performance.now();
    const memoryBefore = getMemoryUsage();
    if (tree && path) {
        const proof = tree.generateProof(path);
        const memoryAfter = getMemoryUsage();
        const memoryUsage = (memoryAfter !== null && memoryBefore !== null) ? (memoryAfter - memoryBefore) : 'N/A';
        const memoryUsageText = memoryUsage >= 0 ? `${memoryUsage} bits` : `0 bits`;
        
        $proof.textContent = JSON.stringify(proof, null, 2);
        $proofGenerationTimeOutput.textContent = `Proof Time: ${performance.now() - proofGeneration} ms`;
        $proofMemoryUsageOutput.textContent = `Memory Usage: ${memoryUsageText}`;
    } else {
        $proof.textContent = 'Invalid leaf path or tree not initialized';
        $proofGenerationTimeOutput.textContent = `Proof Time: ${performance.now() - proofGeneration} ms`;
        $proofMemoryUsageOutput.textContent = 'Memory Usage: N/A';
    }
});

$verifyForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!tree) {
        $verifyOutput.textContent = 'Tree not initialized';
        return;
    }
    const path = document.getElementById('verifyPath').value.trim();
    const value = document.getElementById('verifyValue').value.trim();
    const proof = tree.generateProof(path);
    const root = tree.getRoot();
    const proofGeneration = performance.now();
    const memoryBefore = getMemoryUsage();
    const isValid = tree.verifyProof(path, value, proof, root);
    const memoryAfter = getMemoryUsage();

    const memoryUsage = (memoryAfter !== null && memoryBefore !== null) ? (memoryAfter - memoryBefore) : 'N/A';
    const memoryUsageText = memoryUsage >= 0 ? `${memoryUsage} bits` : `0 bits`;

    $verifyOutput.textContent = `Verification: ${isValid}`;
    $proofOutput.textContent = `${JSON.stringify(proof, null, 2)}`;
    $verificationTimeOutput.textContent = `Verification Time: ${performance.now() - proofGeneration} ms`;
    $verificationMemoryUsageOutput.textContent = `Memory Usage: ${memoryUsageText}`;
});

function updateOutputs() {
    const root = tree.getRoot();
    $rootOutput.textContent = `Root: ${root}`;

    const layers = tree.getLayers(); // You need to implement this method in MerkleSparseTree
    $layersOutput.textContent = JSON.stringify(layers, null, 2);

    const flatLayers = tree.getFlatLayers(); // You need to implement this method in MerkleSparseTree
    $flatLayersOutput.textContent = JSON.stringify(flatLayers, null, 2);

    const treeVisualization = tree.getTreeVisualization(); // This will print tree visualization to console
    console.log(treeVisualization);
    $treeVisualization.textContent = treeVisualization;
}

// Initialize tree with default values on page load
window.addEventListener('DOMContentLoaded', initializeTree);

// Custom replacer function to stringify BigInt values
function replacer(key, value) {
    if (typeof value === 'bigint') {
        return value.toString(); // Convert BigInt to string
    }
    return value;
}
