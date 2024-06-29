var $form = document.getElementById('form');
var $input = document.getElementById('input');
var $multiInputForm = document.getElementById('multiInputForm');
var $multiInput = document.getElementById('multiInput');
var $singleInputForm = document.getElementById('singleInputForm');
var $singleInput = document.getElementById('singleInput');
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
  const leaves = [
    new window.MerkleSumTreeLeaf([0, 1000], 'value1'),
    new window.MerkleSumTreeLeaf([1000, 2000], 'value2'),
    new window.MerkleSumTreeLeaf([2000, 3000], 'value3'),
    new window.MerkleSumTreeLeaf([3000, 4000], 'value4'),
  ];
  $input.textContent = `0, 1000, value1
1000, 2000, value2
2000, 3000, value3
3000, 4000, value4`;
  tree = new MerkleSumTree(leaves)
  console.log(leaves[1])
  updateOutputs();
}

// Function to generate random leaf paths and values
function generateRandomData(numLines) {
  const testData = [];
  for (let i = 0; i < numLines; i++) {
    let path = BigInt(i * 1000);
    let end = path + BigInt(1000);
    let value = 'value' + (i + 1);
    if(i == numLines - 1){
      console.log(i, path, end, value)
    }
    testData.push(new window.MerkleSumTreeLeaf([path, end], value));
  }
  return testData;
}

// Function to insert generated test data into the Merkle tree
function insertMultiGeneratedDataIntoTree(numLines) {
  const testData = generateRandomData(numLines);

  const insertionTime = performance.now();
  const memoryBefore = getMemoryUsage();
  tree = new MerkleSumTree(testData)
  const memoryAfter = getMemoryUsage();

  const memoryUsage = (memoryAfter !== null && memoryBefore !== null) ? (memoryAfter - memoryBefore) : 'N/A';
  const memoryUsageText = memoryUsage >= 0 ? `${memoryUsage} bits` : `0 bits`;

  $insertionTimeOutput.textContent = `Insertion Time: ${performance.now() - insertionTime} ms`;
  $memoryUsageOutput.textContent = `Memory Usage: ${memoryUsageText}`;
}

// Function to insert generated test data into the Merkle tree
function insertSingleGeneratedDataIntoTree(numLines) {
  const testData = generateRandomData(numLines);

  const insertionTime = performance.now();
  const memoryBefore = getMemoryUsage();
  let index = 0;
  testData.forEach((leaf) => {
    if(index == 0){
      tree = new MerkleSumTree([leaf])
    }else{
      tree.insertLeaf(leaf);
    }
    index++;
  });
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
  const numLines = parseInt($multiInput.value.trim());
  insertMultiGeneratedDataIntoTree(numLines);
});

// Event listener for the "Insert 1000 Lines of Test Data" button
$singleInputForm.addEventListener('submit', function (event) {
  // Insert 1000 lines of generated data into the Merkle tree
  event.preventDefault();
  const numLines = parseInt($singleInput.value.trim());
  insertSingleGeneratedDataIntoTree(numLines);
});

$form.addEventListener('submit', function (event) {
  event.preventDefault();
  const value = $input.value.trim().split('\n');
  const leaves = value.map(line => {
    const [start, end, val] = line.trim().split(',');
    return new window.MerkleSumTreeLeaf([BigInt(start), BigInt(end)], val.trim());
  });

  const insertionTime = performance.now();
  const memoryBefore = getMemoryUsage();
  tree = new MerkleSumTree(leaves)
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
  const path = BigInt($leafInput.value.trim());

  const proofGeneration = performance.now();
  const memoryBefore = getMemoryUsage();
  if (tree && path >= 0) {
    const proof = tree.getProof(path);
    const memoryAfter = getMemoryUsage();
    const memoryUsage = (memoryAfter !== null && memoryBefore !== null) ? (memoryAfter - memoryBefore) : 'N/A';
    const memoryUsageText = memoryUsage >= 0 ? `${memoryUsage} bits` : `0 bits`;

    // $proof.textContent = JSON.stringify(proof, replacer, 2);
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
  const index = BigInt(document.getElementById('verifyIndex').value.trim());
  const path = BigInt(document.getElementById('verifyPath').value.trim());
  const value = document.getElementById('verifyValue').value.trim();
  const proofGeneration = performance.now();
  const memoryBefore = getMemoryUsage();
  const proof = tree.getProof(index);
  const root = tree.root;
  const leaf = new window.MerkleSumTreeLeaf([path, path + BigInt(1000)], value);
  const isValid = tree.verifyProof(root, leaf, proof);
  const memoryAfter = getMemoryUsage();

  const memoryUsage = (memoryAfter !== null && memoryBefore !== null) ? (memoryAfter - memoryBefore) : 'N/A';
  const memoryUsageText = memoryUsage >= 0 ? `${memoryUsage} bits` : `0 bits`;

  $verifyOutput.textContent = `Verification: ${isValid}`;
  // $proofOutput.textContent = `${JSON.stringify(proof, replacer, 2)}`;
  $verificationTimeOutput.textContent = `Verification Time: ${performance.now() - proofGeneration} ms`;
  $verificationMemoryUsageOutput.textContent = `Memory Usage: ${memoryUsageText}`;
});

function updateOutputs() {
  const root = tree.root;
  $rootOutput.textContent = `Root: ${root.hashed.toString('hex')}`;

  // Assuming you have methods to get layers and flat layers if needed
  const layers = tree.getLayers();
  $layersOutput.textContent = JSON.stringify(layers, replacer, 2);

  // const flatLayers = tree.getFlatLayers(); 
  // $flatLayersOutput.textContent = JSON.stringify(flatLayers, replacer, 2);

  // Assuming you have a method to visualize the tree if needed
  const treeVisualization = tree.getTreeVisualization();
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
