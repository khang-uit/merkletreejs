const test = require('tape');
const { MerkleSparseSumTree } = require('../'); // Adjust the path as needed

// Example of a hash function
const hashFn = (data) => {
  return require('crypto').createHash('sha256').update(data).digest('hex');
};

// Test suite for MerkleSparseSumTree getProof and verifyProof methods
test('MerkleSparseSumTree getProof and verifyProof methods', t => {
  t.plan(2);

  const smt = new MerkleSparseSumTree(4, hashFn); // Depth of 4 (16 leaves)

  smt.insert('1000', 'value1', BigInt(10));
  smt.insert('1110', 'value2', BigInt(20));
  smt.insert('1111', 'value3', BigInt(30));
  smt.insert('0111', 'value4', BigInt(40));

  const root = smt.getRoot();
  console.log('Root:', root);
  smt.printTree();

  // Get proof for 1000
  const proofForKey1 = smt.generateProof('1000');
  console.log(proofForKey1);
  t.ok(smt.verifyProof('1000', 'value1', BigInt(10), proofForKey1, root), 'Proof for 1000 should be verified correctly');

  // Get proof for 1110
  const proofForKey2 = smt.generateProof('1110');
  t.ok(smt.verifyProof('1110', 'value2', BigInt(20), proofForKey2, root), 'Proof for 1110 should be verified correctly');

  t.end();
});

// Test suite for MerkleSparseSumTree handling non-existent keys
test('MerkleSparseSumTree handling non-existent keys', t => {
  t.plan(1);

  const smt = new MerkleSparseSumTree(4, hashFn); // Depth of 4 (16 leaves)

  smt.insert('1000', 'value1', BigInt(10));
  smt.insert('1110', 'value2', BigInt(20));
  smt.insert('1111', 'value3', BigInt(30));
  smt.insert('0111', 'value4', BigInt(40));

  const root = smt.getRoot();

  // Attempt to generate proof for a key that doesn't exist
  const proofForNonExistentKey = smt.generateProof('1001'); // Key that doesn't exist

  // Verify that the proof for the non-existent key cannot be verified
  const isProofValid = smt.verifyProof('1001', 'value', BigInt(10), proofForNonExistentKey, root);
  t.notOk(isProofValid, 'Proof for non-existent key should not be valid');

  t.end();
});
