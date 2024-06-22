const test = require('tape');
const { SparseMerkleTree } = require('../'); // Adjust the path as needed

// Test suite for SparseMerkleTree getProof and verifyProof methods
test('SparseMerkleTree getProof and verifyProof methods', t => {
  t.plan(2);

  const smt = new SparseMerkleTree(4); // Depth of 4 (16 leaves)

  smt.insert('1000', 'value1');
  smt.insert('1110', 'value2');
  smt.insert('1111', 'value3');
  smt.insert('0111', 'value4');

  const rootHash = smt.getRoot();
  console.log('Root hash:', rootHash)
  smt.printTree();

  // Get proof for 1000001
  const proofForKey1 = smt.generateProof('1000');
  console.log(proofForKey1)
  t.ok(smt.verifyProof('1000', 'value1', proofForKey1, rootHash), 'Proof for 1000 should be verified correctly');

  // Get proof for 1110100111
  const proofForKey2 = smt.generateProof('1110');
  t.ok(smt.verifyProof('1110', 'value2', proofForKey2, rootHash), 'Proof for 1110 should be verified correctly');

  t.end();
});

// Test suite for SparseMerkleTree handling non-existent keys
test('SparseMerkleTree handling non-existent keys', t => {
  t.plan(1);

  const smt = new SparseMerkleTree(4); // Depth of 4 (16 leaves)

  smt.insert('1000', 'value1');
  smt.insert('1110', 'value2');
  smt.insert('1111', 'value3');
  smt.insert('0111', 'value4');

  const rootHash = smt.getRoot();

  // Attempt to generate proof for a key that doesn't exist
  const proofForNonExistentKey = smt.generateProof('1001'); // Key that doesn't exist

  // Verify that the proof for the non-existent key cannot be verified
  const isProofValid = smt.verifyProof('1001', 'value', proofForNonExistentKey, rootHash);
  t.notOk(isProofValid, 'Proof for non-existent key should not be valid');

  t.end();
});
