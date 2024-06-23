var $form = document.getElementById('form');
var $input = document.getElementById('input');
var $verifyForm = document.getElementById('verifyForm');
var $rootOutput = document.getElementById('rootOutput');
var $proofOutput = document.getElementById('proofOutput');
var $verifyOutput = document.getElementById('verifyOutput');
var $layersOutput = document.getElementById('layersOutput');
var $flatLayersOutput = document.getElementById('flatLayersOutput');
var $leafInput = document.getElementById('leafInput');
var $proof = document.getElementById('proof');
var $treeVisualization = document.getElementById('treeVisualization');

var tree;

$form.addEventListener('submit', function (event) {
    event.preventDefault();
    const value = $input.value.trim();
    const height = 4; // Set the height of your tree here
    tree = new window.MerkleSparseSumTree(height, window.sha256);

    const leaves = value.split('\n').map(function (line) {
        const [path, hash, sum] = line.trim().split(',');
        return { path: path.trim(), value: hash.trim(), sum: BigInt(sum.trim()) };
    });
    leaves.forEach(function (leaf) {
        tree.insert(leaf.path, leaf.value, leaf.sum);
    });

    updateOutputs();
});

// Handle proof generation
document.getElementById('proofForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const path = $leafInput.value.trim();

    if (tree && path) {
        const proof = tree.generateProof(path);
        $proof.textContent = JSON.stringify(proof, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value, 2);
    } else {
        $proof.textContent = 'Invalid leaf path or tree not initialized';
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
    const sum = BigInt(document.getElementById('verifySum').value.trim());
    const proof = tree.generateProof(path);
    const root = tree.getRoot();
    const isValid = tree.verifyProof(path, value, sum, proof, root);
    $verifyOutput.textContent = `Verification: ${isValid}`;
    $proofOutput.textContent = `Proof: ${JSON.stringify(proof)}`;
});

function updateOutputs() {
    const root = tree.getRoot();
    $rootOutput.textContent = `Root: ${root.hash} Sum: ${root.sum.toString()}`; // Convert BigInt to string

    const layers = tree.getLayers();
    $layersOutput.textContent = JSON.stringify(layers, replacer, 2); // Use custom replacer

    const flatLayers = tree.getFlatLayers().map(node => node.toString()); // Convert each node's hash to string
    $flatLayersOutput.textContent = JSON.stringify(flatLayers, null, 2);

    const treeVisualization = tree.getTreeVisualization();
    console.log(treeVisualization)
    $treeVisualization.textContent = treeVisualization;
}

// Custom replacer function to stringify BigInt values
function replacer(key, value) {
    if (typeof value === 'bigint') {
        return value.toString(); // Convert BigInt to string
    }
    return value;
}
