document.addEventListener('DOMContentLoaded', () => {
  const $keyValuePairs = document.getElementById('keyValuePairs');
  const $form = document.getElementById('form');
  const $multiInputForm = document.getElementById('multiInputForm');
  const $multiKeyValuePairs = document.getElementById('multiKeyValuePairs');
  const $getForm = document.getElementById('getForm');
  const $proofForm = document.getElementById('proofForm');
  const $verifyForm = document.getElementById('verifyForm');
  const $rootOutput = document.getElementById('rootOutput');
  const $valueOutput = document.getElementById('valueOutput');
  const $proofOutput = document.getElementById('proofOutput');
  const $verifyOutput = document.getElementById('verifyOutput');
  const $leavesOutput = document.getElementById('leavesOutput');
  const $layersOutput = document.getElementById('layersOutput');
  const $flatLayersOutput = document.getElementById('flatLayersOutput');
  const $treeOutput = document.getElementById('treeOutput');
  const $insertionTimeOutput = document.getElementById('insertionTimeOutput');
  const $proofGenerationTimeOutput = document.getElementById('proofGenerationTimeOutput');
  const $verificationTimeOutput = document.getElementById('verificationTimeOutput');

  var trie;

  function initializeTree() {
    trie = new window.MerklePatricia();

    const pairs = [
      { key: '11355', value: 'value1' },
      { key: '7d337', value: 'value2' },
      { key: 'f9365', value: 'value3' },
      { key: '7d397', value: 'value4' },
    ];
    $keyValuePairs.textContent = `11355, value1
7d337, value2
f9365, value3
7d397, value4`
    pairs.forEach(({ key, value }) => {
      trie.put(key, value);
    });

    updateRootOutput();
    updateVisualizations();
  }

  function generateRandomData(multiKeyValuePairs) {
    const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

    const testData = [];

    for (let i = 0; i < multiKeyValuePairs; i++) {
        
        // Generate a random value (for demonstration, using a simple incremental value)
        let value = 'value' + (i + 1);
        let key = genRanHex(32)
        if(i == multiKeyValuePairs-1){{
            console.log(key, value)
        }}
        // Store the generated data as an object
        testData.push({ key: key, value: value});
    }

    return testData;
  }

  function insertGeneratedDataIntoTree(multiKeyValuePairs) {
    const testData = generateRandomData(multiKeyValuePairs);
    trie = new window.MerklePatricia();

    const insertionTime = performance.now();
    testData.forEach(function (leaf) {
        trie.put(leaf.key, leaf.value);
    });
    $insertionTimeOutput.textContent = `Insertion Time: ${performance.now() - insertionTime} ms`;
    console.log(trie.rootHash)
}


  $form.addEventListener('submit', (event) => {
    event.preventDefault();
    trie = new window.MerklePatricia();
    const keyValuePairs = document.getElementById('keyValuePairs').value.trim();
    const pairs = keyValuePairs.split('\n').map(line => line.trim().split(','));
    const insertionTime = performance.now();
    pairs.forEach(([key, value]) => {
      trie.put(key.trim(), value.trim());
    });
    $insertionTimeOutput.textContent = `Insertion Time: ${performance.now() - insertionTime} ms`;
    updateRootOutput();
    updateVisualizations();
  });

  $multiInputForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const multiKeyValuePairs = $multiKeyValuePairs.value.trim();
    insertGeneratedDataIntoTree(multiKeyValuePairs);
  });

  $getForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const key = document.getElementById('getKey').value.trim();
    const value = trie.get(key);
    $valueOutput.textContent = value !== null ? value : 'Key not found';
  });

  $proofForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const key = document.getElementById('proofKey').value.trim();
    const proofGeneration = performance.now();
    const proof = trie.generateProof(key);
    $proofGenerationTimeOutput.textContent = `Proof Time: ${performance.now() - proofGeneration} ms`;
    // $proofOutput.textContent = JSON.stringify(proof, null, 2);
  });

  $verifyForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const key = document.getElementById('verifyKey').value.trim();
    const value = document.getElementById('verifyValue').value.trim();
    const rootHash = document.getElementById('rootHash').value.trim();
    const verifyGeneration = performance.now();
    const proof = trie.generateProof(key)
    const isValid = trie.verifyProof(rootHash, key, proof);
    $verifyOutput.textContent = `Verification: ${isValid}`;
    $verificationTimeOutput.textContent = `Verification Time: ${performance.now() - verifyGeneration} ms`
  });

  function updateRootOutput() {
    const rootHash = trie.rootHash;
    $rootOutput.textContent = `Root Hash: ${rootHash}`;
  }

  function updateVisualizations() {
    const leaves = trie.getLeaves();
    $leavesOutput.textContent = JSON.stringify(leaves, null, 2);

    const flatLayers = trie.getFlatLayers();
    $flatLayersOutput.textContent = JSON.stringify(flatLayers, null, 2);

    const tree = trie.getTreeStructure();
    $treeOutput.textContent = tree; // Tree structure is a string representation
  }

  window.addEventListener('DOMContentLoaded', initializeTree);
});

