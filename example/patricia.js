document.addEventListener('DOMContentLoaded', () => {
  const $keyValuePairs = document.getElementById('keyValuePairs');
  const $form = document.getElementById('form');
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
    pairs.forEach(({key, value}) => {
      trie.put(key, value);
    });

    updateOutputs();
  }


  $form.addEventListener('submit', (event) => {
    event.preventDefault();
    const keyValuePairs = document.getElementById('keyValuePairs').value.trim();
    const pairs = keyValuePairs.split('\n').map(line => line.trim().split(','));
    pairs.forEach(([key, value]) => {
      trie.put(key.trim(), value.trim());
    });
    updateRootOutput();
    updateVisualizations();
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
    const proof = trie.generateProof(key);
    $proofOutput.textContent = JSON.stringify(proof, null, 2);
  });

  $verifyForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const key = document.getElementById('verifyKey').value.trim();
    const value = document.getElementById('verifyValue').value.trim();
    const rootHash = document.getElementById('rootHash').value.trim();
    const proof = JSON.parse($proofOutput.textContent);
    const isValid = trie.verifyProof(rootHash, key, proof);
    $verifyOutput.textContent = `Verification: ${isValid}`;
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

